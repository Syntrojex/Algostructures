// Pure step generators for the Sorting Race. Every comparison and every swap/write is one frame.
export type RaceAlgo = 'bubble' | 'selection' | 'insertion' | 'shell' | 'merge' | 'quick' | 'heap';

export interface Frame {
  a: number[];        // the array at this moment
  hi: number[];       // indices being looked at / moved
  cmp: number;        // comparisons so far
  mov: number;        // swaps / writes so far
  done?: boolean;
}

export const RACE_ALGOS: { id: RaceAlgo; name: string; big: string }[] = [
  { id: 'bubble', name: 'Bubble Sort', big: 'O(n²)' },
  { id: 'selection', name: 'Selection Sort', big: 'O(n²)' },
  { id: 'insertion', name: 'Insertion Sort', big: 'O(n²)' },
  { id: 'shell', name: 'Shell Sort', big: 'O(n log² n)' },
  { id: 'merge', name: 'Merge Sort', big: 'O(n log n)' },
  { id: 'quick', name: 'Quick Sort', big: 'O(n log n)' },
  { id: 'heap', name: 'Heap Sort', big: 'O(n log n)' },
];

export function sortFrames(algo: RaceAlgo, input: number[]): Frame[] {
  const a = [...input];
  const n = a.length;
  const frames: Frame[] = [];
  let cmp = 0, mov = 0;
  const snap = (hi: number[] = []) => frames.push({ a: [...a], hi, cmp, mov });
  const less = (i: number, j: number) => { cmp++; snap([i, j]); return a[i] < a[j]; };
  const swap = (i: number, j: number) => { [a[i], a[j]] = [a[j], a[i]]; mov++; snap([i, j]); };

  snap();
  if (algo === 'bubble') {
    for (let p = 0; p < n - 1; p++) {
      let swapped = false;
      for (let i = 0; i < n - p - 1; i++) { if (less(i + 1, i)) { swap(i, i + 1); swapped = true; } }
      if (!swapped) break;
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) if (less(j, m)) m = j;
      if (m !== i) swap(i, m);
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0 && less(j, j - 1)) { swap(j, j - 1); j--; }
    }
  } else if (algo === 'shell') {
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < n; i++) {
        let j = i;
        while (j >= gap && less(j, j - gap)) { swap(j, j - gap); j -= gap; }
      }
    }
  } else if (algo === 'merge') {
    const rec = (lo: number, hi: number) => {
      if (hi - lo < 1) return;
      const mid = Math.floor((lo + hi) / 2);
      rec(lo, mid); rec(mid + 1, hi);
      const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        cmp++;
        snap([lo + i, mid + 1 + j]);
        a[k] = left[i] <= right[j] ? left[i++] : right[j++];
        mov++; snap([k]); k++;
      }
      while (i < left.length) { a[k] = left[i++]; mov++; snap([k]); k++; }
      while (j < right.length) { a[k] = right[j++]; mov++; snap([k]); k++; }
    };
    rec(0, n - 1);
  } else if (algo === 'quick') {
    const rec = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const pivot = hi;                       // pivot lives at the end
      let i = lo;
      for (let j = lo; j < hi; j++) { if (less(j, pivot)) { if (i !== j) swap(i, j); i++; } }
      if (i !== pivot) swap(i, pivot);
      rec(lo, i - 1); rec(i + 1, hi);
    };
    rec(0, n - 1);
  } else if (algo === 'heap') {
    const sift = (size: number, root: number) => {
      for (;;) {
        let big = root;
        const l = 2 * root + 1, r = 2 * root + 2;
        if (l < size) { cmp++; snap([big, l]); if (a[l] > a[big]) big = l; }
        if (r < size) { cmp++; snap([big, r]); if (a[r] > a[big]) big = r; }
        if (big === root) return;
        swap(root, big); root = big;
      }
    };
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) sift(n, i);
    for (let end = n - 1; end > 0; end--) { swap(0, end); sift(end, 0); }
  }
  frames.push({ a: [...a], hi: [], cmp, mov, done: true });
  return frames;
}

export type Order = 'random' | 'reversed' | 'nearly' | 'few';
export function makeArray(n: number, order: Order, rnd: () => number = Math.random): number[] {
  const base = Array.from({ length: n }, (_, i) => i + 1);
  if (order === 'reversed') return base.reverse().map(v => v * 3);
  if (order === 'nearly') {
    const a = base.map(v => v * 3);
    for (let k = 0; k < Math.max(1, Math.floor(n / 8)); k++) { const i = Math.floor(rnd() * n), j = Math.floor(rnd() * n); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  if (order === 'few') return Array.from({ length: n }, () => (Math.floor(rnd() * 4) + 1) * 20);
  const a = base.map(v => v * 3);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
