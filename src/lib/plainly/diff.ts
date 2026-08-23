export type DiffToken = {
  type: "equal" | "add" | "remove";
  value: string;
};

function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

/** Word-level LCS diff. Fine for drafts under a few thousand words. */
export function diffWords(before: string, after: string): DiffToken[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? (dp[i + 1]![j + 1] ?? 0) + 1 : Math.max(dp[i + 1]![j] ?? 0, dp[i]![j + 1] ?? 0);
    }
  }
  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push(out, "equal", a[i]!);
      i += 1;
      j += 1;
    } else if ((dp[i + 1]![j] ?? 0) >= (dp[i]![j + 1] ?? 0)) {
      push(out, "remove", a[i]!);
      i += 1;
    } else {
      push(out, "add", b[j]!);
      j += 1;
    }
  }
  while (i < n) {
    push(out, "remove", a[i]!);
    i += 1;
  }
  while (j < m) {
    push(out, "add", b[j]!);
    j += 1;
  }
  return out;
}

function push(out: DiffToken[], type: DiffToken["type"], value: string) {
  const last = out[out.length - 1];
  if (last && last.type === type) {
    last.value += value;
    return;
  }
  out.push({ type, value });
}
