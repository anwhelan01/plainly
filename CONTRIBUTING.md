# Contributing

## Add a tell

The linter and the stylebook must stay in sync.

1. Add a pattern to the matching rule in `src/lib/plainly/rules.ts`.
2. Add the human phrase to `src/lib/plainly/appendix.ts` (`RULE_TELLS`).
3. If it belongs in the packaged skill, add it to
   `skills/plainly/references/appendix.md` and the appendix list in
   `src/lib/plainly/skill-md.ts`.
4. Cover it in `src/lib/plainly/lint.test.ts`.

Run:

```sh
npm run typecheck
node --experimental-strip-types --test src/lib/plainly/lint.test.ts
```

## Voice

Write the way Plainly lints. Second person. Present tense. No brochure words.
No pre-announcements.

## Scope

Don't add accounts, a database, or a rewrite call that runs on page load.
Drafts stay in `localStorage`. Rewrite stays a button.
