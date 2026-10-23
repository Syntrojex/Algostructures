import { useMemo, useState } from 'react';
import { StepControls, useStepper } from './useStepper';
import { circleLayout, DEFAULT_EDGES, DEFAULT_LAYOUT, parseGraph, traversalFrames, type Graph } from '../../utils/graphAlgos';

const PRESETS: { name: string; edges: string }[] = [
  { name: 'Example', edges: DEFAULT_EDGES },
  { name: 'Binary tree', edges: 'A-B, A-C, B-D, B-E, C-F, C-G' },
  { name: 'Cycle', edges: 'A-B, B-C, C-D, D-E, E-A' },
  { name: 'Two islands', edges: 'A-B, B-C, D-E' },
];

export default function GraphTraversalVisualizer() {
  const [mode, setMode] = useState<'bfs' | 'dfs'>('bfs');
  const [text, setText] = useState(DEFAULT_EDGES);
  const [graph, setGraph] = useState<Graph>(() => parseGraph(DEFAULT_EDGES) as Graph);
  const [start, setStart] = useState(0);
  const [err, setErr] = useState('');

  const frames = useMemo(() => traversalFrames(graph, Math.min(start, graph.labels.length - 1), mode), [graph, start, mode]);
  const st = useStepper(frames.length, frames);
  const f = frames[st.idx];
  const isDefault = graph.labels.join('') === 'ABCDEFG' && graph.edges.length === 8;
  const pos = useMemo(() => (isDefault ? DEFAULT_LAYOUT : circleLayout(graph.labels.length)), [graph, isDefault]);

  const apply = (t = text) => {
    const g = parseGraph(t);
    if (typeof g === 'string') { setErr(g); return; }
    setErr(''); setGraph(g); setStart(0);
  };
  const stateOf = (id: number) => (f.current === id ? 'current' : f.visited.includes(id) ? 'visited' : f.container.includes(id) ? 'queued' : 'idle');

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🕸️ BFS & DFS Traversal Visualizer</div>

      <div className="custom-input-row">
        <label>Edges (undirected):</label>
        <input className="viz-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()} style={{ minWidth: 260 }} spellCheck={false} placeholder="A-B, B-C, C-A" />
        <button className="viz-btn cyan" onClick={() => apply()}>✔ Apply</button>
      </div>
      <div className="viz-row">
        <label>Try</label>
        {PRESETS.map(p => <button key={p.name} className="viz-chip-btn" onClick={() => { setText(p.edges); apply(p.edges); }}>{p.name}</button>)}
      </div>
      {err && <div className="viz-note bad" style={{ marginTop: 0, marginBottom: 10 }}>⚠ {err}</div>}

      <div className="viz-controls">
        <button className={`viz-btn ${mode === 'bfs' ? 'primary' : ''}`} onClick={() => setMode('bfs')}>BFS (queue)</button>
        <button className={`viz-btn ${mode === 'dfs' ? 'primary' : ''}`} onClick={() => setMode('dfs')}>DFS (stack)</button>
        <label className="lab-label">start</label>
        <select className="lab-select" style={{ minWidth: 80, maxWidth: 110 }} value={start} onChange={e => setStart(parseInt(e.target.value, 10))}>
          {graph.labels.map((l, i) => <option key={l} value={i}>{l}</option>)}
        </select>
      </div>
      <StepControls st={st} />

      <div className="viz-stage" style={{ padding: 10 }}>
        <svg viewBox="0 0 450 210" className="gt-svg" preserveAspectRatio="xMidYMid meet">
          {graph.edges.map(([a, b], i) => {
            const on = f.visited.includes(a) && f.visited.includes(b);
            return <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} className={`gt-edge ${on ? 'on' : ''}`} />;
          })}
          {graph.labels.map((l, i) => (
            <g key={l} className={`gt-node ${stateOf(i)}`}>
              <circle cx={pos[i].x} cy={pos[i].y} r={19} />
              <text x={pos[i].x} y={pos[i].y + 5} textAnchor="middle">{l}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="gt-container">
        <span className="lab-label">{mode === 'bfs' ? 'queue (front → back)' : 'stack (bottom → top)'}</span>
        <div className="gt-chips">
          {f.container.length ? f.container.map((n, i) => <span key={i} className="gt-chip">{graph.labels[n]}</span>) : <span className="lab-nullend">empty</span>}
        </div>
      </div>
      <div className="gt-container">
        <span className="lab-label">visit order</span>
        <div className="gt-chips">
          {f.order.length ? f.order.map((l, i) => <span key={i} className="gt-chip done">{l}</span>) : <span className="lab-nullend">—</span>}
        </div>
      </div>

      <div className="viz-info">{f.info}</div>
      <div className="viz-legend">
        {[{ c: 'var(--ao)', l: 'current' }, { c: 'var(--ag)', l: 'visited' }, { c: 'var(--ap)', l: 'in queue/stack' }].map(x => (
          <div key={x.l} className="legend-item"><div className="legend-dot" style={{ background: x.c }} /><span>{x.l}</span></div>
        ))}
      </div>
    </div>
  );
}
