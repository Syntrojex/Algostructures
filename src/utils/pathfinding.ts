// Grid path finding. Cell values: 0 = open, 1 = wall, 2 = mud (costs 5 to enter, 1 for open).
export type PathAlgo = 'bfs' | 'dfs' | 'dijkstra' | 'astar';
export const MUD_COST = 5;

export interface PathEvent { cur: number; found: number[] }        // visit `cur`; these neighbours were newly discovered
export interface PathResult { events: PathEvent[]; path: number[] | null; cost: number }

export function findPath(grid: number[], rows: number, cols: number, start: number, goal: number, algo: PathAlgo): PathResult {
  const events: PathEvent[] = [];
  const parent = new Int32Array(rows * cols).fill(-1);
  const dist = new Array<number>(rows * cols).fill(Infinity);
  const seen = new Uint8Array(rows * cols);          // discovered
  const done = new Uint8Array(rows * cols);          // visited / closed
  const cost = (i: number) => (grid[i] === 2 ? MUD_COST : 1);
  const nbrs = (i: number) => {
    const r = Math.floor(i / cols), c = i % cols, out: number[] = [];
    if (r > 0) out.push(i - cols);
    if (c < cols - 1) out.push(i + 1);
    if (r < rows - 1) out.push(i + cols);
    if (c > 0) out.push(i - 1);
    return out.filter(j => grid[j] !== 1);
  };
  const h = (i: number) => Math.abs(Math.floor(i / cols) - Math.floor(goal / cols)) + Math.abs((i % cols) - (goal % cols));

  const open: number[] = [start];
  seen[start] = 1; dist[start] = 0;
  let reached = false;
  while (open.length) {
    let pick = 0;
    if (algo === 'bfs') pick = 0;                                             // queue
    else if (algo === 'dfs') pick = open.length - 1;                          // stack
    else {
      const key = (i: number) => (algo === 'dijkstra' ? dist[i] : dist[i] + h(i));
      for (let k = 1; k < open.length; k++) if (key(open[k]) < key(open[pick])) pick = k;
    }
    const cur = open.splice(pick, 1)[0];
    if (done[cur]) continue;
    done[cur] = 1;
    const found: number[] = [];
    if (cur === goal) { events.push({ cur, found }); reached = true; break; }
    for (const nb of nbrs(cur)) {
      if (done[nb]) continue;
      const nd = dist[cur] + (algo === 'bfs' || algo === 'dfs' ? 1 : cost(nb));
      if (algo === 'dijkstra' || algo === 'astar') {
        if (nd < dist[nb]) { if (!seen[nb]) { seen[nb] = 1; found.push(nb); } dist[nb] = nd; parent[nb] = cur; if (!open.includes(nb)) open.push(nb); }
      } else if (!seen[nb]) { seen[nb] = 1; dist[nb] = nd; parent[nb] = cur; found.push(nb); open.push(nb); }
    }
    events.push({ cur, found });
  }
  let path: number[] | null = null;
  let total = 0;
  if (reached) {
    path = [];
    for (let i = goal; i !== -1; i = parent[i]) path.push(i);
    path.reverse();
    total = path.slice(1).reduce((s, i) => s + cost(i), 0);
  }
  return { events, path, cost: total };
}

export function randomMaze(rows: number, cols: number, start: number, goal: number, density = 0.28, rnd: () => number = Math.random): number[] {
  const g = new Array<number>(rows * cols).fill(0);
  for (let i = 0; i < g.length; i++) {
    if (i === start || i === goal) continue;
    const x = rnd();
    g[i] = x < density ? 1 : x < density + 0.1 ? 2 : 0;
  }
  return g;
}
