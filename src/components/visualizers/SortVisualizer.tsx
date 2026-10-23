import { useState, useRef, useCallback, useEffect } from 'react';

type BarState = 'default' | 'compare' | 'swap' | 'sorted' | 'pivot';

interface Bar {
  value: number;
  state: BarState;
}

interface SortVisualizerProps {
  algorithm: 'bubble' | 'selection' | 'insertion' | 'shell' | 'counting' | 'merge' | 'quick' | 'heap';
}

function randomArray(n = 10): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
}

export default function SortVisualizer({ algorithm }: SortVisualizerProps) {
  const [bars, setBars] = useState<Bar[]>(() =>
    randomArray().map(v => ({ value: v, state: 'default' }))
  );
  const [info, setInfo] = useState('Click Play to start sorting');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [customInput, setCustomInput] = useState('');
  const [customErr, setCustomErr] = useState('');
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [sortedResult, setSortedResult] = useState<number[]>([]);
  const stopRef = useRef(false);
  const stepsRef = useRef<Array<{ bars: Bar[]; info: string }>>([]);
  const stepIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barsRef = useRef(bars);
  useEffect(() => { barsRef.current = bars; }, [bars]);

  const delay = useRef(1100 - speed);
  useEffect(() => { delay.current = 1100 - speed; }, [speed]);

  const applyCustom = () => {
    const nums = customInput
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n) && n > 0 && n <= 999)
      .slice(0, 15);
    if (nums.length < 2) {
      setCustomErr('Enter at least 2 numbers (e.g. 5,3,8,1,9)');
      setTimeout(() => setCustomErr(''), 2500);
      return;
    }
    stopRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
    stepsRef.current = [];
    stepIdxRef.current = 0;
    setBars(nums.map(v => ({ value: v, state: 'default' })));
    setInfo(`Custom array set: [${nums.join(', ')}] — click Play!`);
    setComparisons(0);
    setSwaps(0);
    setCustomErr('');
    setIsDone(false);
    setSortedResult([]);
  };

  const clearInput = () => {
    setCustomInput('');
    setCustomErr('');
  };

  const reset = () => {
    stopRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
    stepsRef.current = [];
    stepIdxRef.current = 0;
    setBars(randomArray().map(v => ({ value: v, state: 'default' })));
    setInfo('Click Play to start sorting');
    setComparisons(0);
    setSwaps(0);
    setCustomInput('');
    setCustomErr('');
    setIsDone(false);
    setSortedResult([]);
  };

  const generateSteps = useCallback((arr: number[]): Array<{ bars: Bar[]; info: string }> => {
    const steps: Array<{ bars: Bar[]; info: string }> = [];
    const a = [...arr];
    const n = a.length;
    let cmp = 0, swp = 0;

    const snap = (states: Partial<Record<number, BarState>>, msg: string, sortedFrom?: number) => {
      const bs: Bar[] = a.map((v, i) => ({
        value: v,
        state: states[i] ?? (sortedFrom !== undefined && i >= sortedFrom ? 'sorted' : 'default'),
      }));
      steps.push({ bars: bs, info: msg });
    };

    if (algorithm === 'bubble') {
      for (let pass = 0; pass < n - 1; pass++) {
        let swapped = false;
        for (let i = 0; i < n - pass - 1; i++) {
          cmp++;
          snap({ [i]: 'compare', [i + 1]: 'compare' }, `Pass ${pass+1}: Comparing ${a[i]} and ${a[i+1]} | Cmps: ${cmp}`, n - pass);
          if (a[i] > a[i + 1]) {
            swp++;
            [a[i], a[i + 1]] = [a[i + 1], a[i]];
            snap({ [i]: 'swap', [i + 1]: 'swap' }, `Swap! ${a[i+1]} > ${a[i]} | Swaps: ${swp}`, n - pass);
            swapped = true;
          }
        }
        if (!swapped) { snap({}, `✅ Sorted early! No swaps in pass ${pass+1}`, 0); break; }
        snap({}, `Pass ${pass+1} complete`, n - pass - 1);
      }
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}, Swaps: ${swp}` });
    }

    if (algorithm === 'selection') {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        snap({ [i]: 'pivot' }, `Round ${i+1}: Finding min in [${i}..${n-1}]`, i);
        for (let j = i + 1; j < n; j++) {
          cmp++;
          snap({ [i]: 'pivot', [j]: 'compare', [minIdx]: 'compare' }, `Comparing ${a[j]} with min ${a[minIdx]} | Cmps: ${cmp}`, i);
          if (a[j] < a[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
          swp++;
          [a[i], a[minIdx]] = [a[minIdx], a[i]];
          snap({ [i]: 'swap' }, `Placed min ${a[i]} at index ${i} | Swaps: ${swp}`, i + 1);
        } else {
          snap({ [i]: 'sorted' }, `${a[i]} already in place`, i + 1);
        }
      }
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}, Swaps: ${swp}` });
    }

    if (algorithm === 'insertion') {
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        snap({ [i]: 'pivot' }, `Inserting key=${key} into sorted portion [0..${i-1}]`);
        while (j >= 0 && a[j] > key) {
          cmp++;
          a[j + 1] = a[j];
          snap({ [j]: 'compare', [j + 1]: 'swap' }, `Shifting ${a[j]} right | Cmps: ${cmp}`);
          j--;
        }
        a[j + 1] = key;
        snap({ [j + 1]: 'sorted' }, `Inserted ${key} at position ${j + 1}`);
      }
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}` });
    }

    if (algorithm === 'quick') {
      const qs = (lo: number, hi: number) => {
        if (lo >= hi) return;
        const pivot = a[hi];
        snap({ [hi]: 'pivot' }, `Pivot: ${pivot} at index ${hi}`);
        let p = lo;
        for (let j = lo; j < hi; j++) {
          cmp++;
          snap({ [j]: 'compare', [hi]: 'pivot' }, `Comparing ${a[j]} with pivot ${pivot} | Cmps: ${cmp}`);
          if (a[j] <= pivot) {
            [a[p], a[j]] = [a[j], a[p]];
            if (p !== j) { swp++; snap({ [p]: 'swap', [j]: 'swap', [hi]: 'pivot' }, `Swap | Swaps: ${swp}`); }
            p++;
          }
        }
        [a[p], a[hi]] = [a[hi], a[p]];
        snap({ [p]: 'sorted' }, `Pivot ${a[p]} placed at index ${p}`);
        qs(lo, p - 1);
        qs(p + 1, hi);
      };
      qs(0, n - 1);
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}, Swaps: ${swp}` });
    }

    if (algorithm === 'merge') {
      const ms = (lo: number, hi: number) => {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        ms(lo, mid);
        ms(mid + 1, hi);
        const left = a.slice(lo, mid + 1);
        const right = a.slice(mid + 1, hi + 1);
        let i = 0, j = 0, k = lo;
        while (i < left.length && j < right.length) {
          cmp++;
          if (left[i] <= right[j]) { a[k++] = left[i++]; }
          else { a[k++] = right[j++]; }
          const st: Partial<Record<number, BarState>> = {};
          for (let x = lo; x <= hi; x++) st[x] = 'compare';
          snap(st, `Merging [${lo}..${mid}] and [${mid+1}..${hi}] | Cmps: ${cmp}`);
        }
        while (i < left.length) { a[k++] = left[i++]; }
        while (j < right.length) { a[k++] = right[j++]; }
        const st: Partial<Record<number, BarState>> = {};
        for (let x = lo; x <= hi; x++) st[x] = 'swap';
        snap(st, `Merged segment [${lo}..${hi}]`);
      };
      ms(0, n - 1);
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}` });
    }

    if (algorithm === 'heap') {
      const heapify = (size: number, root: number) => {
        let largest = root;
        const l = 2 * root + 1, r = 2 * root + 2;
        if (l < size) { cmp++; snap({ [largest]: 'compare', [l]: 'compare' }, `Comparing ${a[largest]} with left child ${a[l]} | Cmps: ${cmp}`); if (a[l] > a[largest]) largest = l; }
        if (r < size) { cmp++; snap({ [largest]: 'compare', [r]: 'compare' }, `Comparing ${a[largest]} with right child ${a[r]} | Cmps: ${cmp}`); if (a[r] > a[largest]) largest = r; }
        if (largest !== root) {
          swp++;
          [a[root], a[largest]] = [a[largest], a[root]];
          snap({ [root]: 'swap', [largest]: 'swap' }, `Swap ${a[root]} down, ${a[largest]} up | Swaps: ${swp}`);
          heapify(size, largest);
        }
      };

      // Build max heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        snap({ [i]: 'pivot' }, `Building max heap: heapify at index ${i}`);
        heapify(n, i);
      }
      snap({}, '✅ Max heap built — largest element is now at the root');

      // Repeatedly extract the max and re-heapify
      for (let end = n - 1; end > 0; end--) {
        swp++;
        [a[0], a[end]] = [a[end], a[0]];
        snap({ [0]: 'swap', [end]: 'swap' }, `Move root ${a[end]} to sorted position ${end} | Swaps: ${swp}`, end);
        heapify(end, 0);
      }
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}, Swaps: ${swp}` });
    }

    if (algorithm === 'shell') {
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        snap({}, `Gap = ${gap}: insertion-sort every ${gap}-th element (elements ${gap} apart)`);
        for (let i = gap; i < n; i++) {
          let j = i;
          while (j >= gap) {
            cmp++;
            snap({ [j]: 'compare', [j - gap]: 'compare' }, `Gap ${gap}: comparing ${a[j - gap]} and ${a[j]} | Cmps: ${cmp}`);
            if (a[j - gap] > a[j]) {
              swp++;
              [a[j - gap], a[j]] = [a[j], a[j - gap]];
              snap({ [j]: 'swap', [j - gap]: 'swap' }, `Swap across the gap → ${a[j - gap]}, ${a[j]} | Swaps: ${swp}`);
              j -= gap;
            } else break;
          }
        }
        snap({}, `Gap ${gap} done — the array is now ${gap}-sorted`);
      }
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: ${cmp}, Swaps: ${swp}` });
    }

    if (algorithm === 'counting') {
      const max = Math.max(...a);
      const min = Math.min(...a);
      const count = new Array(max - min + 1).fill(0);
      snap({}, `Values range from ${min} to ${max} → make a count array with ${max - min + 1} slots (no comparisons are needed)`);
      for (let i = 0; i < n; i++) {
        count[a[i] - min]++;
        snap({ [i]: 'compare' }, `Read ${a[i]} → count[${a[i]}] becomes ${count[a[i] - min]}`);
      }
      const seen = count.map((c, v) => (c ? `${v + min}×${c}` : '')).filter(Boolean).join(', ');
      snap({}, `Counting done: ${seen}`);
      let k = 0;
      for (let v = 0; v < count.length; v++) {
        for (let c = 0; c < count[v]; c++) {
          a[k] = v + min;
          swp++;
          snap({ [k]: 'swap' }, `Write ${v + min} into position ${k} (it occurs ${count[v]}×) | Swaps: ${swp}`, k);
          k++;
        }
      }
      steps.push({ bars: a.map(v => ({ value: v, state: 'sorted' })), info: `✅ Done! Comparisons: 0, Writes: ${swp} — O(n + range), no comparing at all` });
    }

    return steps;
  }, [algorithm]);

  const runSteps = useCallback((steps: Array<{ bars: Bar[]; info: string }>, startIdx: number) => {
    const step = () => {
      if (stopRef.current) return;
      const idx = stepIdxRef.current;
      if (idx >= steps.length) {
        setRunning(false);
        return;
      }
      setBars(steps[idx].bars);
      setInfo(steps[idx].info);
      const cmpMatch = steps[idx].info.match(/Cmps: (\d+)/);
      const swpMatch = steps[idx].info.match(/Swaps: (\d+)/);
      if (cmpMatch) setComparisons(parseInt(cmpMatch[1]));
      if (swpMatch) setSwaps(parseInt(swpMatch[1]));
      // Check if done
      if (steps[idx].info.startsWith('✅ Done!') || steps[idx].info.startsWith('✅ Sorted early!')) {
        const finalVals = steps[idx].bars.map(b => b.value);
        setSortedResult(finalVals);
        setIsDone(true);
      }
      stepIdxRef.current++;
      timerRef.current = setTimeout(step, delay.current);
    };
    stepIdxRef.current = startIdx;
    step();
  }, []);

  const play = useCallback(() => {
    stopRef.current = false;
    setIsDone(false);
    setSortedResult([]);
    const currentVals = barsRef.current.map(b => b.value);
    const steps = generateSteps(currentVals);
    stepsRef.current = steps;
    stepIdxRef.current = 0;
    setRunning(true);
    setComparisons(0);
    setSwaps(0);
    runSteps(steps, 0);
  }, [generateSteps, runSteps]);

  const pause = () => {
    stopRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const resume = () => {
    if (stepIdxRef.current >= stepsRef.current.length) {
      play();
      return;
    }
    stopRef.current = false;
    setRunning(true);
    runSteps(stepsRef.current, stepIdxRef.current);
  };

  useEffect(() => () => { stopRef.current = true; if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const maxVal = Math.max(...bars.map(b => b.value), 1);

  const algoNames: Record<string, string> = {
    bubble: 'Bubble Sort', selection: 'Selection Sort',
    insertion: 'Insertion Sort', shell: 'Shell Sort', counting: 'Counting Sort',
    merge: 'Merge Sort', quick: 'Quick Sort', heap: 'Heap Sort',
  };

  const barColors: Record<BarState, string> = {
    default: 'linear-gradient(180deg, #00f5ff 0%, #0066aa 100%)',
    compare: 'linear-gradient(180deg, #ff6b35 0%, #cc3300 100%)',
    swap: 'linear-gradient(180deg, #ff2d78 0%, #aa0044 100%)',
    sorted: 'linear-gradient(180deg, #00ff88 0%, #007744 100%)',
    pivot: 'linear-gradient(180deg, #ffe600 0%, #cc9900 100%)',
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🎬 {algoNames[algorithm]} Visualizer</div>

      {/* Custom input */}
      <div className="custom-input-row">
        <label>Custom array (max 15):</label>
        <input
          className="viz-input"
          placeholder="e.g. 5,3,8,1,9,2"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyCustom()}
          style={{ minWidth: '160px' }}
        />
        <button className="viz-btn cyan" onClick={applyCustom}>✔ Apply</button>
        <button className="viz-btn" style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: 'var(--ak)' }}
          onClick={clearInput}>🗑️ Clear</button>
      </div>
      {customErr && (
        <div style={{ color: 'var(--ak)', fontFamily: 'Rajdhani', fontSize: '0.82rem', marginBottom: '6px', paddingLeft: '4px' }}>
          ⚠️ {customErr}
        </div>
      )}

      {/* Controls */}
      <div className="viz-controls">
        {!running ? (
          <button className="viz-btn primary" onClick={stepIdxRef.current > 0 && stepIdxRef.current < stepsRef.current.length ? resume : play}>
            ▶ {stepIdxRef.current > 0 && stepIdxRef.current < stepsRef.current.length ? 'Resume' : 'Play'}
          </button>
        ) : (
          <button className="viz-btn red" onClick={pause}>⏸ Pause</button>
        )}
        <button className="viz-btn" onClick={reset}>🔄 Reset</button>
        <button className="viz-btn green" onClick={() => {
          stopRef.current = true;
          if (timerRef.current) clearTimeout(timerRef.current);
          const sorted = [...bars].sort((a, b) => a.value - b.value).map(b => ({ ...b, state: 'sorted' as BarState }));
          setBars(sorted);
          setInfo('Array sorted! ✅ (skipped animation)');
          setRunning(false);
          stepsRef.current = [];
          stepIdxRef.current = 0;
          setSortedResult(sorted.map(b => b.value));
          setIsDone(true);
        }}>⚡ Skip</button>

        <div className="speed-control">
          <span>Speed:</span>
          <input type="range" min="100" max="1000" value={speed}
            onChange={e => setSpeed(Number(e.target.value))} />
          <span>{speed > 700 ? 'Fast' : speed > 400 ? 'Med' : 'Slow'}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--tm)' }}>
        <span>🔍 Comparisons: <strong style={{ color: 'var(--ac)' }}>{comparisons}</strong></span>
        <span>🔄 Swaps: <strong style={{ color: 'var(--ap)' }}>{swaps}</strong></span>
        <span>📊 Size: <strong style={{ color: 'var(--ag)' }}>{bars.length}</strong></span>
      </div>

      {/* Visualization stage */}
      <div className="viz-stage" style={{ minHeight: '180px', alignItems: 'flex-end', gap: bars.length > 10 ? '3px' : '5px' }}>
        {bars.map((bar, i) => (
          <div key={i} className="bar-wrap" style={{ flex: `0 0 ${bars.length > 12 ? '24px' : '32px'}` }}>
            <span className="bar-value" style={{ fontSize: bars.length > 12 ? '0.55rem' : '0.7rem' }}>{bar.value}</span>
            <div
              className={`sort-bar ${bar.state !== 'default' ? bar.state : ''}`}
              style={{
                height: `${Math.max(8, (bar.value / maxVal) * 150)}px`,
                background: barColors[bar.state],
                width: '100%',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.2s ease, background 0.2s ease',
                boxShadow: bar.state !== 'default' ? `0 0 8px ${bar.state === 'sorted' ? 'rgba(0,255,136,0.4)' : bar.state === 'compare' ? 'rgba(255,107,53,0.4)' : 'rgba(255,45,120,0.4)'}` : 'none',
              }}
            />
            <span className="bar-index">{i}</span>
          </div>
        ))}
      </div>

      <div className="viz-info">{info}</div>

      <div className="viz-legend">
        {[
          { color: '#00f5ff', label: 'Unsorted' },
          { color: '#ff6b35', label: 'Comparing' },
          { color: '#ff2d78', label: 'Swapping' },
          { color: '#00ff88', label: 'Sorted' },
          { color: '#ffe600', label: 'Pivot' },
        ].map(l => (
          <div key={l.label} className="legend-item">
            <div className="legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Final Answer */}
      {isDone && sortedResult.length > 0 && (
        <div className="viz-final-answer">
          <div className="viz-fa-label">📊 Final Answer</div>
          <div className="viz-fa-result">
            Sorted Array: [{sortedResult.join(', ')}]
          </div>
          <div className="viz-fa-sub">
            {algoNames[algorithm]} complete — {comparisons} comparisons{swaps > 0 ? `, ${swaps} swaps` : ''}
          </div>
        </div>
      )}
    </div>
  );
}
