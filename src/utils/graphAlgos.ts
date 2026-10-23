// Pure BFS / DFS step generators + a tiny edge-list parser for the traversal visualizer.
export interface Graph { labels: string[]; edges: [number, number][]; adj: number[][] }
export interface TravFrame { visited: number[]; current: number | null; container: number[]; info: string; order: string[] }

export const DEFAULT_EDGES = 'A-B, A-C, B-D, C-D, B-E, D-F, E-G, F-G';

export function parseGraph(text: string): Graph | string {
  const parts = text.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  if (!parts.length) return 'Enter at least one edge, e.g. A-B, B-C';
  if (parts.length > 20) return 'Use at most 20 edges.';
  const names: string[] = [];
  const edges: [string, string][] = [];
  for (const p of parts) {
    const m = /^([A-Za-z0-9]{1,3})\s*[-–—>]+\s*([A-Za-z0-9]{1,3})$/.exec(p);
    if (!m) return `“${p}” is not an edge. Write it like A-B.`;
    const a = m[1].toUpperCase(), b = m[2].toUpperCase();
    if (a === b) return `“${p}” connects a node to itself — leave self-loops out.`;
    for (const x of [a, b]) if (!names.includes(x)) names.push(x);
    edges.push([a, b]);
  }
  if (names.length > 10) return 'Use at most 10 different nodes.';
  names.sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));
  const idx = new Map(names.map((n, i) => [n, i]));
  const seen = new Set<string>(); const out: [number, number][] = [];
  for (const [a, b] of edges) {
    const i = idx.get(a)!, j = idx.get(b)!; const k = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (seen.has(k)) continue; seen.add(k); out.push([i, j]);
  }
  const adj: number[][] = names.map(() => []);
  for (const [a, b] of out) { adj[a].push(b); adj[b].push(a); }
  adj.forEach(l => l.sort((x, y) => x - y));
  return { labels: names, edges: out, adj };
}

export function traversalFrames(g: Graph, start: number, mode: 'bfs' | 'dfs'): TravFrame[] {
  const L = (i: number) => g.labels[i];
  const frames: TravFrame[] = [];
  const visited: number[] = []; const order: string[] = [];
  const snap = (current: number | null, container: number[], info: string) =>
    frames.push({ visited: [...visited], current, container: [...container], info, order: [...order] });

  if (mode === 'bfs') {
    const queue = [start]; const seen = new Set([start]);
    snap(null, queue, `BFS puts ${L(start)} into the queue and marks it seen immediately — marking when a node is ADDED (not when it is removed) is what stops it being queued twice.`);
    while (queue.length) {
      const node = queue.shift()!;
      visited.push(node); order.push(L(node));
      snap(node, queue, `Dequeued from the front → ${L(node)}. Neighbours: ${g.adj[node].length ? g.adj[node].map(L).join(', ') : 'none'}.`);
      const fresh: number[] = [];
      for (const nb of g.adj[node]) if (!seen.has(nb)) { seen.add(nb); queue.push(nb); fresh.push(nb); }
      snap(node, queue, fresh.length ? `Added ${fresh.map(L).join(', ')} to the back of the queue. Queue is now [${queue.map(L).join(', ')}].` : `Every neighbour of ${L(node)} has already been seen — nothing added.`);
    }
    snap(null, [], `Done. BFS used a QUEUE, so it fanned out level by level — on an unweighted graph this is also shortest-path order. Visit order: ${order.join(' → ')}. O(V + E).${unreachedNote(g, visited)}`);
  } else {
    const stack = [start];
    snap(null, stack, `DFS pushes ${L(start)} onto the stack. A node is marked visited when it is POPPED; a node can sit in the stack more than once if two neighbours reach it, and the second copy is simply skipped.`);
    while (stack.length) {
      const node = stack.pop()!;
      if (visited.includes(node)) { snap(null, stack, `Popped ${L(node)}, but it is already visited → skip it.`); continue; }
      visited.push(node); order.push(L(node));
      snap(node, stack, `Popped from the top → ${L(node)} is visited. Neighbours: ${g.adj[node].length ? g.adj[node].map(L).join(', ') : 'none'}.`);
      const fresh = g.adj[node].filter(nb => !visited.includes(nb));
      for (const nb of [...fresh].reverse()) stack.push(nb);          // push in reverse so the smallest neighbour is explored first
      snap(node, stack, fresh.length ? `Pushed ${fresh.map(L).join(', ')} (smallest ends up on top, so ${L(fresh[0])} is explored next). Stack is now [${stack.map(L).join(', ')}] (top on the right).` : `No unvisited neighbours — back up to whatever is below on the stack.`);
    }
    snap(null, [], `Done. DFS used a STACK, so it dived as deep as possible before backing up — the natural fit for cycle detection and topological sort. Visit order: ${order.join(' → ')}. O(V + E).${unreachedNote(g, visited)}`);
  }
  return frames;
}

const unreachedNote = (g: Graph, visited: number[]) => {
  const miss = g.labels.filter((_, i) => !visited.includes(i));
  return miss.length ? ` Not reached: ${miss.join(', ')} — they are in a different connected component.` : '';
};

/** Same order as the textbook recursive DFS (neighbours in ascending order) — used by the tests. */
export function recursiveDfsOrder(g: Graph, start: number): number[] {
  const seen = new Set<number>(); const out: number[] = [];
  const go = (v: number) => { seen.add(v); out.push(v); for (const nb of g.adj[v]) if (!seen.has(nb)) go(nb); };
  go(start); return out;
}

export function circleLayout(n: number): { x: number; y: number }[] {
  if (n === 1) return [{ x: 225, y: 105 }];
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: 225 + 165 * Math.cos(a), y: 105 + 78 * Math.sin(a) };
  });
}
export const DEFAULT_LAYOUT = [
  { x: 60, y: 40 }, { x: 170, y: 30 }, { x: 60, y: 140 }, { x: 175, y: 130 }, { x: 285, y: 60 }, { x: 290, y: 170 }, { x: 390, y: 115 },
];
