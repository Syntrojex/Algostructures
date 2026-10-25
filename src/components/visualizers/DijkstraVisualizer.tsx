import NumberStepper from '../NumberStepper';
import { useState, useRef, useEffect, useCallback } from 'react';

interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

const DEFAULT_NODES: GraphNode[] = [
  { id: 0, label: 'A', x: 80, y: 120 },
  { id: 1, label: 'B', x: 200, y: 50 },
  { id: 2, label: 'C', x: 200, y: 200 },
  { id: 3, label: 'D', x: 330, y: 80 },
  { id: 4, label: 'E', x: 330, y: 200 },
  { id: 5, label: 'F', x: 450, y: 130 },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 1 },
  { from: 1, to: 3, weight: 1 },
  { from: 2, to: 1, weight: 2 },
  { from: 2, to: 4, weight: 5 },
  { from: 3, to: 5, weight: 3 },
  { from: 4, to: 5, weight: 1 },
  { from: 3, to: 4, weight: 2 },
];

type NodeState = 'default' | 'source' | 'visited' | 'current' | 'inqueue' | 'destination';

export default function DijkstraVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes] = useState<GraphNode[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(DEFAULT_EDGES);
  const [nodeStates, setNodeStates] = useState<NodeState[]>(() => Array(DEFAULT_NODES.length).fill('default'));
  const [dist, setDist] = useState<number[]>(() => Array(DEFAULT_NODES.length).fill(Infinity));
  const [path, setPath] = useState<number[]>([]);
  const [info, setInfo] = useState('Click Play to run Dijkstra from node A');
  const [running, setRunning] = useState(false);
  const [source, setSource] = useState(0);
  const [dest, setDest] = useState(5);
  const [editingEdge, setEditingEdge] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const stopRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INF = 1e9;

  const delay = (ms = 700) => new Promise<void>(res => {
    timerRef.current = setTimeout(res, ms);
  });

  const drawGraph = useCallback((
    ns: NodeState[],
    distances: number[],
    highlightEdges: number[] = [],
    pathEdges: number[] = [],
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const scaleX = W / 540;
    const scaleY = H / 260;

    const sx = (x: number) => x * scaleX;
    const sy = (y: number) => y * scaleY;

    // Draw edges
    edges.forEach((e, i) => {
      const from = nodes[e.from];
      const to = nodes[e.to];
      const mx = (sx(from.x) + sx(to.x)) / 2;
      const my = (sy(from.y) + sy(to.y)) / 2;

      const isPath = pathEdges.includes(i);
      const isHL = highlightEdges.includes(i);

      ctx.beginPath();
      ctx.strokeStyle = isPath ? '#00ff88' : isHL ? '#ff6b35' : 'rgba(0,245,255,0.25)';
      ctx.lineWidth = isPath ? 3 : isHL ? 2 : 1.5;
      if (isPath) ctx.shadowBlur = 8, ctx.shadowColor = '#00ff88';
      else ctx.shadowBlur = 0;

      ctx.moveTo(sx(from.x), sy(from.y));
      ctx.lineTo(sx(to.x), sy(to.y));
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrowhead
      const angle = Math.atan2(sy(to.y) - sy(from.y), sx(to.x) - sx(from.x));
      const nr = 18;
      const ax = sx(to.x) - nr * Math.cos(angle);
      const ay = sy(to.y) - nr * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = isPath ? '#00ff88' : 'rgba(0,245,255,0.4)';
      ctx.fill();

      // Weight label
      ctx.fillStyle = editingEdge?.idx === i ? '#ffe600' : (isPath ? '#00ff88' : '#7a9cc0');
      ctx.font = `bold ${Math.round(12 * Math.min(scaleX, scaleY))}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      // Offset label slightly
      const offX = (sy(to.y) - sy(from.y)) * 0.12;
      const offY = -(sx(to.x) - sx(from.x)) * 0.12;
      ctx.fillText(String(e.weight), mx + offX, my + offY);
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const st = ns[i];
      const colors: Record<NodeState, string> = {
        default: '#0d1528',
        source: '#00f5ff',
        visited: '#00ff88',
        current: '#bf5aff',
        inqueue: '#ff6b35',
        destination: '#ff2d78',
      };
      const borderColors: Record<NodeState, string> = {
        default: 'rgba(0,245,255,0.4)',
        source: '#00f5ff',
        visited: '#00ff88',
        current: '#bf5aff',
        inqueue: '#ff6b35',
        destination: '#ff2d78',
      };

      const nx = sx(node.x), ny = sy(node.y), r = 18 * Math.min(scaleX, scaleY);

      // Glow
      if (st !== 'default') {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = borderColors[st] + '33';
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = colors[st];
      ctx.fill();
      ctx.strokeStyle = borderColors[st];
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = st === 'default' ? '#e8f4ff' : (st === 'source' ? '#050714' : '#050714');
      ctx.font = `bold ${Math.round(13 * Math.min(scaleX, scaleY))}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, nx, ny);

      // Distance label
      const d = distances[i];
      const dStr = d >= INF ? '∞' : String(d);
      ctx.fillStyle = st === 'visited' ? '#00ff88' : '#7a9cc0';
      ctx.font = `${Math.round(10 * Math.min(scaleX, scaleY))}px JetBrains Mono, monospace`;
      ctx.fillText(dStr, nx, ny + r + 12 * Math.min(scaleX, scaleY));
    });
  }, [nodes, edges, editingEdge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const w = canvas.offsetWidth || 540;
      const h = canvas.offsetHeight || 260;
      canvas.width = w;
      canvas.height = h;
      drawGraph(
        Array(DEFAULT_NODES.length).fill('default') as NodeState[],
        Array(DEFAULT_NODES.length).fill(Infinity),
        [], []
      );
    };
    // Use rAF so layout is complete before we read offsetWidth
    const raf = requestAnimationFrame(resize);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawGraph]);

  useEffect(() => {
    drawGraph(nodeStates, dist, [], path.length > 1 ? getPathEdges(path) : []);
  }, [nodeStates, dist, path, edges, drawGraph]);

  const getPathEdges = (p: number[]): number[] => {
    const result: number[] = [];
    for (let i = 0; i < p.length - 1; i++) {
      const idx = edges.findIndex(e => e.from === p[i] && e.to === p[i + 1]);
      if (idx >= 0) result.push(idx);
    }
    return result;
  };

  const runDijkstra = async () => {
    stopRef.current = false;
    setRunning(true);
    setPath([]);
    const n = nodes.length;
    const d = Array(n).fill(INF);
    const parent = Array(n).fill(-1);
    const visited = Array(n).fill(false);
    d[source] = 0;

    const ns = Array(n).fill('default') as NodeState[];
    ns[source] = 'source';
    setDist([...d]);
    setNodeStates([...ns]);
    setInfo(`Starting Dijkstra from ${nodes[source].label}. dist[${nodes[source].label}]=0`);

    await delay(600);
    if (stopRef.current) return;

    for (let iter = 0; iter < n; iter++) {
      // Find min dist unvisited
      let u = -1;
      for (let i = 0; i < n; i++) {
        if (!visited[i] && d[i] < INF && (u === -1 || d[i] < d[u])) u = i;
      }
      if (u === -1) break;
      visited[u] = true;

      ns[u] = u === source ? 'source' : 'visited';
      if (u === dest) ns[u] = 'destination';

      setNodeStates([...ns]);
      setInfo(`Processing ${nodes[u].label} (dist=${d[u]}). Relaxing neighbors...`);
      await delay(700);
      if (stopRef.current) return;

      // Once the destination is popped as the minimum, its distance is final —
      // standard Dijkstra guarantee. Stop here instead of continuing to explore
      // the rest of the graph, so the visualizer only shows the source→destination search.
      if (u === dest) {
        setInfo(`✅ Reached destination ${nodes[dest].label} — its shortest distance is now final.`);
        break;
      }

      // Relax neighbors
      const hlEdges: number[] = [];
      edges.forEach((e, ei) => {
        if (e.from === u && !visited[e.to]) {
          hlEdges.push(ei);
          if (d[u] + e.weight < d[e.to]) {
            d[e.to] = d[u] + e.weight;
            parent[e.to] = u;
            ns[e.to] = 'inqueue';
          }
        }
      });

      setDist([...d]);
      setNodeStates([...ns]);
      drawGraph([...ns], [...d], hlEdges, []);
      setInfo(`Relaxed edges from ${nodes[u].label}. Updated distances shown.`);
      await delay(700);
      if (stopRef.current) return;
    }

    // Reconstruct path
    const p: number[] = [];
    for (let v = dest; v !== -1; v = parent[v]) p.unshift(v);
    setPath(p);

    const pathStr = p.map(i => nodes[i].label).join(' → ');
    setInfo(`✅ Shortest path: ${pathStr} | Cost: ${d[dest] >= INF ? '∞ (unreachable)' : d[dest]}`);
    setRunning(false);
  };

  const stopRun = () => {
    stopRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  const resetGraph = () => {
    stopRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
    setNodeStates(Array(nodes.length).fill('default'));
    setDist(Array(nodes.length).fill(Infinity));
    setPath([]);
    setInfo('Click Play to run Dijkstra from node A');
  };

  // Handle canvas click for weight editing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const scaleX = canvas.width / 540, scaleY = canvas.height / 260;
    const sx = (x: number) => x * scaleX;
    const sy = (y: number) => y * scaleY;

    // Check if click is near an edge label — use same offset as drawGraph
    for (let i = 0; i < edges.length; i++) {
      const from = nodes[edges[i].from], to = nodes[edges[i].to];
      const mx = (sx(from.x) + sx(to.x)) / 2;
      const my = (sy(from.y) + sy(to.y)) / 2;
      // Match the perpendicular offset used in drawGraph
      const offX = (sy(to.y) - sy(from.y)) * 0.12;
      const offY = -(sx(to.x) - sx(from.x)) * 0.12;
      const lx = mx + offX;
      const ly = my + offY;
      if (Math.abs(cx - lx) < 24 && Math.abs(cy - ly) < 24) {
        setEditingEdge({ idx: i, x: e.clientX - rect.left, y: e.clientY - rect.top });
        setEditWeight(String(edges[i].weight));
        return;
      }
    }
    setEditingEdge(null);
  };

  const applyWeightEdit = () => {
    if (!editingEdge) return;
    const w = parseInt(editWeight);
    if (!isNaN(w) && w > 0 && w < 100) {
      const newEdges = [...edges];
      newEdges[editingEdge.idx] = { ...newEdges[editingEdge.idx], weight: w };
      setEdges(newEdges);
      resetGraph();
    }
    setEditingEdge(null);
  };

  useEffect(() => () => { stopRef.current = true; if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🗺️ Dijkstra Visualizer (click edge weights to edit!)</div>

      <div className="viz-controls" style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '0.75rem', color: 'var(--tm)', fontFamily: 'JetBrains Mono' }}>
          Source:
        </label>
        <select
          value={source}
          onChange={e => { setSource(Number(e.target.value)); resetGraph(); }}
          style={{ background: 'var(--bg2)', border: '1px solid var(--br)', color: 'var(--tp)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}
        >
          {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
        <label style={{ fontSize: '0.75rem', color: 'var(--tm)', fontFamily: 'JetBrains Mono' }}>
          Destination:
        </label>
        <select
          value={dest}
          onChange={e => { setDest(Number(e.target.value)); resetGraph(); }}
          style={{ background: 'var(--bg2)', border: '1px solid var(--br)', color: 'var(--tp)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}
        >
          {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
      </div>

      <div className="viz-controls">
        {!running ? (
          <button className="viz-btn primary" onClick={runDijkstra}>▶ Run Dijkstra</button>
        ) : (
          <button className="viz-btn red" onClick={stopRun}>⏹ Stop</button>
        )}
        <button className="viz-btn" onClick={resetGraph}>🔄 Reset</button>
      </div>

      <div className="graph-canvas-wrap" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          className="graph-canvas"
          style={{ width: '100%', height: '260px', cursor: 'pointer' }}
          onClick={handleCanvasClick}
        />
        {editingEdge && (
          <div
            className="edge-weight-input"
            style={{ left: editingEdge.x - 30, top: editingEdge.y - 20, position: 'absolute' }}
          >
            <NumberStepper value={editWeight} onChange={setEditWeight} min={1} max={99} width={84} ariaLabel="Edge weight" onEnter={applyWeightEdit} />
            <button onClick={applyWeightEdit} style={{ marginLeft: '4px', background: 'var(--ag)', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>✓</button>
            <button onClick={() => setEditingEdge(null)} style={{ marginLeft: '2px', background: 'var(--br)', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--ts)' }}>✕</button>
          </div>
        )}
      </div>

      <div className="viz-info">{info}</div>

      {/* Distance table */}
      {dist.some(d => d < Infinity) && (
        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'JetBrains Mono', fontSize: '0.74rem' }}>
            <thead>
              <tr>
                {nodes.map(n => (
                  <th key={n.id} style={{ padding: '6px 10px', background: 'rgba(0,245,255,0.08)', color: 'var(--ac)', border: '1px solid var(--br)' }}>
                    {n.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {dist.map((d, i) => (
                  <td key={i} style={{
                    padding: '6px 10px', textAlign: 'center',
                    border: '1px solid var(--br)',
                    color: path.includes(i) ? 'var(--ag)' : d >= INF ? 'var(--tm)' : 'var(--tp)',
                    background: path.includes(i) ? 'rgba(0,255,136,0.08)' : 'transparent',
                    fontWeight: path.includes(i) ? 'bold' : 'normal',
                  }}>
                    {d >= INF ? '∞' : d}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: '0.65rem', color: 'var(--tm)', fontFamily: 'JetBrains Mono', marginTop: '4px', textAlign: 'center' }}>
            💡 Click on any edge weight label to edit it and re-run Dijkstra
          </div>
        </div>
      )}

      <div className="viz-legend">
        {[
          { color: '#00f5ff', label: 'Source' },
          { color: '#bf5aff', label: 'Processing' },
          { color: '#ff6b35', label: 'In Queue' },
          { color: '#00ff88', label: 'Visited / Path' },
          { color: '#ff2d78', label: 'Destination' },
        ].map(l => (
          <div key={l.label} className="legend-item">
            <div className="legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
