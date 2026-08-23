# Architecture

Plainly is a TanStack Start app (React 19, Vite, Tailwind v4). Auth and the
database stay off. Drafts persist in `localStorage`. Rewrite calls the xAI
Chat Completions API from a server function, only when you press Rewrite.

## Surfaces

| Route | What it does |
| --- | --- |
| `/` | Desk: paste, live lint, rewrite, diff |
| `/stylebook` | Rule explorer, anti-slop appendix, phrase tester |
| `/skill` | Skill factory: host, dialect, house words, download `SKILL.md` |

## Core library (`src/lib/plainly/`)

| File | Role |
| --- | --- |
| `rules.ts` | One rule catalog. Regex patterns drive the linter. |
| `lint.ts` | Local linter. Skips fenced code, inline code, and URLs. |
| `appendix.ts` | Human tell list for the stylebook. Must stay in sync with `rules.ts`. |
| `rewrite.ts` | Server function. Model `grok-4.5`. JSON `{ rewritten, notes }`. |
| `skill-md.ts` | Builds the drop-in `SKILL.md`. |
| `diff.ts` | Word-level LCS for the rewrite pane. |
| `samples.ts` | Desk samples and the `localStorage` key. |
| `types.ts` | Shared types. |

The packaged skill in `skills/plainly/` is the same text the factory emits for
the Plainly dialect with no house words.

## Scoring

Each finding has a severity: slop (8), style (4), nit (1.5). The slop index is
weighted hits per 100 words, capped at 100. Clarity starts at 100 and subtracts
slop plus a penalty for long average sentences.

## Rewrite contract

- User-initiated. No call on keystroke or page load.
- Input cap: 8,000 characters. Output cap: 3,500 tokens.
- Preserve facts, code, filenames, API names, UI labels, quotations, and modality.
- Degrade to a visible error if `XAI_API_KEY` is missing.

## Tests

```sh
node --experimental-strip-types --test src/lib/plainly/lint.test.ts
```

The suite checks Claude-lish detection, code/URL skipping, a clean control,
Google word-list hits, and that every appendix rule has tells.
