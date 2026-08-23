import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  Eraser,
  LoaderCircle,
  PencilLine,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { diffWords } from "@/lib/plainly/diff";
import { countBySeverity, findingRule, lint } from "@/lib/plainly/lint";
import { rewriteDraft, REWRITE_MAX_CHARS } from "@/lib/plainly/rewrite";
import { SAMPLES, DRAFT_STORAGE_KEY } from "@/lib/plainly/samples";
import type { Dialect, Finding } from "@/lib/plainly/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = DRAFT_STORAGE_KEY;

export function Desk() {
  const [text, setText] = useState(SAMPLES[0]!.text);
  const [dialect, setDialect] = useState<Dialect>("plainly");
  const [activeFinding, setActiveFinding] = useState<string | null>(null);
  const [pane, setPane] = useState<"findings" | "rewrite">("findings");
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [copied, setCopied] = useState<"draft" | "rewrite" | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setText(saved);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      /* ignore */
    }
  }, [text]);

  const result = useMemo(() => lint(text), [text]);
  const counts = countBySeverity(result.findings);
  const overLimit = text.length > REWRITE_MAX_CHARS;

  function selectFinding(finding: Finding) {
    setActiveFinding(finding.id);
    const el = areaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(finding.start, finding.end);
    const ratio = finding.start / Math.max(text.length, 1);
    el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
  }

  async function runRewrite() {
    if (overLimit) {
      toast.error(`Keep the draft under ${REWRITE_MAX_CHARS.toLocaleString()} characters.`);
      return;
    }
    if (!text.trim()) {
      toast.error("Paste something first.");
      return;
    }
    setRewriting(true);
    try {
      const response = await rewriteDraft({ data: { text, dialect } });
      if (!response.ok) {
        toast.error(response.error);
        return;
      }
      setRewritten(response.rewritten);
      setNotes(response.notes);
      setPane("rewrite");
    } catch {
      toast.error("Rewrite failed. Try again.");
    } finally {
      setRewriting(false);
    }
  }

  async function copy(value: string, which: "draft" | "rewrite") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Could not copy.");
    }
  }

  function applyRewrite() {
    if (!rewritten) return;
    setText(rewritten);
    setPane("findings");
    toast.success("Rewrite is now the draft.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-muted">
          Paste AI writing. The desk marks Claude-lish as you type, then rewrites it
          to Google-style English without changing the facts.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-faint">Dialect</span>
          <Tabs
            value={dialect}
            onValueChange={(value) => setDialect(value as Dialect)}
          >
            <TabsList>
              <TabsTrigger value="plainly">Plainly</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ScoreStrip result={result} />

      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => {
              setText(sample.text);
              setRewritten(null);
              setNotes([]);
              setPane("findings");
            }}
            className="h-10 rounded-full bg-paper-raised px-3 text-sm text-ink-soft shadow-[var(--shadow-border)] transition-colors duration-150 hover:text-ink"
            title={sample.blurb}
          >
            {sample.title}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-lg)] bg-paper-raised p-3 shadow-[var(--shadow-border)] sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl text-ink">Draft</h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(text, "draft")}
              >
                {copied === "draft" ? <Check /> : <ClipboardCopy />}
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setText("");
                  setRewritten(null);
                  setNotes([]);
                }}
              >
                <Eraser />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            ref={areaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void runRewrite();
              }
            }}
            spellCheck
            aria-label="Draft to lint"
            className="min-h-[28rem] resize-y font-sans text-[15px] leading-relaxed sm:min-h-[32rem]"
            placeholder="Paste the Claude-lish here."
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-faint">
              {result.wordCount} words · {text.length.toLocaleString()} chars
              {overLimit ? ` · over ${REWRITE_MAX_CHARS.toLocaleString()} limit` : ""}
            </p>
            <Button onClick={() => void runRewrite()} disabled={rewriting} className="w-full sm:w-auto">
              {rewriting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <PencilLine />
              )}
              {rewriting ? "Rewriting" : "Rewrite"}
              <kbd className="hidden rounded bg-paper/20 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
                ⌘↵
              </kbd>
            </Button>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] bg-paper-raised p-3 shadow-[var(--shadow-border)] sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Tabs value={pane} onValueChange={(value) => setPane(value as typeof pane)}>
              <TabsList>
                <TabsTrigger value="findings">
                  Findings ({result.findings.length})
                </TabsTrigger>
                <TabsTrigger value="rewrite" disabled={!rewritten && !rewriting}>
                  Rewrite
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {pane === "findings" ? (
            <FindingsList
              findings={result.findings}
              activeId={activeFinding}
              onSelect={selectFinding}
              counts={counts}
            />
          ) : (
            <RewriteView
              original={text}
              rewritten={rewritten}
              notes={notes}
              rewriting={rewriting}
              copied={copied === "rewrite"}
              onCopy={() => rewritten && copy(rewritten, "rewrite")}
              onApply={applyRewrite}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function ScoreStrip({ result }: { result: ReturnType<typeof lint> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Clarity" value={result.clarityScore} suffix="/100" good={result.clarityScore >= 75} />
      <Stat label="Slop index" value={result.slopIndex} suffix="" good={result.slopIndex <= 15} invert />
      <Stat label="Findings" value={result.findings.length} />
      <Stat
        label="Avg sentence"
        value={result.avgSentenceWords}
        suffix=" words"
        good={result.avgSentenceWords > 0 && result.avgSentenceWords <= 22}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  good,
  invert,
}: {
  label: string;
  value: number;
  suffix?: string;
  good?: boolean;
  invert?: boolean;
}) {
  const tone =
    good === undefined ? "text-ink" : good ? "text-add" : invert ? "text-mark" : "text-mark";
  return (
    <div className="rounded-[var(--radius-md)] bg-paper-raised px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className={cn("mt-1 font-display text-3xl tabular-nums leading-none", tone)}>
        {value}
        {suffix ? (
          <span className="ml-1 font-sans text-sm font-medium text-muted">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

function FindingsList({
  findings,
  activeId,
  onSelect,
  counts,
}: {
  findings: Finding[];
  activeId: string | null;
  onSelect: (finding: Finding) => void;
  counts: { slop: number; style: number; nit: number };
}) {
  if (findings.length === 0) {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[var(--radius-md)] bg-add-soft/40 px-6 text-center">
        <p className="font-display text-2xl text-add">Clean enough</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          No Claude-lish, brochure words, or Google-style faults in this draft.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        <span className="text-mark">{counts.slop} slop</span>
        {" · "}
        <span className="text-warn">{counts.style} style</span>
        {" · "}
        {counts.nit} nits. Click a finding to highlight it in the draft.
      </p>
      <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
        {findings.map((finding) => {
          const rule = findingRule(finding);
          return (
            <li key={finding.id}>
              <div
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-3 transition-colors duration-150",
                  activeId === finding.id ? "bg-mark-soft" : "bg-ink/4 hover:bg-ink/7",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(finding)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={finding.severity}>{finding.severity}</Badge>
                    <span className="text-sm font-medium text-ink">
                      {rule?.title ?? finding.ruleId}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[13px] text-mark">
                    “{finding.excerpt.trim()}”
                  </p>
                  <p className="mt-1 text-sm text-muted">{finding.message}</p>
                  {finding.suggestion ? (
                    <p className="mt-1 text-sm text-add">Try: {finding.suggestion}</p>
                  ) : null}
                </button>
                <Link
                  to="/stylebook"
                  search={{ cat: "appendix", rule: finding.ruleId }}
                  className="mt-2 inline-block text-xs text-faint underline-offset-2 hover:text-mark hover:underline"
                >
                  Open rule
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RewriteView({
  original,
  rewritten,
  notes,
  rewriting,
  copied,
  onCopy,
  onApply,
}: {
  original: string;
  rewritten: string | null;
  notes: string[];
  rewriting: boolean;
  copied: boolean;
  onCopy: () => void;
  onApply: () => void;
}) {
  if (rewriting) {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center text-muted">
        <LoaderCircle className="size-8 animate-spin text-mark" />
        <p className="mt-3 font-display text-xl text-ink">Red-penciling</p>
        <p className="mt-1 text-sm">Keeping facts. Cutting the lish.</p>
      </div>
    );
  }
  if (!rewritten) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center text-sm text-muted">
        Run Rewrite to see a Google-style pass.
      </div>
    );
  }

  const tokens = diffWords(original, rewritten);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onApply}>
          Use this draft
          <ArrowRight />
        </Button>
        <Button size="sm" variant="outline" onClick={onCopy}>
          {copied ? <Check /> : <ClipboardCopy />}
          Copy rewrite
        </Button>
      </div>
      <div className="max-h-[22rem] overflow-y-auto rounded-[var(--radius-md)] bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink">
        {tokens.map((token, index) => {
          if (token.type === "equal") {
            return <span key={index}>{token.value}</span>;
          }
          if (token.type === "remove") {
            return (
              <del
                key={index}
                className="bg-mark-soft text-mark no-underline"
              >
                {token.value}
              </del>
            );
          }
          return (
            <ins key={index} className="bg-add-soft text-add no-underline">
              {token.value}
            </ins>
          );
        })}
      </div>
      {notes.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-faint">
            What changed
          </p>
          <ul className="space-y-1.5">
            {notes.map((note) => (
              <li key={note} className="text-sm text-ink-soft">
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
