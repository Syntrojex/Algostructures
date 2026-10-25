import NumberStepper from '../NumberStepper';
import { useMemo, useState } from 'react';
import { StepControls, useStepper } from './useStepper';
import { binarySearchFrames, parseSorted } from '../../utils/binarySearchSteps';

const rand = () => { const s = new Set<number>(); while (s.size < 10) s.add(Math.floor(Math.random() * 90) + 5); return [...s].sort((a, b) => a - b); };

export default function BinarySearchVisualizer() {
  const [arr, setArr] = useState<number[]>([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  const [text, setText] = useState('');
  const [target, setTarget] = useState('13');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const t = parseInt(target, 10);
  const valid = !isNaN(t);
  const frames = useMemo(() => binarySearchFrames(arr, valid ? t : NaN), [arr, t, valid]);
  const st = useStepper(frames.length, frames);
  const cur = frames[st.idx];
  const done = cur.found !== -1;

  const apply = () => {
    const r = parseSorted(text);
    if (typeof r === 'string') { setErr(r); setMsg(''); return; }
    setErr(''); setArr(r.arr); setMsg(r.sortedForYou ? 'Binary search needs a sorted array, so the numbers were sorted for you.' : '');
    setTarget(String(r.arr[Math.floor(r.arr.length / 2)]));
  };
  const style = (i: number): React.CSSProperties => {
    if (cur.found === i) return { background: 'var(--ag)', boxShadow: '0 0 12px rgba(0,255,136,0.5)', transform: 'scale(1.12)' };
    if (i === cur.mid) return { background: 'var(--ap)', boxShadow: '0 0 12px rgba(191,90,255,0.5)' };
    if (cur.found === -2 || i < cur.lo || i > cur.hi) return { background: 'rgba(61,90,122,0.3)', opacity: 0.4 };
    return { background: 'rgba(0,245,255,0.4)' };
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🔍 Binary Search Visualizer</div>
      <div className="custom-input-row">
        <label>Array:</label>
        <input className="viz-input" placeholder="e.g. 4, 9, 15, 23, 42" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()} style={{ minWidth: 190 }} />
        <button className="viz-btn cyan" onClick={apply}>✔ Apply</button>
        <button className="viz-btn" onClick={() => { const a = rand(); setArr(a); setTarget(String(a[Math.floor(Math.random() * a.length)])); setText(''); setErr(''); setMsg(''); }}>🎲 Random</button>
      </div>
      <div className="viz-row">
        <label>Target</label>
        <NumberStepper value={target} onChange={setTarget} min={-9999} max={9999} width={104} ariaLabel="Target" />
        <button className="viz-btn" onClick={() => setTarget(String(arr[0]))}>First</button>
        <button className="viz-btn" onClick={() => setTarget(String(arr[arr.length - 1]))}>Last</button>
        <button className="viz-btn" onClick={() => setTarget(String(arr[arr.length - 1] + 1))}>Missing</button>
      </div>
      {err && <div className="viz-note bad" style={{ marginTop: 0, marginBottom: 10 }}>⚠ {err}</div>}
      {msg && <div className="viz-note" style={{ marginTop: 0, marginBottom: 10 }}>{msg}</div>}
      {!valid && <div className="viz-note bad" style={{ marginTop: 0, marginBottom: 10 }}>⚠ Enter a whole number as the target.</div>}

      <StepControls st={st} />
      <div className="viz-stage" style={{ gap: 6, alignItems: 'stretch', flexDirection: 'column' }}>
        <div className="bs-row">
          {arr.map((v, i) => (
            <div key={i} className="bs-cell" style={style(i)}>
              <div className="bs-val">{v}</div>
              <div className="bs-idx">[{i}]</div>
            </div>
          ))}
        </div>
        <div className="bs-row bs-ptrs">
          {arr.map((_, i) => {
            const tag = cur.found === -2 || (i === cur.mid && cur.found >= 0) ? (i === cur.mid ? 'mid' : '') : [i === cur.lo ? 'lo' : '', i === cur.mid ? 'mid' : '', i === cur.hi ? 'hi' : ''].filter(Boolean).join('/');
            return <div key={i} className="bs-ptr">{cur.found === -2 ? '' : tag}</div>;
          })}
        </div>
      </div>
      <div className={`viz-note${cur.found >= 0 ? ' good' : cur.found === -2 ? ' bad' : ''}`}>{cur.note}</div>
      <div className="viz-legend">
        {[{ color: 'rgba(0,245,255,0.4)', label: 'Search space' }, { color: 'var(--ap)', label: 'Mid' }, { color: 'var(--ag)', label: 'Found' }, { color: 'rgba(61,90,122,0.3)', label: 'Eliminated' }].map(l => (
          <div key={l.label} className="legend-item"><div className="legend-dot" style={{ background: l.color }} /><span>{l.label}</span></div>
        ))}
      </div>
      {done && st.atEnd && (
        <div className="viz-final-answer">
          <div className="viz-fa-label">📊 Final Answer</div>
          <div className="viz-fa-result">{cur.found >= 0 ? `✅ Target ${t} FOUND at index ${cur.found}` : `❌ Target ${t} NOT FOUND in the array`}</div>
          <div className="viz-fa-sub">{frames.length - 1} comparison{frames.length > 2 ? 's' : ''} for {arr.length} elements — a linear scan could need up to {arr.length}.</div>
        </div>
      )}
    </div>
  );
}
