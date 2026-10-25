import NumberStepper from '../NumberStepper';
import { useMemo, useState } from 'react';
import { StepControls, useStepper } from './useStepper';

const rand = () => Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);

export default function LinearSearchVisualizer() {
  const [arr, setArr] = useState<number[]>(rand);
  const [text, setText] = useState('');
  const [target, setTarget] = useState(() => arr[Math.floor(arr.length * 0.6)]);
  const [err, setErr] = useState('');

  const frames = useMemo(() => {
    const f: { i: number; found: boolean; note: string }[] = [];
    f.push({ i: -1, found: false, note: `Look for ${target}. Start at index 0 and check one element at a time.` });
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) { f.push({ i, found: true, note: `arr[${i}] = ${arr[i]} equals ${target} → FOUND at index ${i} after ${i + 1} comparison${i ? 's' : ''}.` }); return f; }
      f.push({ i, found: false, note: `arr[${i}] = ${arr[i]} is not ${target} → move on to the next element.` });
    }
    f.push({ i: arr.length, found: false, note: `Reached the end without a match → ${target} is NOT in the array (${arr.length} comparisons, the worst case).` });
    return f;
  }, [arr, target]);
  const st = useStepper(frames.length, frames);
  const cur = frames[st.idx];
  const comparisons = cur.i < 0 ? 0 : Math.min(cur.i + 1, arr.length);

  const apply = () => {
    const nums = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 999).slice(0, 14);
    if (nums.length < 2) { setErr('Enter at least 2 numbers, e.g. 7, 3, 9, 1'); return; }
    setErr(''); setArr(nums); setTarget(nums[Math.floor(nums.length / 2)]);
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🔍 Linear Search Visualizer</div>
      <div className="custom-input-row">
        <label>Array (max 14):</label>
        <input className="viz-input" placeholder="e.g. 7, 3, 9, 1" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()} style={{ minWidth: 160 }} />
        <button className="viz-btn cyan" onClick={apply}>✔ Apply</button>
        <button className="viz-btn" onClick={() => { const a = rand(); setArr(a); setTarget(a[Math.floor(a.length * 0.6)]); setText(''); setErr(''); }}>🎲 Random</button>
      </div>
      {err && <div style={{ color: 'var(--ak)', fontSize: '0.82rem', marginBottom: 6 }}>⚠ {err}</div>}
      <div className="viz-row">
        <label>Target</label>
        <NumberStepper value={String(target)} onChange={v => setTarget(v === '' || v === '-' ? 0 : parseInt(v, 10))} min={-9999} max={9999} width={104} ariaLabel="Target" />
        <button className="viz-btn" onClick={() => setTarget(arr[0])}>First element (best case)</button>
        <button className="viz-btn" onClick={() => setTarget(arr[arr.length - 1])}>Last element</button>
        <button className="viz-btn" onClick={() => setTarget(arr.includes(1000) ? 1001 : 1000)}>Not in array (worst case)</button>
      </div>

      <StepControls st={st} />
      <div className="viz-stats"><span>Comparisons: <b>{comparisons}</b></span><span>Array size: <b>{arr.length}</b></span><span>Time: <b>O(n)</b></span></div>

      <div className="ls-row">
        {arr.map((v, i) => {
          const state = cur.found && i === cur.i ? 'found' : i === cur.i ? 'cur' : i < cur.i ? 'miss' : '';
          return (
            <div key={i} className="ls-cell-wrap">
              <div className="ls-ptr">{i === cur.i && cur.i < arr.length ? '▼' : ''}</div>
              <div className={`ls-cell ${state}`}>{v}</div>
              <div className="ls-idx">[{i}]</div>
            </div>
          );
        })}
      </div>
      <div className={`viz-note${cur.found ? ' good' : cur.i >= arr.length ? ' bad' : ''}`}>{cur.note}</div>
      <div className="viz-legend">
        {[['#00f5ff', 'Checking now'], ['#3d5a7a', 'Checked — no match'], ['#00ff88', 'Found']].map(([c, l]) => (
          <div key={l} className="legend-item"><div className="legend-dot" style={{ background: c }} /><span>{l}</span></div>
        ))}
      </div>
    </div>
  );
}
