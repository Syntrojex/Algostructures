import {
  parseCode,
  type CallFrame, type CallTreeNode, type CallsPegs, type CallsSnap, type CallsStrip, type Lab, type LabStep,
} from './core';

/* ══════════════════════════════════════════════════════════════════════════
   RECURSION — one class, many recursive functions.
   Every op below really runs the matching C++ function (re-implemented here with
   a tracer), recording each call, every line it reaches, and every return.
   Tower of Hanoi is here too (full solve with moving disks); N-Queens has its own page.
   ══════════════════════════════════════════════════════════════════════════ */
const rec = parseCode(`
#include <iostream>
#include <vector>
using namespace std;

class Recursion
{
public:
	void print(vector<int>& v)
	{
		cout << "{ ";
		for (int x : v) cout << x << " ";
		cout << "}" << endl;
	}

	// ---------- Printing: before vs after the call ----------
	void printDown(int n) /*@pd*/
	{
		if (n == 0) return; /*@pd_base*/
		cout << n << endl; /*@pd_print*/
		printDown(n - 1); /*@pd_call*/
	}

	void printUp(int n) /*@pu*/
	{
		if (n == 0) return; /*@pu_base*/
		printUp(n - 1); /*@pu_call*/
		cout << n << endl; /*@pu_print*/
	}

	// ---------- Numbers ----------
	int factorial(int n) /*@fa*/
	{
		if (n <= 1) return 1; /*@fa_base*/
		return n * factorial(n - 1); /*@fa_rec*/
	}

	int sumTo(int n) /*@su*/
	{
		if (n == 0) return 0; /*@su_base*/
		return n + sumTo(n - 1); /*@su_rec*/
	}

	int sumDigits(int n) /*@sd*/
	{
		if (n < 10) return n; /*@sd_base*/
		return n % 10 + sumDigits(n / 10); /*@sd_rec*/
	}

	void toBinary(int n) /*@tb*/
	{
		if (n == 0) return; /*@tb_base*/
		toBinary(n / 2); /*@tb_call*/
		cout << n % 2 << endl; /*@tb_print*/
	}

	int gcd(int a, int b) /*@gc*/
	{
		if (b == 0) return a; /*@gc_base*/
		return gcd(b, a % b); /*@gc_rec*/
	}

	int power(int a, int b) /*@po*/
	{
		if (b == 0) return 1; /*@po_base*/
		return a * power(a, b - 1); /*@po_rec*/
	}

	int fastPower(int a, int b) /*@fp*/
	{
		if (b == 0) return 1; /*@fp_base*/
		int half = fastPower(a, b / 2); /*@fp_half*/
		if (b % 2 == 0) /*@fp_check*/
			return half * half; /*@fp_even*/
		return half * half * a; /*@fp_odd*/
	}

	// ---------- Two calls per level (a tree, not a chain) ----------
	int fib(int n) /*@fi*/
	{
		if (n <= 1) return n; /*@fi_base*/
		return fib(n - 1) + fib(n - 2); /*@fi_rec*/
	}

	int fibMemo(int n, vector<int>& memo) /*@fm*/
	{
		if (n <= 1) return n; /*@fm_base*/
		if (memo[n] != -1) return memo[n]; /*@fm_hit*/
		memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo); /*@fm_rec*/
		return memo[n]; /*@fm_ret*/
	}

	// ---------- Arrays ----------
	int sumArray(vector<int>& a, int i) /*@sa*/
	{
		if (i == a.size()) return 0; /*@sa_base*/
		return a[i] + sumArray(a, i + 1); /*@sa_rec*/
	}

	int findMax(vector<int>& a, int i) /*@mx*/
	{
		if (i == a.size() - 1) return a[i]; /*@mx_base*/
		int rest = findMax(a, i + 1); /*@mx_call*/
		return max(a[i], rest); /*@mx_ret*/
	}

	void reverseArray(vector<int>& a, int l, int r) /*@rv*/
	{
		if (l >= r) return; /*@rv_base*/
		swap(a[l], a[r]); /*@rv_swap*/
		reverseArray(a, l + 1, r - 1); /*@rv_call*/
	}

	bool isPalindrome(vector<int>& d, int l, int r) /*@pa*/
	{
		if (l >= r) return true; /*@pa_base*/
		if (d[l] != d[r]) return false; /*@pa_diff*/
		return isPalindrome(d, l + 1, r - 1); /*@pa_rec*/
	}

	int binarySearch(vector<int>& a, int lo, int hi, int target) /*@bs*/
	{
		if (lo > hi) return -1; /*@bs_base*/
		int mid = (lo + hi) / 2; /*@bs_mid*/
		if (a[mid] == target) return mid; /*@bs_found*/
		if (a[mid] < target) /*@bs_cmp*/
			return binarySearch(a, mid + 1, hi, target); /*@bs_right*/
		return binarySearch(a, lo, mid - 1, target); /*@bs_left*/
	}

	// ---------- Choices & backtracking ----------
	void subsets(vector<int>& a, int i, vector<int>& cur) /*@ss*/
	{
		if (i == a.size()) /*@ss_base*/
		{
			print(cur); /*@ss_print*/
			return;
		}
		cur.push_back(a[i]); /*@ss_take*/
		subsets(a, i + 1, cur); /*@ss_inc*/
		cur.pop_back(); /*@ss_undo*/
		subsets(a, i + 1, cur); /*@ss_exc*/
	}

	void permute(vector<int>& a, int start) /*@pe*/
	{
		if (start == a.size()) /*@pe_base*/
		{
			print(a); /*@pe_print*/
			return;
		}
		for (int i = start; i < a.size(); i++) /*@pe_for*/
		{
			swap(a[start], a[i]); /*@pe_swap*/
			permute(a, start + 1); /*@pe_call*/
			swap(a[start], a[i]); /*@pe_undo*/
		}
	}

	// ---------- Tower of Hanoi ----------
	void hanoi(int n, char from, char to, char via) /*@hn*/
	{
		if (n == 0) return; /*@hn_base*/
		hanoi(n - 1, from, via, to); /*@hn_first*/
		cout << "Move disk " << n << " from " << from << " to " << to << endl; /*@hn_move*/
		hanoi(n - 1, via, to, from); /*@hn_second*/
	}

	// ---------- What goes wrong without a base case ----------
	int broken(int n) /*@br*/
	{
		return n + broken(n - 1); /*@br_rec*/
	}
};
`);

const M = rec.marks;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.trunc(v)));

/* ───────────────────────────── tracer ───────────────────────────── */
class Tracer {
  steps: LabStep[] = [];
  stack: CallFrame[] = [];
  tree: CallTreeNode[] = [];
  seq = 0;
  calls = 0;
  maxDepth = 0;
  strip?: CallsStrip;
  memo?: (number | null)[];
  memoHi: number[] = [];
  pegs?: CallsPegs;
  result?: string;
  overflow = false;

  private snap(): CallsSnap {
    return {
      kind: 'calls',
      stack: this.stack.map(f => ({ ...f })),
      tree: this.tree.map(n => ({ ...n })),
      activeId: this.stack.length ? this.stack[this.stack.length - 1].id : null,
      calls: this.calls,
      maxDepth: this.maxDepth,
      strip: this.strip ? { ...this.strip, cells: [...this.strip.cells], hi: [...this.strip.hi], hi2: [...this.strip.hi2], dim: [...this.strip.dim], ptrs: this.strip.ptrs.map(p => ({ ...p })) } : undefined,
      memo: this.memo ? [...this.memo] : undefined,
      memoHi: [...this.memoHi],
      pegs: this.pegs ? { ...this.pegs, stacks: this.pegs.stacks.map(x => [...x]), names: [...this.pegs.names] } : undefined,
      result: this.result,
      overflow: this.overflow || undefined,
    };
  }

  private top(): CallFrame { return this.stack[this.stack.length - 1]; }
  private nodeOf(id: number): CallTreeNode { return this.tree.find(n => n.id === id)!; }

  /** emit a step that highlights the source line named by `mark` */
  at(mark: string, note: string, out?: string) {
    this.steps.push({ line: M[mark] ?? 0, note, out, snap: this.snap() });
  }

  setVars(vars: string) { if (this.stack.length) this.top().vars = vars; }

  /** a new call: push a frame, add a tree node, emit a step on the function's signature line */
  enter(mark: string, call: string, label: string, vars: string, note: string) {
    const parent = this.stack.length ? this.top() : null;
    if (parent) { parent.status = 'waiting'; parent.waitFor = call; this.nodeOf(parent.id).status = 'waiting'; }
    const id = ++this.seq;
    this.calls++;
    this.stack.push({ id, call, vars, status: 'running' });
    this.tree.push({ id, label, parent: parent ? parent.id : null, status: 'running' });
    this.maxDepth = Math.max(this.maxDepth, this.stack.length);
    this.at(mark, note);
  }

  /** the top frame returns: show it returning, then pop it */
  ret(mark: string, value: number | string | boolean | undefined, note: string, tag?: 'base' | 'memo') {
    const f = this.top();
    const shown = value === undefined ? 'void' : typeof value === 'boolean' ? String(value) : String(value);
    f.status = 'returning';
    f.ret = shown;
    delete f.waitFor;
    const node = this.nodeOf(f.id);
    node.status = 'returning';
    node.ret = value === undefined ? '✓' : shown;
    if (tag) node.tag = tag;
    this.at(mark, note);
    node.status = 'done';
    this.stack.pop();
    if (this.stack.length) {
      const p = this.top();
      p.status = 'running';
      delete p.waitFor;
      this.nodeOf(p.id).status = 'running';
    } else if (value !== undefined) {
      this.result = shown;
    }
  }

  /** final "everything finished" step (no source line highlighted) */
  finish(note: string) { this.steps.push({ line: 0, note, snap: this.snap() }); }
}

const strip = (cells: (number | string)[], extra: Partial<CallsStrip> = {}): CallsStrip =>
  ({ cells: [...cells], hi: [], hi2: [], dim: [], ptrs: [], ...extra });

/* ───────────────────────────── operations ───────────────────────────── */
type Args = Record<string, number>;
type OpFn = (T: Tracer, a: Args) => string;   // returns the closing note

const OPS: Record<string, OpFn> = {
  /* ── printing ── */
  printDown(T, a) {
    const go = (n: number) => {
      T.enter('pd', `printDown(${n})`, `pd(${n})`, `n = ${n}`, `Call printDown(${n}) — a new frame with its own n = ${n} is pushed on the call stack.`);
      if (n === 0) { T.ret('pd_base', undefined, 'n == 0 is true → BASE CASE. Nothing to print, so the function simply returns.', 'base'); return; }
      T.at('pd_base', `Is n == 0? ${n} is not 0, so this is NOT the base case — keep going.`);
      T.at('pd_print', `The print comes BEFORE the recursive call, so ${n} is printed right now, on the way DOWN.`, `${n}`);
      T.at('pd_call', `Call printDown(${n - 1}). This frame pauses and waits on the stack.`);
      go(n - 1);
      T.ret('pd_call', undefined, `printDown(${n - 1}) is finished. Nothing is left to do after the call, so printDown(${n}) returns too.`);
    };
    go(a.n);
    T.finish(`Done. Printing before the call gives ${a.n} down to 1 — the numbers come out in the order the calls were made.`);
    return 'printDown';
  },

  printUp(T, a) {
    const go = (n: number) => {
      T.enter('pu', `printUp(${n})`, `pu(${n})`, `n = ${n}`, `Call printUp(${n}) — a new frame is pushed.`);
      if (n === 0) { T.ret('pu_base', undefined, 'n == 0 is true → BASE CASE. Return and start UNWINDING the stack.', 'base'); return; }
      T.at('pu_base', `Is n == 0? ${n} is not 0 → keep recursing.`);
      T.at('pu_call', `Call printUp(${n - 1}) FIRST. Nothing has been printed yet — ${n} is waiting on the stack.`);
      go(n - 1);
      T.at('pu_print', `The child has returned, so we are on the way UP. Now print ${n}.`, `${n}`);
      T.ret('pu_print', undefined, `printUp(${n}) is done and returns.`);
    };
    go(a.n);
    T.finish(`Done. Printing AFTER the call gives 1 up to ${a.n} — the numbers come out as the calls return, in reverse order.`);
    return 'printUp';
  },

  /* ── numbers ── */
  factorial(T, a) {
    const go = (n: number): number => {
      T.enter('fa', `factorial(${n})`, `f(${n})`, `n = ${n}`, `Call factorial(${n}) — a new frame with n = ${n} is pushed.`);
      if (n <= 1) { T.ret('fa_base', 1, `n ≤ 1 is true → BASE CASE. Return 1 without calling anything else.`, 'base'); return 1; }
      T.at('fa_base', `Is n ≤ 1? ${n} ≤ 1 is false → not the base case.`);
      T.at('fa_rec', `We need ${n} × factorial(${n - 1}), but factorial(${n - 1}) is unknown yet — call it. This frame waits.`);
      const r = go(n - 1);
      const v = n * r;
      T.ret('fa_rec', v, `factorial(${n - 1}) came back with ${r}. Now ${n} × ${r} = ${v}, return it.`);
      return v;
    };
    const v = go(a.n);
    T.finish(`factorial(${a.n}) = ${v}. ${T.calls} calls, deepest stack = ${T.maxDepth} frames.`);
    return 'factorial';
  },

  sumTo(T, a) {
    const go = (n: number): number => {
      T.enter('su', `sumTo(${n})`, `s(${n})`, `n = ${n}`, `Call sumTo(${n}) — new frame pushed.`);
      if (n === 0) { T.ret('su_base', 0, 'n == 0 → BASE CASE. The sum of nothing is 0.', 'base'); return 0; }
      T.at('su_base', `Is n == 0? ${n} ≠ 0 → recurse.`);
      T.at('su_rec', `sumTo(${n}) = ${n} + sumTo(${n - 1}). Call the smaller problem first; this frame waits.`);
      const r = go(n - 1);
      const v = n + r;
      T.ret('su_rec', v, `sumTo(${n - 1}) returned ${r}, so ${n} + ${r} = ${v}.`);
      return v;
    };
    const v = go(a.n);
    T.finish(`sumTo(${a.n}) = ${v}.`);
    return 'sumTo';
  },

  sumDigits(T, a) {
    const go = (n: number): number => {
      T.enter('sd', `sumDigits(${n})`, `sd(${n})`, `n = ${n}`, `Call sumDigits(${n}).`);
      if (n < 10) { T.ret('sd_base', n, `${n} < 10 → a single digit is its own digit-sum. BASE CASE: return ${n}.`, 'base'); return n; }
      T.at('sd_base', `Is n < 10? ${n} ≥ 10 → more than one digit, recurse.`);
      T.at('sd_rec', `Split ${n} into last digit ${n % 10} and the rest ${Math.trunc(n / 10)}. Call sumDigits(${Math.trunc(n / 10)}); this frame waits.`);
      const r = go(Math.trunc(n / 10));
      const v = (n % 10) + r;
      T.ret('sd_rec', v, `The rest summed to ${r}; add the last digit ${n % 10} → ${v}.`);
      return v;
    };
    const v = go(a.n);
    T.finish(`sumDigits(${a.n}) = ${v}. Each call removes one digit, so the depth equals the number of digits.`);
    return 'sumDigits';
  },

  toBinary(T, a) {
    const go = (n: number) => {
      T.enter('tb', `toBinary(${n})`, `tb(${n})`, `n = ${n}`, `Call toBinary(${n}).`);
      if (n === 0) { T.ret('tb_base', undefined, 'n == 0 → BASE CASE. No more bits.', 'base'); return; }
      T.at('tb_base', `Is n == 0? ${n} ≠ 0 → recurse.`);
      T.at('tb_call', `Call toBinary(${Math.trunc(n / 2)}) FIRST — the higher bits must be printed before this one.`);
      go(Math.trunc(n / 2));
      T.at('tb_print', `Unwinding: print ${n} % 2 = ${n % 2}, the lowest bit of ${n}.`, `${n % 2}`);
      T.ret('tb_print', undefined, `toBinary(${n}) is done.`);
    };
    go(a.n);
    T.finish(`Read the console from top to bottom: that is ${a.n} in binary.`);
    return 'toBinary';
  },

  gcd(T, a) {
    const go = (x: number, y: number): number => {
      T.enter('gc', `gcd(${x}, ${y})`, `g(${x},${y})`, `a = ${x}, b = ${y}`, `Call gcd(${x}, ${y}).`);
      if (y === 0) { T.ret('gc_base', x, `b == 0 → BASE CASE. The answer is a = ${x}.`, 'base'); return x; }
      T.at('gc_base', `Is b == 0? ${y} ≠ 0 → recurse.`);
      T.at('gc_rec', `Euclid: gcd(a, b) = gcd(b, a % b) = gcd(${y}, ${x % y}). Call it; this frame waits.`);
      const r = go(y, x % y);
      T.ret('gc_rec', r, `The child returned ${r}; nothing more to do, pass ${r} straight up.`);
      return r;
    };
    const v = go(a.a, a.b);
    T.finish(`gcd(${a.a}, ${a.b}) = ${v}. The second argument shrinks fast, so there are very few calls.`);
    return 'gcd';
  },

  power(T, a) {
    const go = (x: number, y: number): number => {
      T.enter('po', `power(${x}, ${y})`, `p(${x},${y})`, `a = ${x}, b = ${y}`, `Call power(${x}, ${y}).`);
      if (y === 0) { T.ret('po_base', 1, 'b == 0 → BASE CASE. Anything to the power 0 is 1.', 'base'); return 1; }
      T.at('po_base', `Is b == 0? ${y} ≠ 0 → recurse.`);
      T.at('po_rec', `power(${x}, ${y}) = ${x} × power(${x}, ${y - 1}). Call the smaller power; this frame waits.`);
      const r = go(x, y - 1);
      const v = x * r;
      T.ret('po_rec', v, `${x} × ${r} = ${v}.`);
      return v;
    };
    const v = go(a.a, a.b);
    T.finish(`${a.a}^${a.b} = ${v}, using ${T.calls} call${T.calls === 1 ? '' : 's'} — one per unit of b. Compare with fastPower.`);
    return 'power';
  },

  fastPower(T, a) {
    const go = (x: number, y: number): number => {
      T.enter('fp', `fastPower(${x}, ${y})`, `fp(${x},${y})`, `a = ${x}, b = ${y}`, `Call fastPower(${x}, ${y}).`);
      if (y === 0) { T.ret('fp_base', 1, 'b == 0 → BASE CASE. Return 1.', 'base'); return 1; }
      T.at('fp_base', `Is b == 0? ${y} ≠ 0 → recurse.`);
      T.at('fp_half', `Compute the power for HALF the exponent: fastPower(${x}, ${Math.trunc(y / 2)}). One call replaces many multiplications.`);
      const h = go(x, Math.trunc(y / 2));
      T.setVars(`a = ${x}, b = ${y}, half = ${h}`);
      T.at('fp_check', `half = ${h}. Is b even? ${y} % 2 == ${y % 2} → ${y % 2 === 0 ? 'yes' : 'no'}.`);
      if (y % 2 === 0) { const v = h * h; T.ret('fp_even', v, `Even exponent: half × half = ${h} × ${h} = ${v}.`); return v; }
      const v = h * h * x;
      T.ret('fp_odd', v, `Odd exponent: half × half × a = ${h} × ${h} × ${x} = ${v}.`);
      return v;
    };
    const v = go(a.a, a.b);
    T.finish(`${a.a}^${a.b} = ${v} in only ${T.calls} calls — the exponent is halved each time, so depth ≈ log₂(b).`);
    return 'fastPower';
  },

  /* ── two calls per level ── */
  fib(T, a) {
    const go = (n: number): number => {
      T.enter('fi', `fib(${n})`, `fib(${n})`, `n = ${n}`, `Call fib(${n}).`);
      if (n <= 1) { T.ret('fi_base', n, `n ≤ 1 → BASE CASE. fib(${n}) = ${n}.`, 'base'); return n; }
      T.at('fi_base', `Is n ≤ 1? ${n} > 1 → recurse TWICE.`);
      T.at('fi_rec', `fib(${n}) = fib(${n - 1}) + fib(${n - 2}). Call the LEFT one, fib(${n - 1}), first.`);
      const l = go(n - 1);
      T.setVars(`n = ${n}, left = ${l}`);
      T.at('fi_rec', `Left side gave ${l}. Now call the RIGHT one, fib(${n - 2}).`);
      const r = go(n - 2);
      T.ret('fi_rec', l + r, `Both children are back: ${l} + ${r} = ${l + r}.`);
      return l + r;
    };
    const v = go(a.n);
    T.finish(`fib(${a.n}) = ${v}, but it took ${T.calls} calls — the same values (like fib(2)) are recomputed again and again.`);
    return 'fib';
  },

  fibMemo(T, a) {
    const n0 = a.n;
    const memo: (number | null)[] = Array.from({ length: n0 + 1 }, () => null);
    T.memo = memo;
    const go = (n: number): number => {
      T.enter('fm', `fibMemo(${n})`, `fm(${n})`, `n = ${n}`, `Call fibMemo(${n}, memo).`);
      if (n <= 1) { T.ret('fm_base', n, `n ≤ 1 → BASE CASE. Return ${n}.`, 'base'); return n; }
      T.memoHi = [n];
      T.at('fm_base', `Is n ≤ 1? ${n} > 1 → not a base case.`);
      if (memo[n] !== null) { T.ret('fm_hit', memo[n]!, `memo[${n}] is already ${memo[n]} — reuse it instead of recomputing. The whole subtree is skipped!`, 'memo'); T.memoHi = []; return memo[n]!; }
      T.at('fm_hit', `memo[${n}] is -1 (empty) → this value has not been computed yet.`);
      T.memoHi = [];
      T.at('fm_rec', `Compute fibMemo(${n - 1}) first.`);
      const l = go(n - 1);
      T.setVars(`n = ${n}, left = ${l}`);
      T.at('fm_rec', `Left gave ${l}. Now fibMemo(${n - 2}).`);
      const r = go(n - 2);
      memo[n] = l + r;
      T.memoHi = [n];
      T.at('fm_rec', `Store memo[${n}] = ${l} + ${r} = ${l + r}.`);
      T.ret('fm_ret', memo[n]!, `Return memo[${n}] = ${memo[n]}.`);
      T.memoHi = [];
      return memo[n]!;
    };
    const v = go(n0);
    T.finish(`fibMemo(${n0}) = ${v} in only ${T.calls} calls (plain fib(${n0}) needs ${fibCalls(n0)}). Each value is computed once, then looked up — that is memoisation.`);
    return 'fibMemo';
  },

  /* ── arrays ── */
  sumArray(T, _a) {
    const arr = [3, 1, 4, 1, 5, 9];
    const go = (i: number): number => {
      T.strip = strip(arr, { ptrs: i < arr.length ? [{ name: 'i', index: i, color: 'cyan' }] : [], hi: i < arr.length ? [i] : [] });
      T.enter('sa', `sumArray(a, ${i})`, `sa(${i})`, `i = ${i}`, `Call sumArray(a, ${i}).`);
      if (i === arr.length) { T.ret('sa_base', 0, `i == a.size() (${arr.length}) → ran off the end. BASE CASE: the sum of nothing is 0.`, 'base'); return 0; }
      T.at('sa_base', `Is i == ${arr.length}? ${i} ≠ ${arr.length} → there is still an element to add.`);
      T.at('sa_rec', `a[${i}] = ${arr[i]}. Result = ${arr[i]} + sumArray(a, ${i + 1}). Call it; this frame waits.`);
      const r = go(i + 1);
      const v = arr[i] + r;
      T.strip = strip(arr, { hi: [i], ptrs: [{ name: 'i', index: i, color: 'cyan' }] });
      T.ret('sa_rec', v, `The rest summed to ${r}; ${arr[i]} + ${r} = ${v}.`);
      return v;
    };
    const v = go(0);
    T.finish(`Sum of the array = ${v}.`);
    return 'sumArray';
  },

  findMax(T, _a) {
    const arr = [3, 8, 2, 9, 4, 7];
    const go = (i: number): number => {
      T.strip = strip(arr, { hi: [i], ptrs: [{ name: 'i', index: i, color: 'cyan' }] });
      T.enter('mx', `findMax(a, ${i})`, `mx(${i})`, `i = ${i}`, `Call findMax(a, ${i}).`);
      if (i === arr.length - 1) { T.ret('mx_base', arr[i], `i is the last index → BASE CASE. A one-element range has maximum ${arr[i]}.`, 'base'); return arr[i]; }
      T.at('mx_base', `Is i the last index (${arr.length - 1})? ${i} ≠ ${arr.length - 1} → recurse.`);
      T.at('mx_call', `Find the maximum of everything AFTER index ${i} first.`);
      const rest = go(i + 1);
      T.strip = strip(arr, { hi: [i], ptrs: [{ name: 'i', index: i, color: 'cyan' }] });
      T.setVars(`i = ${i}, rest = ${rest}`);
      const v = Math.max(arr[i], rest);
      T.ret('mx_ret', v, `max(a[${i}] = ${arr[i]}, rest = ${rest}) = ${v}.`);
      return v;
    };
    const v = go(0);
    T.finish(`The maximum is ${v}.`);
    return 'findMax';
  },

  reverseArray(T, a) {
    const arr = Array.from({ length: a.n }, (_, i) => i + 1);
    const go = (l: number, r: number) => {
      T.strip = strip(arr, { hi: l < r ? [l, r] : [], ptrs: l <= r ? [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: r, color: 'orange' }] : [] });
      T.enter('rv', `reverseArray(a, ${l}, ${r})`, `rv(${l},${r})`, `l = ${l}, r = ${r}`, `Call reverseArray(a, ${l}, ${r}).`);
      if (l >= r) { T.ret('rv_base', undefined, `l ≥ r → the two ends have met (or crossed). BASE CASE: nothing left to swap.`, 'base'); return; }
      T.at('rv_base', `Is l ≥ r? ${l} < ${r} → there is still a pair to swap.`);
      [arr[l], arr[r]] = [arr[r], arr[l]];
      T.strip = strip(arr, { hi: [l, r], ptrs: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: r, color: 'orange' }] });
      T.at('rv_swap', `Swap a[${l}] and a[${r}].`);
      T.at('rv_call', `Recurse on the inner part: reverseArray(a, ${l + 1}, ${r - 1}).`);
      go(l + 1, r - 1);
      T.ret('rv_call', undefined, `Inner part is reversed; reverseArray(a, ${l}, ${r}) is done.`);
    };
    go(0, a.n - 1);
    T.strip = strip(arr);
    T.finish(`The array is now reversed: ${arr.join(', ')}.`);
    return 'reverseArray';
  },

  isPalindrome(T, a) {
    const digits = String(a.n).split('').map(Number);
    const go = (l: number, r: number): boolean => {
      T.strip = strip(digits, { ptrs: l <= r ? [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: r, color: 'orange' }] : [], hi: l < r ? [l, r] : [] });
      T.enter('pa', `isPalindrome(d, ${l}, ${r})`, `pa(${l},${r})`, `l = ${l}, r = ${r}`, `Call isPalindrome(d, ${l}, ${r}).`);
      if (l >= r) { T.ret('pa_base', true, `l ≥ r → every pair matched. BASE CASE: it is a palindrome → true.`, 'base'); return true; }
      T.at('pa_base', `Is l ≥ r? ${l} < ${r} → still pairs to compare.`);
      if (digits[l] !== digits[r]) { T.ret('pa_diff', false, `d[${l}] = ${digits[l]} ≠ d[${r}] = ${digits[r]} → mismatch, so the answer is false right away.`, 'base'); return false; }
      T.at('pa_diff', `d[${l}] = ${digits[l]} equals d[${r}] = ${digits[r]} → this pair matches.`);
      T.at('pa_rec', `Check the inside: isPalindrome(d, ${l + 1}, ${r - 1}).`);
      const v = go(l + 1, r - 1);
      T.strip = strip(digits, { hi: l < r ? [l, r] : [], ptrs: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: r, color: 'orange' }] });
      T.ret('pa_rec', v, `The inside gave ${v}; this level has nothing to add, so it returns ${v}.`);
      return v;
    };
    const v = go(0, digits.length - 1);
    T.finish(`${a.n} ${v ? 'IS' : 'is NOT'} a palindrome.`);
    return 'isPalindrome';
  },

  binarySearch(T, a) {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72];
    const target = a.target;
    const view = (lo: number, hi: number, mid?: number): CallsStrip => {
      const dim: number[] = [];
      arr.forEach((_, i) => { if (i < lo || i > hi) dim.push(i); });
      const ptrs: CallsStrip['ptrs'] = [];
      if (lo <= hi) { ptrs.push({ name: 'lo', index: lo, color: 'cyan' }, { name: 'hi', index: hi, color: 'orange' }); }
      if (mid !== undefined) ptrs.push({ name: 'mid', index: mid, color: 'purple' });
      return strip(arr, { dim, ptrs, hi: mid !== undefined ? [mid] : [], title: `searching for ${target}` });
    };
    const go = (lo: number, hi: number): number => {
      T.strip = view(lo, hi);
      T.enter('bs', `binarySearch(a, ${lo}, ${hi}, ${target})`, `bs(${lo},${hi})`, `lo = ${lo}, hi = ${hi}`, `Call binarySearch with the range [${lo}..${hi}].`);
      if (lo > hi) { T.ret('bs_base', -1, `lo > hi → the range is empty. BASE CASE: ${target} is not in the array, return -1.`, 'base'); return -1; }
      T.at('bs_base', `Is lo > hi? ${lo} ≤ ${hi} → the range still has elements.`);
      const mid = Math.trunc((lo + hi) / 2);
      T.strip = view(lo, hi, mid);
      T.setVars(`lo = ${lo}, hi = ${hi}, mid = ${mid}`);
      T.at('bs_mid', `mid = (${lo} + ${hi}) / 2 = ${mid}, and a[${mid}] = ${arr[mid]}.`);
      if (arr[mid] === target) { T.ret('bs_found', mid, `a[${mid}] == ${target} → FOUND at index ${mid}. Return it.`, 'base'); return mid; }
      T.at('bs_found', `a[${mid}] = ${arr[mid]} is not ${target}.`);
      if (arr[mid] < target) {
        T.at('bs_cmp', `${arr[mid]} < ${target} → the target must be to the RIGHT. Throw away the left half.`);
        T.at('bs_right', `Recurse on [${mid + 1}..${hi}].`);
        const r = go(mid + 1, hi);
        T.strip = view(lo, hi, mid);
        T.ret('bs_right', r, `Child returned ${r}; pass it up.`);
        return r;
      }
      T.at('bs_cmp', `${arr[mid]} > ${target} → the target must be to the LEFT. Throw away the right half.`);
      T.at('bs_left', `Recurse on [${lo}..${mid - 1}].`);
      const r = go(lo, mid - 1);
      T.strip = view(lo, hi, mid);
      T.ret('bs_left', r, `Child returned ${r}; pass it up.`);
      return r;
    };
    const v = go(0, arr.length - 1);
    T.strip = view(0, -1);
    T.finish(v >= 0 ? `Found ${target} at index ${v} after ${T.calls} call${T.calls === 1 ? '' : 's'} — each call halves the range.` : `${target} is not in the array (${T.calls} calls). Each call halved the range until it was empty.`);
    return 'binarySearch';
  },

  /* ── Tower of Hanoi: the whole solve, driven by the code ── */
  hanoi(T, a) {
    const names = ['A', 'B', 'C'];
    const stacks: number[][] = [Array.from({ length: a.n }, (_, i) => a.n - i), [], []];
    let moves = 0;
    const board = (hiDisk?: number, hiPeg?: number): CallsPegs =>
      ({ stacks: stacks.map(x => [...x]), names, total: a.n, hiDisk, hiPeg });
    T.pegs = board();
    const go = (n: number, from: number, to: number, via: number) => {
      const f = names[from], t = names[to], v = names[via];
      T.enter('hn', `hanoi(${n}, ${f}, ${t}, ${v})`, `${n}:${f}→${t}`, `n = ${n}, from = ${f}, to = ${t}, via = ${v}`,
        `Call hanoi(${n}, ${f}, ${t}, ${v}): move ${n} disk${n === 1 ? '' : 's'} from ${f} to ${t}, using ${v} as the helper peg.`);
      if (n === 0) { T.ret('hn_base', undefined, 'n == 0 → BASE CASE: there are no disks to move, so just return.', 'base'); return; }
      T.at('hn_base', `Is n == 0? ${n} ≠ 0 → there are disks to move.`);
      T.at('hn_first', `Step 1: get the top ${n - 1} disk${n - 1 === 1 ? '' : 's'} out of the way, onto ${v}: hanoi(${n - 1}, ${f}, ${v}, ${t}).`);
      go(n - 1, from, via, to);
      const disk = stacks[from].pop() as number;
      stacks[to].push(disk);
      moves++;
      T.pegs = board(disk, to);
      T.at('hn_move', `Step 2: disk ${disk} is now free — move it from ${f} to ${t}. That is move #${moves}.`, `Move disk ${disk} from ${f} to ${t}`);
      T.pegs = board();
      T.at('hn_second', `Step 3: bring those ${n - 1} disk${n - 1 === 1 ? '' : 's'} from ${v} on top of disk ${disk}: hanoi(${n - 1}, ${v}, ${t}, ${f}).`);
      go(n - 1, via, to, from);
      T.ret('hn_second', undefined, `hanoi(${n}, ${f}, ${t}, ${v}) is complete — ${n} disk${n === 1 ? '' : 's'} moved from ${f} to ${t}.`);
    };
    go(a.n, 0, 2, 1);
    T.pegs = board();
    T.finish(`Solved! All ${a.n} disks are on peg C in ${moves} moves = 2^${a.n} − 1, using ${T.calls} calls. This is the minimum possible.`);
    return 'hanoi';
  },

  /* ── choices & backtracking ── */
  subsets(T, a) {
    const arr = Array.from({ length: a.n }, (_, i) => i + 1);
    const cur: number[] = [];
    const fmt = () => `{${cur.join(',')}}`;
    const go = (i: number) => {
      T.strip = strip(arr, { ptrs: i < arr.length ? [{ name: 'i', index: i, color: 'cyan' }] : [] });
      T.enter('ss', `subsets(a, ${i}, cur)`, fmt(), `i = ${i}, cur = ${fmt()}`, `Call subsets with i = ${i}, cur = ${fmt()}.`);
      if (i === arr.length) {
        T.at('ss_base', `i == ${arr.length} → every element has been decided. This path is one complete subset.`);
        T.at('ss_print', `Print the subset ${fmt()}.`, `{ ${cur.join(' ')}${cur.length ? ' ' : ''}}`);
        T.ret('ss_print', undefined, `Return to the previous decision.`, 'base');
        return;
      }
      T.at('ss_base', `Is i == ${arr.length}? ${i} ≠ ${arr.length} → element ${arr[i]} still needs a decision: take it or skip it.`);
      cur.push(arr[i]);
      T.setVars(`i = ${i}, cur = ${fmt()}`);
      T.at('ss_take', `CHOICE 1 — take ${arr[i]}: cur becomes ${fmt()}.`);
      T.at('ss_inc', `Recurse to decide the next element with ${arr[i]} included.`);
      go(i + 1);
      T.strip = strip(arr, { ptrs: [{ name: 'i', index: i, color: 'cyan' }] });
      cur.pop();
      T.setVars(`i = ${i}, cur = ${fmt()}`);
      T.at('ss_undo', `BACKTRACK — undo the choice: pop ${arr[i]}, cur is ${fmt()} again.`);
      T.at('ss_exc', `CHOICE 2 — skip ${arr[i]}: recurse with it left out.`);
      go(i + 1);
      T.strip = strip(arr, { ptrs: [{ name: 'i', index: i, color: 'cyan' }] });
      T.ret('ss_exc', undefined, `Both choices for element ${arr[i]} are explored; return.`);
    };
    go(0);
    T.finish(`${2 ** a.n} subsets printed — 2 choices for each of ${a.n} elements, so ${T.calls} calls in total.`);
    return 'subsets';
  },

  permute(T, a) {
    const arr = Array.from({ length: a.n }, (_, i) => i + 1);
    const go = (start: number) => {
      T.strip = strip(arr, { ptrs: start < arr.length ? [{ name: 'start', index: start, color: 'cyan' }] : [] });
      T.enter('pe', `permute(a, ${start})`, arr.join(''), `start = ${start}, a = {${arr.join(',')}}`, `Call permute(a, ${start}) with a = {${arr.join(', ')}}.`);
      if (start === arr.length) {
        T.at('pe_base', `start == ${arr.length} → every position is fixed. The array is one complete permutation.`);
        T.at('pe_print', `Print it.`, `{ ${arr.join(' ')} }`);
        T.ret('pe_print', undefined, 'Return to try the next choice.', 'base');
        return;
      }
      T.at('pe_base', `Is start == ${arr.length}? ${start} ≠ ${arr.length} → decide which element goes in position ${start}.`);
      for (let i = start; i < arr.length; i++) {
        T.strip = strip(arr, { hi: [start, i], ptrs: [{ name: 'start', index: start, color: 'cyan' }, { name: 'i', index: i, color: 'orange' }] });
        T.setVars(`start = ${start}, i = ${i}, a = {${arr.join(',')}}`);
        T.at('pe_for', `Loop: try putting a[${i}] = ${arr[i]} into position ${start} (i = ${i}).`);
        [arr[start], arr[i]] = [arr[i], arr[start]];
        T.strip = strip(arr, { hi: [start, i], ptrs: [{ name: 'start', index: start, color: 'cyan' }, { name: 'i', index: i, color: 'orange' }] });
        T.setVars(`start = ${start}, i = ${i}, a = {${arr.join(',')}}`);
        T.at('pe_swap', `Swap a[${start}] and a[${i}] → a = {${arr.join(', ')}}.`);
        T.at('pe_call', `Recurse: arrange positions ${start + 1} onward.`);
        go(start + 1);
        [arr[start], arr[i]] = [arr[i], arr[start]];
        T.strip = strip(arr, { hi: [start, i], ptrs: [{ name: 'start', index: start, color: 'cyan' }, { name: 'i', index: i, color: 'orange' }] });
        T.setVars(`start = ${start}, i = ${i}, a = {${arr.join(',')}}`);
        T.at('pe_undo', `BACKTRACK — swap back so the next iteration starts from the same array: a = {${arr.join(', ')}}.`);
      }
      T.strip = strip(arr, { ptrs: [{ name: 'start', index: start, color: 'cyan' }] });
      T.ret('pe_for', undefined, `The loop has tried every candidate for position ${start}; return.`);
    };
    go(0);
    T.finish(`${fact(a.n)} permutations printed (${a.n}! = ${fact(a.n)}), using ${T.calls} calls.`);
    return 'permute';
  },

  /* ── missing base case ── */
  broken(T, a) {
    const LIMIT = 9;
    for (let n = a.n, d = 1; d <= LIMIT; n--, d++) {
      T.enter('br', `broken(${n})`, `b(${n})`, `n = ${n}`, `Call broken(${n}) — frame #${d} goes on the stack.`);
      T.at('br_rec', d === 1
        ? `There is NO base case, so nothing ever says "stop". broken(${n}) calls broken(${n - 1}) …`
        : `Still no base case → broken(${n}) calls broken(${n - 1}), pushing yet another frame.`);
    }
    T.overflow = true;
    T.at('br_rec', `💥 STACK OVERFLOW — the call stack has a fixed size, and recursion with no base case never stops pushing frames. A real program crashes here (segmentation fault).`);
    return 'broken';
  },
};

function fact(n: number): number { return n <= 1 ? 1 : n * fact(n - 1); }
function fibCalls(n: number): number { return n <= 1 ? 1 : 1 + fibCalls(n - 1) + fibCalls(n - 2); }

/* ───────────────────────────── lab definition ───────────────────────────── */
const emptySnap = (): CallsSnap => ({ kind: 'calls', stack: [], tree: [], activeId: null, calls: 0, maxDepth: 0 });

type OpDef = { id: string; label: string; sig: string; params: { name: string; label: string; def: number; min: number; max: number }[]; big: string };
const OP_DEFS: OpDef[] = [
  { id: 'factorial', label: 'Factorial', sig: 'int factorial(int n)', params: [{ name: 'n', label: 'n (1–8)', def: 4, min: 1, max: 8 }], big: 'O(n)' },
  { id: 'sumTo', label: 'Sum of 1..n', sig: 'int sumTo(int n)', params: [{ name: 'n', label: 'n (1–8)', def: 5, min: 1, max: 8 }], big: 'O(n)' },
  { id: 'printDown', label: 'Print n down to 1 (print before call)', sig: 'void printDown(int n)', params: [{ name: 'n', label: 'n (1–8)', def: 4, min: 1, max: 8 }], big: 'O(n)' },
  { id: 'printUp', label: 'Print 1 up to n (print after call)', sig: 'void printUp(int n)', params: [{ name: 'n', label: 'n (1–8)', def: 4, min: 1, max: 8 }], big: 'O(n)' },
  { id: 'sumDigits', label: 'Sum of digits', sig: 'int sumDigits(int n)', params: [{ name: 'n', label: 'n (0–999999)', def: 472, min: 0, max: 999999 }], big: 'O(log n)' },
  { id: 'toBinary', label: 'Decimal → binary', sig: 'void toBinary(int n)', params: [{ name: 'n', label: 'n (1–255)', def: 13, min: 1, max: 255 }], big: 'O(log n)' },
  { id: 'gcd', label: 'GCD (Euclid)', sig: 'int gcd(int a, int b)', params: [{ name: 'a', label: 'a', def: 48, min: 1, max: 9999 }, { name: 'b', label: 'b', def: 18, min: 0, max: 9999 }], big: 'O(log min(a,b))' },
  { id: 'power', label: 'Power — one multiply per step', sig: 'int power(int a, int b)', params: [{ name: 'a', label: 'a (1–9)', def: 2, min: 1, max: 9 }, { name: 'b', label: 'b (0–8)', def: 5, min: 0, max: 8 }], big: 'O(b)' },
  { id: 'fastPower', label: 'Fast power — halve the exponent', sig: 'int fastPower(int a, int b)', params: [{ name: 'a', label: 'a (1–5)', def: 2, min: 1, max: 5 }, { name: 'b', label: 'b (0–12)', def: 10, min: 0, max: 12 }], big: 'O(log b)' },
  { id: 'fib', label: 'Fibonacci — plain (two calls per level)', sig: 'int fib(int n)', params: [{ name: 'n', label: 'n (0–7)', def: 5, min: 0, max: 7 }], big: 'O(2ⁿ)' },
  { id: 'fibMemo', label: 'Fibonacci — with memoisation', sig: 'int fibMemo(int n, vector<int>& memo)', params: [{ name: 'n', label: 'n (0–10)', def: 6, min: 0, max: 10 }], big: 'O(n)' },
  { id: 'sumArray', label: 'Sum of an array [3,1,4,1,5,9]', sig: 'int sumArray(vector<int>& a, int i)', params: [], big: 'O(n)' },
  { id: 'findMax', label: 'Maximum of an array [3,8,2,9,4,7]', sig: 'int findMax(vector<int>& a, int i)', params: [], big: 'O(n)' },
  { id: 'reverseArray', label: 'Reverse an array (two ends)', sig: 'void reverseArray(vector<int>& a, int l, int r)', params: [{ name: 'n', label: 'size (2–8)', def: 6, min: 2, max: 8 }], big: 'O(n)' },
  { id: 'isPalindrome', label: 'Palindrome check (digits of a number)', sig: 'bool isPalindrome(vector<int>& d, int l, int r)', params: [{ name: 'n', label: 'number', def: 12321, min: 0, max: 999999999 }], big: 'O(n)' },
  { id: 'binarySearch', label: 'Binary search [2,5,8,12,16,23,38,56,72]', sig: 'int binarySearch(vector<int>& a, int lo, int hi, int target)', params: [{ name: 'target', label: 'target', def: 23, min: -999, max: 999 }], big: 'O(log n)' },
  { id: 'hanoi', label: '🗼 Tower of Hanoi — full solve', sig: 'void hanoi(int n, char from, char to, char via)', params: [{ name: 'n', label: 'disks (1–5)', def: 3, min: 1, max: 5 }], big: 'O(2ⁿ)' },
  { id: 'subsets', label: 'All subsets (take / skip choices)', sig: 'void subsets(vector<int>& a, int i, vector<int>& cur)', params: [{ name: 'n', label: 'n (1–4)', def: 3, min: 1, max: 4 }], big: 'O(2ⁿ)' },
  { id: 'permute', label: 'All permutations (swap & backtrack)', sig: 'void permute(vector<int>& a, int start)', params: [{ name: 'n', label: 'n (1–3)', def: 3, min: 1, max: 3 }], big: 'O(n · n!)' },
  { id: 'broken', label: '💥 No base case → stack overflow', sig: 'int broken(int n)', params: [{ name: 'n', label: 'n', def: 3, min: -99, max: 99 }], big: 'never ends' },
];

export const recursionLab: Lab = {
  id: 'recursion',
  title: 'Recursion',
  icon: '🔁',
  className: 'Recursion',
  blurb: 'One class, every classic recursive function. Run any of them and watch the call stack grow and unwind, the recursion tree fill in, and each return value flow back up. (N-Queens has its own page.)',
  code: rec.code,
  marks: rec.marks,
  ops: OP_DEFS.map(o => ({ id: o.id, label: o.label, sig: o.sig, params: o.params.map(p => ({ name: p.name, label: p.label, def: p.def })), big: o.big })),
  init: () => ({ runs: 0 }),
  snapshot: () => emptySnap(),
  run: (st: { runs: number }, opId: string, args: Record<string, number>): LabStep[] => {
    const def = OP_DEFS.find(o => o.id === opId);
    const fn = OPS[opId];
    if (!def || !fn) return [];
    const safe: Args = {};
    for (const p of def.params) safe[p.name] = clamp(Number.isFinite(args[p.name]) ? args[p.name] : p.def, p.min, p.max);
    const T = new Tracer();
    fn(T, safe);
    st.runs++;
    return T.steps;
  },
};
