# Install the Plainly skill

Keep this folder together. Place it in the skill directory your host reads.

| Host | Destination |
| --- | --- |
| Claude Code (project) | `.claude/skills/plainly/` |
| Claude Code (user) | `~/.claude/skills/plainly/` |
| Codex (project) | `.agents/skills/plainly/` |
| Codex (user) | `~/.agents/skills/plainly/` |
| Cursor | `.cursor/skills/plainly/` |
| Windsurf | `.windsurf/skills/plainly/` |
| Generic | `skills/plainly/` |

Copy:

```sh
git clone https://github.com/anwhelan01/plainly.git
cp -R plainly/skills/plainly .claude/skills/plainly
```

Start a new agent task so the host reloads skills. Invoke it by name:

```text
Use $plainly to revise this draft. Keep the facts. Cut the Claude-lish.
```

Audit without rewriting:

```text
Use $plainly to audit this README. Report the highest-risk problems. Don't rewrite it.
```
