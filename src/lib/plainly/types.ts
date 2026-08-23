export type Severity = "slop" | "style" | "nit";

export type RuleOrigin = "google" | "plainly";

export type RuleCategory =
  | "voice"
  | "slop"
  | "words"
  | "structure"
  | "global";

export type Pattern = {
  /** Source of a case-insensitive, global regex. */
  source: string;
  message: string;
  suggestion?: string;
};

export type Rule = {
  id: string;
  title: string;
  category: RuleCategory;
  origin: RuleOrigin;
  severity: Severity;
  summary: string;
  why: string;
  doExample: string;
  dontExample: string;
  patterns?: Pattern[];
};

export type Finding = {
  id: string;
  ruleId: string;
  severity: Severity;
  start: number;
  end: number;
  excerpt: string;
  message: string;
  suggestion?: string;
};

export type LintResult = {
  findings: Finding[];
  wordCount: number;
  sentenceCount: number;
  avgSentenceWords: number;
  slopIndex: number;
  clarityScore: number;
};

export type Dialect = "google" | "plainly";

export type SkillHost = "claude" | "codex" | "cursor" | "windsurf" | "generic";
