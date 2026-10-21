import { GROUPS, PAGES } from '../data/registry';

const CHANGELOG = [
  {
    version: 'v2.7',
    tag: 'Current',
    notes: [
      'Algostructures is now a visualizer-first site: the long theory pages and the sidebar are gone. Browse everything from the home grid, the ☰ Browse drawer, or the sibling tabs at the top of each page.',
      'Linked lists now draw real pointer arrows. A new node hovers above the list, its arrow grows toward the node it will point to, the head pointer moves, and only then does the node slide into the row — for singly, doubly and circular lists. BST insertion works the same way, with arrowheads on every tree edge.',
      'Singly Linked List: added “Remove the cycle” (Floyd’s algorithm, phase 2) and a guard so no operation can loop forever on a list that has a cycle. Fixed removeDuplicates corrupting the list size, and heap sort printing its output twice.',
      'New Recursion Visualizer: 20 classic recursive functions with a live call stack and recursion tree, including Tower of Hanoi solved line by line. Tower of Hanoi is also a playable game with hints, undo and auto-solve.',
      'New visualizers: Sorting Race (2–5 algorithms on the same array), Pathfinding Grid (BFS, DFS, Dijkstra, A*), Balanced Parentheses with a step-by-step log, Infix → Postfix, Shell Sort, Counting Sort and Linear Search.',
      'Custom input almost everywhere: DP tables (knapsack, LCS, coin change, edit distance), your own graph edges for BFS/DFS, your own array for Binary Search and the Sorting Race, and your own n in the Big-O chart.',
      'Stack and Queue playgrounds now require a value, explain underflow and overflow clearly, and no longer push random numbers by themselves. Class Lab inputs refuse empty or non-numeric values with a clear message.',
      'Fixed DFS (it did not follow true depth-first order), Two Pointer on unsorted input, and a Binary Search animation that could overlap itself.',
      'Readability: brighter secondary text and larger labels across every visualizer, and a much more visible status line under each animation.',
      'Performance: each visualizer and each Class Lab is its own on-demand chunk (first load went from about 650 KB to about 200 KB), and the background animation calms down while a visualizer is open.',
      'Removed: bookmarks, the Documentation page and the Standard Library reference.',
    ],
  },
  {
    version: 'v2.0.3',
    tag: 'Legacy',
    notes: [
      'Removed the older quick-interactive visualizer from every topic that now has a full Class Lab, so each topic shows one clear visual instead of two competing ones — the Stack and Queue visualizers were brought back afterward since they were still genuinely useful there, sitting above their Class Labs exactly as before.',
      'Cleaned up now-unused visualizer components and dead code left behind by the Class Lab rollout.',
    ],
  },
  {
    version: 'v2.0.2',
    tag: 'Legacy',
    notes: [
      'Every data structure\'s Class Lab now ships a complete standard operation set — insert/remove/update at start, end and a given position, display, traverse, search, sort ascending, sort descending, reverse by k, rotate left, rotate right, remove duplicates, and frequency count — implemented with real, runnable C++ and the same line-by-line animation as before.',
      'Class Lab layout flipped: the C++ source now sits on the left and the animated diagram on the right, so the line that just ran and the effect it had read left-to-right.',
      'Fixed a critical bug where opening certain topics could blank the entire app (sidebar included) due to a component mount-order issue; added an error boundary around every visualizer so a single broken panel can never take the rest of the page down with it.',
    ],
  },
  {
    version: 'v2.0.1',
    tag: 'Legacy',
    notes: [
      'Full mobile responsiveness pass — sidebar, header, bookmarks, topic pages, comparison tables, and every visualizer now adapt properly down to small phone widths.',
      'Footer now only shows the full link/social layout on the home page; every topic and info page shows a compact "Built by Muhammad Mustafa" credit line instead.',
      'Every C++ code example and practice problem now uses only <code>&lt;iostream&gt;</code> with plain, manually-managed arrays — no <code>std::vector</code> or other STL containers in runnable code.',
      'Documentation page expanded with more detail and larger, more readable type.',
      'Header C++ badge, home page background particles, and the scanning code-term glow were all restyled to be more vivid and more clearly "in theme".',
      'Usage Terms rewritten to be clearer and more complete; Feedback and footer GitHub links now point at the Algostructures repository and its issue tracker.',
    ],
  },
  {
    version: 'v2.0.0',
    tag: 'Legacy',
    notes: [
      'Full site rewritten to a single-language (C++) content standard — every topic follows the same 9-section structure: Introduction, Why We Need It, Theory, Diagram, Dry Run, Algorithm, Complexity, Advantages, Applications.',
      'Every topic ships with exactly 5 full, compilable practice problems (not snippets) alongside the main example.',
      'Complete DSA coverage: Introduction, Built-in Libraries, Bit Manipulation, Recursion, Arrays, Strings, Linked Lists, Stacks, Queues, Hashing, Trees, Heap, Searching, Sorting, Graphs, Greedy Algorithms, Divide & Conquer, and Dynamic Programming.',
      'Interactive visualizers added across Sorting, Arrays, Bit Manipulation, Trees/BST, Dijkstra, and Tower of Hanoi.',
    ],
  },
  {
    version: 'v1.x',
    tag: 'Legacy',
    notes: [
      'Java and Python language tabs removed in favor of a single, deeply-maintained C++ track.',
      'Bookmarks, in-app search, and a collapsible sidebar navigation were introduced.',
    ],
  },
];

export default function VersionInfoPage() {
  return (
    <div className="topic-page show">
      <div className="topic-header-section">
        <div className="topic-title">🏷️ Version Info</div>
        <div className="topic-desc">
          What's currently shipped on Algostructures, what changed recently, and what the site is
          built with.
        </div>
      </div>

      <div className="page-section">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          {[
            ['Current Version', 'v2.7'],
            ['Language', 'C++'],
            ['Visualizers', String(PAGES.length)],
            ['Categories', String(GROUPS.length)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                flex: '1 1 140px',
                background: 'rgba(0,245,255,0.04)',
                border: '1px solid var(--br)',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'var(--tm)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ac)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', color: 'var(--tp)', marginBottom: '16px' }}>
          Changelog
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {CHANGELOG.map((entry) => (
            <div
              key={entry.version}
              style={{
                border: '1px solid var(--br)',
                borderRadius: '12px',
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.015)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, color: 'var(--ac)' }}>{entry.version}</span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: entry.tag === 'Current' ? 'rgba(0,255,136,0.1)' : 'rgba(122,156,192,0.1)',
                    color: entry.tag === 'Current' ? 'var(--ag)' : 'var(--ts)',
                    border: `1px solid ${entry.tag === 'Current' ? 'rgba(0,255,136,0.3)' : 'var(--br)'}`,
                  }}
                >
                  {entry.tag}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entry.notes.map((note, i) => (
                  <li key={i} style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.86rem', color: 'var(--ts)', lineHeight: 1.5 }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', color: 'var(--tp)', margin: '28px 0 14px' }}>
          Built With
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['React 18', 'TypeScript', 'Vite', 'Custom CSS'].map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '0.68rem',
                color: 'var(--tm)',
                background: 'rgba(0,245,255,0.06)',
                border: '1px solid rgba(0,245,255,0.12)',
                padding: '4px 10px',
                borderRadius: '10px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
