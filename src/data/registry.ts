// ══════════════════════════════════════════════════════════════════════════
// The site is a set of visualizers. This file is the single list of them:
// groups (shown as cards on Home / in the Browse drawer) and pages (one visualizer each).
// ══════════════════════════════════════════════════════════════════════════

export type Spec =
  | { t: 'lab'; lab: string }
  | { t: 'sort'; algo: 'bubble' | 'selection' | 'insertion' | 'shell' | 'counting' | 'merge' | 'quick' | 'heap' }
  | { t: 'race' }
  | { t: 'linsearch' }
  | { t: 'pathfind' }
  | { t: 'stackapp'; mode: 'parens' | 'infix' }
  | { t: 'bsearch' }
  | { t: 'array'; mode: 'prefixsum' | 'twopointer' | 'slidingwindow' | 'kadane' }
  | { t: 'stackqueue'; mode: 'stack' | 'queue' }
  | { t: 'bfsdfs' }
  | { t: 'dijkstra' }
  | { t: 'dp'; mode: 'knapsack' | 'lcs' | 'coinchange' | 'editdistance' }
  | { t: 'nqueens' }
  | { t: 'hanoi' }
  | { t: 'bit'; modes: ('and' | 'or' | 'xor' | 'not' | 'lshift' | 'rshift' | 'setbit' | 'countbits')[] }
  | { t: 'complexity' }
  | { t: 'practice' };

export interface VizPage {
  key: string;
  group: string;
  title: string;
  blurb: string;            // one or two lines — what you are looking at
  spec: Spec;
  badge?: string;           // small tag on cards, e.g. "Class Lab"
}

export type GroupKind = 'ds' | 'algo' | 'play' | 'tool';

export interface VizGroup {
  key: string;
  icon: string;
  name: string;
  kind: GroupKind;
  blurb: string;
}

export const KIND_TITLES: Record<GroupKind, { title: string; sub: string }> = {
  ds:   { title: 'Data Structures', sub: 'Run the full C++ class line by line and watch the structure change.' },
  algo: { title: 'Algorithms',      sub: 'Step through the classics with your own input.' },
  play: { title: 'Games & Puzzles', sub: 'Play it, then watch the recursion solve it.' },
  tool: { title: 'Tools',           sub: 'Practice, charts and your own code.' },
};

export const GROUPS: VizGroup[] = [
  { key: 'arrays',      icon: '📦', name: 'Arrays',               kind: 'ds',   blurb: 'Dynamic array class, plus the four classic array techniques.' },
  { key: 'linked-list', icon: '🔗', name: 'Linked Lists',         kind: 'ds',   blurb: 'Singly, doubly and circular — pointers rewired step by step.' },
  { key: 'stack',       icon: '📚', name: 'Stack',                kind: 'ds',   blurb: 'Last in, first out — push, pop, peek, plus bracket checking and infix → postfix.' },
  { key: 'queue',       icon: '🚶', name: 'Queue',                kind: 'ds',   blurb: 'First in, first out — enqueue and dequeue.' },
  { key: 'hashing',     icon: '🗂️', name: 'Hash Table',           kind: 'ds',   blurb: 'Keys, buckets and collisions.' },
  { key: 'trees',       icon: '🌳', name: 'Binary Search Tree',   kind: 'ds',   blurb: 'BST and self-balancing AVL: insert, delete, rotations and every traversal.' },
  { key: 'heap',        icon: '⛰️', name: 'Heap',                 kind: 'ds',   blurb: 'Min heap and max heap — heapify up and down, extract-min / extract-max, heap sort.' },

  { key: 'sorting',     icon: '🔀', name: 'Sorting',              kind: 'algo', blurb: 'Eight sorting algorithms, plus a live race between them.' },
  { key: 'searching',   icon: '🔍', name: 'Searching',            kind: 'algo', blurb: 'Halve the range until you find it.' },
  { key: 'graphs',      icon: '🕸️', name: 'Graphs',               kind: 'algo', blurb: 'BFS, DFS, shortest paths, and a draw-your-own-maze pathfinder.' },
  { key: 'dp',          icon: '🧩', name: 'Dynamic Programming',  kind: 'algo', blurb: 'Knapsack, LCS, coin change and edit distance — watch the table fill cell by cell.' },
  { key: 'recursion',   icon: '🔁', name: 'Recursion',            kind: 'algo', blurb: 'Call stack and recursion tree for 20 classic functions — Tower of Hanoi included.' },
  { key: 'bit',         icon: '⚡', name: 'Bit Manipulation',     kind: 'algo', blurb: 'AND, OR, XOR, NOT, shifts and bit tricks on real bits.' },

  { key: 'puzzles',     icon: '🎮', name: 'Games & Puzzles',      kind: 'play', blurb: 'Tower of Hanoi (playable) and the N-Queens backtracking solver.' },

  { key: 'tools',       icon: '🧰', name: 'Tools',                kind: 'tool', blurb: 'Big-O chart and 64 complexity practice questions.' },
];

const lab = (key: string, group: string, title: string, blurb: string, labId: string): VizPage =>
  ({ key, group, title, blurb, spec: { t: 'lab', lab: labId }, badge: 'Class Lab' });

export const PAGES: VizPage[] = [
  // ── Data structures ──
  lab('array-visualizer', 'arrays', 'Array Visualizer', 'A full dynamic-array class — insert, delete, search, regrow — executed line by line.', 'array'),
  { key: 'prefix-sum', group: 'arrays', title: 'Prefix Sum', blurb: 'Build the running totals once, then answer any range-sum in O(1).', spec: { t: 'array', mode: 'prefixsum' } },
  { key: 'two-pointer', group: 'arrays', title: 'Two Pointer', blurb: 'Two indices closing in on each other instead of a nested loop.', spec: { t: 'array', mode: 'twopointer' } },
  { key: 'sliding-window', group: 'arrays', title: 'Sliding Window', blurb: 'Slide a window across the array, adding one element and dropping one.', spec: { t: 'array', mode: 'slidingwindow' } },
  { key: 'kadane-algorithm', group: 'arrays', title: "Kadane's Algorithm", blurb: 'Maximum subarray sum in a single pass.', spec: { t: 'array', mode: 'kadane' } },

  lab('singly-ll-visualizer', 'linked-list', 'Singly LL Visualizer', 'Singly linked list class — inserts, deletes, reverse, middle and cycle detection.', 'sll'),
  lab('doubly-ll-visualizer', 'linked-list', 'Doubly LL Visualizer', 'Doubly linked list class — every node has both prev and next.', 'dll'),
  lab('circular-ll-visualizer', 'linked-list', 'Circular LL Visualizer', 'Circular linked list class — the last node points back to the first.', 'cll'),

  lab('stack-visualizer', 'stack', 'Stack Visualizer', 'Stack class — push, pop, peek and position-based operations.', 'stack'),
  { key: 'stack-playground', group: 'stack', title: 'Stack Playground', blurb: 'Push and pop values and watch the stack grow and shrink.', spec: { t: 'stackqueue', mode: 'stack' } },

  { key: 'parentheses-checker', group: 'stack', title: 'Balanced Parentheses', blurb: 'Push every opener, pop on every closer — the classic stack check.', spec: { t: 'stackapp', mode: 'parens' } },
  { key: 'infix-postfix', group: 'stack', title: 'Infix → Postfix', blurb: 'The shunting-yard algorithm: operators wait on a stack, operands go straight out.', spec: { t: 'stackapp', mode: 'infix' } },

  lab('queue-visualizer', 'queue', 'Queue Visualizer', 'Queue class — enqueue, dequeue, front and position-based operations.', 'queue'),
  { key: 'queue-playground', group: 'queue', title: 'Queue Playground', blurb: 'Enqueue and dequeue values and watch the front and back move.', spec: { t: 'stackqueue', mode: 'queue' } },

  lab('hash-visualizer', 'hashing', 'Hash Table Visualizer', 'Hash table class — hashing, buckets and collision handling.', 'hash'),
  lab('bst-visualizer', 'trees', 'BST Visualizer', 'Binary search tree class — insert, search, delete and every traversal.', 'bst'),
  lab('avl-visualizer', 'trees', 'AVL Visualizer', 'Self-balancing BST class — insert and remove with LL, RR, LR and RL rotations, balance factors on every node.', 'avl'),
  lab('heap-visualizer', 'heap', 'Min Heap Visualizer', 'Min-heap class — smallest value at the root: heapify up and down, extract-min and heap sort.', 'heap'),
  lab('max-heap-visualizer', 'heap', 'Max Heap Visualizer', 'Max-heap class — largest value at the root: heapify up and down, extract-max and heap sort.', 'maxheap'),

  // ── Algorithms ──
  { key: 'bubble-sort', group: 'sorting', title: 'Bubble Sort', blurb: 'Swap neighbours until the biggest values bubble to the end. O(n²).', spec: { t: 'sort', algo: 'bubble' } },
  { key: 'selection-sort', group: 'sorting', title: 'Selection Sort', blurb: 'Find the minimum of the rest and put it in place. O(n²).', spec: { t: 'sort', algo: 'selection' } },
  { key: 'insertion-sort', group: 'sorting', title: 'Insertion Sort', blurb: 'Grow a sorted prefix by inserting one element at a time. O(n²), fast when nearly sorted.', spec: { t: 'sort', algo: 'insertion' } },
  { key: 'shell-sort', group: 'sorting', title: 'Shell Sort', blurb: 'Insertion sort on elements far apart first, then closer — a shrinking gap. About O(n log² n).', spec: { t: 'sort', algo: 'shell' } },
  { key: 'merge-sort', group: 'sorting', title: 'Merge Sort', blurb: 'Split in halves, sort each, merge them back. O(n log n), stable.', spec: { t: 'sort', algo: 'merge' } },
  { key: 'quick-sort', group: 'sorting', title: 'Quick Sort', blurb: 'Partition around a pivot, then sort each side. O(n log n) on average.', spec: { t: 'sort', algo: 'quick' } },
  { key: 'heap-sort', group: 'sorting', title: 'Heap Sort', blurb: 'Build a max-heap, then repeatedly move the root to the end. O(n log n).', spec: { t: 'sort', algo: 'heap' } },
  { key: 'counting-sort', group: 'sorting', title: 'Counting Sort', blurb: 'Count how often each value occurs, then write them back in order — no comparisons. O(n + range).', spec: { t: 'sort', algo: 'counting' } },

  { key: 'sorting-race', group: 'sorting', title: 'Sorting Race', blurb: 'Pick 2–5 algorithms and watch them sort the same array at the same time.', spec: { t: 'race' }, badge: 'Compare' },

  { key: 'linear-search', group: 'searching', title: 'Linear Search', blurb: 'Check elements one by one. O(n), works on unsorted data.', spec: { t: 'linsearch' } },
  { key: 'binary-search', group: 'searching', title: 'Binary Search', blurb: 'Look at the middle, throw away half. O(log n) on a sorted array.', spec: { t: 'bsearch' } },

  { key: 'pathfinding', group: 'graphs', title: 'Pathfinding Grid', blurb: 'Draw walls and mud, then watch BFS, DFS, Dijkstra and A* find a route.', spec: { t: 'pathfind' }, badge: 'Interactive' },
  { key: 'bfs-dfs', group: 'graphs', title: 'BFS & DFS', blurb: 'Breadth-first and depth-first traversal of a graph.', spec: { t: 'bfsdfs' } },
  { key: 'dijkstra', group: 'graphs', title: "Dijkstra's Algorithm", blurb: 'Shortest paths from a source, with weights you can edit.', spec: { t: 'dijkstra' } },

  { key: 'knapsack', group: 'dp', title: '0/1 Knapsack', blurb: 'Take or skip each item — the table of best values by capacity.', spec: { t: 'dp', mode: 'knapsack' } },
  { key: 'lcs', group: 'dp', title: 'Longest Common Subsequence', blurb: 'Compare two strings cell by cell.', spec: { t: 'dp', mode: 'lcs' } },
  { key: 'coin-change', group: 'dp', title: 'Coin Change', blurb: 'Fewest coins for every amount up to the target.', spec: { t: 'dp', mode: 'coinchange' } },
  { key: 'edit-distance', group: 'dp', title: 'Edit Distance', blurb: 'Minimum inserts, deletes and replaces to turn one word into another.', spec: { t: 'dp', mode: 'editdistance' } },

  lab('recursion-visualizer', 'recursion', 'Recursion Visualizer', 'One class, 20 recursive functions — call stack, recursion tree and return values.', 'recursion'),

  { key: 'bit-operators', group: 'bit', title: 'Bitwise Operators', blurb: 'AND, OR, XOR and NOT on real binary digits.', spec: { t: 'bit', modes: ['and', 'or', 'xor', 'not'] } },
  { key: 'bit-tricks', group: 'bit', title: 'Shifts & Bit Tricks', blurb: 'Left and right shift, set a bit, count set bits.', spec: { t: 'bit', modes: ['lshift', 'rshift', 'setbit', 'countbits'] } },


  // ── Games & puzzles ──
  { key: 'tower-hanoi', group: 'puzzles', title: 'Tower of Hanoi', blurb: 'Play it yourself with hints and undo, or let the recursion solve it.', spec: { t: 'hanoi' }, badge: 'Game' },
  { key: 'n-queens', group: 'puzzles', title: 'N-Queens', blurb: 'Backtracking places queens one row at a time and retreats on conflict.', spec: { t: 'nqueens' } },

  // ── Tools ──
  { key: 'complexity-chart', group: 'tools', title: 'Big-O Chart', blurb: 'How common growth rates compare as n grows.', spec: { t: 'complexity' } },
  { key: 'practice-questions', group: 'tools', title: 'Practice Questions', blurb: '64 time-complexity questions — type your answer, press Check, then open the line-by-line solution.', spec: { t: 'practice' } },
];

export const PAGE_BY_KEY: Record<string, VizPage> = Object.fromEntries(PAGES.map(p => [p.key, p]));
export const GROUP_BY_KEY: Record<string, VizGroup> = Object.fromEntries(GROUPS.map(g => [g.key, g]));
export const pagesOf = (group: string): VizPage[] => PAGES.filter(p => p.group === group);

/** Where the "paste your own code" page lives (separate route, early preview). */
export const PLAYGROUND_HREF = '/CodeStructures';
