---
name: plainly
description: Lint and rewrite prose against Google developer style plus the anti-slop appendix. Export a host-specific SKILL.md.
version: 1.0.0
metadata:
  hermes:
    tags: [k3ss, plainly]
    category: desk
---

# Plainly

A copy desk for Claude-lish. Lint, rewrite, export a Google-style writing skill.

## When to use

The operator is working in `plainly` or @mentions `plainly`.

## Do

Lint and rewrite prose against Google developer style plus the anti-slop appendix. Export a host-specific SKILL.md.

## Do not

Violate `.hermes/SOUL.md`. Do not commit secrets. Do not invent live market data, checksums, or Sharpes.

## Project

Load `AGENTS.md` at the repo root. Install the Bot with `./scripts/install-hermes-bot.sh`.

Chat: `hermes -p plainly chat`
