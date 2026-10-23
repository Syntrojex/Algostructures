import { useMemo, useState } from 'react';
import { RACE_ALGOS, makeArray, sortFrames, type Order, type RaceAlgo } from '../../utils/sortSteps';
import { StepControls, useStepper } from './useStepper';

const ORDERS: { id: Order; label: string }[] = [
  { id: 'random', label: 'Random' }, { id: 'reversed', label: 'Reversed' },
  { id: 'nearly', label: 'Nearly sorted' }, { id: 'few', label: 'Few unique' },
];

export default function SortingRace() {
  const [size, setSize] = useState(18);
  const [order, setOrder] = useState<Order>('random');
  const [seed, setSeed] = useState(0);
  const [picked, setPicked] = useState<RaceAlgo[]>(['bubble', 'insertion', 'merge', 'quick']);
  const [custom, setCustom] = useState<number[] | null>(null);
  const [customText, setCustomText] = useState('');
  const [err, setErr] = useState('');

  const input = useMemo(() => custom ?? makeArray(size, order), [custom, size, order, seed]);   // eslint-disable-line react-hooks/exhaustive-deps
  const lanes = useMemo(() => picked.map(id => ({ id, frames: sortFrames(id, input) })), [picked, input]);
  const total = Math.max(1, ...lanes.map(l => l.frames.length));
  const st = useStepper(total, lanes, { strideFor: s => (s >= 9 ? 3 : 1) });

  const toggle = (id: RaceAlgo) =>
    setPicked(p => (p.includes(id) ? (p.length > 2 ? p.filter(x => x !== id) : p) : p.length >= 5 ? p : [...p, id]));

  const applyCustom = () => {
    const parts = customText.split(/[\s,;]+/).filter(Boolean);
    if (parts.length < 4 || parts.length > 30) { setErr('Enter between 4 and 30 numbers.'); return; }
    const nums = parts.map(p => (/^\d+$/.test(p) ? parseInt(p, 10) : NaN));
    if (nums.some(v => isNaN(v) || v < 1 || v > 999)) { setErr('Use whole numbers from 1 to 999.'); return; }
    setErr(''); setCustom(nums);
  };

  const maxV = Math.max(...input);
  const finishOrder = lanes
    .map(l => ({ id: l.id, steps: l.frames.length }))
    .sort((x, y) => x.steps - y.steps);

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🏁 Sorting Race — same array, different algorithms</div>
      <div className="viz-row">
        <label>Order</label>
        <select className="viz-select" value={order} onChange={e => setOrder(e.target.value as Order)}>
          {ORDERS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <label>Size {size}</label>
        <input type="range" min="8" max="30" value={size} onChange={e => setSize(Number(e.target.value))} />
        <button className="viz-btn cyan" onClick={() => setSeed(s => s + 1)}>🎲 New array</button>
      </div>
      <div className="viz-row">
        <label>Your own array</label>
        <input className="viz-input" placeholder="e.g. 9, 4, 7, 1, 8, 2, 6" value={customText} onChange={e => setCustomText(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyCustom()} style={{ minWidth: 200 }} />
        <button className="viz-btn cyan" onClick={applyCustom}>✔ Use it</button>
        {custom && <button className="viz-btn" onClick={() => { setCustom(null); setCustomText(''); }}>✕ Back to generated</button>}
      </div>
      {err && <div className="viz-note bad" style={{ marginTop: 0, marginBottom: 10 }}>⚠ {err}</div>}
      <div className="viz-row race-picks">
        <label>Racers (2–5)</label>
        {RACE_ALGOS.map(a => (
          <button key={a.id} className={`viz-chip-btn${picked.includes(a.id) ? ' on' : ''}`} onClick={() => toggle(a.id)}>{a.name}</button>
        ))}
      </div>

      <StepControls st={st} />

      <div className="race-lanes">
        {lanes.map(l => {
          const f = l.frames[Math.min(st.idx, l.frames.length - 1)];
          const done = !!f.done;
          const place = finishOrder.findIndex(x => x.id === l.id);
          const meta = RACE_ALGOS.find(a => a.id === l.id)!;
          return (
            <div key={l.id} className={`race-lane${done ? ' done' : ''}`}>
              <div className="race-lane-head">
                <span className="race-name">{meta.name} <em>{meta.big}</em></span>
                <span className="race-stats">cmp <b>{f.cmp}</b> · moves <b>{f.mov}</b></span>
                {done && <span className="race-medal">{['🥇', '🥈', '🥉', '4th', '5th'][place]} finished in {l.frames.length - 1} steps</span>}
              </div>
              <div className="race-bars">
                {f.a.map((v, i) => (
                  <div key={i} className="race-bar-wrap">
                    <div className={`race-bar${f.hi.includes(i) ? ' hot' : ''}${done ? ' ok' : ''}`} style={{ height: `${Math.max(6, (v / maxV) * 100)}%` }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="viz-note">
        Every comparison and every swap/write counts as one step, so the algorithm that needs the fewest steps finishes first.
        {st.atEnd && <> Winner: <b>{RACE_ALGOS.find(a => a.id === finishOrder[0].id)!.name}</b> with {finishOrder[0].steps - 1} steps.</>}
        {' '}Try <b>Reversed</b> (bubble and insertion suffer) and <b>Nearly sorted</b> (insertion shines).
      </div>
    </div>
  );
}
