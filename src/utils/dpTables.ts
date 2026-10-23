// Pure builders for the DP table visualizers. Each returns every frame of the table being filled.
export interface Cell { r: number; c: number }
export interface DPStep { grid: (number | null)[][]; cur: Cell | null; from: Cell[]; info: string }
export interface DPConf {
  title: string; recurrence: string; rowLabels: string[]; colLabels: string[];
  steps: DPStep[]; takeaway: string; answer: number | null;
}
export const INF = 999;
const copy = (g: (number | null)[][]) => g.map(r => [...r]);

export function knapsack(wt: number[], val: number[], W: number): DPConf {
  const n = wt.length;
  const g: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
  const steps: DPStep[] = [];
  for (let w = 0; w <= W; w++) g[0][w] = 0;
  steps.push({ grid: copy(g), cur: null, from: [], info: 'Row 0 = zero items available, so the best value is 0 at every capacity. That is the base case.' });
  for (let i = 1; i <= n; i++) for (let w = 0; w <= W; w++) {
    const skip = g[i - 1][w] as number;
    if (wt[i - 1] > w) {
      g[i][w] = skip;
      steps.push({ grid: copy(g), cur: { r: i, c: w }, from: [{ r: i - 1, c: w }], info: `Item ${i} weighs ${wt[i - 1]}, which does not fit in capacity ${w}. Only one option: copy the value from the row above → ${skip}.` });
    } else {
      const take = val[i - 1] + (g[i - 1][w - wt[i - 1]] as number);
      g[i][w] = Math.max(skip, take);
      steps.push({ grid: copy(g), cur: { r: i, c: w }, from: [{ r: i - 1, c: w }, { r: i - 1, c: w - wt[i - 1] }], info: `Capacity ${w}: skip item ${i} → ${skip}, or take it → ${val[i - 1]} + dp[${i - 1}][${w - wt[i - 1]}] = ${take}. max = ${g[i][w]}.` });
    }
  }
  const best = g[n][W] as number;
  const chosen: number[] = [];
  for (let i = n, w = W; i >= 1; i--) if (g[i][w] !== g[i - 1][w]) { chosen.push(i); w -= wt[i - 1]; }
  chosen.reverse();
  const used = chosen.reduce((s, i) => s + wt[i - 1], 0);
  steps.push({ grid: copy(g), cur: { r: n, c: W }, from: [], info: `Done! Best value = ${best}. ${chosen.length ? `Take item${chosen.length > 1 ? 's' : ''} ${chosen.join(', ')} (total weight ${used} of ${W}).` : 'No item is worth taking.'}` });
  return {
    title: `0/1 Knapsack — weights [${wt}], values [${val}], capacity ${W}`,
    recurrence: 'dp[i][w] = max(dp[i-1][w],  val[i-1] + dp[i-1][w - wt[i-1]])',
    rowLabels: ['0 items', ...wt.map((w, i) => `item ${i + 1} (w${w}/v${val[i]})`)],
    colLabels: Array.from({ length: W + 1 }, (_, i) => String(i)),
    steps, answer: best,
    takeaway: 'Each row asks one question: with this item now available, is it worth taking? The row above is the answer without it. Every item is used at most once — that is the "0/1".',
  };
}

export function lcs(a: string, b: string): DPConf {
  const g: (number | null)[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(null));
  const steps: DPStep[] = [];
  for (let i = 0; i <= a.length; i++) g[i][0] = 0;
  for (let j = 0; j <= b.length; j++) g[0][j] = 0;
  steps.push({ grid: copy(g), cur: null, from: [], info: 'Row 0 and column 0 are all zeros — an empty string shares nothing with anything.' });
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    if (a[i - 1] === b[j - 1]) {
      g[i][j] = 1 + (g[i - 1][j - 1] as number);
      steps.push({ grid: copy(g), cur: { r: i, c: j }, from: [{ r: i - 1, c: j - 1 }], info: `'${a[i - 1]}' == '${b[j - 1]}' → both characters are used, so extend the diagonal: 1 + ${g[i - 1][j - 1]} = ${g[i][j]}.` });
    } else {
      g[i][j] = Math.max(g[i - 1][j] as number, g[i][j - 1] as number);
      steps.push({ grid: copy(g), cur: { r: i, c: j }, from: [{ r: i - 1, c: j }, { r: i, c: j - 1 }], info: `'${a[i - 1]}' != '${b[j - 1]}' → drop one character from one string and keep the better answer: max(${g[i - 1][j]}, ${g[i][j - 1]}) = ${g[i][j]}.` });
    }
  }
  let i = a.length, j = b.length, seq = '';
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { seq = a[i - 1] + seq; i--; j--; }
    else if ((g[i - 1][j] as number) >= (g[i][j - 1] as number)) i--; else j--;
  }
  const len = g[a.length][b.length] as number;
  steps.push({ grid: copy(g), cur: { r: a.length, c: b.length }, from: [], info: `Done! The LCS length is ${len}${len ? ` — one such subsequence is "${seq}"` : ' — the strings share no characters'}.` });
  return {
    title: `LCS of "${a}" and "${b}"`,
    recurrence: 'match → dp[i][j] = 1 + dp[i-1][j-1]   ·   mismatch → max(dp[i-1][j], dp[i][j-1])',
    rowLabels: ['∅', ...a.split('')], colLabels: ['∅', ...b.split('')], steps, answer: len,
    takeaway: 'The bottom-right cell is the LCS length. Walking back up through the arrows reconstructs the subsequence itself.',
  };
}

export function coinChange(coins: number[], amount: number): DPConf {
  const g: (number | null)[][] = [Array(amount + 1).fill(null)];
  const steps: DPStep[] = [];
  g[0][0] = 0;
  steps.push({ grid: copy(g), cur: { r: 0, c: 0 }, from: [], info: 'dp[0] = 0 — it takes zero coins to make zero. Every other amount starts as infinity (∞).' });
  for (let amt = 1; amt <= amount; amt++) {
    let best = INF; const from: Cell[] = []; const tries: string[] = [];
    for (const c of coins) if (c <= amt) {
      const prev = g[0][amt - c] as number;
      if (prev < INF) { from.push({ r: 0, c: amt - c }); best = Math.min(best, 1 + prev); tries.push(`1 + dp[${amt - c}] = ${1 + prev}`); }
      else tries.push(`dp[${amt - c}] = ∞ (unreachable)`);
    }
    g[0][amt] = best;
    steps.push({ grid: copy(g), cur: { r: 0, c: amt }, from, info: `Amount ${amt}: ${tries.length ? `try every coin ≤ ${amt} → ${tries.join(', ')}. Best = ${best >= INF ? '∞ (cannot be made)' : best}.` : `no coin is ≤ ${amt}, so it cannot be made → ∞.`}` });
  }
  const dpv = g[0][amount] as number;
  let greedy = 0, left = amount; const sorted = [...coins].sort((x, y) => y - x);
  for (const c of sorted) { const k = Math.floor(left / c); greedy += k; left -= k * c; }
  const greedyOk = left === 0;
  steps.push({ grid: copy(g), cur: { r: 0, c: amount }, from: [], info: dpv >= INF ? `Done! ${amount} cannot be made with these coins.` : `Done! The minimum is ${dpv} coin${dpv > 1 ? 's' : ''} for ${amount}.` });
  return {
    title: `Coin Change — coins [${coins}], amount ${amount}`,
    recurrence: 'dp[a] = min(dp[a],  1 + dp[a - coin])   for every coin ≤ a',
    rowLabels: ['dp'], colLabels: Array.from({ length: amount + 1 }, (_, i) => String(i)), steps, answer: dpv >= INF ? null : dpv,
    takeaway: dpv >= INF ? 'No combination of these coins adds up to the amount — DP shows ∞ for it.'
      : !greedyOk ? `Greedy (always the biggest coin) cannot even make ${amount} here, but DP finds ${dpv}.`
      : greedy > dpv ? `Greedy (biggest coin first) uses ${greedy} coins, but DP finds ${dpv}. That gap is exactly why coin change is a DP problem, not a greedy one.`
      : `Greedy also gives ${greedy} here — try coins like 1, 3, 4 with amount 6 to see greedy fail (it uses 3 coins, DP finds 2).`,
  };
}

export function editDistance(a: string, b: string): DPConf {
  const g: (number | null)[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(null));
  const steps: DPStep[] = [];
  for (let i = 0; i <= a.length; i++) g[i][0] = i;
  for (let j = 0; j <= b.length; j++) g[0][j] = j;
  steps.push({ grid: copy(g), cur: null, from: [], info: 'Base row and column: turning a string into the empty string costs one deletion per character, and vice versa.' });
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    if (a[i - 1] === b[j - 1]) {
      g[i][j] = g[i - 1][j - 1] as number;
      steps.push({ grid: copy(g), cur: { r: i, c: j }, from: [{ r: i - 1, c: j - 1 }], info: `'${a[i - 1]}' == '${b[j - 1]}' → free. Copy the diagonal: ${g[i][j]}.` });
    } else {
      const del = g[i - 1][j] as number, ins = g[i][j - 1] as number, rep = g[i - 1][j - 1] as number;
      g[i][j] = 1 + Math.min(del, ins, rep);
      steps.push({ grid: copy(g), cur: { r: i, c: j }, from: [{ r: i - 1, c: j }, { r: i, c: j - 1 }, { r: i - 1, c: j - 1 }], info: `'${a[i - 1]}' != '${b[j - 1]}' → 1 + min(delete ${del}, insert ${ins}, replace ${rep}) = ${g[i][j]}.` });
    }
  }
  const d = g[a.length][b.length] as number;
  steps.push({ grid: copy(g), cur: { r: a.length, c: b.length }, from: [], info: `Done! "${a}" → "${b}" needs ${d} edit${d === 1 ? '' : 's'} at minimum.` });
  return {
    title: `Edit Distance — "${a}" → "${b}"`,
    recurrence: 'match → dp[i-1][j-1]   ·   else → 1 + min(delete, insert, replace)',
    rowLabels: ['∅', ...a.split('')], colLabels: ['∅', ...b.split('')], steps, answer: d,
    takeaway: `The three neighbours are the three edits: above = delete, left = insert, diagonal = replace. The bottom-right cell is the answer (${d}).`,
  };
}

// ── input parsing (shared by the UI and the tests) ──
export function parseNums(text: string, min: number, max: number, maxCount: number): number[] | string {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) return 'Enter at least one number.';
  if (parts.length > maxCount) return `Use at most ${maxCount} numbers.`;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^-?\d+$/.test(p)) return `“${p}” is not a whole number.`;
    const n = parseInt(p, 10);
    if (n < min || n > max) return `Numbers must be between ${min} and ${max}.`;
    out.push(n);
  }
  return out;
}
