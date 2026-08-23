import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  APPENDIX_GROUPS,
  APPENDIX_RULE_IDS,
  RULE_TELLS,
  TESTER_PHRASES,
} from "@/lib/plainly/appendix";
import { DRAFT_STORAGE_KEY } from "@/lib/plainly/samples";
import { findingRule, lint } from "@/lib/plainly/lint";
import { RULES, RULES_BY_ID } from "@/lib/plainly/rules";
import type { Rule, RuleCategory } from "@/lib/plainly/types";
import { cn } from "@/lib/utils";

type Filter = "appendix" | "all" | RuleCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "appendix", label: "Anti-slop" },
  { id: "all", label: "All" },
  { id: "voice", label: "Voice" },
  { id: "structure", label: "Structure" },
  { id: "words", label: "Words" },
  { id: "global", label: "Global" },
];

type Search = { cat?: Filter; rule?: string };

export const Route = createFileRoute("/stylebook")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const cat = raw.cat;
    const rule = raw.rule;
    const cats: Filter[] = ["appendix", "all", "voice", "structure", "words", "slop", "global"];
    return {
      cat: typeof cat === "string" && cats.includes(cat as Filter) ? (cat as Filter) : undefined,
      rule: typeof rule === "string" ? rule : undefined,
    };
  },
  component: Stylebook,
});

function Stylebook() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/stylebook" });
  const filter: Filter = search.cat ?? "appendix";
  const [query, setQuery] = useState("");
  const [probe, setProbe] = useState(TESTER_PHRASES[0] ?? "");

  const probeResult = useMemo(() => lint(probe), [probe]);
  const appendixHits = probeResult.findings.filter((finding) =>
    APPENDIX_RULE_IDS.includes(finding.ruleId),
  );

  const visibleRules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RULES.filter((rule) => {
      if (filter === "appendix") return APPENDIX_RULE_IDS.includes(rule.id);
      if (filter !== "all" && rule.category !== filter) return false;
      if (!q) return true;
      const tells = (RULE_TELLS[rule.id] ?? []).join(" ");
      return `${rule.title} ${rule.summary} ${rule.why} ${tells}`.toLowerCase().includes(q);
    });
  }, [filter, query]);

  function setFilter(next: Filter) {
    void navigate({
      search: (prev) => ({ ...prev, cat: next === "appendix" ? undefined : next, rule: undefined }),
    });
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-mark">
          {filter === "appendix" ? "Appendix" : "Stylebook"}
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {filter === "appendix"
            ? "Anti-slop"
            : filter === "all"
              ? "Stylebook"
              : FILTERS.find((item) => item.id === filter)?.label}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {filter === "appendix"
            ? "Google never listed Claude-lish. This appendix does: openers, wrappers, brochure words, hedges, false ease, and padding. The linter uses the same list."
            : "Operationalized from the Google developer documentation style guide (CC BY 4.0), plus Plainly’s appendix for model English. Independent. Not endorsed by Google."}
        </p>
      </div>

      <PhraseTester
        probe={probe}
        onProbe={setProbe}
        hits={appendixHits}
        wordCount={probeResult.wordCount}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "h-10 rounded-full px-3 text-sm transition-colors duration-150",
                filter === item.id
                  ? "bg-ink text-paper-raised"
                  : "bg-ink/5 text-ink-soft hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tells"
            className="h-11 w-full rounded-[var(--radius-sm)] bg-paper-raised pl-10 pr-3 text-sm text-ink shadow-[var(--shadow-border)] placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mark/50"
          />
        </label>
      </div>

      {filter === "appendix" && !query ? (
        <div className="space-y-10">
          {APPENDIX_GROUPS.map((group) => {
            const rules = group.ruleIds
              .map((id) => RULES_BY_ID[id])
              .filter((rule): rule is Rule => Boolean(rule));
            return (
              <section key={group.id} id={group.id} className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl text-ink">{group.label}</h3>
                  <p className="mt-1 text-sm text-muted">{group.lede}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {rules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      highlighted={search.rule === rule.id}
                      expanded
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRules.length === 0 ? (
            <p className="text-sm text-muted">No rules match that search.</p>
          ) : (
            visibleRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                highlighted={search.rule === rule.id}
                expanded={APPENDIX_RULE_IDS.includes(rule.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PhraseTester({
  probe,
  onProbe,
  hits,
  wordCount,
}: {
  probe: string;
  onProbe: (value: string) => void;
  hits: ReturnType<typeof lint>["findings"];
  wordCount: number;
}) {
  const navigate = useNavigate();

  function sendToDesk() {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, probe);
    } catch {
      /* ignore */
    }
    void navigate({ to: "/" });
  }

  return (
    <section className="rounded-[var(--radius-lg)] bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink">Try a phrase</h3>
          <p className="mt-1 text-sm text-muted">
            The linter runs locally. Nothing is sent until you rewrite on the desk.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={sendToDesk}>
          Open on the desk
          <ArrowRight />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {TESTER_PHRASES.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onProbe(phrase)}
            className={cn(
              "max-w-full truncate rounded-full px-3 py-2 text-left text-xs text-ink-soft shadow-[var(--shadow-border)]",
              probe === phrase ? "bg-mark-soft text-mark" : "bg-paper hover:text-ink",
            )}
          >
            {phrase}
          </button>
        ))}
      </div>
      <Textarea
        value={probe}
        onChange={(event) => onProbe(event.target.value)}
        aria-label="Phrase to test against the appendix"
        className="mt-3 min-h-28 text-sm"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="tabular-nums">{wordCount} words</span>
        <span>·</span>
        <span className={hits.length ? "text-mark" : "text-add"}>
          {hits.length === 0 ? "No appendix hits" : `${hits.length} hit${hits.length === 1 ? "" : "s"}`}
        </span>
      </div>
      {hits.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {hits.map((finding) => {
            const rule = findingRule(finding);
            return (
              <li
                key={finding.id}
                className="rounded-[var(--radius-sm)] bg-mark-soft px-3 py-2 text-sm text-mark"
              >
                <span className="font-medium">{rule?.title ?? finding.ruleId}</span>
                <span className="text-mark/80"> — {finding.message}</span>
                <span className="mt-0.5 block font-mono text-xs">“{finding.excerpt}”</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function RuleCard({
  rule,
  highlighted,
  expanded,
}: {
  rule: Rule;
  highlighted?: boolean;
  expanded?: boolean;
}) {
  const tells = RULE_TELLS[rule.id] ?? [];
  const [open, setOpen] = useState(Boolean(expanded || highlighted));

  return (
    <article
      id={rule.id}
      className={cn(
        "flex flex-col rounded-[var(--radius-lg)] bg-paper-raised p-5 shadow-[var(--shadow-border)]",
        highlighted && "ring-2 ring-mark/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={rule.severity}>{rule.severity}</Badge>
        <Badge variant="outline">{rule.origin === "google" ? "Google" : "Plainly"}</Badge>
      </div>
      <h4 className="mt-3 font-display text-xl text-ink">{rule.title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{rule.summary}</p>
      <p className="mt-2 text-sm text-muted">{rule.why}</p>
      <div className="mt-4 grid gap-2">
        <Example kind="dont" text={rule.dontExample} />
        <Example kind="do" text={rule.doExample} />
      </div>
      {tells.length > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="text-xs font-medium uppercase tracking-[0.14em] text-faint hover:text-ink"
          >
            {open ? "Hide tells" : `Show ${tells.length} tells`}
          </button>
          {open ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tells.map((tell) => (
                <li
                  key={tell}
                  className="rounded-full bg-mark-soft px-2.5 py-1 font-mono text-xs text-mark"
                >
                  {tell}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <Link
        to="/"
        onClick={() => {
          try {
            localStorage.setItem(DRAFT_STORAGE_KEY, rule.dontExample);
          } catch {
            /* ignore */
          }
        }}
        className="mt-4 inline-flex h-11 items-center gap-2 self-start text-sm font-medium text-ink hover:text-mark"
      >
        Lint this example
        <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}

function Example({ kind, text }: { kind: "do" | "dont"; text: string }) {
  const isDo = kind === "do";
  return (
    <p
      className={
        isDo
          ? "rounded-[var(--radius-sm)] bg-add-soft px-3 py-2 text-sm text-add"
          : "rounded-[var(--radius-sm)] bg-mark-soft px-3 py-2 text-sm text-mark"
      }
    >
      <span className="mr-2 font-mono text-[10px] uppercase tracking-wider">
        {isDo ? "Do" : "Don't"}
      </span>
      {text}
    </p>
  );
}
