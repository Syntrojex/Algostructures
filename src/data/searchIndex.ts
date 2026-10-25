import { PAGES, GROUP_BY_KEY } from './registry';

export interface SearchItem {
  name: string;
  aliases: string[];
  parent: string;
  group: string;
  sub: string;
  icon: string;
}

// Extra words people might type for each visualizer.
const ALIASES: Record<string, string[]> = {
  'array-visualizer': ['array', 'array class', 'dynamic array', 'vector', 'size capacity', 'regrow', 'resize', 'insert', 'delete'],
  'prefix-sum': ['prefix', 'cumulative sum', 'range sum', 'running total'],
  'two-pointer': ['two pointers', 'pair sum', 'left right'],
  'sliding-window': ['window', 'max sum subarray', 'subarray of size k'],
  'kadane-algorithm': ['kadane', 'maximum subarray', 'max subarray sum'],
  'singly-ll-visualizer': ['singly linked list', 'linked list', 'sll', 'reverse linked list', 'detect cycle', 'floyd', 'middle of list'],
  'doubly-ll-visualizer': ['doubly linked list', 'dll', 'prev next'],
  'circular-ll-visualizer': ['circular linked list', 'cll'],
  'stack-visualizer': ['stack', 'stack class', 'push pop peek', 'lifo'],
  'queue-visualizer': ['queue', 'queue class', 'enqueue dequeue', 'fifo'],
  'hash-visualizer': ['hash', 'hash table', 'hash map', 'buckets', 'collision', 'chaining'],
  'bst-visualizer': ['bst', 'binary search tree', 'tree', 'inorder', 'preorder', 'postorder', 'level order', 'traversal'],
  'avl-visualizer': ['avl', 'avl tree', 'balanced tree', 'self balancing', 'rotation', 'rotations', 'left rotation', 'right rotation', 'balance factor', 'll', 'rr', 'lr', 'rl', 'tree'],
  'heap-visualizer': ['heap', 'min heap', 'priority queue', 'heapify', 'extract min'],
  'bubble-sort': ['bubble', 'sorting', 'adjacent swap'],
  'selection-sort': ['selection', 'sorting', 'find minimum'],
  'insertion-sort': ['insertion', 'sorting'],
  'merge-sort': ['merge', 'sorting', 'divide and conquer', 'stable sort'],
  'quick-sort': ['quick', 'sorting', 'pivot', 'partition'],
  'heap-sort': ['heap', 'sorting', 'max heap'],
  'binary-search': ['binary', 'search', 'sorted array', 'log n', 'mid'],
  'bfs-dfs': ['bfs', 'dfs', 'breadth first', 'depth first', 'graph', 'traversal'],
  'dijkstra': ['dijkstra', 'shortest path', 'graph', 'weighted'],
  'knapsack': ['knapsack', '0/1', 'dp', 'dynamic programming'],
  'lcs': ['lcs', 'longest common subsequence', 'dp', 'dynamic programming'],
  'coin-change': ['coin change', 'coins', 'dp', 'dynamic programming'],
  'edit-distance': ['edit distance', 'levenshtein', 'dp', 'dynamic programming'],
  'recursion-visualizer': ['recursion', 'call stack', 'recursion tree', 'factorial', 'fibonacci', 'memoization', 'base case', 'stack overflow', 'subsets', 'permutations', 'gcd', 'fast power', 'backtracking', 'tower of hanoi', 'hanoi'],
  'bit-operators': ['bit', 'bitwise', 'and', 'or', 'xor', 'not', 'binary'],
  'bit-tricks': ['bit', 'shift', 'left shift', 'right shift', 'set bit', 'count set bits', 'popcount'],
  'tower-hanoi': ['hanoi', 'game', 'play', 'puzzle', 'disks', 'recursion'],
  'sorting-race': ['race', 'compare sorting', 'sorting', 'fastest sort', 'benchmark'],
  'pathfinding': ['pathfinding', 'path finding', 'a star', 'astar', 'a*', 'maze', 'grid', 'shortest path', 'bfs', 'dfs', 'dijkstra', 'walls'],
  'parentheses-checker': ['parentheses', 'brackets', 'balanced', 'valid parentheses', 'stack'],
  'infix-postfix': ['infix', 'postfix', 'shunting yard', 'expression', 'stack', 'rpn', 'evaluate postfix'],
  'stack-playground': ['stack', 'push', 'pop', 'lifo'],
  'queue-playground': ['queue', 'enqueue', 'dequeue', 'fifo'],
  'shell-sort': ['shell', 'sorting', 'gap sequence'],
  'counting-sort': ['counting', 'sorting', 'non comparison', 'frequency'],
  'linear-search': ['linear', 'sequential search', 'search', 'unsorted'],
  'n-queens': ['n queens', 'queens', 'backtracking', 'chess', 'puzzle'],
  'complexity-chart': ['big o', 'complexity', 'o(n)', 'growth', 'chart', 'time complexity'],
  'practice-questions': ['practice', 'questions', 'time complexity', 'big o', 'quiz', 'complexity analysis', 'loops'],
};

export const SEARCH_INDEX: SearchItem[] = PAGES.map(p => ({
  name: p.title,
  aliases: ALIASES[p.key] ?? [],
  parent: GROUP_BY_KEY[p.group].name,
  group: p.group,
  sub: p.key,
  icon: GROUP_BY_KEY[p.group].icon,
}));

export function searchTopics(query: string, max = 8): SearchItem[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();

  const scored = SEARCH_INDEX.map(item => {
    let score = 0;
    const nameLower = item.name.toLowerCase();

    if (nameLower === q) score += 100;
    else if (nameLower.startsWith(q)) score += 50;
    else if (nameLower.includes(q)) score += 30;

    if (item.aliases.some(a => a === q)) score += 40;
    else if (item.aliases.some(a => a.startsWith(q))) score += 25;
    else if (item.aliases.some(a => a.includes(q))) score += 15;

    if (item.parent.toLowerCase().includes(q)) score += 5;

    return { item, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map(x => x.item);
}

export function highlightMatch(text: string, query: string): string {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (!query) return esc(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return esc(text);
  return (
    esc(text.slice(0, idx)) +
    '<span class="match">' + esc(text.slice(idx, idx + query.length)) + '</span>' +
    esc(text.slice(idx + query.length))
  );
}
