import assert from "node:assert/strict";
import { test } from "node:test";
import { APPENDIX_RULE_IDS, RULE_TELLS } from "./appendix.ts";
import { lint } from "./lint.ts";
import { RULES_BY_ID } from "./rules.ts";

test("flags Claude-lish openers and brochure words", () => {
  const result = lint(
    "Great question! I'd be happy to help. Let's dive in and leverage this robust, seamless toolkit in order to empower teams.",
  );
  const messages = result.findings.map((finding) => finding.message).join(" | ");
  assert.match(messages, /throat-clearing|cheerleading|Great question/i);
  assert.ok(result.findings.some((finding) => /leverage/i.test(finding.excerpt)));
  assert.ok(result.findings.some((finding) => /robust/i.test(finding.excerpt)));
  assert.ok(result.slopIndex > 20);
});

test("skips fenced code and URLs", () => {
  const result = lint("See https://example.com/leverage and `leverage` and:\n```\nleverage robust\n```\n");
  assert.equal(
    result.findings.filter((finding) => finding.excerpt.toLowerCase().includes("leverage")).length,
    0,
  );
});

test("clean control scores high", () => {
  const result = lint(
    "To install the CLI, run npm install -g plainly.\n\nYou can lint a file. Click Deploy when you are ready. The API returns JSON.",
  );
  assert.ok(result.clarityScore >= 85, `clarity ${result.clarityScore}`);
  assert.ok(result.slopIndex <= 10, `slop ${result.slopIndex}`);
});

test("flags please / simply / in order to", () => {
  const result = lint("Please note that in order to install it, you simply run the command.");
  assert.ok(result.findings.some((finding) => finding.ruleId === "please"));
  assert.ok(result.findings.some((finding) => finding.ruleId === "simply-just-easy"));
  assert.ok(result.findings.some((finding) => finding.ruleId === "in-order-to"));
});

test("appendix catalog matches live rules", () => {
  for (const id of APPENDIX_RULE_IDS) {
    assert.ok(RULES_BY_ID[id], `missing rule ${id}`);
    assert.ok((RULE_TELLS[id] ?? []).length > 0, `no tells for ${id}`);
  }
  for (const phrase of [
    "I'd be happy to help.",
    "It's important to note that auth is off.",
    "A robust seamless pipeline.",
  ]) {
    const hits = lint(phrase).findings.filter((finding) =>
      APPENDIX_RULE_IDS.includes(finding.ruleId),
    );
    assert.ok(hits.length > 0, `expected appendix hit for: ${phrase}`);
  }
});
