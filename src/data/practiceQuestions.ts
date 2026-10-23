// ══════════════════════════════════════════════════════════════════════════
// PRACTICE QUESTIONS — Time Complexity
// ──────────────────────────────────────────────────────────────────────────
// Sourced primarily from the course material provided (a PDF of loop-pattern
// derivations credited to Usama Hassan Alvi / Sarfraz Raza, and two DOCX
// files of formal Big-O proofs and best/worst-case analysis problems), with
// a smaller number of original questions added to round out categories the
// source material didn't cover well (Recursion especially — the source
// material's "f1..f6" functions are nested loops wrapped in function calls,
// not true recursion, so genuine recursive examples were added separately).
// Every question's answer and step reasoning was independently re-derived
// and checked against the source's own worked solution where one was given,
// rather than copied — a few of the source's own scratch derivations
// (e.g. "n^k+a" constant-of-proof lines) contained arithmetic slips that a
// straight copy would have reproduced.
// ══════════════════════════════════════════════════════════════════════════

export interface PracticeQuestion {
  id: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  code?: string;
  steps: string[];
  answer: string;
  note?: string;
  source: 'docx' | 'pdf' | 'original';
}

export const CATEGORIES = [
  'Basic Loops',
  'Logarithmic Patterns',
  'Nested Loops',
  'Sequential Operations',
  'Geometric Series',
  'Conditionals & Best/Worst Case',
  'Function Calls & Composition',
  'Recursion',
  'Formal Big-O Proofs',
] as const;

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [

  // ── BASIC LOOPS ──────────────────────────────────────────────────────────
  {
    id: 1, category: 'Basic Loops', difficulty: 'Easy', source: 'pdf',
    prompt: 'What is the time complexity of this loop?',
    code: `for (int i = 1; i <= N; i++) {\n    // O(1) work\n}`,
    steps: [
      'The loop starts at i = 1 and increases by exactly 1 each time, stopping once i > N.',
      'It visits every value in {1, 2, 3, ..., N} — that is exactly N iterations, no more, no fewer.',
      'Each iteration does O(1) work, so total work = N × O(1).',
    ],
    answer: 'Θ(N)',
  },
  {
    id: 2, category: 'Basic Loops', difficulty: 'Easy', source: 'pdf',
    prompt: 'How many times does this loop run, and what is its complexity?',
    code: `for (int i = 0; i <= N; i += 2) {\n    // O(1) work\n}`,
    steps: [
      'i takes the values 0, 2, 4, 6, ..., up to N — every other integer.',
      'That is roughly N/2 values, since the step size is 2 instead of 1.',
      'Dropping the constant factor of 1/2 (it does not change the growth rate), this is still linear in N.',
    ],
    answer: 'Θ(N)',
    note: 'A constant step size (2, 3, 10 — anything fixed) only ever changes the constant factor, never the growth class.',
  },
  {
    id: 3, category: 'Basic Loops', difficulty: 'Easy', source: 'pdf',
    prompt: 'What is the complexity of this loop, where k is a fixed constant?',
    code: `for (int i = 1; i <= N; i += k) {\n    // O(1) work\n}`,
    steps: [
      'i visits 1, 1+k, 1+2k, 1+3k, ..., up to N.',
      'The number of terms in that sequence is about N/k.',
      'Since k is a constant (does not grow with N), N/k is just N scaled by a constant factor.',
    ],
    answer: 'O(N)',
  },
  {
    id: 4, category: 'Basic Loops', difficulty: 'Medium', source: 'original',
    prompt: 'What is the complexity of this loop, where the step itself depends on N?',
    code: `for (int i = 1; i <= N; i += N/4) {\n    // O(1) work\n}`,
    steps: [
      'Unlike a fixed step size, the step here is N/4 — it grows as N grows, not a constant.',
      'i visits roughly 1, 1+N/4, 1+N/2, 1+3N/4, N — about 4 values, regardless of how large N is.',
      'A step size that is a fixed fraction of N always produces a fixed, N-independent number of iterations.',
    ],
    answer: 'Θ(1)',
    note: 'This is the flip side of Question 3: when the step size scales WITH the input instead of staying constant, the iteration count stops growing entirely.',
  },
  {
    id: 5, category: 'Basic Loops', difficulty: 'Easy', source: 'pdf',
    prompt: 'What is the complexity of this loop counting down?',
    code: `for (int i = N; i > 0; i--) {\n    // O(1) work\n}`,
    steps: [
      'i starts at N and decreases by 1 each time until it reaches 0.',
      'This visits N, N-1, N-2, ..., 1 — exactly N values, the same count as counting up.',
      'Direction (counting up vs. down) never affects the growth rate, only which end you start from.',
    ],
    answer: 'Θ(N)',
  },
  {
    id: 6, category: 'Basic Loops', difficulty: 'Medium', source: 'original',
    prompt: 'What is the complexity of this loop, where the array has N elements?',
    code: `for (int i = 0; i < arr.size(); i++) {\n    if (arr[i] == target) {\n        found = true;\n    }\n}`,
    steps: [
      'The loop condition depends on arr.size(), which is N — the loop is bounded exactly like a standard for-loop from 0 to N-1.',
      'Even though there is an if-check inside, that check is O(1) and does not change how many times the loop runs — it always runs N times regardless of whether a match is found early (this version never breaks out).',
      'So every one of the N iterations does a constant amount of work.',
    ],
    answer: 'Θ(N)',
    note: 'If this loop had a `break;` after `found = true;`, it would still be O(N) worst case (target absent, or at the last index) but O(1) best case (target at index 0) — see the Conditionals category for exactly that variant.',
  },
  {
    id: 7, category: 'Basic Loops', difficulty: 'Medium', source: 'original',
    prompt: 'What is the complexity of this loop that touches every element of a 2D array laid out as a single pass?',
    code: `int total = 0;\nfor (int i = 0; i < rows * cols; i++) {\n    total += flatArray[i];\n}`,
    steps: [
      'The loop bound is rows * cols — the TOTAL number of elements in the 2D array, not either dimension alone.',
      'If we call the total element count N = rows × cols, this is a single loop running N times.',
      'This is worth noticing: it LOOKS like it might be related to two dimensions, but because it is a single flat loop over all N elements (not two nested loops each of size rows and cols), it is linear in the total element count, not quadratic.',
    ],
    answer: 'Θ(rows × cols) = Θ(N)',
    note: 'Compare this with a genuinely nested loop over a 2D array (one loop over rows, one over cols) — same total work, same answer, but a very different-looking piece of code. Both are Θ(rows × cols).',
  },

  // ── LOGARITHMIC PATTERNS ─────────────────────────────────────────────────
  {
    id: 8, category: 'Logarithmic Patterns', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity of this loop where i doubles each time?',
    code: `for (int i = 1; i <= N; i *= 2) {\n    // O(1) work\n}`,
    steps: [
      'i takes the values 1, 2, 4, 8, 16, ..., doubling each iteration, until it exceeds N.',
      'This is the set {N, N/2, N/4, ...} read backwards — the number of times you can double 1 before passing N.',
      'That count is exactly log₂N: solving 2^k = N for k gives k = log₂N.',
    ],
    answer: 'Θ(log N)',
  },
  {
    id: 9, category: 'Logarithmic Patterns', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity of this loop where i triples each time?',
    code: `for (int i = 1; i <= N; i *= 3) {\n    // O(1) work\n}`,
    steps: [
      'i takes the values 1, 3, 9, 27, ..., tripling each time, until it exceeds N.',
      'The number of iterations is the number of times you can multiply by 3 before exceeding N — that is log₃N.',
      'The BASE of the logarithm changed (base 3 instead of base 2), but log₃N and log₂N differ only by a constant factor (log₃N = log₂N / log₂3), so the growth class is the same.',
    ],
    answer: 'Θ(log N)',
    note: 'This is why Big-O notation never bothers writing the base of a logarithm — every base differs from every other only by a constant multiplier.',
  },
  {
    id: 10, category: 'Logarithmic Patterns', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity of this loop that halves i each time?',
    code: `for (int i = N; i >= 1; i /= 2) {\n    // O(1) work\n}`,
    steps: [
      'i starts at N and is repeatedly divided by 2, so it visits N, N/2, N/4, N/8, ..., 1.',
      'This is the same set of values as the doubling loop, just visited in reverse order.',
      'The number of times you can halve N before reaching 1 is log₂N.',
    ],
    answer: 'Θ(log N)',
  },
  {
    id: 11, category: 'Logarithmic Patterns', difficulty: 'Hard', source: 'docx',
    prompt: 'This function keeps dividing n by 3 until it is no longer divisible by 3. What are the best-case and worst-case running times?',
    code: `int Func(int n) {\n    int i = 0;\n    while (n % 3 == 0) {\n        n = n / 3;\n        i++;\n    }\n    return i;\n}`,
    steps: [
      'The algorithm counts how many times n can be divided by 3 evenly — i.e., the exponent of 3 in the prime factorization of n.',
      'Best case: n is not divisible by 3 at all (e.g. n = 7). The while condition fails immediately, so the loop body never runs.',
      'Worst case: n is a pure power of 3 (e.g. n = 3^k). The loop then runs once for every factor of 3 that can be divided out.',
      'If n = 3^k, the loop runs exactly k times, and k = log₃n — so the worst case scales with the logarithm of n, base 3.',
    ],
    answer: 'Best: Θ(1)  ·  Worst: Θ(log₃n)',
    note: 'This is a genuinely different kind of "logarithmic" loop from Questions 8–10: here the loop count depends on the INPUT VALUE\'s structure (how many times it factors by 3), not on a fixed doubling/halving step applied to a loop counter — which is exactly why best and worst case differ so sharply.',
  },
  {
    id: 12, category: 'Logarithmic Patterns', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity of this loop, where k is a fixed constant greater than 1?',
    code: `for (int i = 1; i <= N; i *= k) {\n    // O(1) work\n}`,
    steps: [
      'i visits 1, k, k², k³, ..., up to N — the powers of k.',
      'The number of powers of k needed to reach N is log_k(N).',
      'Since k is a fixed constant, this is Θ(log N) regardless of what k specifically is — 2, 3, 10, or any other constant greater than 1.',
    ],
    answer: 'Θ(log N)',
  },
  {
    id: 13, category: 'Logarithmic Patterns', difficulty: 'Hard', source: 'pdf',
    prompt: 'Two nested loops both use multiplicative steps. What is the total complexity?',
    code: `for (int i = 1; i <= N; i *= 2) {\n    for (int j = 1; j <= i; j *= 2) {\n        // O(1) work\n    }\n}`,
    steps: [
      'The outer loop runs log₂N times (i doubles from 1 to N).',
      'For a FIXED value of i, the inner loop also doubles from 1 up to i, so it runs log₂i times — not i times, because j *= 2, not j++.',
      'Summing log₂i over the log₂N values that i takes (1, 2, 4, ..., N): the values of log₂i themselves form the sequence 0, 1, 2, ..., log₂N.',
      'Summing 0 + 1 + 2 + ... + log₂N is an arithmetic series, which totals Θ((log N)²).',
    ],
    answer: 'Θ((log N)²)',
    note: 'The inner loop\'s multiplier (j *= 2, not j++) is the detail that makes this (log N)² rather than N log N — always check whether an inner loop increments or multiplies before assuming it runs "i times".',
  },
  {
    id: 14, category: 'Logarithmic Patterns', difficulty: 'Hard', source: 'pdf',
    prompt: 'What is the complexity of this loop, where i shrinks by a factor of 4 each time but the inner loop steps by a fixed amount over the full range N?',
    code: `for (int i = N; i > 1; i /= 4) {\n    cout << i;\n    for (int j = 0; j < N; j += 2) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop runs log₄N times (i is divided by 4 each time until it drops below 2).',
      'The inner loop does NOT depend on i at all — it always runs from 0 to N in steps of 2, which is N/2 iterations every single time.',
      'So the total work is: (number of outer iterations) × (work per outer iteration) = log₄N × N/2.',
      'Dropping the constant factor of 1/2 and the logarithm\'s base (base 4 vs base 2 only differs by a constant), this is N log N.',
    ],
    answer: 'Θ(N log N)',
    note: 'The key thing to notice: the inner loop\'s bound is N (a constant with respect to the outer loop\'s variable i), not i itself — that is what turns this into N log N instead of the (log N)² pattern from Question 13.',
  },

  // ── NESTED LOOPS ─────────────────────────────────────────────────────────
  {
    id: 15, category: 'Nested Loops', difficulty: 'Easy', source: 'pdf',
    prompt: 'What is the complexity of these two independent nested loops?',
    code: `for (int i = 1; i <= N; i++) {\n    for (int j = 1; j <= N; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop runs N times.',
      'For EVERY single one of those N outer iterations, the inner loop independently runs a full N times (it does not depend on i at all).',
      'Total iterations of the inner statement = N × N.',
    ],
    answer: 'Θ(N²)',
  },
  {
    id: 16, category: 'Nested Loops', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity of this triangular nested loop, where the inner bound depends on the outer variable?',
    code: `for (int i = 1; i <= N; i++) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop runs N times, with i taking values 1, 2, 3, ..., N.',
      'This time the inner loop\'s bound is i, not N — when i=1 the inner loop runs once, when i=2 it runs twice, and so on up to i=N running N times.',
      'Total iterations = 1 + 2 + 3 + ... + N, the classic arithmetic series, which sums to N(N+1)/2.',
      'Dropping the constant factor and lower-order term, N(N+1)/2 is Θ(N²).',
    ],
    answer: 'Θ(N²)',
    note: 'This "triangular" pattern (inner bound = outer variable) always reduces to an arithmetic series summing to Θ(N²) — recognize the shape and you don\'t need to redo the sum every time.',
  },
  {
    id: 17, category: 'Nested Loops', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity here, where the outer loop only visits odd numbers?',
    code: `for (int i = 1; i <= N; i += 2) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop visits only 1, 3, 5, 7, ..., N — about N/2 values instead of N.',
      'For each odd i, the inner loop still runs i times (triangular pattern again).',
      'Total = 1 + 3 + 5 + 7 + ... + N — the sum of the first N/2 odd numbers, which is a known identity equal to (N/2)².',
      '(N/2)² = N²/4, and dropping the constant factor of 1/4 leaves N².',
    ],
    answer: 'O(N²)',
  },
  {
    id: 18, category: 'Nested Loops', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity when the inner loop bound is the SQUARE of the outer variable?',
    code: `for (int i = 1; i <= N; i++) {\n    for (int j = 1; j <= i * i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop runs N times, with i = 1, 2, 3, ..., N.',
      'For each i, the inner loop runs i² times, not i times — the bound is i squared.',
      'Total = 1² + 2² + 3² + ... + N², the sum of squares, which has the closed form N(N+1)(2N+1)/6.',
      'That closed form expands to a leading term of (1/3)N³, so dropping the constant factor gives N³.',
    ],
    answer: 'Θ(N³)',
  },
  {
    id: 19, category: 'Nested Loops', difficulty: 'Hard', source: 'pdf',
    prompt: 'Three levels of nesting, where each inner bound depends on the loop outside it. What is the total complexity?',
    code: `for (int i = 1; i < N; i++) {\n    for (int j = 1; j < i * i; j++) {\n        for (int k = 0; k < N; k++) {\n            sum++;\n        }\n    }\n}`,
    steps: [
      'The innermost loop always runs N times, regardless of i or j — it is independent of both.',
      'The middle loop runs roughly i² times for each value of i (bound is i*i).',
      'Combining the middle and inner loops for a fixed i: i² iterations of the middle loop, each running the inner loop N times, gives i² × N work for that one value of i.',
      'Summing over all i from 1 to N: N × (1² + 2² + ... + N²) = N × Θ(N³) [the sum-of-squares result from Question 18].',
      'N × N³ = N⁴.',
    ],
    answer: 'Θ(N⁴)',
    note: 'Three nested loops does NOT automatically mean N³ — it depends entirely on what each loop\'s bound actually is. Here the middle loop already contributes an N² factor by itself, before the innermost loop\'s N is even multiplied in.',
  },
  {
    id: 20, category: 'Nested Loops', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity when the inner bound is the CUBE of the outer variable?',
    code: `for (int i = 1; i <= N; i++) {\n    for (int j = 1; j <= i * i * i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop runs N times.',
      'For each i, the inner loop runs i³ times.',
      'Total = 1³ + 2³ + 3³ + ... + N³, the sum of cubes, whose closed form is [N(N+1)/2]², with leading term (1/4)N⁴.',
      'Dropping the constant factor gives N⁴.',
    ],
    answer: 'Θ(N⁴)',
  },
  {
    id: 21, category: 'Nested Loops', difficulty: 'Hard', source: 'docx',
    prompt: 'This algorithm finds the length of the longest run of strictly increasing elements in an array of size n. What are its best-case and worst-case complexities?',
    code: `int len = 1;\nfor (int i = 0; i < n - 1; i++) {\n    int i1 = i, i2 = i;\n    for (int j = i; j < n - 1 && a[j] < a[j + 1]; j++, i2++);\n    if (len < i2 - i1 + 1) {\n        len = i2 - i1 + 1;\n    }\n}`,
    steps: [
      'The outer loop always runs n-1 times, regardless of the array\'s contents.',
      'The inner loop\'s iteration count depends on the data: it keeps extending forward as long as a[j] < a[j+1] holds — as soon as it hits a non-increasing pair, it stops.',
      'Best case: the array is entirely non-increasing (every a[j] ≥ a[j+1]). The inner loop condition fails immediately every time, so it contributes only O(1) per outer iteration.',
      'Worst case: the array is entirely increasing (a[0] < a[1] < ... < a[n-1]). Then for i=0 the inner loop scans almost the whole rest of the array (n-1 steps), for i=1 it scans n-2 steps, and so on.',
      'That worst-case total is (n-1) + (n-2) + ... + 1 + 0 — an arithmetic series, Θ(n²).',
    ],
    answer: 'Best: Θ(n)  ·  Worst: Θ(n²)',
  },
  {
    id: 22, category: 'Nested Loops', difficulty: 'Hard', source: 'docx',
    prompt: 'This algorithm computes the maximum subarray sum by checking every possible subarray. What is its complexity?',
    code: `int Mystery(int a[], int asize) {\n    int mSum = 0;\n    for (int i = 0; i < asize; ++i) {\n        int thisSum = 0;\n        for (int j = i; j < asize; ++j) {\n            thisSum += a[j];\n            if (thisSum > mSum) {\n                mSum = thisSum;\n            }\n        }\n    }\n    return mSum;\n}`,
    steps: [
      'The outer loop runs from i = 0 to asize-1 — asize iterations.',
      'For each i, the inner loop runs from j = i to asize-1 — that is (asize - i) iterations, another triangular pattern.',
      'Total = asize + (asize-1) + (asize-2) + ... + 1, an arithmetic series summing to Θ(asize²).',
      'The if-check inside does not change this — it is O(1) and runs the same number of times as the rest of the inner loop body.',
      'Since this pattern is identical in every case (it does not depend on the array\'s actual values, only its size), best case and worst case are the same here.',
    ],
    answer: 'Θ(asize²) — best case and worst case are equal',
    note: 'This is the brute-force "maximum subarray sum" algorithm — the same problem Kadane\'s Algorithm solves in Θ(n) with a single pass, which is why Kadane\'s is such a well-known improvement.',
  },
  {
    id: 23, category: 'Nested Loops', difficulty: 'Medium', source: 'original',
    prompt: 'What is the complexity of this loop counting all pairs (i, j) where i ≠ j?',
    code: `for (int i = 0; i < N; i++) {\n    for (int j = 0; j < N; j++) {\n        if (i != j) {\n            pairs++;\n        }\n    }\n}`,
    steps: [
      'Both loops run the full N times regardless of the condition inside — the if-check does not skip any iterations, it just decides whether to increment pairs.',
      'So this executes the loop BODY N × N times no matter what, exactly like two plain independent nested loops.',
      'The if-check itself is O(1) work per iteration, so it does not change the total.',
    ],
    answer: 'Θ(N²)',
    note: 'A conditional INSIDE a loop body only changes the complexity if it can cause the loop to skip iterations or exit early (like a `break` or `continue` that depends on the data) — a plain `if` that just decides what to count still costs O(1) either way.',
  },

  // ── SEQUENTIAL OPERATIONS ────────────────────────────────────────────────
  {
    id: 24, category: 'Sequential Operations', difficulty: 'Easy', source: 'pdf',
    prompt: 'Two independent, back-to-back loops. What is the total complexity?',
    code: `int Sum = 0;\nfor (int i = 0; i < N; i++) {\n    Sum++;\n}\nfor (int j = 0; j < N; j++) {\n    Sum++;\n}`,
    steps: [
      'The first loop is not nested inside the second — they run one after the other, sequentially.',
      'The first loop costs Θ(N). The second loop, run afterward, also costs Θ(N).',
      'For sequential (non-nested) blocks, you ADD their costs rather than multiply: Θ(N) + Θ(N) = Θ(2N).',
      'The constant factor of 2 is dropped in Big-O, leaving Θ(N).',
    ],
    answer: 'Θ(N)',
    note: 'This is the single most common mix-up between nested and sequential loops: nested loops MULTIPLY their costs (giving N²), sequential loops ADD them (staying at N).',
  },
  {
    id: 25, category: 'Sequential Operations', difficulty: 'Easy', source: 'pdf',
    prompt: 'Six independent, back-to-back loops, each running N times. What is the total complexity?',
    code: `for (int i = 0; i < N; i++) Sum++;\nfor (int j = 0; j < N; j++) Sum++;\nfor (int k = 0; k < N; k++) Sum++;\nfor (int m = 0; m < N; m++) Sum++;\nfor (int n = 0; n < N; n++) Sum++;\nfor (int p = 0; p < N; p++) Sum++;`,
    steps: [
      'None of these six loops are nested inside each other — they are six separate sequential blocks.',
      'Each one individually costs Θ(N).',
      'Adding all six: Θ(N) + Θ(N) + Θ(N) + Θ(N) + Θ(N) + Θ(N) = Θ(6N).',
      'The constant factor of 6 is dropped, leaving Θ(N) — the SAME complexity class as a single loop.',
    ],
    answer: 'Θ(N)',
    note: 'No matter how many separate O(N) loops you chain sequentially — 2, 6, or 100 — as long as the COUNT of loops is a fixed constant (not growing with N), the total stays Θ(N).',
  },
  {
    id: 26, category: 'Sequential Operations', difficulty: 'Medium', source: 'pdf',
    prompt: 'One nested pair of loops (Θ(N²)) followed sequentially by another nested pair (also Θ(N²)). What is the total complexity?',
    code: `for (int i = 0; i < N; i++)\n    for (int j = 0; j < N; j++)\n        Sum++;\n\nfor (int i = 0; i < N; i++)\n    for (int j = 0; j < N; j++)\n        Sum++;`,
    steps: [
      'The first nested block costs Θ(N²), following the standard two-independent-loops pattern.',
      'The second nested block, run afterward (not nested inside the first), also costs Θ(N²).',
      'These two blocks are sequential with respect to EACH OTHER (even though each one internally has nesting), so their costs add: Θ(N²) + Θ(N²) = Θ(2N²).',
      'Dropping the constant factor of 2 leaves Θ(N²).',
    ],
    answer: 'Θ(N²)',
  },
  {
    id: 27, category: 'Sequential Operations', difficulty: 'Medium', source: 'original',
    prompt: 'A loop of complexity O(N log N), followed sequentially by a nested pair of loops of complexity O(N²). What is the overall complexity?',
    code: `// Block 1: O(N log N)\nfor (int i = 1; i <= N; i++) {\n    for (int j = 1; j <= N; j *= 2) {\n        work++;\n    }\n}\n\n// Block 2: O(N^2)\nfor (int i = 0; i < N; i++) {\n    for (int j = 0; j < N; j++) {\n        work++;\n    }\n}`,
    steps: [
      'Block 1: the outer loop runs N times, and for each one the inner loop runs log N times (doubling j) — total Θ(N log N).',
      'Block 2: two independent nested loops, both running N times — total Θ(N²).',
      'The two blocks run one after another (sequential, not nested in each other), so their costs add: Θ(N log N) + Θ(N²).',
      'When adding two different growth rates, only the DOMINANT (fastest-growing) term survives in Big-O — and N² grows faster than N log N for large N.',
    ],
    answer: 'Θ(N²)',
    note: 'This is "Rule 5 — Dominant Term" from the Time Complexity page, applied to two sequential blocks with genuinely different growth rates rather than the same one.',
  },
  {
    id: 28, category: 'Sequential Operations', difficulty: 'Medium', source: 'pdf',
    prompt: 'A single loop of size N*N, followed sequentially by another single loop, also of size N*N but with a multiplicative step. What is the total complexity?',
    code: `for (int i = 1; i <= N * N; i += 2) {\n    sum++;\n}\nfor (int j = 1; j < N * N; j *= 2) {\n    sum++;\n}`,
    steps: [
      'The first loop\'s bound is N*N (call it M = N²), stepping by 2 each time — this runs about M/2 times, which is Θ(N²).',
      'The second loop\'s bound is also M = N², but it steps MULTIPLICATIVELY (j *= 2) — that runs about log₂M times, which is log₂(N²) = 2 log₂N = Θ(log N).',
      'These two loops are sequential, so their costs add: Θ(N²) + Θ(log N).',
      'N² completely dominates log N for large N, so the smaller term is dropped.',
    ],
    answer: 'Θ(N²)',
    note: 'Watch the step operator carefully: `i += 2` on a bound of N² gives Θ(N²), while `j *= 2` on that SAME bound of N² gives only Θ(log N) — a huge difference hiding in one character.',
  },

  // ── GEOMETRIC SERIES ─────────────────────────────────────────────────────
  {
    id: 29, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'The outer loop doubles, and the inner loop runs a number of times equal to the CURRENT value of i. What is the total complexity?',
    code: `for (int i = 1; i <= N; i *= 2) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop visits i = 1, 2, 4, 8, ..., up to N — that is log₂N values total.',
      'For EACH of those values, the inner loop runs a plain incrementing count from 1 to i — that is i iterations (not log i, because this inner loop uses j++, not j *= 2).',
      'Total = 1 + 2 + 4 + 8 + ... + N — a geometric series with ratio 2.',
      'A geometric series with a growth ratio greater than 1 is dominated entirely by its LARGEST term — the sum 1+2+4+...+N is always less than 2N (it equals 2N - 1 exactly).',
      'So the total is Θ(N), even though there are only log N terms being summed.',
    ],
    answer: 'Θ(N)',
    note: 'This is the classic "geometric series trap": it is tempting to guess N log N (log N outer iterations × up to N work each), but because the inner work SHRINKS geometrically for smaller i, the sum collapses to just the largest term.',
  },
  {
    id: 30, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'Same shape as before, but the outer loop triples instead of doubling. What is the total complexity?',
    code: `for (int i = 1; i <= N; i *= 3) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop visits i = 1, 3, 9, 27, ..., up to N — log₃N values.',
      'The inner loop runs i times for each (a plain j++ loop).',
      'Total = 1 + 3 + 9 + 27 + ... + N — a geometric series with ratio 3.',
      'Any geometric series with ratio greater than 1 sums to a constant multiple of its largest term — here, less than (3/2)N.',
    ],
    answer: 'Θ(N)',
  },
  {
    id: 31, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'The outer bound is N², and the outer loop triples. The inner loop runs the current value of i times. What is the total complexity?',
    code: `for (int i = 1; i <= N * N; i *= 3) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop\'s bound is now N² (not N), and it triples each time, visiting log₃(N²) values.',
      'For each i, the inner loop runs i times.',
      'Total = 1 + 3 + 9 + ... + N² — a geometric series whose largest term is N².',
      'By the same "bounded by the largest term" rule, this sums to Θ(N²), not Θ(N² log N).',
    ],
    answer: 'Θ(N²)',
    note: 'The only thing that changed from Question 30 is the outer BOUND (N² instead of N) — the geometric-series behavior is identical, it just tops out at a bigger number.',
  },
  {
    id: 32, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'What is the complexity of this geometric series bounded by N³, with ratio 5?',
    code: `for (int i = 1; i <= N * N * N; i *= 5) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer bound is N³, and i quintuples each iteration.',
      'The inner loop runs i times for each value of i.',
      'Total = 1 + 5 + 25 + 125 + ... + N³ — geometric with ratio 5, largest term N³.',
      'A geometric series with ratio 5 sums to strictly less than (5/4)×(largest term) = (5/4)N³ — still Θ(N³).',
    ],
    answer: 'Θ(N³)',
  },
  {
    id: 33, category: 'Geometric Series', difficulty: 'Medium', source: 'pdf',
    prompt: 'What is the complexity of this geometric series bounded by √N?',
    code: `for (int i = 1; i <= sqrt(N); i *= 2) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer bound is √N this time — a smaller quantity than N itself.',
      'i doubles each time, and the inner loop runs i times for each value.',
      'Total = 1 + 2 + 4 + ... + √N — geometric with ratio 2, largest term √N.',
      'By the same rule, this sums to a constant multiple of the largest term, √N.',
    ],
    answer: 'Θ(√N)',
  },
  {
    id: 34, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'The inner loop steps by 2 while the outer loop steps by 5x each time. What is the total complexity? (Be careful — this one is easy to get wrong.)',
    code: `for (int i = 1; i < N; i *= 5) {\n    for (int j = 0; j < i; j += 2) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop visits i = 1, 5, 25, 125, ..., up to N — log₅N values.',
      'The inner loop runs from 0 to i in steps of 2 — that is i/2 iterations for each i, not the full i.',
      'Total = 1/2 + 5/2 + 25/2 + ... + N/2 = (1/2) × (1 + 5 + 25 + ... + N).',
      'The sum in parentheses is a geometric series bounded by its largest term N, so the whole expression is (1/2) × Θ(N) — still Θ(N) after dropping the constant factor of 1/2.',
    ],
    answer: 'Θ(N)',
    note: 'The "be careful" warning here is about NOT assuming the inner step size changes the fundamental geometric-series behavior — dividing every term by a constant (2, in this case) never changes which growth class the sum falls into.',
  },
  {
    id: 35, category: 'Geometric Series', difficulty: 'Medium', source: 'original',
    prompt: 'What is the complexity of this DECREASING geometric series — a loop that starts large and halves each time, doing linear work at each step?',
    code: `for (int i = N; i >= 1; i /= 2) {\n    for (int j = 0; j < i; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop visits N, N/2, N/4, N/8, ..., down to 1 — a DECREASING geometric sequence, log₂N terms total.',
      'For each i, the inner loop runs i times.',
      'Total = N + N/2 + N/4 + ... + 1 — a geometric series, but this time DECREASING, with ratio 1/2.',
      'For a decreasing geometric series, the sum is still bounded by (a constant multiple of) its LARGEST term — which here is the very first one, N.',
      'The full sum N + N/2 + N/4 + ... converges to less than 2N.',
    ],
    answer: 'Θ(N)',
    note: 'Whether a geometric series increases (ratio > 1) or decreases (ratio < 1), the rule is the same: the sum is dominated by its single largest term — first term here, last term in Questions 29–34.',
  },
  {
    id: 36, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'One geometric-growth outer loop with TWO separate inner loops — one nested (triangular) and one sequential and independent of i. What is the total complexity?',
    code: `for (int i = 1; i <= N * N * N; i *= 2) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n    for (int j = 1; j <= N; j++) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop runs log₂(N³) = 3 log₂N times (a constant multiple of log N).',
      'The FIRST inner loop depends on i, running i times each — summed across all outer iterations, this is a geometric series bounded by the largest i (which is N³), giving Θ(N³).',
      'The SECOND inner loop does NOT depend on i — it always runs N times, and it runs once per outer iteration, so its total contribution is (log N) × N = Θ(N log N).',
      'Adding the two inner loops\' total contributions: Θ(N³) + Θ(N log N).',
      'N³ dominates N log N for large N, so only the N³ term survives.',
    ],
    answer: 'Θ(N³)',
    note: 'When a loop body contains multiple separate pieces, analyze EACH one\'s total contribution across all outer iterations separately, then take the dominant one — do not assume they combine the same way.',
  },
  {
    id: 37, category: 'Geometric Series', difficulty: 'Hard', source: 'pdf',
    prompt: 'Same outer loop as before, but now BOTH inner loops are geometric (one bounded by i, one bounded by N). What is the total complexity?',
    code: `for (int i = 1; i <= N * N * N; i *= 2) {\n    for (int j = 1; j <= i; j++) {\n        sum++;\n    }\n    for (int j = 1; j <= N; j *= 2) {\n        sum++;\n    }\n}`,
    steps: [
      'The outer loop still runs Θ(log N) times (log₂(N³) is a constant multiple of log N).',
      'The first inner loop (bound i, step j++) summed across all outer iterations is a geometric series bounded by the largest i = N³, giving Θ(N³) — same as the previous question.',
      'The second inner loop this time is ALSO geometric (j *= 2, bound N) — it runs Θ(log N) times per outer iteration, and the outer loop runs Θ(log N) times, so this contributes Θ((log N)²) total.',
      'Comparing the two contributions, Θ(N³) and Θ((log N)²): N³ is vastly larger for any meaningful N.',
    ],
    answer: 'Θ(N³)',
    note: 'Changing the second inner loop from a plain N-step loop (previous question, contributing N log N) to a geometric N-step loop (this question, contributing only (log N)²) barely matters here — because the FIRST inner loop\'s N³ already dominates both versions.',
  },

  // ── CONDITIONALS & BEST/WORST CASE ───────────────────────────────────────
  {
    id: 38, category: 'Conditionals & Best/Worst Case', difficulty: 'Easy', source: 'original',
    prompt: 'What are the best-case and worst-case complexities of linear search with an early exit?',
    code: `bool linearSearch(int arr[], int n, int target) {\n    for (int i = 0; i < n; i++) {\n        if (arr[i] == target) {\n            return true;\n        }\n    }\n    return false;\n}`,
    steps: [
      'The `return true` inside the if-statement means the function can exit the loop early, as soon as it finds a match — this is exactly the kind of conditional that DOES change the complexity.',
      'Best case: the target is at index 0. The loop runs once, checks it, and returns immediately.',
      'Worst case: the target is at the LAST index, or not present in the array at all. Either way, the loop must check all n elements before it can return.',
      'These two scenarios genuinely differ in how much work is done, so they need to be stated separately rather than as one single complexity.',
    ],
    answer: 'Best: Θ(1)  ·  Worst: Θ(n)',
  },
  {
    id: 39, category: 'Conditionals & Best/Worst Case', difficulty: 'Hard', source: 'pdf',
    prompt: 'This function checks primality using a helper that itself contains a loop. What is its complexity?',
    code: `int isqrt(int N) {\n    int d;\n    for (d = 0; d * d <= N; d++) { }\n    return d - 1;\n}\n\nbool isPrime(int n) {\n    int lmt = isqrt(n);\n    for (int d = 2; d <= lmt; ++d) {\n        if (n % d == 0) {\n            return false;\n        }\n    }\n    return true;\n}`,
    steps: [
      'isqrt(N) has a loop that runs while d*d <= N, i.e. while d <= √N — so isqrt costs Θ(√n) and is called exactly ONCE, before the main loop starts (its result is stored in lmt, not re-checked every iteration).',
      'The main loop in isPrime runs from d = 2 up to lmt ≈ √n — so it runs at most √n times.',
      'Best case: n is even (or divisible by the smallest tested factor, 2). The loop finds a divisor on its very first check and returns false immediately — O(1) beyond the one-time √n cost of isqrt.',
      'Worst case: n is actually prime, so NO divisor is ever found, and the loop must run all the way through its full √n iterations.',
      'Either way, the one-time Θ(√n) cost of computing isqrt(n) is paid up front, and the main loop adds at most another Θ(√n).',
    ],
    answer: 'Best: Θ(√n)  ·  Worst: Θ(√n)',
    note: 'Even though there IS an early-exit condition (`return false` on finding a divisor), the one-time √n cost of isqrt(n) is unavoidable in every case, so best and worst case end up the same order here — unlike Question 38, where the early exit could happen on the very first element with no fixed cost paid upfront.',
  },
  {
    id: 40, category: 'Conditionals & Best/Worst Case', difficulty: 'Hard', source: 'pdf',
    prompt: 'A near-identical primality check, but this time the helper is called inside the loop CONDITION instead of being stored first. What changes?',
    code: `int isqrt(int N) {\n    int d;\n    for (d = 0; d * d <= N; d++) { }\n    return d - 1;\n}\n\nbool isPrime(int n) {\n    for (int d = 2; d <= isqrt(n); ++d) {\n        if (n % d == 0) {\n            return false;\n        }\n    }\n    return true;\n}`,
    steps: [
      'The only visible difference from Question 39 is that isqrt(n) is called directly inside the loop\'s condition, instead of being computed once and stored in a variable.',
      'A loop condition is a general expression, and general expressions are RE-EVALUATED at the top of every single iteration — so isqrt(n) is called again every time the loop checks whether to continue, not just once.',
      'isqrt(n) costs Θ(√n) per call. If the loop runs up to √n times in the worst case (n is prime), and EACH of those iterations re-calls isqrt(n) at Θ(√n) cost, the condition-checking alone costs √n × √n = Θ(n).',
      'That Θ(n) from repeated condition evaluation dominates the Θ(√n) cost of the loop body itself.',
    ],
    answer: 'Worst: Θ(n)  (versus Θ(√n) in Question 39)',
    note: 'This single change — moving a function call from "computed once into a variable" to "called directly inside a loop condition" — turned a Θ(√n) algorithm into a Θ(n) one. Always check whether a loop bound is a stored value or a live function call.',
  },
  {
    id: 41, category: 'Conditionals & Best/Worst Case', difficulty: 'Medium', source: 'original',
    prompt: 'What are the best-case and worst-case complexities of this modified bubble sort that stops early if no swaps occur?',
    code: `void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        bool swapped = false;\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                swap(arr[j], arr[j + 1]);\n                swapped = true;\n            }\n        }\n        if (!swapped) break;\n    }\n}`,
    steps: [
      'The `if (!swapped) break;` after the inner loop is the key conditional here — it lets the ENTIRE outer loop exit early if a full pass made no swaps at all.',
      'Best case: the array is already sorted. The very first pass makes zero swaps, `swapped` stays false, and the outer loop breaks after just one pass — a single Θ(n) scan.',
      'Worst case: the array is in reverse order. Every single pass makes at least one swap, so the early-exit check never triggers, and the algorithm runs the full standard bubble-sort pattern.',
      'The full pattern (no early exit) is the familiar triangular nested loop: (n-1) + (n-2) + ... + 1, which is Θ(n²).',
    ],
    answer: 'Best: Θ(n)  ·  Worst: Θ(n²)',
    note: 'This early-exit optimization is why some textbooks call this version "optimized bubble sort" — the swapped flag genuinely earns bubble sort a best case better than Θ(n²), unlike a naive version with no such check.',
  },

  // ── FUNCTION CALLS & COMPOSITION ─────────────────────────────────────────
  {
    id: 42, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'A helper function f1 costs Θ(N) and returns a value proportional to N. It is called as the loop bound EVERY iteration. What is main\'s complexity?',
    code: `int f1(int n) {\n    int K = 0;\n    for (int j = 0; j * j <= n * n; j++) K++;\n    return K;  // K ends up ~ n\n}\n\nint main() {\n    int Sum = 0, n;\n    cin >> n;\n    for (int i = 1; i <= f1(n); i += 1) {\n        for (int j = 1; j <= i; j++) {\n            Sum++;\n        }\n    }\n}`,
    steps: [
      'First, analyze f1 alone: its loop runs while j*j <= n*n, i.e. while j <= n — so f1 costs Θ(n) and returns K ≈ n.',
      'Now look at the outer loop\'s CONDITION: `i <= f1(n)`. This is a live function call inside the condition, so f1(n) is re-evaluated at the top of every single outer iteration — not just once.',
      'The outer loop runs roughly f1(n) ≈ n times in total. Each of those ~n iterations re-calls f1(n), and each call costs Θ(n) — so just checking the condition repeatedly costs n × n = Θ(n²).',
      'On top of that, the inner loop (triangular, bound = i) contributes its own Θ(n²) — the classic 1+2+...+n pattern.',
      'Both contributions are the same order, Θ(n²) + Θ(n²), so the total stays Θ(n²).',
    ],
    answer: 'Θ(n²)',
    note: 'Part 1 of a 4-question series exploring how f1 is called. Compare with Questions 44–45, where a similar helper is called ONCE into a variable instead — a much cheaper pattern.',
  },
  {
    id: 43, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'Same idea as before, but f1 now costs only Θ(log n) and returns a small value. What is main\'s complexity?',
    code: `int f1(int n) {\n    int K = 0;\n    for (int j = 1; j * j <= n; j *= 2) K++;\n    return K;  // K ~ (1/2) log n\n}\n\nint main() {\n    int Sum = 0, n;\n    cin >> n;\n    for (int i = 1; i <= f1(n); i += 1) {\n        for (int j = 1; j <= i; j++) {\n            Sum++;\n        }\n    }\n}`,
    steps: [
      'Analyze f1 first: j doubles each time and the condition is j*j <= n, i.e. j <= √n — since j doubles, it takes log₂(√n) = (1/2)log₂n steps. So f1 costs Θ(log n) and returns K ≈ Θ(log n), a SMALL value.',
      'The outer loop\'s condition `i <= f1(n)` is again re-evaluated every iteration. Since f1(n) ≈ log n is small, the outer loop itself only runs about Θ(log n) times total.',
      'Each of those ~log n outer iterations re-calls f1(n) at Θ(log n) cost each — total repeated-call cost = log n × log n = Θ((log n)²).',
      'The inner triangular loop, bounded by i (which only ever reaches ~log n), contributes 1+2+...+(log n) ≈ Θ((log n)²) as well.',
      'Both contributions are Θ((log n)²), so the total is Θ((log n)²).',
    ],
    answer: 'Θ((log n)²)',
    note: 'The SAME structural pattern as Question 42 (function call in the loop condition), but because f1 itself returns a much smaller value here, the entire program becomes dramatically cheaper — this is why "what does the helper function return" matters as much as "how is it called".',
  },
  {
    id: 44, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'f1 costs Θ(√n) and returns a value close to n. It is called ONCE and stored — but returns a squared value. What is main\'s complexity?',
    code: `int f1(int n) {\n    int K = 0;\n    for (int j = 1; j * j <= n; j++) K++;\n    return K * K;  // K ~ sqrt(n), so K*K ~ n\n}\n\nint main() {\n    int Sum = 0, n;\n    cin >> n;\n    int Terminator = f1(n);  // called ONCE\n    for (int i = 1; i <= Terminator; i += 1) {\n        for (int j = 1; j <= i; j++) {\n            Sum++;\n        }\n    }\n}`,
    steps: [
      'f1\'s own loop runs while j*j <= n, i.e. j <= √n — so the loop itself costs Θ(√n), and K ends up ≈ √n. But f1 RETURNS K*K, which is ≈ n, not √n!',
      'Crucially, f1(n) is called exactly ONCE here, stored into Terminator — the outer loop\'s condition then just compares against a plain variable, with no repeated function calls.',
      'So the total cost of calling f1 is just its own one-time Θ(√n).',
      'Terminator ≈ n, so the outer loop runs ≈ n times, and the inner triangular loop (bound = i) contributes the familiar 1+2+...+n ≈ Θ(n²).',
      'Comparing the one-time Θ(√n) cost of f1 against the Θ(n²) cost of the nested loops, the nested loops dominate completely.',
    ],
    answer: 'Θ(n²)',
  },
  {
    id: 45, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'Nearly identical to the previous question, but f1 returns K instead of K*K. What changes?',
    code: `int f1(int n) {\n    int K = 0;\n    for (int j = 0; j * j <= n; j++) K++;\n    return K;  // K ~ sqrt(n)\n}\n\nint main() {\n    int Sum = 0, n;\n    cin >> n;\n    int Terminator = f1(n);  // called ONCE\n    for (int i = 1; i <= Terminator; i += 1) {\n        for (int j = 1; j <= i; j++) {\n            Sum++;\n        }\n    }\n}`,
    steps: [
      'f1 is identical in cost to the previous question — its own loop costs Θ(√n) — but this time it returns K directly, not K squared, so it returns ≈ √n instead of ≈ n.',
      'f1(n) is again called once and stored in Terminator, so there is no repeated-call cost — just the one-time Θ(√n).',
      'Terminator ≈ √n, so the outer loop runs only ≈ √n times, and the triangular inner loop sums 1+2+...+√n.',
      'That sum is ≈ (√n)² / 2 = n/2, which is Θ(n).',
      'Comparing the one-time Θ(√n) cost of f1 against the Θ(n) cost of the nested loops, the nested loops still dominate, but the OVERALL program is now much cheaper than the previous question.',
    ],
    answer: 'Θ(n)',
    note: 'The only change from Question 44 is `return K*K` versus `return K`, both called once into a variable — yet the final answer drops from Θ(n²) all the way to Θ(n). Whether a helper squares its result before returning can matter enormously.',
  },
  {
    id: 46, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'A function f1 costs Θ(N) and returns ≈ N. Another function f2 calls f1 once, then loops up to f1\'s result. What is f2\'s complexity?',
    code: `int f1(int N) {\n    int Count = 0;\n    for (int i = 1; i <= N; i *= 2) {\n        for (int j = 1; j <= i; j++) {\n            Count++;\n        }\n    }\n    return Count;  // geometric series bounded by N => Count ~ N\n}\n\nint f2(int N) {\n    int Count = 0;\n    int C = f1(N);  // called once\n    for (int i = 0; i < C; i++) {\n        Count++;\n    }\n    return Count;\n}`,
    steps: [
      'f1 is a geometric-series pattern (outer doubles, inner bound = i) — from Question 29\'s reasoning, this is bounded by its largest term N, so f1 costs Θ(N) and returns C ≈ N.',
      'f2 calls f1(N) exactly once, storing the result in C — a one-time Θ(N) cost.',
      'f2\'s own loop then runs from 0 to C ≈ N — another Θ(N).',
      'Total: Θ(N) [for the one f1 call] + Θ(N) [for f2\'s own loop] = Θ(N).',
    ],
    answer: 'Θ(N)',
    note: 'Part of a 6-function series (f1 through f6) that builds up piece by piece — each function\'s complexity depends on correctly having solved the ones before it.',
  },
  {
    id: 47, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'Using the SAME f1 as before (Θ(N), returns ≈ N), this function calls f1 TWICE inside a loop condition. What is the complexity?',
    code: `int f1(int N) {  // Θ(N), returns Count ~ N — same as before\n    int Count = 0;\n    for (int i = 1; i <= N; i *= 2)\n        for (int j = 1; j <= i; j++) Count++;\n    return Count;\n}\n\nint f5(int N) {\n    int Count = 0;\n    for (int i = 0; i < sqrt(f1(N) * f1(N)); i++) {\n        Count++;\n    }\n    return Count;\n}`,
    steps: [
      'sqrt(f1(N) * f1(N)) simplifies mathematically to just f1(N) (since f1(N) is non-negative) — so the loop conceptually runs about f1(N) ≈ N times.',
      'But the loop CONDITION calls f1(N) TWICE per check (once for each multiplication operand), and this condition is re-evaluated on every single iteration.',
      'The loop runs ≈ N times total, and EACH of those N checks costs 2 × Θ(N) (two fresh calls to f1) = Θ(N) per check.',
      'Total cost of just evaluating the condition, over all N iterations: N iterations × Θ(N) per check = Θ(N²).',
      'The loop body itself (Count++) is only O(1) per iteration × N iterations = Θ(N), which is dominated by the Θ(N²) condition-checking cost.',
    ],
    answer: 'Θ(N²)',
    note: 'Calling an expensive function TWICE inside a repeatedly-checked condition compounds the "hidden repeated call" trap from Questions 42–43 even further.',
  },
  {
    id: 48, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'Using the same f1 (Θ(N), returns ≈ N), this function calls f1 once but takes its SQUARE ROOT, then loops multiplicatively. What is the complexity?',
    code: `int f1(int N) {  // Θ(N), returns Count ~ N\n    int Count = 0;\n    for (int i = 1; i <= N; i *= 2)\n        for (int j = 1; j <= i; j++) Count++;\n    return Count;\n}\n\nint f3(int N) {\n    int Count = 0;\n    int C = sqrt(f1(N));  // f1 called ONCE\n    for (int i = 1; i < C; i *= 2) {\n        Count++;\n    }\n    return Count;\n}`,
    steps: [
      'f1(N) is called exactly once here (inside sqrt(...), but sqrt itself does not re-trigger extra f1 calls — f1(N) is evaluated a single time and its result is square-rooted).',
      'That one call costs Θ(N), and C = sqrt(f1(N)) ≈ sqrt(N) = √N.',
      'The loop then runs from 1 to C, multiplying i by 2 each time — a logarithmic loop, costing Θ(log C) = Θ(log √N) = Θ((1/2) log N) = Θ(log N).',
      'Total: Θ(N) [one-time f1 call] + Θ(log N) [the loop] — the one-time f1 call dominates completely.',
    ],
    answer: 'Θ(N)',
  },
  {
    id: 49, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'Using the same f1, this function calls f1 TWICE inside a loop condition — but as a PRODUCT (not inside a sqrt) — while a plain loop body counts up. What is the complexity?',
    code: `int f1(int N) {  // Θ(N), returns Count ~ N\n    int Count = 0;\n    for (int i = 1; i <= N; i *= 2)\n        for (int j = 1; j <= i; j++) Count++;\n    return Count;\n}\n\nint f4(int N) {\n    int Count = 0;\n    for (int i = 0; i < f1(N) * f1(N); i++) {\n        Count++;\n    }\n    return Count;\n}`,
    steps: [
      'f1(N) * f1(N) is approximately N × N = N² in magnitude, so the loop conceptually runs ≈ N² times.',
      'The condition calls f1(N) TWICE, and is re-evaluated on every one of those ≈N² iterations.',
      'Cost of evaluating the condition alone: N² iterations × (2 calls × Θ(N) each) = N² × Θ(N) = Θ(N³).',
      'The loop body (Count++) contributes only O(1) × N² = Θ(N²), which the Θ(N³) condition-checking cost completely dominates.',
    ],
    answer: 'Θ(N³)',
    note: 'Comparing f4 (this question) with f5 (Question 47): both call f1 twice per condition check, but f4\'s loop runs N² times (because the condition is a PRODUCT, ~N²) versus f5\'s N times (because of the sqrt bringing it back down to ~N) — that difference alone separates Θ(N³) from Θ(N²).',
  },
  {
    id: 50, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'pdf',
    prompt: 'A sixth function sums the costs of calling f1 through f5 once each. It LOOKS recursive (it checks N==1) but never calls itself. What is its complexity?',
    code: `int Sum = 0;\nint f6(int N) {\n    if (N == 1) return 1;\n    Sum += f1(N);\n    Sum += f2(N);\n    Sum += f3(N);\n    Sum += f4(N);\n    Sum += f5(N);\n    return Sum;\n}`,
    steps: [
      'First, notice what this function does NOT do: despite the `if (N == 1)` check looking like a recursive base case, f6 never calls itself anywhere in its body — this is a plain straight-line function, not recursion.',
      'For N ≠ 1, f6 simply calls each of f1, f2, f3, f4, and f5 exactly once, and adds their results together.',
      'From the earlier questions in this series: f1 = Θ(N), f2 = Θ(N), f3 = Θ(N), f4 = Θ(N³), f5 = Θ(N²).',
      'Adding all five costs together: Θ(N) + Θ(N) + Θ(N) + Θ(N³) + Θ(N²).',
      'Only the dominant (fastest-growing) term survives — and Θ(N³) from f4 grows faster than all the others.',
    ],
    answer: 'Θ(N³)',
    note: 'A great "spot the fake recursion" reminder: an if-statement that resembles a base case does not make a function recursive — check whether it actually calls itself before assuming a recurrence relation is needed.',
  },
  {
    id: 51, category: 'Function Calls & Composition', difficulty: 'Hard', source: 'original',
    prompt: 'A function is called from inside a loop body itself (not the condition) — does the cost change the same way?',
    code: `int square(int x) {\n    return x * x;  // O(1)\n}\n\nint sumOfSquares(int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total += square(arr[i]);  // called once PER iteration, inside the body\n    }\n    return total;\n}`,
    steps: [
      'square(x) is O(1) — a single multiplication, regardless of x.',
      'Here, square() is called from inside the LOOP BODY, once per iteration — not inside the loop\'s condition, so there is no hidden re-evaluation trap like in Questions 42–43.',
      'The loop runs n times, and each iteration does O(1) work (the call to square, which is itself O(1)).',
      'Total: n iterations × O(1) per call = Θ(n).',
    ],
    answer: 'Θ(n)',
    note: 'Calling a function once per iteration, from the loop BODY, is completely ordinary and just adds that function\'s cost per iteration — the "hidden repeated call" danger from earlier questions is specifically about function calls placed inside a loop\'s CONDITION, which get re-evaluated on every single check, including ones that don\'t even execute the body.',
  },

  // ── RECURSION ────────────────────────────────────────────────────────────
  {
    id: 52, category: 'Recursion', difficulty: 'Easy', source: 'original',
    prompt: 'What is the time complexity of this recursive function that sums the first n numbers?',
    code: `int recursiveSum(int n) {\n    if (n <= 0) return 0;\n    return n + recursiveSum(n - 1);\n}`,
    steps: [
      'Each call to recursiveSum(n) does O(1) work of its own (one comparison, one addition) and makes exactly ONE recursive call, with n reduced by 1.',
      'Starting from recursiveSum(n), the chain of calls is n, n-1, n-2, ..., 1, 0 — exactly n+1 calls before hitting the base case.',
      'Since each call does O(1) work and there are Θ(n) calls total, the total work is Θ(n).',
    ],
    answer: 'Θ(n)',
    note: 'A useful shortcut: for simple "one recursive call, input shrinks by a fixed amount" recursion, the complexity is (number of calls until the base case) × (work per call).',
  },
  {
    id: 53, category: 'Recursion', difficulty: 'Medium', source: 'original',
    prompt: 'What is the time complexity of this recursive binary search?',
    code: `int binarySearch(int arr[], int lo, int hi, int target) {\n    if (lo > hi) return -1;\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) return binarySearch(arr, mid + 1, hi, target);\n    return binarySearch(arr, lo, mid - 1, target);\n}`,
    steps: [
      'Each call does O(1) work (one midpoint calculation, one or two comparisons) and makes AT MOST one recursive call — never both branches, because of the two return statements.',
      'Each recursive call is on a range that is HALF the size of the previous one (either [mid+1, hi] or [lo, mid-1]).',
      'Starting from a range of size n, how many times can you halve it before it becomes empty (lo > hi)? That is exactly log₂n times.',
      'So there are Θ(log n) calls total, each doing O(1) work.',
    ],
    answer: 'Θ(log n)',
  },
  {
    id: 54, category: 'Recursion', difficulty: 'Hard', source: 'original',
    prompt: 'What is the time complexity of this naive recursive Fibonacci function?',
    code: `int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}`,
    steps: [
      'Each call (for n > 1) makes TWO recursive calls, not one — this branches into a tree of calls rather than a single chain.',
      'Draw the call tree: fib(n) calls fib(n-1) and fib(n-2), each of those calls two more, and so on down to the base cases.',
      'At depth n, there are up to 2ⁿ leaf calls in the worst case, since the tree roughly doubles in size at each level down to depth n.',
      'Even though many branches terminate earlier (via the n-2 side), the total number of calls is still bounded by, and grows like, 2ⁿ.',
    ],
    answer: 'O(2ⁿ)',
    note: 'This exponential blow-up — recomputing the same fib(k) values many times across different branches — is exactly why memoization (storing already-computed results) turns this into an O(n) algorithm instead.',
  },
  {
    id: 55, category: 'Recursion', difficulty: 'Hard', source: 'original',
    prompt: 'What is the time complexity of merge sort, given its recurrence relation?',
    code: `void mergeSort(int arr[], int left, int right) {\n    if (left >= right) return;\n    int mid = left + (right - left) / 2;\n    mergeSort(arr, left, mid);       // sort left half\n    mergeSort(arr, mid + 1, right);  // sort right half\n    merge(arr, left, mid, right);    // O(n) to merge the two halves\n}`,
    steps: [
      'Each call makes exactly TWO recursive calls, each on a problem HALF the size of the original, plus an O(n) merge step to combine the results.',
      'This gives the recurrence T(n) = 2T(n/2) + O(n) — two half-sized subproblems, plus linear work to combine them.',
      'Picture this as a tree: at the top level, the merge step costs O(n). At the next level down, there are 2 subproblems, each needing an O(n/2) merge — together still O(n) for that whole level.',
      'This pattern repeats at every level: each level of the recursion tree does a total of O(n) work, combining the merges across however many subproblems exist at that level.',
      'The tree has log₂n levels (since the problem size halves each level, from n down to 1), and each level costs O(n) — so total work = O(n) × O(log n).',
    ],
    answer: 'Θ(n log n)',
    note: 'This "2T(n/2) + O(n) → O(n log n)" pattern is one of the most important recurrences in all of computer science — it also appears in Quick Sort\'s average case and many divide-and-conquer algorithms.',
  },
  {
    id: 56, category: 'Recursion', difficulty: 'Medium', source: 'original',
    prompt: 'What is the time complexity of this recursive function that computes xⁿ using fast exponentiation?',
    code: `long long fastPower(long long x, int n) {\n    if (n == 0) return 1;\n    long long half = fastPower(x, n / 2);\n    if (n % 2 == 0) {\n        return half * half;\n    }\n    return half * half * x;\n}`,
    steps: [
      'Each call does O(1) work of its own (one or two multiplications) and makes exactly ONE recursive call, with n roughly HALVED each time (n / 2).',
      'This is the same shape as binary search\'s recursion: one call, input halved — so the number of calls before reaching the base case (n == 0) is log₂n.',
      'Each of those Θ(log n) calls does O(1) work.',
    ],
    answer: 'Θ(log n)',
    note: 'Contrast this with naive exponentiation (multiplying x by itself n times in a loop), which is Θ(n) — halving the exponent each recursive call, rather than just decrementing it, is what brings this down to logarithmic time.',
  },
  {
    id: 57, category: 'Recursion', difficulty: 'Hard', source: 'original',
    prompt: 'What is the time complexity of this recursive function that prints all subsets of an array?',
    code: `void printSubsets(int arr[], int n, vector<int>& current) {\n    if (n == 0) {\n        printVector(current); // O(size of current), treated as O(1) here\n        return;\n    }\n    // Exclude arr[n-1]\n    printSubsets(arr, n - 1, current);\n    // Include arr[n-1]\n    current.push_back(arr[n - 1]);\n    printSubsets(arr, n - 1, current);\n    current.pop_back();\n}`,
    steps: [
      'Each call (for n > 0) makes exactly TWO recursive calls — one excluding the current element, one including it — with n reduced by 1 in both branches.',
      'This is the same branching shape as naive Fibonacci (Question 54): two calls per level, so the call tree doubles in size at each depth.',
      'The recursion goes n levels deep (from n down to 0), and doubling n times gives 2ⁿ total calls (one for each possible subset — which makes sense, since an array of size n has exactly 2ⁿ subsets).',
      'Each call does O(1) work beyond its two recursive calls (ignoring the cost of actually printing, which is a separate factor).',
    ],
    answer: 'Θ(2ⁿ)',
    note: 'This matches the well-known fact that a set of n elements has exactly 2ⁿ subsets — an algorithm that must generate all of them can never do better than Θ(2ⁿ), no matter how it is written.',
  },

  // ── FORMAL BIG-O PROOFS ──────────────────────────────────────────────────
  {
    id: 58, category: 'Formal Big-O Proofs', difficulty: 'Medium', source: 'docx',
    prompt: 'Prove that 9n³ + 400n² is O(n³) using the formal definition of Big-O — find constants c and n₀ such that the inequality holds for all n ≥ n₀.',
    code: `f(n) = 9n³ + 400n²`,
    steps: [
      'The formal definition requires finding constants c > 0 and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀, where g(n) = n³ here.',
      'Set up the inequality: 9n³ + 400n² ≤ c·n³.',
      'Divide both sides by n³: 9 + 400/n ≤ c. This shows c depends on which n we pick — larger n makes the required c smaller.',
      'Try n = 2 as a candidate n₀: 9 + 400/2 = 9 + 200 = 209. So c = 209 works at n = 2.',
      'Verify: at n = 2, 9(8) + 400(4) = 72 + 1600 = 1672, and c·n³ = 209 × 8 = 1672. The inequality holds (with equality) at n = 2, and for all larger n the left side grows slower relative to n³ than at n=2, so it continues to hold.',
    ],
    answer: 'c = 209, n₀ = 2 — so 9n³ + 400n² is O(n³)',
  },
  {
    id: 59, category: 'Formal Big-O Proofs', difficulty: 'Medium', source: 'docx',
    prompt: 'Prove that n³·2ⁿ + n²·3ⁿ is O(n²·3ⁿ) using the formal definition.',
    code: `f(n) = n³·2ⁿ + n²·3ⁿ`,
    steps: [
      'Set up the inequality with g(n) = n²·3ⁿ: n³·2ⁿ + n²·3ⁿ ≤ c·n²·3ⁿ.',
      'Divide both sides by n²·3ⁿ: (n·2ⁿ)/3ⁿ + 1 ≤ c, which simplifies to n·(2/3)ⁿ + 1 ≤ c.',
      'Since (2/3)ⁿ shrinks as n grows, n·(2/3)ⁿ does not grow without bound — it is a well-behaved, bounded quantity for n ≥ 1.',
      'Try n = 2: n·(2/3)ⁿ + 1 = 2·(4/9) + 1 = 8/9 + 1 ≈ 1.89. So c = 2 comfortably satisfies this at n = 2.',
      'Verify: at n = 2, the original inequality 8·4 + 4·9 = 32 + 36 = 68, and c·n²·3ⁿ = 2×4×9 = 72. Since 68 ≤ 72, it holds.',
    ],
    answer: 'c = 2, n₀ = 2 — so n³·2ⁿ + n²·3ⁿ is O(n²·3ⁿ)',
  },
  {
    id: 60, category: 'Formal Big-O Proofs', difficulty: 'Hard', source: 'docx',
    prompt: 'Prove that (100n + log n) × (25n + log n) is O(n²) using the formal definition.',
    code: `f(n) = (100n + log n) × (25n + log n)`,
    steps: [
      'First expand the product: (100n + log n)(25n + log n) = 2500n² + 125n·log n + (log n)².',
      'Set up the inequality against g(n) = n²: 2500n² + 125n·log n + (log n)² ≤ c·n².',
      'Divide both sides by n²: 2500 + 125·(log n)/n + ((log n)/n)² ≤ c. Everything now depends on how large (log n)/n can get.',
      'The ratio (log n)/n is NOT biggest at n = 2: with log base 2 it is 0.5 at n = 2, about 0.528 at n = 3, then 0.5 at n = 4, and it keeps shrinking after that. So its largest value is about 0.528.',
      'Plug that peak in: 2500 + 125(0.528) + (0.528)² ≈ 2500 + 66.04 + 0.28 ≈ 2566.3. Any c at least that big works, so choose c = 2567.',
      'Verify at the worst point n = 3: f(3) = (300 + 1.585)(75 + 1.585) ≈ 23,096.9 and c·n² = 2567 × 9 = 23,103. Since 23,096.9 ≤ 23,103 it holds, and for every other n ≥ 1 the gap is bigger.',
    ],
    answer: 'c = 2567, n₀ = 1 — so the expression is O(n²)',
    note: 'A tempting but WRONG choice is c = 2563 (the exact ratio at n = 2): it fails at n = 3. When the ratio f(n)/g(n) first rises and then falls, c must be taken at the PEAK, not at the starting point n₀.',
  },
  {
    id: 61, category: 'Formal Big-O Proofs', difficulty: 'Medium', source: 'docx',
    prompt: 'Prove that n³ + 4n + 2ⁿ is O(2ⁿ) using the formal definition.',
    code: `f(n) = n³ + 4n + 2ⁿ`,
    steps: [
      'Set up the inequality with g(n) = 2ⁿ: n³ + 4n + 2ⁿ ≤ c·2ⁿ.',
      'Divide both sides by 2ⁿ: n³/2ⁿ + 4n/2ⁿ + 1 ≤ c. Both fractions eventually shrink toward 0, since exponentials outgrow any polynomial — but NOT immediately.',
      'Compute the ratio (n³ + 4n + 2ⁿ)/2ⁿ for the first few n: n = 2 → 20/4 = 5, n = 3 → 47/8 = 5.875, n = 4 → 96/16 = 6, n = 5 → 177/32 ≈ 5.53, and it keeps falling after that.',
      'So the ratio climbs for a little while and PEAKS at n = 4 with value 6. The constant c must be at least that peak: choose c = 6.',
      'Verify: at n = 4 the left side is 64 + 16 + 16 = 96 and c·2ⁿ = 6 × 16 = 96 (equality). At n = 3, 47 ≤ 48; at n = 2, 20 ≤ 24; for n ≥ 5 the ratio is below 6 and shrinking.',
    ],
    answer: 'c = 6, n₀ = 2 — so n³ + 4n + 2ⁿ is O(2ⁿ)',
    note: 'Choosing c = 5 (the ratio at n = 2) is a classic slip: it fails at n = 3 (47 > 40). Always look for where the ratio peaks before fixing c.',
  },
  {
    id: 62, category: 'Formal Big-O Proofs', difficulty: 'Hard', source: 'docx',
    prompt: 'Prove that n²/log n + n is O(n²/log n) using the formal definition.',
    code: `f(n) = n²/log n + n`,
    steps: [
      'Set up the inequality with g(n) = n²/log n: n²/log n + n ≤ c·(n²/log n).',
      'Divide both sides by n²/log n: 1 + (n·log n)/n² ≤ c, which simplifies to 1 + (log n)/n ≤ c.',
      'As n grows, (log n)/n shrinks toward 0 (logarithms grow far slower than n itself), so this expression is bounded.',
      'Try n = 2 (log₂2 = 1): 1 + 1/2 = 1.5. So a value like c = 2 comfortably satisfies this from n = 2 onward.',
      'Verify: at n = 2, n²/log n + n = 4/1 + 2 = 6, and c·n²/log n = 2×4 = 8. Since 6 ≤ 8, the inequality holds.',
    ],
    answer: 'c = 2, n₀ = 2 — so n²/log n + n is O(n²/log n)',
  },
  {
    id: 63, category: 'Formal Big-O Proofs', difficulty: 'Hard', source: 'docx',
    prompt: 'Given a fixed constant k > 0, prove that n^k + 2ⁿ is O(2ⁿ) using the formal definition (this generalizes the n³ + 2ⁿ case).',
    code: `f(n) = n^k + 2ⁿ,  for a fixed constant k`,
    steps: [
      'Set up the inequality with g(n) = 2ⁿ: n^k + 2ⁿ ≤ c·2ⁿ.',
      'Divide both sides by 2ⁿ: n^k / 2ⁿ + 1 ≤ c.',
      'The key fact this relies on: for ANY fixed constant k, n^k / 2ⁿ shrinks toward 0 as n grows — exponentials always eventually outgrow polynomials of any fixed degree, no matter how large k is.',
      'Since n^k/2ⁿ is bounded above by some maximum value it reaches before shrinking (a value depending on k), a constant c = (that maximum) + 1 will always exist, even though its exact value depends on k.',
      'So a valid n₀ and c can always be found — they just depend on the specific k chosen, unlike the earlier fixed-degree examples.',
    ],
    answer: 'O(2ⁿ), for any fixed constant k — c depends on k, but always exists',
    note: 'This is the general principle behind "exponentials beat polynomials": no matter how large a FIXED polynomial degree k is, 2ⁿ eventually wins, because exponential growth compounds while polynomial growth does not.',
  },
  {
    id: 64, category: 'Formal Big-O Proofs', difficulty: 'Hard', source: 'docx',
    prompt: 'Given a fixed constant k > 0, prove that n^(k+a) + nᵏ·log n is O(n^(k+a)) using the formal definition (assume a > 0 is also a fixed constant).',
    code: `f(n) = n^(k+a) + nᵏ·log n,  for fixed constants k, a > 0`,
    steps: [
      'Set up the inequality with g(n) = n^(k+a): n^(k+a) + nᵏ·log n ≤ c·n^(k+a).',
      'Divide both sides by n^(k+a): 1 + (log n)/nᵃ ≤ c.',
      'Since a is a fixed positive constant, (log n)/nᵃ shrinks toward 0 as n grows — nᵃ (any positive power of n) always eventually outgrows log n. So the ratio is bounded: it has some largest value M(a).',
      'M(a) depends on a and is NOT always reached at n = 2. For a = 1 the peak is ≈ 0.53 (at n = 3); for a = 0.5 it is ≈ 1.06 (at n = 7); for a = 0.1 it is ≈ 5.3, reached only near n ≈ 22,000.',
      'So take c = 1 + M(a) and n₀ = 1: then 1 + (log n)/nᵃ ≤ c for every n ≥ 1. For example, a = 1 works with c = 2.',
    ],
    answer: 'O(n^(k+a)) — c = 1 + M(a), where M(a) is the maximum of (log n)/nᵃ (it exists for every a > 0), n₀ = 1',
    note: 'The general principle: whenever you have n^(bigger power) plus n^(smaller power) times log n, the bigger power wins — even a tiny extra power of n eventually beats any amount of extra log n. Only the constant c (not the conclusion) depends on how tiny a is.',
  },
];

export const TOTAL_QUESTIONS = PRACTICE_QUESTIONS.length;
