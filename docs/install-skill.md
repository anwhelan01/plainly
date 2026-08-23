# Install the skill

The web app can export a custom `SKILL.md`. The canonical copy lives in
[`skills/plainly/`](../skills/plainly/).

## What you get

A compact agent skill that:

1. Puts the reader's answer first.
2. Preserves facts, code, and UI labels.
3. Applies Google developer-docs voice (you, active, present tense).
4. Deletes Claude-lish using the anti-slop appendix.
5. Stops when the page is already clear.

It is not a generic "simplify everything" prompt.

## Hosts

See [`skills/plainly/README.md`](../skills/plainly/README.md) for paths.

After you copy the folder, start a **new** agent task. Old sessions keep a
stale skill list.

## House rules

On the Skill page you can:

- Pick a host (Claude Code, Codex, Cursor, Windsurf, generic).
- Pick a dialect: **Plainly** (Google + anti-slop) or **Google only**.
- Add banned words (one per line).
- Add extra house rules (product names, things never to change).

Copy or download the file and drop it in as `SKILL.md`.

## Invoke

```text
Use $plainly to revise this procedure. Keep every command and filename.
```

```text
Use $plainly to audit this release note. Don't rewrite it.
```
