import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
    if (!apiKey) {
      return { ok: false as const, error: "Rewrite is not available in this environment." };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 3500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `${dialectHint(data.dialect)}\n\n---DRAFT---\n${data.text}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Rewrite failed (${res.status}). Try again.` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = body.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(raw) as { rewritten?: string; notes?: string[] };
      const rewritten = (parsed.rewritten ?? "").trim();
      if (!rewritten) {
        return { ok: false as const, error: "The desk returned an empty rewrite." };
      }
      const notes = Array.isArray(parsed.notes)
        ? parsed.notes.filter((note) => typeof note === "string").slice(0, 8)
        : [];
      return { ok: true as const, rewritten, notes };
    } catch {
      const fallback = raw.trim();
      if (!fallback) {
        return { ok: false as const, error: "The desk returned an empty rewrite." };
      }
      return { ok: true as const, rewritten: fallback, notes: [] as string[] };
    }
  });

export const REWRITE_MAX_CHARS = MAX_CHARS;
