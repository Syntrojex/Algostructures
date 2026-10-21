import InfoPageLayout from '../components/InfoPageLayout';

export default function AboutPage() {
  return (
    <InfoPageLayout
      icon="👤"
      title="About Algostructures"
      intro="Why this site exists, and what it does differently from a DSA tutorial."
    >
      <h2>The Idea</h2>
      <p>
        Algostructures is a collection of interactive visualizers for data structures and
        algorithms. There are no long articles here — explanations are everywhere already.
        What is hard to find is a good place to <em>watch the code run</em>, so that is all this
        site does: pick a structure or algorithm, give it your own input, and step forward and
        back through exactly what happens.
      </p>

      <h2>Class Labs — Run the Code, Line by Line</h2>
      <p>
        Every core data structure — Array, Singly/Doubly/Circular Linked List, Stack, Queue,
        Binary Search Tree, Heap and Hash Table — has a Class Lab: real, runnable C++ that
        highlights line by line as it executes, so you can watch <code>temp</code> walk down a
        list or a value bubble up a heap. Pick an operation from the dropdown — insert, delete,
        update, search, sort, rotate and more — and step through what the code does to the
        structure in memory. The Recursion Visualizer does the same for 20 recursive functions,
        showing the call stack and the recursion tree as they grow and unwind.
      </p>

      <h2>Algorithms, Games and Tools</h2>
      <p>
        Sorting (with a live race between algorithms), binary search, BFS/DFS, Dijkstra, a
        draw-your-own-maze pathfinder, dynamic programming tables, bit manipulation and
        N-Queens each have their own visualizer. Tower of Hanoi is a game you can play — with
        hints, undo and auto-solve — and the Recursion Visualizer solves it line by line. The
        Tools section has a Big-O chart and 64 time-complexity practice questions with a Check
        button and a line-by-line solution.
      </p>

      <h2>Playground</h2>
      <p>
        The next step is pointing the same line-by-line engine at <strong>your own C++ code</strong>.
        An early-preview page already accepts pasted code; running and visualizing it is still
        under development.
      </p>

      <h2>Why C++ Only</h2>
      <p>
        C++ forces explicit memory and complexity thinking, which is what DSA is really about,
        and keeping a single language means every visualizer gets the full attention of one
        implementation instead of three shallow ones.
      </p>

      <h2>Who Built This</h2>
      <p>
        Algostructures is made by <strong>Syntrojex (Muhammad Mustafa Amir)</strong>
        (<a href="https://github.com/Syntrojex" target="_blank" rel="noopener noreferrer">GitHub</a>),
        a BS Software Engineering student who built the site he wished existed while learning DSA.
        It's a solo, ongoing project — changes are tracked on the <strong>Version Info</strong>
        page in the footer.
      </p>

      <h2>What's Next</h2>
      <p>
        More algorithm visualizers in the line-by-line Class Lab style, and the Playground for
        your own code.
      </p>
    </InfoPageLayout>
  );
}
