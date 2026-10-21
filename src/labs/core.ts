/* ──────────────────────────────────────────────────────────────────────────
   CLASS LAB — core types
   --------------------------------------------------------------------------
   A "Class Lab" is a real C++ class (exactly the code shown on screen) paired
   with a step-by-step interpreter. Every operation the user runs produces an
   ordered list of LabSteps; each step knows:
     • which SOURCE LINE of the class is executing,
     • a plain-English note about what that line just did,
     • an optional cout line (so the console output is real, not faked),
     • a full SNAPSHOT of the data structure at that instant.

   The UI (components/visualizers/ClassLab.tsx) just plays those steps back.
   ────────────────────────────────────────────────────────────────────────── */

export interface Ptr {
  name: string;          // head / temp / newNode / prev / top / i / j ...
  index?: number;        // for array-style snapshots
  id?: number | null;    // for node-style snapshots (null => pointing at NULL)
  color?: 'cyan' | 'purple' | 'green' | 'orange' | 'pink';
}

export interface ArraySnap {
  kind: 'array';
  cells: (number | null)[];   // length == capacity; null == uninitialised slot
  size: number;
  capacity: number;
  hi: number[];               // primary highlight (being written / compared)
  hi2?: number[];             // secondary highlight (read from / moved)
  ptrs: Ptr[];
  /** stack/queue flavouring — draws the array vertically or as a ring */
  layout?: 'row' | 'stack' | 'ring';
  dead?: number[];            // logically-removed slots (drawn faded)
}

export interface ListSnap {
  kind: 'list';
  /** physical left-to-right layout. Nodes do NOT move when links change —
      that is the whole point of a linked list, and reverse() shows it. */
  order: number[];
  floating: number[];         // allocated with `new` but not linked in yet
  vals: Record<number, number>;
  next: Record<number, number | null>;
  prev?: Record<number, number | null>;
  head: number | null;
  tail?: number | null;
  ptrs: Ptr[];
  hiNode: number[];
  hiLink: number[];           // ids whose OUTGOING next-pointer just changed
  hiPrevLink?: number[];      // ids whose OUTGOING prev-pointer just changed
  doubly?: boolean;
  circular?: boolean;
  dying?: number[];           // nodes about to be `delete`d (drawn fading red)
}

export interface TreeNode {
  id: number;
  value: number;
  l: number | null;
  r: number | null;
}

export interface TreeSnap {
  kind: 'tree';
  nodes: TreeNode[];
  root: number | null;
  hi: number[];               // node currently being looked at
  path: number[];             // nodes already visited on the way down
  ptrs: Ptr[];
  floating?: number[];        // brand-new nodes that exist in memory but are not linked into the tree yet
  pointers?: boolean;         // draw edges as pointer arrows (BST); heaps are array-backed, so no arrowheads
  arrayView?: (number | null)[];  // heaps also show their backing array
  arrayHi?: number[];
}

export interface HashSnap {
  kind: 'hash';
  buckets: number[][];
  hiBucket: number[];
  hiEntry: { b: number; i: number }[];
  formula?: string;
}

/** One frame on the call stack. */
export interface CallFrame {
  id: number;
  call: string;                 // e.g. "factorial(3)"
  vars: string;                 // e.g. "n = 3"
  status: 'running' | 'waiting' | 'returning';
  waitFor?: string;             // the child call this frame is waiting on
  ret?: string;                 // value being returned (status === 'returning')
}

/** One node of the recursion (call) tree. */
export interface CallTreeNode {
  id: number;
  label: string;                // short text drawn inside the node
  parent: number | null;
  status: 'running' | 'waiting' | 'returning' | 'done';
  ret?: string;
  tag?: 'base' | 'memo';        // base case reached / answer came from the memo table
}

export interface CallsStrip {
  cells: (number | string)[];
  hi: number[];                 // primary highlight
  hi2: number[];                // secondary highlight
  dim: number[];                // cells outside the current search range
  ptrs: { name: string; index: number; color?: 'cyan' | 'purple' | 'green' | 'orange' | 'pink' }[];
  title?: string;
}

/** Tower of Hanoi board shown above the call stack. stacks[i] is bottom -> top. */
export interface CallsPegs {
  stacks: number[][];
  names: string[];
  total: number;                // number of disks (sets disk widths)
  hiDisk?: number;              // disk that was just moved
  hiPeg?: number;               // peg it landed on
}

export interface CallsSnap {
  kind: 'calls';
  stack: CallFrame[];           // bottom -> top
  tree: CallTreeNode[];
  activeId: number | null;
  calls: number;                // total calls made so far
  maxDepth: number;
  strip?: CallsStrip;           // array the recursion is working on
  memo?: (number | null)[];     // memo table (memoised ops only)
  memoHi?: number[];
  pegs?: CallsPegs;
  result?: string;
  overflow?: boolean;
}

export type Snap = ArraySnap | ListSnap | TreeSnap | HashSnap | CallsSnap;

export interface LabStep {
  line: number;       // 1-based line number inside lab.code (0 = no line)
  note: string;
  out?: string;       // a line of cout output produced by this step
  snap: Snap;
}

export interface LabParam {
  name: string;
  label: string;
  def: number;
}

export interface LabOp {
  id: string;
  label: string;       // shown in the dropdown
  sig: string;         // C++ signature, shown under the dropdown
  params: LabParam[];
  big: string;         // time complexity
}

export interface Lab {
  id: string;
  title: string;
  icon: string;
  className: string;
  blurb: string;
  code: string;
  marks: Record<string, number>;
  ops: LabOp[];
  init: () => any;
  snapshot: (st: any) => Snap;
  /** mutates `st` and returns the animation steps for the operation */
  run: (st: any, opId: string, args: Record<string, number>) => LabStep[];
}

/* ──────────────────────────────────────────────────────────────────────────
   parseCode — strips the inline "@mark" block-comment annotations out of the
   source and records
   the 1-based line number each mark landed on. This keeps the displayed code
   clean C++ while letting the interpreter reference lines by NAME instead of
   by a hardcoded number that silently rots the moment a line is added.
   ────────────────────────────────────────────────────────────────────────── */
export function parseCode(raw: string): { code: string; marks: Record<string, number> } {
  const lines = raw.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const marks: Record<string, number> = {};
  const out = lines.map((line, i) => {
    const m = line.match(/[ \t]*\/\*@([A-Za-z0-9_]+)\*\/[ \t]*$/);
    if (!m) return line;
    marks[m[1]] = i + 1;
    return line.slice(0, m.index);
  });
  return { code: out.join('\n'), marks };
}

/** small helper every lab uses to build steps without repeating itself */
export function stepper(marks: Record<string, number>, snapOf: () => Snap) {
  const steps: LabStep[] = [];
  const S = (mark: string, note: string, patch?: Partial<Snap>, out?: string) => {
    const snap = { ...snapOf(), ...(patch || {}) } as Snap;
    steps.push({ line: marks[mark] ?? 0, note, out, snap });
  };
  return { steps, S };
}

let idSeq = 1;
export const nextId = () => idSeq++;
