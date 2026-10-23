// Optimal next move for ANY legal Tower of Hanoi position (goal: every disk on peg `goal`).
// To get disk k onto the goal peg: if it is already there, handle the smaller disks; otherwise
// first park every smaller disk on the third peg, then move disk k. Repeating this always
// follows a shortest path to the solution.
export interface HanoiMove { disk: number; from: number; to: number }

export function nextOptimalMove(pegs: number[][], goal = 2): HanoiMove | null {
  const n = pegs.reduce((s, p) => s + p.length, 0);
  const pegOf: number[] = new Array(n + 1).fill(0);
  pegs.forEach((p, pi) => p.forEach(d => { pegOf[d] = pi; }));
  const solve = (k: number, target: number): HanoiMove | null => {
    if (k === 0) return null;
    const from = pegOf[k];
    if (from === target) return solve(k - 1, target);
    const helper = 3 - from - target;
    return solve(k - 1, helper) ?? { disk: k, from, to: target };
  };
  return solve(n, goal);
}

export function canPlace(pegs: number[][], from: number, to: number): boolean {
  if (from === to || !pegs[from].length) return false;
  const disk = pegs[from][pegs[from].length - 1];
  const top = pegs[to][pegs[to].length - 1];
  return top === undefined || disk < top;
}
