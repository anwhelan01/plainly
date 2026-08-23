# Plainly

A copy desk for Claude-lish.

Paste AI writing. The desk marks throat-clearing, brochure words, and Google
style faults as you type. Rewrite keeps the facts and cuts the lish. Export a
drop-in skill for Claude Code, Codex, Cursor, or Windsurf.

Inspired by [Nate B. Jones](https://x.com/natebjones/status/2089457435459404093):
a skill file is hope; a linter is proof.

## What you get

| Surface | Job |
| --- | --- |
| **Desk** | Live lint, clarity / slop scores, rewrite with a red-pencil diff |
| **Stylebook** | Google-derived rules plus the anti-slop appendix. Try a phrase. |
| **Skill factory** | Host-specific `SKILL.md`, optional house banned words |

The linter runs in the browser. Nothing is sent until you press **Rewrite**.

## Install the skill only

If you just want the agent skill:

```sh
git clone https://github.com/anwhelan01/plainly.git
cp -R plainly/skills/plainly .claude/skills/plainly
```

| Host | Path |
| --- | --- |
| Claude Code | `.claude/skills/plainly/` |
| Codex | `.agents/skills/plainly/` |
| Cursor | `.cursor/skills/plainly/` |
| Windsurf | `.windsurf/skills/plainly/` |

Start a new agent task, then:

```text
Use $plainly to revise this draft. Keep the facts. Cut the Claude-lish.
```

Full install notes: [docs/install-skill.md](docs/install-skill.md).
The tell list: [skills/plainly/references/appendix.md](skills/plainly/references/appendix.md).

## Run the desk

Needs Node 22.

```sh
git clone https://github.com/anwhelan01/plainly.git
cd plainly
npm install
cp .env.example .env   # add XAI_API_KEY if you want Rewrite
npm run dev
```

Open the URL Vite prints. Routes: `/` desk, `/stylebook`, `/skill`.

Rewrite uses `XAI_API_KEY` on the server (model `grok-4.5`). Without a key, lint
and the skill factory still work.

```sh
npm run typecheck
node --experimental-strip-types --test src/lib/plainly/lint.test.ts
```

## Anti-slop appendix

Google's guide never listed model English. Plainly does:

| Group | Cut these | Keep |
| --- | --- | --- |
| Openers | *I'd be happy to*, *Great question*, *Let's dive in* | The answer |
| Wrappers | *It's important to note*, *Needless to say* | The fact |
| Brochure | *robust*, *seamless*, *tapestry*, *unlock the potential* | What happens |
| Hedges | *feel free to*, *you may want to* | The imperative |
| False ease | *simply*, *just click*, *please note* | The step |
| Padding | *in order to*, *in this guide we will* | *to*, or start |

Dialects: **Plainly** (Google + appendix) or **Google only**.

## How a rule is born

1. `src/lib/plainly/rules.ts` — regex the linter runs.
2. `src/lib/plainly/appendix.ts` — human tells the stylebook shows.
3. `skills/plainly/` — the file you drop into an agent host.

See [docs/architecture.md](docs/architecture.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Attribution

Operationalizes the [Google developer documentation style guide](https://developers.google.com/style/)
(CC BY 4.0). Independent. Not endorsed by Google.

Anti-slop rules are original to this project. See [NOTICE.md](NOTICE.md).

## License

MIT for original code and the anti-slop appendix. Google's source material
stays under its licenses.
