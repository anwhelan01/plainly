import { RULES, RULES_BY_ID } from "./rules.ts";
import type { Finding, LintResult } from "./types.ts";

const FENCE_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`]+`/g;
const URL_RE = /https?:\/\/[^\s)]+/g;

function maskedRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const re of [FENCE_RE, INLINE_CODE_RE, URL_RE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      ranges.push([match.index, match.index + match[0].length]);
      if (match[0].length === 0) re.lastIndex += 1;
    }
  }
  return ranges;
}

function inRange(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function words(text: string): string[] {
  return text.match(/[A-Za-z0-9]+(?:'[A-Za-z]+)?/g) ?? [];
}

function sentences(text: string): Array<{ start: number; end: number; text: string }> {
  const out: Array<{ start: number; end: number; text: string }> = [];
  const re = /[^.!?\n]+[.!?]+|[^.!?\n]+$/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const chunk = match[0];
    if (chunk.trim().length === 0) continue;
    out.push({
      start: match.index,
      end: match.index + chunk.length,
      text: chunk,
    });
  }
  return out;
}

function headingFindings(text: string): Finding[] {
  const findings: Finding[] = [];
  const lines = text.split("\n");
  let offset = 0;
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const title = heading[2] ?? "";
      const tokens = title.split(/\s+/).filter(Boolean);
      const capped = tokens.filter((token) => {
        if (token.length <= 3) return false;
        if (/^[A-Z0-9]{2,}$/.test(token)) return false;
        return /^[A-Z]/.test(token);
      });
      if (tokens.length >= 3 && capped.length >= tokens.length - 1 && capped.length >= 3) {
        const start = offset + (heading[1]?.length ?? 0) + 1;
        findings.push({
          id: `heading-${offset}`,
          ruleId: "sentence-case",
          severity: "nit",
          start,
          end: offset + line.length,
          excerpt: title,
          message: "Use sentence case in headings.",
          suggestion: title.charAt(0) + title.slice(1).replace(/\b([A-Z][a-z]+)\b/g, (word) => {
            const lower = word.toLowerCase();
            if (["api", "cli", "sdk", "ui", "id"].includes(lower)) return word;
            return lower;
          }),
        });
      }
    }
    offset += line.length + 1;
  }
  return findings;
}

function longSentenceFindings(text: string, ranges: Array<[number, number]>): Finding[] {
  const findings: Finding[] = [];
  for (const sentence of sentences(text)) {
    if (inRange(sentence.start, ranges)) continue;
    const count = words(sentence.text).length;
    if (count < 32) continue;
    findings.push({
      id: `long-${sentence.start}`,
      ruleId: "long-sentence",
      severity: count >= 40 ? "style" : "nit",
      start: sentence.start,
      end: sentence.end,
      excerpt: sentence.text.trim().slice(0, 140),
      message:
        count >= 40
          ? `This sentence is ${count} words. Split it.`
          : `This sentence is ${count} words. Aim under 25.`,
    });
  }
  return findings;
}

export function lint(text: string): LintResult {
  const ranges = maskedRanges(text);
  const findings: Finding[] = [];
  let counter = 0;

  for (const rule of RULES) {
    if (!rule.patterns) continue;
    for (const pattern of rule.patterns) {
      const re = new RegExp(pattern.source, "gi");
      let match: RegExpExecArray | null;
      while ((match = re.exec(text)) !== null) {
        if (match[0].length === 0) {
          re.lastIndex += 1;
          continue;
        }
        if (inRange(match.index, ranges)) continue;
        findings.push({
          id: `f-${counter++}`,
          ruleId: rule.id,
          severity: rule.severity,
          start: match.index,
          end: match.index + match[0].length,
          excerpt: match[0],
          message: pattern.message,
          suggestion: pattern.suggestion,
        });
      }
    }
  }

  findings.push(...headingFindings(text));
  findings.push(...longSentenceFindings(text, ranges));
  findings.sort((a, b) => a.start - b.start || a.end - b.end);

  const wordCount = words(text).length;
  const sentenceList = sentences(text);
  const sentenceCount = Math.max(sentenceList.length, wordCount === 0 ? 0 : 1);
  const avgSentenceWords =
    sentenceCount === 0 ? 0 : Math.round((wordCount / sentenceCount) * 10) / 10;

  const weights = { slop: 8, style: 4, nit: 1.5 };
  const weighted = findings.reduce((sum, finding) => sum + weights[finding.severity], 0);
  const perHundred = wordCount === 0 ? 0 : (weighted / Math.max(wordCount, 1)) * 100;
  const slopIndex = Math.max(0, Math.min(100, Math.round(perHundred)));
  const lengthPenalty = Math.max(0, avgSentenceWords - 22) * 1.4;
  const clarityScore = Math.max(
    0,
    Math.min(100, Math.round(100 - slopIndex * 0.85 - lengthPenalty)),
  );

  return {
    findings,
    wordCount,
    sentenceCount,
    avgSentenceWords,
    slopIndex,
    clarityScore,
  };
}

export function findingRule(finding: Finding) {
  return RULES_BY_ID[finding.ruleId];
}

export function countBySeverity(findings: Finding[]) {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      return acc;
    },
    { slop: 0, style: 0, nit: 0 },
  );
}
