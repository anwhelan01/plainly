import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { reserveRewrite } from "./quota.server";
import { requestRewrite } from "./rewrite-provider.server";
import type { Dialect } from "./types.ts";

const MAX_CHARS = 8000;

const Input = z.object({
  text: z.string().min(1).max(MAX_CHARS),
  dialect: z.enum(["google", "plainly"]),
});

const SYSTEM = `You are Plainly, a copy desk for technical English.

Rewrite the user's draft. Return ONLY valid JSON:
{"rewritten":"...","notes":["short reason","..."]}

Hard rules:
- Preserve facts, numbers, links, code, filenames, API names, UI labels, product names, and quotations.
- Preserve modality (can/might/should/must). Do not upgrade hedges into certainty.
- Do not add claims, features, or praise.
- Second person (you). Active voice. Present tense for current behavior.
- Conditions before instructions.
- Sentence-case headings if any.
- No please, simply, just, easy, in order to, leverage, utilize.
- No throat-clearing (I'd be happy to, certainly, great question, let's dive in).
- No brochure words (robust, seamless, cutting-edge, empower, tapestry, landscape, pivotal, unlock potential).
- No pre-announcements ("this guide will cover").
- Short sentences, varied rhythm. Not childish. Not identical staccato.
- American spelling. Serial comma. No exclamation marks.
- Write for a global audience: no idioms.
- If the draft is already clear, change little. Stop early.
- Keep markdown structure (lists, fences, headings).
- notes: at most 8 bullets, each one concrete change. Empty array if almost unchanged.`;

function dialectHint(dialect: Dialect): string {
  if (dialect === "google") {
    return "Dialect: Google Developer Documentation Style Guide only. Do not hunt brochure words unless they also violate Google guidance.";
  }
  return "Dialect: Plainly. Apply Google rules plus the anti-slop appendix. Prefer the shortest accurate word.";
}

export const rewriteDraft = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    const model = process.env.XAI_MODEL;
    const directory = process.env.PLAINLY_DATA_DIR;
    if (process.env.PLAINLY_REWRITE_ENABLED !== "true" || !apiKey || !model || !directory) {
      return { ok: false as const, error: "AI rewrite is not enabled here. Local checks and skill export still work." };
    }
    try {
      if (!reserveRewrite(directory, Number(process.env.PLAINLY_DAILY_REWRITES ?? 50))) {
        return { ok: false as const, error: "The shared rewrite allowance is busy or used up. Try later; local checks still work." };
      }
    } catch {
      return { ok: false as const, error: "Rewrite is temporarily unavailable. Your draft has not changed." };
    }
    return requestRewrite(apiKey, model, SYSTEM, `${dialectHint(data.dialect)}\n\n---DRAFT---\n${data.text}`);
  });

export const REWRITE_MAX_CHARS = MAX_CHARS;
