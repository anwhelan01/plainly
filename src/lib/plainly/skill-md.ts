import type { Dialect, SkillHost } from "./types.ts";

export const HOST_INSTALL: Record<
  SkillHost,
  { label: string; path: string; note: string }
> = {
  claude: {
    label: "Claude Code",
    path: ".claude/skills/plainly/",
    note: "Project skill. Restart Claude Code if it does not appear.",
  },
  codex: {
    label: "Codex",
    path: ".agents/skills/plainly/",
    note: "Also works in ~/.agents/skills/plainly/ for a user install.",
  },
  cursor: {
    label: "Cursor",
    path: ".cursor/skills/plainly/",
    note: "Start a new agent chat so it reloads skills.",
  },
  windsurf: {
    label: "Windsurf",
    path: ".windsurf/skills/plainly/",
    note: "Keep SKILL.md at the root of that folder.",
  },
  generic: {
    label: "Any host",
    path: "skills/plainly/",
    note: "Place the folder in whatever skill directory your host reads.",
  },
};

export function buildSkillMarkdown(opts: {
  dialect: Dialect;
  houseWords: string[];
  extra?: string;
}): string {
  const banned =
    opts.houseWords.length > 0
      ? opts.houseWords.map((word) => `- ${word}`).join("\n")
      : "- (none)";
  const extra = opts.extra?.trim()
    ? `\n## House rules\n\n${opts.extra.trim()}\n`
    : "";
  const dialectBlock =
    opts.dialect === "google"
      ? `Apply the Google-derived rules. Do not add the anti-slop appendix unless a phrase is also a Google violation.`
      : `Apply Google-derived rules AND the anti-slop appendix. Prefer the shortest accurate word.`;

  return `---
name: plainly
description: Draft, revise, and audit technical prose so a reader can act without rereading. Use for developer docs, procedures, READMEs, release notes, UI copy, and explanations. Do not auto-apply to fiction, legal, academic, or marketing unless the user asks for this style.
---

# Plainly

## Outcome

Produce prose the reader can use on the first pass. Name the actor. Put the answer or the task first. Preserve facts, code, UI labels, product names, and the author's useful voice.

## Authority

1. The user's explicit request and the destination's requirements.
2. Facts, quotations, code, filenames, API names, UI labels, and required structure in the source.
3. Project style, then this skill.
4. Live Google Developer Documentation Style Guide pages only for a specialized question this skill does not cover.

Depart from a guideline when the result is clearer for the actual reader. Stay consistent after that choice.

Dialect for this copy of the skill: ${opts.dialect === "google" ? "Google" : "Plainly (Google + anti-slop)"}.
${dialectBlock}

## Write or revise

1. Identify the reader, the goal, and whether you are drafting, revising, or auditing.
2. Mark what must not drift: facts, hedges (\`can\`, \`might\`, \`should\`, \`will\` as obligation), quotations, technical tokens, links.
3. Lead with the result or the purpose. One idea per paragraph. Critical information first.
4. Use \`you\`, active voice, and present tense. Use imperatives for steps.
5. Put the condition before the instruction it controls.
6. Prefer short familiar words. One term per concept. Define jargon on first use.
7. Vary sentence rhythm. Short is good; identical staccato is not. Contractions are fine.
8. Remove throat-clearing, pre-announcements, brochure words, idioms, and fake certainty.
9. Structure for scanning: sentence-case headings, numbered lists for sequences, bullets for parallel items, descriptive links, UI labels in bold.
10. Stop when the page is clear. Do not keep polishing lines that already work.

## Do not

- Add facts, praise, urgency, or product claims.
- Change modality (\`might\` to \`will\`) to satisfy tense preference.
- Replace code, commands, filenames, API names, UI labels, or quotations with "clearer" synonyms.
- Rewrite when the user asked for an audit. Report findings in priority order with bounded examples.
- Flatten every sentence into the same length. Do not make prose childish.
- Force this style onto dialogue, fiction, legal language, or a deliberately personal voice.

## Anti-slop appendix

Delete these on sight unless they are a quotation or a required term:

- Openers: *I'd be happy to*, *Certainly!*, *Great question*, *As an AI*, *Let's dive in*, *Let's delve*, *Without further ado*
- Wrappers: *It's important to note*, *It's worth noting*, *It should be noted*, *Needless to say*, *Rest assured*
- Brochure: *robust*, *seamless*, *cutting-edge*, *groundbreaking*, *game-changer*, *unlock the potential*, *empower*, *foster*, *harness*, *leverage*, *utilize*, *tapestry*, *landscape of*, *pivotal*, *multifaceted*, *holistic*, *synergy*, *paradigm*, *supercharge*, *revolutionize*, *in today's rapidly evolving*
- False ease: *simply*, *just click*, *it's easy*, *please note*
- Padding: *in order to* → *to*; *due to the fact that* → *because*; *in this guide we will* → start the task

## Google-derived core

- Be conversational without being frivolous.
- Don't pre-announce. Don't write "this document will cover".
- Second person. Active voice. Present tense for current behavior.
- Put conditions before instructions.
- No *please* in instructions. No *simply* / *just* / *easy*.
- Sentence case headings. Numbered lists for sequences. Serial comma.
- Write for a global audience: no idioms, sports metaphors, or slang.
- UI elements in **bold**. Descriptive link text. Alt text on images.

## House banned words

${banned}
${extra}
## Validate before you return

- The opening answers the reader's question.
- Every instruction names or clearly implies the actor.
- Conditions precede actions.
- Pronouns have referents.
- Claims match the source. Technical tokens are unchanged.
- A global reader can understand it.
- It still sounds like the author when voice matters.

## Attribution

Operationalizes the [Google developer documentation style guide](https://developers.google.com/style/) (CC BY 4.0). Independent; not endorsed by Google. Anti-slop rules are original to Plainly.
`;
}

export function skillFilename(host: SkillHost) {
  return `plainly-${host}-SKILL.md`;
}
