// ══════════════════════════════════════════════════════════════════════════
// Grading specs for the Practice Questions "Check" button.
// One entry per question id. `accept` lists equivalent ways the expected answer may be
// written; the grader parses every typed answer into a growth class (so `n^2`, `N²`,
// `quadratic`, `O(n²)` … all match) — see utils/gradeAnswer.ts.
// ══════════════════════════════════════════════════════════════════════════

export type GradeSpec =
  | { kind: 'single'; accept: string[]; placeholder: string }
  | { kind: 'bw'; best: string[]; worst: string[]; placeholder: string }
  | { kind: 'worst'; worst: string[]; placeholder: string }
  | { kind: 'proof'; f: (n: number) => number; g: (n: number) => number; minN: number; placeholder: string };

const S = (...accept: string[]): GradeSpec => ({ kind: 'single', accept, placeholder: 'e.g. O(n log n)' });
const BW = (best: string, worst: string): GradeSpec => ({ kind: 'bw', best: [best], worst: [worst], placeholder: 'Best: O(…), Worst: O(…)' });

const lg = (n: number) => Math.log2(n);
const proof = (f: (n: number) => number, g: (n: number) => number, minN = 1): GradeSpec =>
  ({ kind: 'proof', f, g, minN, placeholder: 'c = …, n0 = …' });

export const GRADING: Record<number, GradeSpec> = {
  // Basic loops
  1: S('n'), 2: S('n'), 3: S('n'), 4: S('1'), 5: S('n'), 6: S('n'), 7: S('rows*cols', 'n'),
  // Logarithmic
  8: S('log n'), 9: S('log n'), 10: S('log n'), 11: BW('1', 'log n'), 12: S('log n'), 13: S('(log n)^2'), 14: S('n log n'),
  // Nested
  15: S('n^2'), 16: S('n^2'), 17: S('n^2'), 18: S('n^3'), 19: S('n^4'), 20: S('n^4'),
  21: BW('n', 'n^2'), 22: BW('n^2', 'n^2'), 23: S('n^2'),
  // Sequential
  24: S('n'), 25: S('n'), 26: S('n^2'), 27: S('n^2'), 28: S('n^2'),
  // Geometric
  29: S('n'), 30: S('n'), 31: S('n^2'), 32: S('n^3'), 33: S('sqrt(n)'), 34: S('n'), 35: S('n'), 36: S('n^3'), 37: S('n^3'),
  // Conditionals
  38: BW('1', 'n'), 39: BW('sqrt(n)', 'sqrt(n)'), 40: { kind: 'worst', worst: ['n'], placeholder: 'Worst: O(…)' }, 41: BW('n', 'n^2'),
  // Function calls
  42: S('n^2'), 43: S('(log n)^2'), 44: S('n^2'), 45: S('n'), 46: S('n'), 47: S('n^2'), 48: S('n'), 49: S('n^3'), 50: S('n^3'), 51: S('n'),
  // Recursion
  52: S('n'), 53: S('log n'), 54: S('2^n'), 55: S('n log n'), 56: S('log n'), 57: S('2^n'),
  // Formal proofs — the learner supplies c and n0, and they are verified numerically
  58: proof(n => 9 * n ** 3 + 400 * n ** 2, n => n ** 3),
  59: proof(n => n ** 3 * 2 ** n + n ** 2 * 3 ** n, n => n ** 2 * 3 ** n),
  60: proof(n => (100 * n + lg(n)) * (25 * n + lg(n)), n => n ** 2),
  61: proof(n => n ** 3 + 4 * n + 2 ** n, n => 2 ** n),
  62: proof(n => n ** 2 / lg(n) + n, n => n ** 2 / lg(n), 2),
  63: S('2^n'),
  64: S('n^(k+a)', 'n^(a+k)'),
};

export const DEFAULT_PLACEHOLDER = 'e.g. O(n log n)';
