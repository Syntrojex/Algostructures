export interface BSFrame { lo: number; hi: number; mid: number; found: number; note: string }

export function parseSorted(text: string): { arr: number[]; sortedForYou: boolean } | string {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (parts.length < 2) return 'Enter at least 2 numbers, e.g. 3, 8, 12, 20';
  if (parts.length > 16) return 'Use at most 16 numbers.';
  const arr: number[] = [];
  for (const p of parts) { if (!/^-?\d+$/.test(p)) return `“${p}” is not a whole number.`; arr.push(parseInt(p, 10)); }
  if (arr.some(v => Math.abs(v) > 9999)) return 'Keep numbers between -9999 and 9999.';
  const sorted = [...arr].sort((a, b) => a - b);
  return { arr: sorted, sortedForYou: sorted.some((v, i) => v !== arr[i]) };
}

export function binarySearchFrames(arr: number[], t: number): BSFrame[] {
  const f: BSFrame[] = [{ lo: 0, hi: arr.length - 1, mid: -1, found: -1, note: `Search for ${t}. The whole array [0..${arr.length - 1}] is still possible.` }];
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === t) { f.push({ lo, hi, mid, found: mid, note: `lo=${lo}, hi=${hi} → mid=${mid}, arr[mid]=${arr[mid]} equals ${t} → FOUND at index ${mid} after ${f.length} comparison${f.length > 1 ? 's' : ''}.` }); return f; }
    const goRight = arr[mid] < t;
    f.push({ lo, hi, mid, found: -1, note: `lo=${lo}, hi=${hi} → mid=${mid}, arr[mid]=${arr[mid]} is ${goRight ? 'smaller' : 'bigger'} than ${t} → throw away the ${goRight ? 'left' : 'right'} half and search ${goRight ? `[${mid + 1}..${hi}]` : `[${lo}..${mid - 1}]`}.` });
    if (goRight) lo = mid + 1; else hi = mid - 1;
  }
  f.push({ lo, hi, mid: -1, found: -2, note: `lo (${lo}) passed hi (${hi}) → the search space is empty. ${t} is NOT in the array (${f.length - 1} comparison${f.length > 2 ? 's' : ''}).` });
  return f;
}
