import { useMemo, useState } from 'react';
import { StepControls, useStepper } from './useStepper';
import { findPath, randomMaze, MUD_COST, type PathAlgo } from '../../utils/pathfinding';

const ROWS = 13, COLS = 26;
const START0 = 6 * COLS + 3, GOAL0 = 6 * COLS + COLS - 4;
type Tool = 'wall' | 'mud' | 'erase' | 'start' | 'goal';

const ALGOS: { id: PathAlgo; name: string; blurb: string }[] = [
  { id: 'bfs', name: 'BFS', blurb: 'Explores in rings; fewest steps, ignores mud.' },
  { id: 'dfs', name: 'DFS', blurb: 'Dives deep first; finds a path, not a short one.' },
  { id: 'dijkstra', name: 'Dijkstra', blurb: 'Cheapest total cost — avoids expensive mud.' },
  { id: 'astar', name: 'A*', blurb: 'Dijkstra + a goal-pointing guess → fewer cells explored.' },
];

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<number[]>(() => new Array(ROWS * COLS).fill(0));
  const [start, setStart] = useState(START0);
  const [goal, setGoal] = useState(GOAL0);
  const [algo, setAlgo] = useState<PathAlgo>('bfs');
  const [tool, setTool] = useState<Tool>('wall');
  const [drawing, setDrawing] = useState(false);

  const res = useMemo(() => findPath(grid, ROWS, COLS, start, goal, algo), [grid, start, goal, algo]);
  const total = res.events.length + 1;
  const st = useStepper(total, res, { strideFor: s => (s >= 9 ? 4 : s >= 8 ? 2 : 1) });
  const k = st.idx;

  const view = useMemo(() => {
    const visited = new Set<number>(), disc = new Set<number>();
    for (let i = 0; i < k; i++) { visited.add(res.events[i].cur); res.events[i].found.forEach(f => disc.add(f)); }
    const frontier = new Set([...disc].filter(x => !visited.has(x)));
    const cur = k > 0 ? res.events[k - 1].cur : -1;
    return { visited, frontier, cur };
  }, [res, k]);
  const finished = k === total - 1;
  const showPath = finished && res.path;
  const pathSet = useMemo(() => new Set(showPath ? res.path : []), [showPath, res]);

  const paint = (i: number) => {
    if (tool === 'start') { if (i !== goal && grid[i] !== 1) setStart(i); return; }
    if (tool === 'goal') { if (i !== start && grid[i] !== 1) setGoal(i); return; }
    if (i === start || i === goal) return;
    const v = tool === 'wall' ? 1 : tool === 'mud' ? 2 : 0;
    setGrid(g => (g[i] === v ? g : g.map((x, j) => (j === i ? v : x))));
  };

  const note = k === 0
    ? `Start at the green cell and reach the red one. Draw walls (and mud, cost ${MUD_COST}) on the grid, pick an algorithm, then press Play.`
    : finished
      ? res.path
        ? `Goal reached! Path length ${res.path.length - 1} steps, total cost ${res.cost}. ${view.visited.size} cells were explored.`
        : `No path exists — the goal is walled off. ${view.visited.size} cells were explored before running out of options.`
      : `Exploring cell ${res.events[k - 1].cur % COLS},${Math.floor(res.events[k - 1].cur / COLS)}: ${view.frontier.size} cell${view.frontier.size === 1 ? '' : 's'} waiting in the ${algo === 'bfs' ? 'queue' : algo === 'dfs' ? 'stack' : 'priority queue'}.`;

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">🧭 Pathfinding — BFS, DFS, Dijkstra, A*</div>
      <div className="viz-row">
        <label>Algorithm</label>
        {ALGOS.map(a => <button key={a.id} className={`viz-chip-btn${algo === a.id ? ' on' : ''}`} onClick={() => setAlgo(a.id)}>{a.name}</button>)}
        <span className="pf-blurb">{ALGOS.find(a => a.id === algo)!.blurb}</span>
      </div>
      <div className="viz-row">
        <label>Draw</label>
        {([['wall', '⬛ Wall'], ['mud', '🟫 Mud'], ['erase', '⬜ Erase'], ['start', '🟢 Move start'], ['goal', '🔴 Move goal']] as [Tool, string][]).map(([t, l]) => (
          <button key={t} className={`viz-chip-btn${tool === t ? ' on' : ''}`} onClick={() => setTool(t)}>{l}</button>
        ))}
        <button className="viz-btn cyan" onClick={() => setGrid(randomMaze(ROWS, COLS, start, goal))}>🎲 Random maze</button>
        <button className="viz-btn" onClick={() => setGrid(new Array(ROWS * COLS).fill(0))}>🧹 Clear</button>
      </div>

      <StepControls st={st} showCounter={false} />
      <div className="viz-stats">
        <span>Explored <b>{view.visited.size}</b></span><span>Waiting <b>{view.frontier.size}</b></span>
        {finished && res.path && <><span>Path <b>{res.path.length - 1}</b> steps</span><span>Cost <b>{res.cost}</b></span></>}
      </div>

      <div className="pf-scroll" onMouseLeave={() => setDrawing(false)} onMouseUp={() => setDrawing(false)}>
        <div className="pf-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((v, i) => {
            const cls = i === start ? 'start' : i === goal ? 'goal' : pathSet.has(i) ? 'path' : v === 1 ? 'wall'
              : i === view.cur ? 'cur' : view.visited.has(i) ? 'seen' : view.frontier.has(i) ? 'front' : v === 2 ? 'mud' : '';
            return (
              <div key={i} className={`pf-cell ${cls}${v === 2 && cls !== 'mud' && cls !== '' ? ' mud-under' : ''}`}
                onMouseDown={e => { e.preventDefault(); setDrawing(true); paint(i); }}
                onMouseEnter={() => drawing && paint(i)}
                onClick={() => { if (!drawing) paint(i); }} />
            );
          })}
        </div>
      </div>
      <div className={`viz-note${finished ? (res.path ? ' good' : ' bad') : ''}`}>{note}</div>
      <div className="viz-legend">
        {[['#00ff88', 'Start'], ['#ff2d78', 'Goal'], ['#0a1124', 'Wall'], ['#8a6a3a', 'Mud (cost 5)'], ['#ffe600', 'Waiting'], ['#00a8c8', 'Explored'], ['#bf5aff', 'Final path']].map(([c, l]) => (
          <div key={l} className="legend-item"><div className="legend-dot" style={{ background: c, border: '1px solid #3d5a7a' }} /><span>{l}</span></div>
        ))}
      </div>
    </div>
  );
}
