import NumberStepper from '../NumberStepper';
import { useMemo, useState } from 'react';

const CURVES = [
  { id: 'c', name: 'O(1)', color: '#00ff88', f: () => 1 },
  { id: 'log', name: 'O(log n)', color: '#00f5ff', f: (n: number) => Math.log2(Math.max(n, 1)) },
  { id: 'n', name: 'O(n)', color: '#ffe600', f: (n: number) => n },
  { id: 'nlog', name: 'O(n log n)', color: '#ff6b35', f: (n: number) => n * Math.log2(Math.max(n, 1)) },
  { id: 'n2', name: 'O(n²)', color: '#ff2d78', f: (n: number) => n * n },
  { id: '2n', name: 'O(2ⁿ)', color: '#bf5aff', f: (n: number) => Math.pow(2, n) },
];

const W = 560, H = 270, PL = 46, PR = 74, PT = 14, PB = 30;

/** 1e9 operations per second — a rough, round number to make the counts feel real. */
function timeText(ops: number): string {
  const s = ops / 1e9;
  if (s < 1e-6) return '< 1 µs';
  if (s < 1e-3) return `${(s * 1e6).toFixed(0)} µs`;
  if (s < 1) return `${(s * 1e3).toFixed(1)} ms`;
  if (s < 60) return `${s.toFixed(1)} s`;
  if (s < 3600) return `${(s / 60).toFixed(1)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
  if (s < 3.15e7) return `${(s / 86400).toFixed(0)} days`;
  if (s < 3.15e12) return `${(s / 3.15e7).toLocaleString('en-US', { maximumFractionDigits: 0 })} years`;
  return 'longer than the age of the universe';
}
const fmtOps = (v: number) => (v >= 1e15 ? v.toExponential(1).replace('e+', ' × 10^') : Math.round(v).toLocaleString('en-US'));

export default function ComplexityChart() {
  const [nText, setNText] = useState('20');
  const [log, setLog] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const n = Math.min(200, Math.max(2, parseInt(nText, 10) || 2));

  const chart = useMemo(() => {
    const xs = Array.from({ length: Math.min(n, 120) }, (_, i) => 1 + (i * (n - 1)) / (Math.min(n, 120) - 1));
    const visible = CURVES.filter(c => !hidden.includes(c.id));
    // y axis: linear → clip at n² (so the slow curves stay readable); log → fit everything
    const top = log ? Math.max(...visible.map(c => Math.min(c.f(n), 1e30)), 10) : Math.max(n * n, 10);
    const yOf = (v: number) => {
      const val = Math.max(v, 1);
      const t = log ? Math.log10(val) / Math.log10(top) : Math.min(val, top) / top;
      return PT + (1 - Math.min(1, t)) * (H - PT - PB);
    };
    const xOf = (x: number) => PL + ((x - 1) / (n - 1)) * (W - PL - PR);
    const lines = visible.map(c => ({ c, pts: xs.map(x => `${xOf(x).toFixed(1)},${yOf(c.f(x)).toFixed(1)}`).join(' '), endY: yOf(c.f(n)), clipped: !log && c.f(n) > top }));
    return { lines, top, xOf, yOf };
  }, [n, log, hidden]);

  const toggle = (id: string) => setHidden(h => (h.includes(id) ? h.filter(x => x !== id) : [...h, id]));

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">📈 Big O Complexity Chart</div>
      <div className="custom-input-row">
        <label>Input size n:</label>
        <NumberStepper value={nText} onChange={setNText} min={2} max={200} width={92} ariaLabel="Input size n" />
        <input type="range" min={2} max={100} value={Math.min(n, 100)} onChange={e => setNText(e.target.value)} />
        <button className={`viz-btn ${!log ? 'primary' : ''}`} onClick={() => setLog(false)}>Linear scale</button>
        <button className={`viz-btn ${log ? 'primary' : ''}`} onClick={() => setLog(true)}>Log scale</button>
      </div>

      <div className="cc-chart">
        <svg viewBox={`0 0 ${W} ${H}`} className="cc-svg" role="img" aria-label="Growth of common time complexities">
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <g key={t}>
              <line x1={PL} x2={W - PR} y1={PT + t * (H - PT - PB)} y2={PT + t * (H - PT - PB)} className="cc-grid" />
              <text x={PL - 6} y={PT + t * (H - PT - PB) + 3} textAnchor="end" className="cc-axis">
                {log ? `10^${((1 - t) * Math.log10(chart.top)).toFixed(0)}` : Math.round((1 - t) * chart.top).toLocaleString('en-US')}
              </text>
            </g>
          ))}
          <text x={PL} y={H - 8} className="cc-axis">1</text>
          <text x={W - PR} y={H - 8} textAnchor="end" className="cc-axis">n = {n}</text>
          {chart.lines.map(({ c, pts, endY, clipped }) => (
            <g key={c.id}>
              <polyline points={pts} fill="none" stroke={c.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <text x={W - PR + 6} y={Math.max(PT + 8, endY) + 3} className="cc-label" fill={c.color}>{c.name}{clipped ? ' ↑' : ''}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="viz-legend" style={{ marginTop: 10 }}>
        {CURVES.map(c => (
          <button key={c.id} className={`cc-toggle${hidden.includes(c.id) ? ' off' : ''}`} onClick={() => toggle(c.id)} title="Show / hide this curve">
            <span className="legend-dot" style={{ background: c.color, width: 12, height: 3, borderRadius: 2, display: 'inline-block' }} /> {c.name}
          </button>
        ))}
      </div>

      <div className="dp-scroll">
        <table className="dp-table cc-table">
          <thead><tr><th>Complexity</th><th>Operations at n = {n}</th><th>Time at 10⁹ ops/sec</th></tr></thead>
          <tbody>
            {CURVES.map(c => {
              const ops = c.f(n);
              return (
                <tr key={c.id} style={{ opacity: hidden.includes(c.id) ? 0.4 : 1 }}>
                  <th className="dp-rowhead" style={{ color: c.color }}>{c.name}</th>
                  <td className="dp-cell filled">{fmtOps(ops)}</td>
                  <td className="dp-cell filled">{timeText(ops)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="viz-note">Try n = 10, 30 and 60. {log ? 'On a log scale every curve fits, and a straight line means polynomial growth.' : 'On the linear scale the arrows (↑) mark curves that shot off the top — 2ⁿ does that almost immediately.'}</div>
    </div>
  );
}
