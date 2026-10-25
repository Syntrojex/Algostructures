import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { loadLab } from '../../labs';
import HanoiBoard from './HanoiBoard';
import NumberStepper from '../NumberStepper';
import type { ArraySnap, CallsSnap, HashSnap, Lab, LabStep, ListSnap, Ptr, Snap, TreeSnap } from '../../labs/core';
import { highlightCode } from '../../utils/highlight';

/* ══════════════════════════════════════════════════════════════════════════
   RENDERERS — one per snapshot kind
   ══════════════════════════════════════════════════════════════════════════ */

function PtrBadges({ ptrs }: { ptrs: Ptr[] }) {
  if (!ptrs.length) return <div className="lab-ptrslot" />;
  return (
    <div className="lab-ptrslot">
      {ptrs.map(p => (
        <span key={p.name} className={`lab-ptr c-${p.color || 'cyan'}`}>{p.name}</span>
      ))}
    </div>
  );
}

function ArrayView({ s }: { s: ArraySnap }) {
  const vertical = s.layout === 'stack';
  const cells = Array.from({ length: s.capacity }, (_, i) => i);
  const isLive = (i: number) => (s.dead ? !s.dead.includes(i) : i < s.size);

  const cellClass = (i: number) => {
    const c = ['lab-cell'];
    if (!isLive(i)) c.push('ghost');
    if (s.hi?.includes(i)) c.push('hi');
    if (s.hi2?.includes(i)) c.push('hi2');
    return c.join(' ');
  };
  const ptrsAt = (i: number) => s.ptrs.filter(p => p.index === i);

  return (
    <div className="lab-arrview">
      <div className="lab-meta">
        <span>size <b>{s.size}</b></span>
        <span>capacity <b>{s.capacity}</b></span>
        {s.ptrs.map(p => (
          <span key={p.name}>{p.name} <b className={`c-${p.color || 'cyan'}`}>{p.index}</b></span>
        ))}
      </div>
      <div className={vertical ? 'lab-arr-col' : 'lab-arr-row'}>
        {(vertical ? [...cells].reverse() : cells).map(i => (
          <div className="lab-cellwrap" key={i}>
            {!vertical && <PtrBadges ptrs={ptrsAt(i)} />}
            <div className={cellClass(i)}>
              {s.cells[i] === null || s.cells[i] === undefined ? '·' : s.cells[i]}
            </div>
            <div className="lab-idx">
              [{i}]{vertical && ptrsAt(i).length > 0 ? <span className="lab-ptr-inline"> ← {ptrsAt(i).map(p => p.name).join(', ')}</span> : null}
            </div>
          </div>
        ))}
      </div>
      {s.layout === 'ring' && (
        <div className="lab-hint">Slots outside front…rear are free — the queue wraps around this array instead of shifting.</div>
      )}
    </div>
  );
}

/* ── Linked lists: real pointer arrows ──────────────────────────────────────────
   Nodes are boxes; every `next` (and `prev`) pointer is an SVG arrow drawn between the boxes, so a new node
   can hover above the list, grow its arrow toward the old head, and only then slide into the row. */
interface Arrow { key: string; d: string; kind: 'next' | 'prev'; hi: boolean; label?: { x: number; y: number; t: string } }
interface Box { l: number; r: number; t: number; b: number; cx: number; cy: number }

function ListView({ s }: { s: ListSnap }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const wraps = useRef<Record<string, HTMLElement | null>>({});
  const lastRects = useRef<Record<string, { l: number; t: number }>>({});
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const floating = s.floating;
  const rowIds = s.order.filter(id => !floating.includes(id));           // floating nodes are drawn above the row only
  const ptrsAt = (id: number) => s.ptrs.filter(p => p.id === id);
  const nullPtrs = s.ptrs.filter(p => p.id === null);
  const lastId = rowIds.length ? rowIds[rowIds.length - 1] : null;
  const showNullRight = !s.circular && lastId !== null && s.next[lastId] === null;
  const showNullLeft = s.doubly && rowIds.length > 0 && s.prev?.[rowIds[0]] === null;

  const draw = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    /* offset-based geometry (ignores CSS transforms), so arrows stay correct even while a box is still gliding */
    const box = (key: string): Box | null => {
      const el = refs.current[key];
      if (!el) return null;
      let l = 0, t = 0;
      for (let cur: HTMLElement | null = el; cur && cur !== wrap; cur = cur.offsetParent as HTMLElement | null) { l += cur.offsetLeft; t += cur.offsetTop; }
      const w = el.offsetWidth, h = el.offsetHeight;
      return { l, r: l + w, t, b: t + h, cx: l + w / 2, cy: t + h / 2 };
    };
    const out: Arrow[] = [];
    const ids = [...rowIds, ...floating];
    const idxInRow = (id: number) => rowIds.indexOf(id);
    for (const id of ids) {
      const A = box(`n${id}`);
      if (!A) continue;
      const hi = (a: number, b: number) => s.hiLink.includes(a) || s.hiLink.includes(b);
      const lanes = s.doubly ? 7 : 0;

      // ── next ──
      const nx = s.next[id];
      if (nx !== undefined) {
        if (nx === null) {
          if (id === lastId && showNullRight) {
            const N = box('nullR');
            if (N) out.push({ key: `${id}>null`, kind: 'next', hi: s.hiLink.includes(id), d: `M ${A.r} ${A.cy - lanes} L ${N.l - 3} ${N.cy - lanes}` });
          } else if (floating.includes(id)) {
            out.push({ key: `${id}>null`, kind: 'next', hi: false, d: `M ${A.cx} ${A.b} L ${A.cx} ${A.b + 12}`, label: { x: A.cx, y: A.b + 24, t: 'NULL' } });
          }
        } else {
          const B = box(`n${nx}`);
          if (B) {
            let d: string;
            const adjacent = idxInRow(id) >= 0 && idxInRow(nx) === idxInRow(id) + 1 && Math.abs(A.cy - B.cy) < 12;
            if (nx === id) {
              d = `M ${A.cx + 10} ${A.t} C ${A.cx + 10} ${A.t - 44}, ${A.cx - 10} ${A.t - 44}, ${A.cx - 10} ${A.t}`;
            } else if (adjacent) {
              d = `M ${A.r} ${A.cy - lanes} L ${B.l - 3} ${B.cy - lanes}`;
            } else if (idxInRow(id) >= 0 && idxInRow(nx) === idxInRow(id) + 1) {
              const mid = (A.b + B.t) / 2;                                                                            // list wrapped onto the next line
              d = `M ${A.r} ${A.cy - lanes} H ${A.r + 14} V ${mid - lanes} H ${B.l - 16} V ${B.cy - lanes} H ${B.l - 3}`;
            } else if (floating.includes(id)) {
              d = `M ${A.cx} ${A.b} C ${A.cx} ${A.b + 46}, ${B.cx} ${B.t - 46}, ${B.cx} ${B.t - 3}`;                  // new node → down onto its target
            } else if (floating.includes(nx)) {
              d = `M ${A.cx} ${A.t} C ${A.cx} ${A.t - 46}, ${B.cx} ${B.b + 46}, ${B.cx} ${B.b + 3}`;                  // list node → up to the new node
            } else if (B.cx > A.cx) {
              const h = 34 + 7 * Math.min(6, Math.abs(idxInRow(nx) - idxInRow(id)));
              d = `M ${A.cx} ${A.t} C ${A.cx} ${A.t - h}, ${B.cx} ${B.t - h}, ${B.cx} ${B.t - 3}`;                    // forward skip: arc over the row
            } else {
              const h = 34 + 7 * Math.min(6, Math.abs(idxInRow(nx) - idxInRow(id)));
              d = `M ${A.cx} ${A.b} C ${A.cx} ${A.b + h}, ${B.cx} ${B.b + h}, ${B.cx} ${B.b + 3}`;                    // pointing backwards: arc under the row
            }
            out.push({ key: `${id}>${nx}`, kind: 'next', hi: hi(id, nx), d });
          }
        }
      }

      // ── prev (doubly) ──
      if (s.doubly) {
        const pv = s.prev?.[id];
        if (pv === null && id === rowIds[0] && showNullLeft) {
          const N = box('nullL');
          if (N) out.push({ key: `${id}<null`, kind: 'prev', hi: false, d: `M ${A.l} ${A.cy + 7} L ${N.r + 3} ${N.cy + 7}` });
        } else if (pv !== undefined && pv !== null) {
          const B = box(`n${pv}`);
          if (B) {
            let d: string;
            const adjacent = idxInRow(id) >= 0 && idxInRow(pv) === idxInRow(id) - 1 && Math.abs(A.cy - B.cy) < 12;
            if (adjacent) d = `M ${A.l} ${A.cy + 7} L ${B.r + 3} ${B.cy + 7}`;
            else if (idxInRow(id) >= 0 && idxInRow(pv) === idxInRow(id) - 1) { const mid = (A.t + B.b) / 2 + 6; d = `M ${A.l} ${A.cy + 7} H ${A.l - 14} V ${mid} H ${B.r + 16} V ${B.cy + 7} H ${B.r + 3}`; }
            else if (floating.includes(id)) d = `M ${A.cx - 12} ${A.b} C ${A.cx - 12} ${A.b + 52}, ${B.cx - 12} ${B.t - 52}, ${B.cx - 12} ${B.t - 3}`;
            else if (floating.includes(pv)) d = `M ${A.cx - 12} ${A.t} C ${A.cx - 12} ${A.t - 52}, ${B.cx - 12} ${B.b + 52}, ${B.cx - 12} ${B.b + 3}`;
            else if (B.cx < A.cx) { const h = 46 + 7 * Math.min(6, Math.abs(idxInRow(pv) - idxInRow(id))); d = `M ${A.cx} ${A.b} C ${A.cx} ${A.b + h}, ${B.cx} ${B.b + h}, ${B.cx} ${B.b + 3}`; }
            else { const h = 46 + 7 * Math.min(6, Math.abs(idxInRow(pv) - idxInRow(id))); d = `M ${A.cx} ${A.t} C ${A.cx} ${A.t - h}, ${B.cx} ${B.t - h}, ${B.cx} ${B.t - 3}`; }
            out.push({ key: `${id}<${pv}`, kind: 'prev', hi: hi(id, pv), d });
          }
        }
      }
    }
    setArrows(out);
    setDims({ w: wrap.scrollWidth, h: wrap.scrollHeight });
  };

  // Measure after every render: arrows use the FINAL positions; boxes that moved glide there from where they were (FLIP).
  useLayoutEffect(() => {
    draw();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const c = wrap.getBoundingClientRect();
    const now: Record<string, { l: number; t: number }> = {};
    for (const id of [...rowIds, ...floating]) {
      const el = wraps.current[`n${id}`];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      now[`n${id}`] = { l: r.left - c.left, t: r.top - c.top };
      const was = lastRects.current[`n${id}`];
      if (was && (Math.abs(was.l - now[`n${id}`].l) > 1 || Math.abs(was.t - now[`n${id}`].t) > 1)) {
        el.style.transition = 'none';
        el.style.transform = `translate(${was.l - now[`n${id}`].l}px, ${was.t - now[`n${id}`].t}px)`;
        void el.offsetWidth;                                                   // commit the starting position
        el.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        el.style.transform = '';
      }
    }
    lastRects.current = now;
  }, [s]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => ro.disconnect();
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const setRef = (key: string) => (el: HTMLElement | null) => { refs.current[key] = el; };
  const setWrap = (key: string) => (el: HTMLElement | null) => { wraps.current[key] = el; };
  const nodeClass = (id: number, extra = '') => {
    const c = ['lab-node'];
    if (extra) c.push(extra);
    if (s.hiNode.includes(id)) c.push('hi');
    if (s.dying?.includes(id)) c.push('dying');
    if (id === s.head) c.push('is-head');
    return c.join(' ');
  };

  return (
    <div className="lab-listview" ref={wrapRef}>
      <svg className="lab-arrows" width={dims.w} height={dims.h} aria-hidden="true">
        <defs>
          {(['next', 'prev', 'hi'] as const).map(k => (
            <marker key={k} id={`lab-ah-${k}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className={`lab-ahead ${k}`} />
            </marker>
          ))}
        </defs>
        {arrows.map(a => (
          <g key={a.key} className={`lab-arrow ${a.kind}${a.hi ? ' hi' : ''}`}>
            <path d={a.d} markerEnd={`url(#lab-ah-${a.hi ? 'hi' : a.kind})`} />
            {a.label && <text x={a.label.x} y={a.label.y} textAnchor="middle" className="lab-arrow-label">{a.label.t}</text>}
          </g>
        ))}
      </svg>

      {floating.length > 0 && (
        <div className="lab-float-row">
          {floating.map(id => (
            <div className="lab-nodewrap floating" key={id} ref={setWrap(`n${id}`)}>
              <PtrBadges ptrs={ptrsAt(id)} />
              <div className={nodeClass(id, 'floating')} ref={setRef(`n${id}`)}>
                <span className="lab-node-val">{s.vals[id]}</span>
              </div>
              <div className="lab-idx">new Node — not in the list yet</div>
            </div>
          ))}
        </div>
      )}

      <div className="lab-node-row">
        {rowIds.length === 0 && floating.length === 0 && <div className="lab-empty">head = nullptr &nbsp;(empty list)</div>}
        {showNullLeft && <div className="lab-nullbox left" ref={setRef('nullL')}>NULL</div>}
        {rowIds.map(id => (
          <div className="lab-nodewrap" key={id} ref={setWrap(`n${id}`)}>
            <PtrBadges ptrs={ptrsAt(id)} />
            <div className={nodeClass(id)} ref={setRef(`n${id}`)}>
              <span className="lab-node-val">{s.vals[id]}</span>
            </div>
            <div className="lab-idx" />
          </div>
        ))}
        {showNullRight && <div className="lab-nullbox" ref={setRef('nullR')}>NULL</div>}
      </div>

      {nullPtrs.length > 0 && (
        <div className="lab-nullptrs">
          {nullPtrs.map(p => <span key={p.name} className={`lab-ptr c-${p.color || 'cyan'}`}>{p.name} = NULL</span>)}
        </div>
      )}
      <div className="lab-hint">Boxes are nodes in memory — they stay put. The <b>arrows are the pointers</b>: watch them being created, rewired and removed.</div>
    </div>
  );
}


function TreeView({ s }: { s: TreeSnap }) {
  const layout = useMemo(() => {
    const byId = new Map(s.nodes.map(n => [n.id, n]));
    const pos = new Map<number, { x: number; y: number }>();
    let col = 0;
    let maxDepth = 0;
    const walk = (id: number | null, d: number) => {
      if (id === null) return;
      const n = byId.get(id);
      if (!n) return;
      maxDepth = Math.max(maxDepth, d);
      walk(n.l, d + 1);
      pos.set(id, { x: col++, y: d });
      walk(n.r, d + 1);
    };
    walk(s.root, 0);
    return { pos, cols: Math.max(col, 1), depth: maxDepth };
  }, [s.nodes, s.root]);

  const GAP_X = 62, GAP_Y = 68, R = 21, PAD = 34;
  const floating = (s.floating ?? []).map(id => s.nodes.find(n => n.id === id)).filter((n): n is NonNullable<typeof n> => !!n);
  const TOP = floating.length ? 78 : 0;                              // room for brand-new, still-unlinked nodes above the tree
  const W = Math.max(layout.cols * GAP_X + PAD * 2 - GAP_X + R * 2, floating.length * 120 + PAD * 2);
  const H = (layout.depth + 1) * GAP_Y + PAD + TOP;
  const xy = (id: number) => {
    const p = layout.pos.get(id)!;
    return { cx: PAD + p.x * GAP_X, cy: PAD + p.y * GAP_Y + TOP };
  };
  /* an edge is a pointer parent → child: start/end on the circle borders so the arrowhead is visible */
  const edge = (from: number, to: number, key: string) => {
    const a2 = xy(from), b2 = xy(to);
    const dx = b2.cx - a2.cx, dy = b2.cy - a2.cy, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = a2.cx + ux * R, y1 = a2.cy + uy * R;
    const x2 = b2.cx - ux * (R + (s.pointers ? 3 : 0)), y2 = b2.cy - uy * (R + (s.pointers ? 3 : 0));
    return <line key={key} x1={s.pointers ? x1 : a2.cx} y1={s.pointers ? y1 : a2.cy} x2={s.pointers ? x2 : b2.cx} y2={s.pointers ? y2 : b2.cy} className="lab-tree-edge" markerEnd={s.pointers ? 'url(#lab-tree-ah)' : undefined} />;
  };

  return (
    <div className="lab-treeview">
      {s.root === null && floating.length === 0 ? (
        <div className="lab-empty">root = nullptr &nbsp;(empty tree)</div>
      ) : (
        <svg viewBox={`0 0 ${Math.max(W, 180)} ${Math.max(H, 120)}`} className="lab-tree-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="lab-tree-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" className="lab-tree-ahead" />
            </marker>
          </defs>
          {floating.map((n, i) => (
            <g key={`f${n.id}`} className="lab-tree-node floating">
              <circle cx={PAD + i * 120} cy={PAD + 4} r={R} />
              <text x={PAD + i * 120} y={PAD + 9} textAnchor="middle">{n.value}</text>
              <text x={PAD + i * 120 + R + 8} y={PAD + 1} className="lab-tree-note">new Node</text>
              <text x={PAD + i * 120 + R + 8} y={PAD + 13} className="lab-tree-note">left = right = NULL</text>
            </g>
          ))}
          {s.root === null && <text x={PAD} y={H - 18} className="lab-tree-note">root = nullptr</text>}
          {s.nodes.map(n => (
            <g key={`e${n.id}`}>
              {n.l !== null && layout.pos.has(n.l) && edge(n.id, n.l, `l${n.id}`)}
              {n.r !== null && layout.pos.has(n.r) && edge(n.id, n.r, `r${n.id}`)}
            </g>
          ))}
          {s.nodes.map(n => {
            if (!layout.pos.has(n.id)) return null;
            const { cx, cy } = xy(n.id);
            const cls = s.hi.includes(n.id) ? 'hi' : s.path.includes(n.id) ? 'path' : '';
            return (
              <g key={n.id} className={`lab-tree-node ${cls}`}>
                <circle cx={cx} cy={cy} r={R} />
                <text x={cx} y={cy + 5} textAnchor="middle">{n.value}</text>
                {s.badges && s.badges[n.id] && (
                  <text x={cx} y={cy + R + 13} textAnchor="middle" className={`lab-tree-badge${s.badBadges?.includes(n.id) ? ' bad' : ''}`}>{s.badges[n.id]}</text>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {s.arrayView && (
        <div className="lab-heaparr">
          <div className="lab-meta"><span>backing array</span></div>
          <div className="lab-arr-row">
            {s.arrayView.map((v, i) => (
              <div className="lab-cellwrap" key={i}>
                <div className={`lab-cell ${i >= s.nodes.length ? 'ghost' : ''} ${s.arrayHi?.includes(i) ? 'hi' : ''}`}>{v === null ? '·' : v}</div>
                <div className="lab-idx">[{i}]</div>
              </div>
            ))}
          </div>
          <div className="lab-hint">parent(i) = (i−1)/2 &nbsp;·&nbsp; left(i) = 2i+1 &nbsp;·&nbsp; right(i) = 2i+2</div>
        </div>
      )}
    </div>
  );
}

function HashView({ s }: { s: HashSnap }) {
  return (
    <div className="lab-hashview">
      <div className="lab-meta"><span>{s.formula}</span></div>
      {s.buckets.map((b, i) => (
        <div className={`lab-bucket ${s.hiBucket.includes(i) ? 'hi' : ''}`} key={i}>
          <div className="lab-bucket-idx">[{i}]</div>
          <div className="lab-bucket-chain">
            {b.length === 0 && <span className="lab-nullend">NULL</span>}
            {b.map((k, j) => (
              <span key={j} className={`lab-chainnode ${s.hiEntry.some(e => e.b === i && e.i === j) ? 'hi' : ''}`}>
                {k}
              </span>
            ))}
            {b.length > 1 && <span className="lab-collide">collision chain ×{b.length}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Recursion: call stack (left) + recursion tree (right) + the array being worked on ── */
const NODE_W = 74;
const NODE_H = 40;
const X_GAP = 84;

function CallsView({ s }: { s: CallsSnap }) {
  const layout = useMemo(() => {
    const kids: Record<number, number[]> = {};
    let root: number | null = null;
    s.tree.forEach(n => {
      if (n.parent === null) root = n.id;
      else (kids[n.parent] = kids[n.parent] || []).push(n.id);
    });
    const pos: Record<number, { x: number; d: number }> = {};
    let leaf = 0;
    let maxD = 0;
    const walk = (id: number, d: number): number => {
      maxD = Math.max(maxD, d);
      const ch = kids[id] || [];
      let x: number;
      if (!ch.length) x = leaf++;
      else {
        const xs = ch.map(c => walk(c, d + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      pos[id] = { x, d };
      return x;
    };
    if (root !== null) walk(root, 0);
    const yGap = maxD > 6 ? 52 : 62;
    return { pos, w: Math.max(leaf, 1) * X_GAP, h: (maxD + 1) * yGap + 10, yGap };
  }, [s.tree]);

  const frames = [...s.stack].reverse();           // newest call on top
  const strip = s.strip;

  return (
    <div className="lab-calls">
      <div className="lab-meta">
        <span>calls so far <b>{s.calls}</b></span>
        <span>stack depth <b>{s.stack.length}</b></span>
        <span>deepest <b>{s.maxDepth}</b></span>
        {s.result !== undefined && <span className="lab-calls-result">result <b>{s.result}</b></span>}
      </div>

      {s.overflow && <div className="lab-calls-overflow">💥 STACK OVERFLOW — no base case, the recursion never stops</div>}

      {s.pegs && (
        <HanoiBoard stacks={s.pegs.stacks} names={s.pegs.names} total={s.pegs.total} hiDisk={s.pegs.hiDisk} hiPeg={s.pegs.hiPeg} compact />
      )}

      {strip && (
        <div className="lab-calls-strip">
          {strip.title && <div className="lab-calls-striptitle">{strip.title}</div>}
          <div className="lab-arr-row">
            {strip.cells.map((v, i) => (
              <div className="lab-cellwrap" key={i}>
                <div className="lab-ptrslot">
                  {strip.ptrs.filter(p => p.index === i).map(p => (
                    <span key={p.name} className={`lab-ptr c-${p.color || 'cyan'}`}>{p.name}</span>
                  ))}
                </div>
                <div className={`lab-cell ${strip.hi.includes(i) ? 'hi' : ''} ${strip.hi2.includes(i) ? 'hi2' : ''} ${strip.dim.includes(i) ? 'ghost' : ''}`}>{v}</div>
                <div className="lab-idx">[{i}]</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.memo && (
        <div className="lab-calls-strip">
          <div className="lab-calls-striptitle">memo table (— = not computed yet)</div>
          <div className="lab-arr-row">
            {s.memo.map((v, i) => (
              <div className="lab-cellwrap" key={i}>
                <div className={`lab-cell ${s.memoHi?.includes(i) ? 'hi' : ''} ${v === null ? 'ghost' : ''}`}>{v === null ? '—' : v}</div>
                <div className="lab-idx">memo[{i}]</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lab-calls-grid">
        {/* call stack */}
        <div className="lab-callstack">
          <div className="lab-calls-head">CALL STACK <span>(grows upward ↑)</span></div>
          {frames.length === 0 && <div className="lab-calls-empty">empty — nothing is running yet</div>}
          {frames.slice(0, 12).map((f, i) => {
            const depth = frames.length - i;
            const vars = f.vars.split(/,\s*(?=[A-Za-z_]+\s*=)/).filter(Boolean);
            return (
              <div key={f.id} className={`lab-frame lab-frame-${f.status}${i === 0 ? ' top' : ''}`}>
                <div className="lab-frame-head">
                  <span className="lab-frame-depth">#{depth}</span>
                  <span className="lab-frame-call">{f.call}</span>
                  {i === 0 && <span className="lab-frame-toptag">TOP</span>}
                </div>
                <div className="lab-frame-vars">
                  {vars.map((v, k) => <span key={k} className="lab-frame-var">{v}</span>)}
                </div>
                <div className="lab-frame-status">
                  {f.status === 'running' && <span className="pill run">▶ running</span>}
                  {f.status === 'waiting' && <><span className="pill wait">⏳ waiting</span><span className="lab-frame-for">for <b>{f.waitFor}</b></span></>}
                  {f.status === 'returning' && <><span className="pill ret">↩ returns</span><b className="lab-frame-retval">{f.ret}</b></>}
                </div>
              </div>
            );
          })}
          {frames.length > 12 && <div className="lab-calls-empty">… {frames.length - 12} more frames below</div>}
          <div className="lab-callstack-floor">main()  ·  bottom of the stack</div>
        </div>

        {/* recursion tree */}
        <div className="lab-calltree">
          <div className="lab-calls-head">RECURSION TREE <span>(each call is a node)</span></div>
          {s.tree.length === 0 ? (
            <div className="lab-calls-empty">the tree fills in as calls are made</div>
          ) : (
            <div className="lab-calltree-scroll">
              <svg width={layout.w + 12} height={layout.h} viewBox={`0 0 ${layout.w + 12} ${layout.h}`}>
                {s.tree.filter(n => n.parent !== null).map(n => {
                  const a = layout.pos[n.parent as number];
                  const b = layout.pos[n.id];
                  if (!a || !b) return null;
                  const x1 = a.x * X_GAP + X_GAP / 2 + 6;
                  const y1 = a.d * layout.yGap + NODE_H + 4;
                  const x2 = b.x * X_GAP + X_GAP / 2 + 6;
                  const y2 = b.d * layout.yGap + 4;
                  return <line key={`e${n.id}`} x1={x1} y1={y1} x2={x2} y2={y2} className="lab-treeedge" />;
                })}
                {s.tree.map(n => {
                  const p = layout.pos[n.id];
                  if (!p) return null;
                  const x = p.x * X_GAP + (X_GAP - NODE_W) / 2 + 6;
                  const y = p.d * layout.yGap + 4;
                  const cls = ['lab-callnode', `st-${n.status}`, n.tag ? `tag-${n.tag}` : '', n.id === s.activeId ? 'active' : ''].join(' ');
                  return (
                    <g key={n.id} className={cls}>
                      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={9} />
                      <text x={x + NODE_W / 2} y={y + 16} textAnchor="middle" className="lab-callnode-label">{n.label}</text>
                      <text x={x + NODE_W / 2} y={y + 32} textAnchor="middle" className="lab-callnode-ret">
                        {n.ret !== undefined ? `→ ${n.ret}` : n.status === 'waiting' ? '…' : '▶'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
          <div className="lab-calls-legend">
            <span className="lg run">running</span>
            <span className="lg wait">waiting</span>
            <span className="lg done">returned</span>
            <span className="lg base">base case</span>
            <span className="lg memo">memo hit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stage({ snap }: { snap: Snap }) {
  if (snap.kind === 'calls') return <CallsView s={snap} />;
  if (snap.kind === 'array') return <ArrayView s={snap} />;
  if (snap.kind === 'list') return <ListView s={snap} />;
  if (snap.kind === 'tree') return <TreeView s={snap} />;
  return <HashView s={snap} />;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */

const clone = <T,>(v: T): T => {
  try { return structuredClone(v); } catch { return JSON.parse(JSON.stringify(v)); }
};

/* The guard lives in a WRAPPER, not inside the hook-using component. An early
   return placed above the hooks would change the hook count between renders and
   break the Rules of Hooks — a subtler bug than the one it was fixing. Keeping
   the check out here means the inner component only ever runs with a real lab,
   and remounts cleanly whenever labId changes. */
export default function ClassLab({ labId }: { labId: string }) {
  // undefined = still loading the lab's code, null = no such lab
  const [lab, setLab] = useState<Lab | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    setLab(undefined);
    loadLab(labId).then(l => { if (live) setLab(l); }).catch(() => { if (live) setLab(null); });
    return () => { live = false; };
  }, [labId]);

  if (lab === undefined) return <div className="viz-loading">Loading class lab…</div>;
  if (!lab) {
    return (
      <div className="viz-panel">
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ts)', fontFamily: 'Rajdhani' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🧩</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: 'var(--ao)' }}>
            This class lab could not be loaded
          </div>
        </div>
      </div>
    );
  }
  return <ClassLabBody key={labId} lab={lab} />;
}

function ClassLabBody({ lab }: { lab: Lab }) {
  const stateRef = useRef<any>(null);
  if (stateRef.current === null) stateRef.current = lab.init();

  const [opId, setOpId] = useState(lab.ops[0].id);
  const op = lab.ops.find(o => o.id === opId) || lab.ops[0];
  const [inputErr, setInputErr] = useState('');
  const [args, setArgs] = useState<Record<string, string>>(() =>
    Object.fromEntries(lab.ops[0].params.map(p => [p.name, String(p.def)])));
  const [steps, setSteps] = useState<LabStep[]>([]);
  const [idx, setIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(850);
  const [base, setBase] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const codeRef = useRef<HTMLDivElement>(null);

  const codeLines = useMemo(() => highlightCode(lab.code).split('\n'), [lab.code]);

  const onOpChange = (id: string) => {
    const nop = lab.ops.find(o => o.id === id)!;
    setOpId(id);
    setInputErr('');
    setArgs(Object.fromEntries(nop.params.map(p => [p.name, String(p.def)])));
  };

  const shownConsole = useMemo(() => {
    const lines = [...base];
    let open = false;                                        // the last line is an unfinished `cout << x << " "` run
    for (const s of steps.slice(0, idx + 1)) {
      if (!s.out) continue;
      if (s.inline) {
        if (open && lines.length) lines[lines.length - 1] += ' ' + s.out;
        else { lines.push(s.out); open = true; }
      } else { lines.push(s.out); open = false; }
    }
    return lines;
  }, [base, steps, idx]);

  const current = idx >= 0 && steps[idx] ? steps[idx] : null;
  const snap: Snap = current ? current.snap : lab.snapshot(stateRef.current);

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx(i => i + 1), speed);
    return () => clearTimeout(t);
  }, [playing, idx, steps, speed]);

  /* keep the executing line inside the code viewport without scrolling the page */
  useEffect(() => {
    if (!current || !codeRef.current) return;
    const box = codeRef.current;
    const el = box.querySelector(`[data-line="${current.line}"]`) as HTMLElement | null;
    if (!el) return;
    const target = Math.max(0, el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2);
    // Element.scrollTo with an options object is missing in older Safari and in
    // some embedded webviews. Falling back to scrollTop keeps the highlight
    // tracking (just without the smooth easing) instead of throwing mid-run.
    if (typeof box.scrollTo === 'function') {
      try { box.scrollTo({ top: target, behavior: 'smooth' }); }
      catch { box.scrollTop = target; }
    } else {
      box.scrollTop = target;
    }
  }, [current]);

  const runOp = () => {
    const nums: Record<string, number> = {};
    for (const p of op.params) {
      const raw = (args[p.name] ?? '').trim();
      if (!/^-?\d+$/.test(raw)) {
        setInputErr(`Enter a whole number for “${p.label}” (it is empty or not a number), then press Run.`);
        return;
      }
      nums[p.name] = parseInt(raw, 10);
    }
    setInputErr('');
    const next = clone(stateRef.current);
    let produced: LabStep[] = [];
    try {
      produced = lab.run(next, op.id, nums);
    } catch {
      produced = [];
    }
    if (!produced.length) return;
    stateRef.current = next;
    setBase(shownConsole);
    setSteps(produced);
    setIdx(0);
    setPlaying(true);
    setTick(t => t + 1);
  };

  const reset = () => {
    stateRef.current = lab.init();
    setSteps([]); setIdx(-1); setPlaying(false); setBase([]);
    setTick(t => t + 1);
  };

  const atEnd = idx >= steps.length - 1;

  return (
    <div className="viz-panel class-lab">
      <div className="viz-panel-title">{lab.icon} {lab.title} — Live Run</div>
      <p className="lab-blurb">{lab.blurb}</p>

      {/* ── operation picker ── */}
      <div className="lab-controls">
        <label className="lab-label">Operation</label>
        <select className="lab-select" value={opId} onChange={e => onOpChange(e.target.value)}>
          {lab.ops.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        {op.params.map(p => (
          <span className="lab-arg" key={p.name}>
            <label className="lab-label">{p.label}</label>
            <NumberStepper
              value={args[p.name] ?? ''}
              onChange={v => { setInputErr(''); setArgs(a => ({ ...a, [p.name]: v })); }}
              onEnter={runOp}
              min={-9999}
              max={9999}
              width={84}
              ariaLabel={p.label}
              invalid={!!inputErr}
            />
          </span>
        ))}
        <button className="viz-btn primary" onClick={runOp}>▶ Run</button>
        <button className="viz-btn" onClick={reset}>🔄 Reset object</button>
      </div>

      {inputErr && <div className="viz-note bad" style={{ marginTop: 0, marginBottom: 10 }} role="alert">⚠ {inputErr}</div>}

      <div className="lab-sig">
        <code>{lab.className}::{op.sig}</code>
        <span className="lab-big">{op.big}</span>
      </div>

      {/* ── code + stage (code reads first, left-to-right, then its effect on the right) ── */}
      <div className="lab-body">
        <div className="lab-codebox" ref={codeRef}>
          {codeLines.map((html, i) => {
            const n = i + 1;
            const active = current && current.line === n;
            return (
              <div key={n} data-line={n} className={`lab-codeline ${active ? 'active' : ''}`}>
                <span className="lab-lineno">{n}</span>
                <code dangerouslySetInnerHTML={{ __html: html || ' ' }} />
              </div>
            );
          })}
        </div>

        <div className="lab-stage" key={`stage-${tick}`}>
          <Stage snap={snap} />
        </div>
      </div>

      {/* ── transport ── */}
      <div className="lab-transport">
        <button className="viz-btn" onClick={() => { setPlaying(false); setIdx(0); }} disabled={!steps.length}>⏮</button>
        <button className="viz-btn" onClick={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)); }} disabled={!steps.length || idx <= 0}>◀ Prev</button>
        <button
          className="viz-btn primary"
          onClick={() => { if (atEnd) { setIdx(0); setPlaying(true); } else setPlaying(p => !p); }}
          disabled={!steps.length}
        >
          {playing ? '⏸ Pause' : atEnd ? '↻ Replay' : '▶ Play'}
        </button>
        <button className="viz-btn" onClick={() => { setPlaying(false); setIdx(i => Math.min(steps.length - 1, i + 1)); }} disabled={!steps.length || atEnd}>Next ▶</button>
        <button className="viz-btn" onClick={() => { setPlaying(false); setIdx(steps.length - 1); }} disabled={!steps.length}>⏭</button>
        <span className="lab-count">{steps.length ? `step ${idx + 1} / ${steps.length}` : 'no run yet'}</span>
        <span className="lab-speed">
          <label className="lab-label">speed</label>
          <input type="range" min={150} max={1600} step={50} value={1750 - speed} onChange={e => setSpeed(1750 - parseInt(e.target.value, 10))} />
        </span>
      </div>

      <div className="lab-note">
        {current ? current.note : 'Pick an operation, hit Run, then step through it line by line. The object keeps its state between runs, so you can build it up as you go.'}
      </div>

      {/* ── console ── */}
      <div className="lab-console">
        <div className="lab-console-head">
          <span>console output</span>
          <button
            className="code-btn"
            onClick={() => { setBase([]); setSteps(s => s.map(x => ({ ...x, out: undefined }))); }}
            disabled={!shownConsole.length}
          >clear</button>
        </div>
        <pre>{shownConsole.length ? shownConsole.join('\n') : '(nothing printed yet — try display())'}</pre>
      </div>
    </div>
  );
}
