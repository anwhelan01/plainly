import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ClipboardCopy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  buildSkillMarkdown,
  HOST_INSTALL,
  skillFilename,
} from "@/lib/plainly/skill-md";
import type { Dialect, SkillHost } from "@/lib/plainly/types";

export const Route = createFileRoute("/skill")({ component: SkillFactory });

const HOSTS: SkillHost[] = ["claude", "codex", "cursor", "windsurf", "generic"];

function SkillFactory() {
  const [host, setHost] = useState<SkillHost>("claude");
  const [dialect, setDialect] = useState<Dialect>("plainly");
  const [house, setHouse] = useState("");
  const [extra, setExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const houseWords = useMemo(
    () =>
      house
        .split(/[\n,]/)
        .map((word) => word.trim())
        .filter(Boolean),
    [house],
  );

  const markdown = useMemo(
    () => buildSkillMarkdown({ dialect, houseWords, extra }),
    [dialect, houseWords, extra],
  );

  const install = HOST_INSTALL[host];

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy.");
    }
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = skillFilename(host);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Skill factory
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Nate’s original instruction was “tell your AI to read the Google style
          guide.” That still leaves the model hoping. This file is the compact
          skill: authority order, preservation rules, Google core, anti-slop
          appendix, and a hard stop.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-5 rounded-[var(--radius-lg)] bg-paper-raised p-4 shadow-[var(--shadow-border)] sm:p-5">
          <fieldset className="space-y-2">
            <legend className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Host
            </legend>
            <div className="flex flex-wrap gap-2">
              {HOSTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setHost(item)}
                  className={
                    host === item
                      ? "h-10 rounded-full bg-ink px-3 text-sm text-paper-raised"
                      : "h-10 rounded-full bg-ink/5 px-3 text-sm text-ink-soft hover:text-ink"
                  }
                >
                  {HOST_INSTALL[item].label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Dialect
            </legend>
            <Tabs value={dialect} onValueChange={(value) => setDialect(value as Dialect)}>
              <TabsList>
                <TabsTrigger value="plainly">Plainly</TabsTrigger>
                <TabsTrigger value="google">Google only</TabsTrigger>
              </TabsList>
            </Tabs>
          </fieldset>

          <label className="block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              House banned words
            </span>
            <Textarea
              value={house}
              onChange={(event) => setHouse(event.target.value)}
              placeholder="One per line, or comma-separated. Example: utilize, going forward"
              className="min-h-28"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Extra house rules
            </span>
            <Textarea
              value={extra}
              onChange={(event) => setExtra(event.target.value)}
              placeholder="Optional. Project-specific voice, product names, things to never change."
              className="min-h-28"
            />
          </label>

          <div className="rounded-[var(--radius-md)] bg-paper px-4 py-3 text-sm text-ink-soft">
            <p className="font-medium text-ink">Install</p>
            <p className="mt-1 font-mono text-xs text-mark">{install.path}SKILL.md</p>
            <p className="mt-1">{install.note}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void copy()}>
              {copied ? <Check /> : <ClipboardCopy />}
              Copy SKILL.md
            </Button>
            <Button variant="outline" onClick={download}>
              <Download />
              Download
            </Button>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] bg-ink p-4 text-paper-raised shadow-[var(--shadow-border)] sm:p-5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-raised/60">
            {skillFilename(host)}
          </p>
          <pre className="max-h-[40rem] overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-paper-raised/90">
            {markdown}
          </pre>
        </div>
      </div>
    </div>
  );
}
