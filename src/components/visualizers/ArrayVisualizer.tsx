import NumberStepper from '../NumberStepper';
import { useState, useMemo, useRef, useEffect } from 'react';

type ArrayMode = 'twopointer' | 'slidingwindow' | 'kadane' | 'prefixsum';

interface ArrayVisualizerProps {
  modes: ArrayMode[];
}

const MODE_LABELS: Record<ArrayMode, string> = {
  twopointer: 'Two Pointer',
  slidingwindow: 'Sliding Window',
  kadane: "Kadane's Algorithm",
  prefixsum: 'Prefix Sum',
};

interface Step {
  arr: number[];
  highlights: Record<number, string>; // index -> css class suffix
  info: string;
  extra?: string; // e.g. running sum / max / window sum display
}

function parseCustom(input: string, fallback: number[]): number[] {
  if (!input.trim()) return fallback;
  const nums = input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  return nums.length > 0 ? nums.slice(0, 12) : fallback;
}

const DEFAULTS: Record<ArrayMode, number[]> = {
  twopointer: [1, 2, 3, 4, 6, 8, 11],
  slidingwindow: [2, 1, 5, 1, 3, 2],
  kadane: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
  prefixsum: [3, 1, 4, 1, 5, 9, 2, 6],
};

export default function ArrayVisualizer({ modes }: ArrayVisualizerProps) {
  const [mode, setMode] = useState<ArrayMode>(modes[0]);
  const [customInput, setCustomInput] = useState('');
  const [target, setTarget] = useState('11');
  const [k, setK] = useState('3');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseArr = useMemo(() => parseCustom(customInput, DEFAULTS[mode]), [customInput, mode]);

  useEffect(() => {
    setCustomInput('');
  }, [mode]);

  const steps: Step[] = useMemo(() => {
    const arr = [...baseArr];
    const n = arr.length;
    const out: Step[] = [];

    if (mode === 'twopointer') {
      const t = parseInt(target, 10) || 0;
      const wasUnsorted = arr.some((v, i) => i > 0 && arr[i - 1] > v);
      if (wasUnsorted) arr.sort((a, b) => a - b);          // the two-pointer trick only works on a sorted array
      let lo = 0, hi = n - 1;
      out.push({ arr, highlights: { [lo]: 'ptr-left', [hi]: 'ptr-right' }, info: `${wasUnsorted ? 'Two Pointer needs a sorted array, so your numbers were sorted first. ' : ''}Looking for two numbers that sum to ${t}. lo=${lo}, hi=${hi}` });
      while (lo < hi) {
        const sum = arr[lo] + arr[hi];
        if (sum === t) {
          out.push({ arr, highlights: { [lo]: 'found', [hi]: 'found' }, info: `arr[${lo}]+arr[${hi}] = ${arr[lo]}+${arr[hi]} = ${sum} ✅ MATCH!` });
          break;
        } else if (sum < t) {
          out.push({ arr, highlights: { [lo]: 'ptr-left', [hi]: 'ptr-right' }, info: `arr[${lo}]+arr[${hi}] = ${sum} < ${t} → sum too small, move lo right` });
          lo++;
        } else {
          out.push({ arr, highlights: { [lo]: 'ptr-left', [hi]: 'ptr-right' }, info: `arr[${lo}]+arr[${hi}] = ${sum} > ${t} → sum too big, move hi left` });
          hi--;
        }
        if (lo < hi) out.push({ arr, highlights: { [lo]: 'ptr-left', [hi]: 'ptr-right' }, info: `lo=${lo}, hi=${hi}` });
      }
      if (lo >= hi && out[out.length - 1]?.info.indexOf('MATCH') === -1) {
        out.push({ arr, highlights: {}, info: 'Pointers crossed — no pair found.' });
      }
    }

    else if (mode === 'slidingwindow') {
      const winK = Math.max(1, Math.min(parseInt(k, 10) || 3, n));
      let sum = 0;
      for (let i = 0; i < winK; i++) sum += arr[i];
      let maxSum = sum;
      const h: Record<number, string> = {};
      for (let i = 0; i < winK; i++) h[i] = 'window';
      out.push({ arr, highlights: { ...h }, info: `Initial window [0, ${winK - 1}], sum = ${sum}`, extra: `Max so far: ${maxSum}` });
      for (let i = winK; i < n; i++) {
        sum += arr[i] - arr[i - winK];
        maxSum = Math.max(maxSum, sum);
        const hh: Record<number, string> = {};
        for (let j = i - winK + 1; j <= i; j++) hh[j] = 'window';
        hh[i] = 'window-new';
        hh[i - winK] = 'window-out';
        out.push({ arr, highlights: hh, info: `Slide window: +arr[${i}](${arr[i]}) −arr[${i - winK}](${arr[i - winK]}) → sum = ${sum}`, extra: `Max so far: ${maxSum}` });
      }
      out.push({ arr, highlights: {}, info: `✅ Done. Maximum sum of any window of size ${winK} = ${maxSum}`, extra: `Answer: ${maxSum}` });
    }

    else if (mode === 'kadane') {
      let curSum = arr[0], maxSum = arr[0], start = 0, bestStart = 0, bestEnd = 0;
      out.push({ arr, highlights: { 0: 'window' }, info: `Start: curSum = ${arr[0]}, maxSum = ${arr[0]}`, extra: `Max: ${maxSum}` });
      for (let i = 1; i < n; i++) {
        if (curSum < 0) { curSum = arr[i]; start = i; }
        else { curSum += arr[i]; }
        if (curSum > maxSum) { maxSum = curSum; bestStart = start; bestEnd = i; }
        const h: Record<number, string> = {};
        for (let j = start; j <= i; j++) h[j] = 'window';
        out.push({ arr, highlights: h, info: `i=${i}, val=${arr[i]}: curSum = ${curSum}${curSum === arr[i] ? ' (reset — previous sum was negative)' : ''}`, extra: `Max: ${maxSum}` });
      }
      const finalH: Record<number, string> = {};
      for (let j = bestStart; j <= bestEnd; j++) finalH[j] = 'found';
      out.push({ arr, highlights: finalH, info: `✅ Best subarray is [${bestStart}, ${bestEnd}] with sum ${maxSum}`, extra: `Answer: ${maxSum}` });
    }

    else if (mode === 'prefixsum') {
      const prefix = [arr[0]];
      out.push({ arr, highlights: { 0: 'window' }, info: `prefix[0] = arr[0] = ${arr[0]}`, extra: `Prefix so far: [${prefix.join(', ')}]` });
      for (let i = 1; i < n; i++) {
        prefix.push(prefix[i - 1] + arr[i]);
        out.push({ arr, highlights: { [i]: 'window', [i - 1]: 'window-out' }, info: `prefix[${i}] = prefix[${i - 1}](${prefix[i - 1]}) + arr[${i}](${arr[i]}) = ${prefix[i]}`, extra: `Prefix so far: [${prefix.join(', ')}]` });
      }
      out.push({ arr, highlights: {}, info: '✅ Prefix sum array complete — any range sum [i,j] is now prefix[j] − prefix[i-1] in O(1)', extra: `Final: [${prefix.join(', ')}]` });
    }

    return out;
  }, [mode, baseArr, target, k]);

  useEffect(() => {
    setStepIdx(0);
    setRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [steps]);

  useEffect(() => {
    if (!running) return;
    if (stepIdx >= steps.length - 1) { setRunning(false); return; }
    timerRef.current = setTimeout(() => setStepIdx(i => i + 1), speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, stepIdx, steps.length, speed]);

  const cur = steps[Math.min(stepIdx, steps.length - 1)] || { arr: baseArr, highlights: {}, info: '' };

  const needsTarget = mode === 'twopointer';
  const needsK = mode === 'slidingwindow';

  return (
    <div className="viz-panel array-viz">
      <div className="viz-panel-title">🎬 Array Visualizer</div>

      <div className="bit-mode-tabs">
        {modes.map(m => (
          <button key={m} className={`bit-mode-tab ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="bit-controls" style={{ flexWrap: 'wrap' }}>
        <label style={{ flex: 1, minWidth: '220px' }}>
          Array (comma-separated, max 12) ={' '}
          <input
            type="text"
            className="viz-input"
            style={{ width: '100%', maxWidth: '260px' }}
            placeholder={DEFAULTS[mode].join(',')}
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
          />
        </label>
        {needsTarget && (
          <label>Target = <NumberStepper value={target} onChange={setTarget} min={-999} max={999} width={96} ariaLabel="Target" /></label>
        )}
        {needsK && (
          <label>Window size k = <NumberStepper value={k} onChange={setK} min={1} max={12} width={84} ariaLabel="Window size" /></label>
        )}
      </div>

      <div className="bit-play-controls">
        {!running ? (
          <button className="viz-btn" onClick={() => setRunning(true)} disabled={stepIdx >= steps.length - 1}>▶ Play</button>
        ) : (
          <button className="viz-btn" onClick={() => setRunning(false)}>⏸ Pause</button>
        )}
        <button className="viz-btn" onClick={() => { setRunning(false); setStepIdx(i => Math.max(0, i - 1)); }} disabled={stepIdx === 0}>⏮ Prev</button>
        <button className="viz-btn" onClick={() => { setRunning(false); setStepIdx(i => Math.min(steps.length - 1, i + 1)); }} disabled={stepIdx >= steps.length - 1}>Next ⏭</button>
        <button className="viz-btn" onClick={() => { setRunning(false); setStepIdx(0); }}>↺ Reset</button>
        <label className="bit-speed-label">
          Speed
          <input type="range" min={200} max={1200} step={50} value={1400 - speed} onChange={e => setSpeed(1400 - Number(e.target.value))} />
        </label>
      </div>

      <div className="array-viz-cells">
        {cur.arr.map((v, i) => (
          <div key={i} className={`array-cell ${cur.highlights[i] ? 'ac-' + cur.highlights[i] : ''}`}>
            <div className="array-cell-val">{v}</div>
            <div className="array-cell-idx">{i}</div>
          </div>
        ))}
      </div>

      {cur.extra && <div className="array-viz-extra">{cur.extra}</div>}
      <div className="viz-info">{cur.info}</div>
      <div className="array-viz-progress">Step {Math.min(stepIdx + 1, steps.length)} / {steps.length}</div>
    </div>
  );
}
