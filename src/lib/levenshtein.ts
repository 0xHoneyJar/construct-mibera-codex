export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export function suggestClosest(
  query: string,
  candidates: readonly string[],
  threshold = 4,
): { match: string; distance: number } | null {
  const q = query.toLowerCase();
  let best: { match: string; distance: number } | null = null;
  for (const c of candidates) {
    const d = levenshtein(q, c.toLowerCase());
    if (d <= threshold && (best === null || d < best.distance)) {
      best = { match: c, distance: d };
    }
  }
  return best;
}
