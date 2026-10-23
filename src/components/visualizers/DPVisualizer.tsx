import { useState } from 'react';
import { StepControls, useStepper } from './useStepper';
import { coinChange, editDistance, knapsack, lcs, parseNums, INF, type DPConf } from '../../utils/dpTables';

export type DPMode = 'knapsack' | 'lcs' | 'coinchange' | 'editdistance';

const DEFAULTS: Record<DPMode, Record<string, string>> = {
  knapsack:     { wt: '1, 3, 4, 5', val: '1, 4, 5, 7', cap: '7' },
  lcs:          { a: 'AGGTAB', b: 'GXTXAYB' },
  coinchange:   { coins: '1, 3, 4', amount: '6' },
  editdistance: { a: 'kitten', b: 'sitting' },
};

/** Parse the form; returns a table config or a message explaining what is wrong. */
function build(mode: DPMode, f: Record<string, string>): DPConf | string {
  if (mode === 'knapsack') {
    const wt = parseNums(f.wt, 1, 9, 6); if (typeof wt === 'string') return `Weights: ${wt}`;
    const val = parseNums(f.val, 0, 99, 6); if (typeof val === 'string') return `Values: ${val}`;
    if (wt.length !== val.length) return `Give the same number of weights and values (you gave ${wt.length} and ${val.length}).`;
    const cap = parseNums(f.cap, 1, 15, 1); if (typeof cap === 'string') return `Capacity: ${cap}`;
    return knapsack(wt, val, cap[0]);
  }
  if (mode === 'coinchange') {
    const coins = parseNums(f.coins, 1, 9, 5); if (typeof coins === 'string') return `Coins: ${coins}`;
    const amt = parseNums(f.amount, 1, 25, 1); if (typeof amt === 'string') return `Amount: ${amt}`;
    return coinChange(coins, amt[0]);
  }
  const ok = (s: string) => /^[A-Za-z0-9]{1,10}$/.test(s);
  if (!ok(f.a) || !ok(f.b)) return 'Each word must be 1–10 letters or digits (no spaces).';
  return mode === 'lcs' ? lcs(f.a, f.b) : editDistance(f.a, f.b);
}

const FIELDS: Record<DPMode, { key: string; label: string; width: number; hint: string }[]> = {
  knapsack:     [{ key: 'wt', label: 'Weights', width: 150, hint: '1, 3, 4, 5' }, { key: 'val', label: 'Values', width: 150, hint: '1, 4, 5, 7' }, { key: 'cap', label: 'Capacity', width: 70, hint: '7' }],
  lcs:          [{ key: 'a', label: 'String A', width: 130, hint: 'AGGTAB' }, { key: 'b', label: 'String B', width: 130, hint: 'GXTXAYB' }],
  coinchange:   [{ key: 'coins', label: 'Coins', width: 150, hint: '1, 3, 4' }, { key: 'amount', label: 'Amount', width: 80, hint: '6' }],
  editdistance: [{ key: 'a', label: 'From', width: 130, hint: 'kitten' }, { key: 'b', label: 'To', width: 130, hint: 'sitting' }],
};

export default function DPVisualizer({ mode = 'knapsack' }: { mode?: DPMode }) {
  const [form, setForm] = useState<Record<string, string>>(DEFAULTS[mode]);
  const [conf, setConf] = useState<DPConf>(() => build(mode, DEFAULTS[mode]) as DPConf);
  const [err, setErr] = useState('');

  const st = useStepper(conf.steps.length, conf);
  const cur = conf.steps[st.idx];
  const done = st.idx === conf.steps.length - 1;

  const apply = () => {
    const r = build(mode, form);
    if (typeof r === 'string') { setErr(r); return; }
    setErr(''); setConf(r);
  };
  const example = () => { setForm(DEFAULTS[mode]); setErr(''); setConf(build(mode, DEFAULTS[mode]) as DPConf); };
  const fmt = (v: number | null) => (v === null ? '·' : v >= INF ? '∞' : String(v));

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🧩 DP Table Builder — {conf.title}</div>

      <div className="custom-input-row">
        {FIELDS[mode].map(f => (
          <span key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <label>{f.label}:</label>
            <input className="viz-input" value={form[f.key]} placeholder={f.hint} style={{ width: f.width }} spellCheck={false}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && apply()} />
          </span>
        ))}
        <button className="viz-btn cyan" onClick={apply}>✔ Apply</button>
        <button className="viz-btn" onClick={example}>↺ Example</button>
      </div>
      {err && <div className="viz-note bad" style={{ marginTop: 0, marginBottom: 10 }}>⚠ {err}</div>}

      <StepControls st={st} />
      <div className="dp-recurrence">{conf.recurrence}</div>

      <div className="dp-scroll">
        <table className="dp-table">
          <thead>
            <tr><th />{conf.colLabels.map((l, i) => <th key={i}>{l}</th>)}</tr>
          </thead>
          <tbody>
            {conf.rowLabels.map((rl, r) => (
              <tr key={r}>
                <th className="dp-rowhead">{rl}</th>
                {conf.colLabels.map((_, c) => {
                  const v = cur.grid[r][c];
                  const isCur = cur.cur?.r === r && cur.cur?.c === c;
                  const isSrc = cur.from.some(f => f.r === r && f.c === c);
                  return <td key={c} className={`dp-cell ${isCur ? 'cur' : ''} ${isSrc ? 'src' : ''} ${v !== null ? 'filled' : ''}`}>{fmt(v)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`viz-info${done ? ' dp-final' : ''}`}>{cur.info}</div>
      {done && <div className="dp-takeaway">{conf.takeaway}</div>}
    </div>
  );
}
