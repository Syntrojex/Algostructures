import { parseCode, stepper, type ArraySnap, type Lab, type LabStep } from './core';

/* ══════════════════════════════════════════════════════════════════════════
   STACK — array backed, single `top` index
   ══════════════════════════════════════════════════════════════════════════ */
const stk = parseCode(`
class Stack
{
private:
	int* arr;
	int top;
	int capacity;

public:
	Stack(int capacity)
	{
		this->capacity = capacity;
		arr = new int[capacity];
		top = -1;
	}

	bool isEmpty() /*@empty*/
	{
		return top == -1;
	}

	bool isFull() /*@full*/
	{
		return top == capacity - 1;
	}

	// Push
	void push(int value) /*@push*/
	{
		if (isFull()) /*@push_check*/
		{
			cout << "Stack Overflow!" << endl; /*@push_over*/
			return;
		}

		top++; /*@push_top*/
		arr[top] = value; /*@push_set*/
	}

	// Pop
	int pop() /*@pop*/
	{
		if (isEmpty()) /*@pop_check*/
		{
			cout << "Stack Underflow!" << endl; /*@pop_under*/
			return -1;
		}

		int value = arr[top]; /*@pop_read*/
		top--; /*@pop_top*/

		return value; /*@pop_ret*/
	}

	// Peek
	int peek() /*@peek*/
	{
		if (isEmpty()) /*@peek_check*/
		{
			cout << "Stack is Empty!" << endl; /*@peek_empty*/
			return -1;
		}

		return arr[top]; /*@peek_ret*/
	}

	int getSize() /*@size*/
	{
		return top + 1;
	}

	// Insert at Start (bottom of the stack — shifts every element up)
	void insertAtStart(int value) /*@is*/
	{
		if (isFull()) /*@is_check*/
		{
			cout << "Stack Overflow!" << endl; /*@is_over*/
			return;
		}

		for (int i = top; i >= 0; i--) /*@is_shift*/
		{
			arr[i + 1] = arr[i];
		}

		arr[0] = value; /*@is_set*/
		top++; /*@is_top*/
	}

	// Insert at End — identical to push(), the stack's natural insertion point
	void insertAtEnd(int value) /*@ie*/
	{
		push(value); /*@ie_call*/
	}

	// Insert at Position (counted from the BOTTOM, 0 = bottom)
	void insertAtPosition(int value, int pos) /*@ip*/
	{
		if (isFull()) /*@ip_check*/
		{
			cout << "Stack Overflow!" << endl; /*@ip_over*/
			return;
		}

		if (pos < 0 || pos > top + 1) /*@ip_range*/
		{
			cout << "Invalid Position!" << endl; /*@ip_bad*/
			return;
		}

		for (int i = top; i >= pos; i--) /*@ip_shift*/
		{
			arr[i + 1] = arr[i];
		}

		arr[pos] = value; /*@ip_set*/
		top++; /*@ip_top*/
	}

	// Remove from Start (bottom — shifts every element down)
	int removeAtStart() /*@rs*/
	{
		if (isEmpty()) /*@rs_check*/
		{
			cout << "Stack Underflow!" << endl; /*@rs_under*/
			return -1;
		}

		int value = arr[0]; /*@rs_read*/

		for (int i = 0; i < top; i++) /*@rs_shift*/
		{
			arr[i] = arr[i + 1];
		}

		top--; /*@rs_top*/

		return value; /*@rs_ret*/
	}

	// Remove from End — identical to pop()
	int removeAtEnd() /*@re*/
	{
		return pop(); /*@re_call*/
	}

	// Remove at Position (counted from the bottom)
	int removeAtPosition(int pos) /*@rp*/
	{
		if (pos < 0 || pos > top) /*@rp_check*/
		{
			cout << "Invalid Position!" << endl; /*@rp_bad*/
			return -1;
		}

		int value = arr[pos]; /*@rp_read*/

		for (int i = pos; i < top; i++) /*@rp_shift*/
		{
			arr[i] = arr[i + 1];
		}

		top--; /*@rp_top*/

		return value; /*@rp_ret*/
	}

	// Update at Start (bottom)
	void updateAtStart(int value) /*@ust*/
	{
		if (isEmpty()) /*@ust_check*/
		{
			cout << "Stack is Empty!" << endl; /*@ust_msg*/
			return;
		}

		arr[0] = value; /*@ust_set*/
	}

	// Update at Position
	void updateAtPosition(int pos, int value) /*@up*/
	{
		if (pos < 0 || pos > top) /*@up_check*/
		{
			cout << "Invalid Position!" << endl; /*@up_bad*/
			return;
		}

		arr[pos] = value; /*@up_set*/
	}

	// Update at End (top)
	void updateAtEnd(int value) /*@uen*/
	{
		if (isEmpty()) /*@uen_check*/
		{
			cout << "Stack is Empty!" << endl; /*@uen_msg*/
			return;
		}

		arr[top] = value; /*@uen_set*/
	}

	// Traverse (bottom to top)
	void traverse() /*@tv*/
	{

		for (int i = 0; i <= top; i++) /*@tv_loop*/
		{
			cout << arr[i] << " "; /*@tv_print*/
		}

		cout << endl; /*@tv_done*/
	}

	// Search (distance from the TOP; 0 = top itself, -1 = not found)
	int search(int value) /*@se*/
	{
		for (int i = top; i >= 0; i--) /*@se_loop*/
		{
			if (arr[i] == value) /*@se_hit*/
			{
				return top - i; /*@se_found*/
			}
		}

		return -1; /*@se_miss*/
	}

	// Reverse a range [start, end] of the backing array
	void reverseRange(int start, int end) /*@rev*/
	{
		while (start < end) /*@rev_while*/
		{
			int t = arr[start]; /*@rev_swap*/
			arr[start] = arr[end];
			arr[end] = t;
			start++;
			end--; /*@rev_move*/
		}
	}

	// Reverse in blocks of k
	void reverseByK(int k) /*@revk*/
	{
		int n = top + 1; /*@revk_n*/

		for (int start = 0; start < n; start += k) /*@revk_loop*/
		{
			int end = start + k - 1; /*@revk_end*/

			if (end >= n) /*@revk_clamp*/
			{
				end = n - 1;
			}

			reverseRange(start, end); /*@revk_call*/
		}
	}

	// Rotate Left by k (three-reversal trick, same as the Array class)
	void rotateLeft(int k) /*@rotl*/
	{
		int n = top + 1; /*@rotl_n*/

		if (n <= 1) return;

		k = k % n; /*@rotl_k*/

		reverseRange(0, k - 1); /*@rotl_1*/
		reverseRange(k, n - 1); /*@rotl_2*/
		reverseRange(0, n - 1); /*@rotl_3*/
	}

	// Rotate Right by k
	void rotateRight(int k) /*@rotr*/
	{
		int n = top + 1; /*@rotr_n*/

		if (n <= 1) return;

		k = k % n; /*@rotr_k*/

		reverseRange(0, n - 1); /*@rotr_1*/
		reverseRange(0, k - 1); /*@rotr_2*/
		reverseRange(k, n - 1); /*@rotr_3*/
	}

	// Sort Ascending (bubble sort, bottom to top)
	void sortAscending() /*@sasc*/
	{
		for (int i = 0; i < top; i++) /*@sasc_outer*/
		{
			for (int j = 0; j < top - i; j++) /*@sasc_inner*/
			{
				if (arr[j] > arr[j + 1]) /*@sasc_cmp*/
				{
					int t = arr[j]; /*@sasc_swap*/
					arr[j] = arr[j + 1];
					arr[j + 1] = t;
				}
			}
		}
	}

	// Sort Descending
	void sortDescending() /*@sdesc*/
	{
		for (int i = 0; i < top; i++) /*@sdesc_outer*/
		{
			for (int j = 0; j < top - i; j++) /*@sdesc_inner*/
			{
				if (arr[j] < arr[j + 1]) /*@sdesc_cmp*/
				{
					int t = arr[j]; /*@sdesc_swap*/
					arr[j] = arr[j + 1];
					arr[j + 1] = t;
				}
			}
		}
	}

	// Remove Duplicates (keeps first occurrence from the bottom)
	void removeDuplicates() /*@dedup*/
	{
		int newTop = -1; /*@dedup_init*/

		for (int i = 0; i <= top; i++) /*@dedup_outer*/
		{
			bool duplicate = false; /*@dedup_flag*/

			for (int j = 0; j <= newTop; j++) /*@dedup_inner*/
			{
				if (arr[j] == arr[i]) /*@dedup_cmp*/
				{
					duplicate = true; /*@dedup_mark*/
					break;
				}
			}

			if (!duplicate) /*@dedup_check*/
			{
				newTop++;
				arr[newTop] = arr[i]; /*@dedup_keep*/
			}
		}

		top = newTop; /*@dedup_top*/
	}

	// Frequency Count
	void frequencyCount() /*@freq*/
	{
		bool counted[64] = { false }; /*@freq_init*/

		for (int i = 0; i <= top; i++) /*@freq_outer*/
		{
			if (counted[i]) /*@freq_skip*/
			{
				continue;
			}

			int count = 1; /*@freq_start*/

			for (int j = i + 1; j <= top; j++) /*@freq_inner*/
			{
				if (arr[j] == arr[i]) /*@freq_cmp*/
				{
					count++; /*@freq_bump*/
					counted[j] = true;
				}
			}

			cout << arr[i] << " -> " << count << endl; /*@freq_print*/
		}
	}

	// Display (top to bottom)
	void display() /*@disp*/
	{
		if (isEmpty()) /*@disp_check*/
		{
			cout << "Stack is Empty!" << endl; /*@disp_empty*/
			return;
		}

		for (int i = top; i >= 0; i--) /*@disp_loop*/
		{
			cout << arr[i] << " ";
		}

		cout << endl; /*@disp_end*/
	}

	~Stack()
	{
		delete[] arr;
		arr = nullptr;
	}
};
`);

interface StkState { arr: (number | null)[]; top: number; capacity: number; }

const stkSnap = (st: StkState): ArraySnap => ({
  kind: 'array',
  cells: st.arr.slice(),
  size: st.top + 1,
  capacity: st.capacity,
  hi: [], hi2: [], layout: 'stack',
  ptrs: [{ name: 'top', index: st.top, color: 'purple' }],
});

function runStk(st: StkState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(stk.marks, () => stkSnap(st));
  const M = (p: Partial<ArraySnap>) => p as Partial<ArraySnap>;

  switch (opId) {
    case 'push': {
      const v = a.value;
      S('push', `Called push(${v}).`);
      S('push_check', `isFull(): top (${st.top}) == capacity - 1 (${st.capacity - 1}) → ${st.top === st.capacity - 1 ? 'true' : 'false'}.`);
      if (st.top === st.capacity - 1) { S('push_over', 'Fixed-size stack is full — this is overflow.', undefined, 'Stack Overflow!'); break; }
      st.top++;
      S('push_top', `top++ → ${st.top}. The index moves up FIRST, then the write happens.`, M({ hi: [st.top] }));
      st.arr[st.top] = v;
      S('push_set', `arr[${st.top}] = ${v}. Only one index changed — no shifting, no searching. O(1).`, M({ hi: [st.top] }));
      break;
    }
    case 'pop': {
      S('pop', 'Called pop().');
      S('pop_check', `isEmpty(): top == -1 → ${st.top === -1 ? 'true' : 'false'}.`);
      if (st.top === -1) { S('pop_under', 'Nothing on the stack — underflow.', undefined, 'Stack Underflow!'); break; }
      const v = st.arr[st.top];
      S('pop_read', `int value = arr[${st.top}] → read ${v} while it is still inside the live region.`, M({ hi: [st.top] }));
      st.top--;
      S('pop_top', `top-- → ${st.top}. The value is still physically sitting in memory at index ${st.top + 1}; it is simply no longer reachable, and the next push will overwrite it.`, M({ hi2: [st.top + 1] }));
      S('pop_ret', `return ${v}. LIFO: the last thing pushed is the first thing out.`, M({ hi2: [st.top + 1] }), `pop() returned ${v}`);
      break;
    }
    case 'peek': {
      S('peek', 'Called peek().');
      S('peek_check', `isEmpty() → ${st.top === -1 ? 'true' : 'false'}.`);
      if (st.top === -1) { S('peek_empty', 'Nothing to look at.', undefined, 'Stack is Empty!'); break; }
      S('peek_ret', `return arr[${st.top}] → ${st.arr[st.top]}. peek reads the top WITHOUT moving it — that is the whole difference from pop().`, M({ hi: [st.top] }), `peek() returned ${st.arr[st.top]}`);
      break;
    }
    case 'getSize': {
      S('size', `return top + 1 → ${st.top} + 1 = ${st.top + 1}. The size is derived from top, never stored separately.`, undefined, `getSize() returned ${st.top + 1}`);
      break;
    }

    case 'insertAtStart': {
      const v = a.value;
      S('is', `Called insertAtStart(${v}). A stack has no native "insert at the bottom" — this reaches into the backing array directly.`);
      S('is_check', `isFull() → ${st.top === st.capacity - 1 ? 'true' : 'false'}.`);
      if (st.top === st.capacity - 1) { S('is_over', 'Full.', undefined, 'Stack Overflow!'); break; }
      for (let i = st.top; i >= 0; i--) {
        st.arr[i + 1] = st.arr[i];
        S('is_shift', `arr[${i + 1}] = arr[${i}] (${st.arr[i]}) — shifting every existing element up by one slot to make room at index 0.`, M({ hi: [i, i + 1] }));
      }
      st.arr[0] = v;
      S('is_set', `arr[0] = ${v}.`, M({ hi: [0] }));
      st.top++;
      S('is_top', `top++ → ${st.top}.`, M({ hi: [0] }));
      break;
    }

    case 'insertAtEnd': {
      const v = a.value;
      S('ie', `Called insertAtEnd(${v}).`);
      S('ie_call', 'insertAtEnd delegates straight to push() — the top of the stack already IS "the end".');
      if (st.top === st.capacity - 1) { S('push_over', 'Full.', undefined, 'Stack Overflow!'); break; }
      st.top++;
      st.arr[st.top] = v;
      S('push_set', `push(${v}) → arr[${st.top}] = ${v}, top = ${st.top}.`, M({ hi: [st.top] }));
      break;
    }

    case 'insertAtPosition': {
      const v = a.value, pos = a.pos;
      S('ip', `Called insertAtPosition(${v}, ${pos}) — position counted from the bottom (0 = bottom).`);
      S('ip_check', `isFull() → ${st.top === st.capacity - 1 ? 'true' : 'false'}.`);
      if (st.top === st.capacity - 1) { S('ip_over', 'Full.', undefined, 'Stack Overflow!'); break; }
      S('ip_range', `Guard: ${pos} < 0 || ${pos} > ${st.top + 1} → ${pos < 0 || pos > st.top + 1 ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos > st.top + 1) { S('ip_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      for (let i = st.top; i >= pos; i--) {
        st.arr[i + 1] = st.arr[i];
        S('ip_shift', `arr[${i + 1}] = arr[${i}] — sliding everything from position ${pos} upward.`, M({ hi: [i, i + 1] }));
      }
      st.arr[pos] = v;
      S('ip_set', `arr[${pos}] = ${v}.`, M({ hi: [pos] }));
      st.top++;
      S('ip_top', `top++ → ${st.top}.`);
      break;
    }

    case 'removeAtStart': {
      S('rs', 'Called removeAtStart() — removes the bottom element, shifting everything else down.');
      S('rs_check', `isEmpty() → ${st.top === -1 ? 'true' : 'false'}.`);
      if (st.top === -1) { S('rs_under', 'Empty.', undefined, 'Stack Underflow!'); break; }
      const v = st.arr[0];
      S('rs_read', `int value = arr[0] → ${v}.`, M({ hi: [0] }));
      for (let i = 0; i < st.top; i++) {
        st.arr[i] = st.arr[i + 1];
        S('rs_shift', `arr[${i}] = arr[${i + 1}] (${st.arr[i]}) — sliding everything down to close the gap.`, M({ hi: [i, i + 1] }));
      }
      st.top--;
      S('rs_top', `top-- → ${st.top}.`);
      S('rs_ret', `return ${v}.`, undefined, `removeAtStart() returned ${v}`);
      break;
    }

    case 'removeAtEnd': {
      S('re', 'Called removeAtEnd().');
      S('re_call', 'removeAtEnd delegates straight to pop().');
      if (st.top === -1) { S('pop_under', 'Empty.', undefined, 'Stack Underflow!'); break; }
      const v = st.arr[st.top];
      S('pop_read', `pop() → int value = arr[${st.top}] = ${v}.`, M({ hi: [st.top] }));
      st.top--;
      S('pop_top', `top-- → ${st.top}.`);
      S('pop_ret', `return ${v}.`, undefined, `removeAtEnd() returned ${v}`);
      break;
    }

    case 'removeAtPosition': {
      const pos = a.pos;
      S('rp', `Called removeAtPosition(${pos}).`);
      S('rp_check', `Guard: ${pos} < 0 || ${pos} > ${st.top} → ${pos < 0 || pos > st.top ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos > st.top) { S('rp_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      const v = st.arr[pos];
      S('rp_read', `int value = arr[${pos}] → ${v}.`, M({ hi: [pos] }));
      for (let i = pos; i < st.top; i++) {
        st.arr[i] = st.arr[i + 1];
        S('rp_shift', `arr[${i}] = arr[${i + 1}].`, M({ hi: [i, i + 1] }));
      }
      st.top--;
      S('rp_top', `top-- → ${st.top}.`);
      S('rp_ret', `return ${v}.`, undefined, `removeAtPosition(${pos}) returned ${v}`);
      break;
    }

    case 'updateAtStart': {
      S('ust', `Called updateAtStart(${a.value}).`);
      S('ust_check', `isEmpty() → ${st.top === -1 ? 'true' : 'false'}.`);
      if (st.top === -1) { S('ust_msg', 'Empty.', undefined, 'Stack is Empty!'); break; }
      st.arr[0] = a.value;
      S('ust_set', `arr[0] = ${a.value}.`, M({ hi: [0] }));
      break;
    }

    case 'updateAtPosition': {
      const pos = a.pos, v = a.value;
      S('up', `Called updateAtPosition(${pos}, ${v}).`);
      S('up_check', `Guard: ${pos} < 0 || ${pos} > ${st.top} → ${pos < 0 || pos > st.top ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos > st.top) { S('up_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      st.arr[pos] = v;
      S('up_set', `arr[${pos}] = ${v}.`, M({ hi: [pos] }));
      break;
    }

    case 'updateAtEnd': {
      S('uen', `Called updateAtEnd(${a.value}).`);
      S('uen_check', `isEmpty() → ${st.top === -1 ? 'true' : 'false'}.`);
      if (st.top === -1) { S('uen_msg', 'Empty.', undefined, 'Stack is Empty!'); break; }
      st.arr[st.top] = a.value;
      S('uen_set', `arr[top] = ${a.value}.`, M({ hi: [st.top] }));
      break;
    }

    case 'traverse': {
      S('tv', 'Called traverse() — bottom to top.');
      for (let i = 0; i <= st.top; i++) {
        S('tv_loop', `i = ${i}.`, M({ hi: [i] }));
        S('tv_print', `cout << arr[${i}] → printed ${st.arr[i]}.`, M({ hi: [i] }), `${st.arr[i]}`);
      }
      S('tv_done', 'Every slot from 0 to top visited.');
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}) — scanning from the TOP down, since that is the direction a stack "sees" first.`);
      let found = -1;
      for (let i = st.top; i >= 0; i--) {
        S('se_loop', `i = ${i}, arr[${i}] = ${st.arr[i]}.`, M({ hi: [i] }));
        S('se_hit', `arr[${i}] == ${v} → ${st.arr[i] === v ? 'true' : 'false'}.`);
        if (st.arr[i] === v) { found = st.top - i; S('se_found', `Found ${st.top - i} step(s) down from the top.`, M({ hi: [i] }), `search(${v}) returned ${found}`); break; }
      }
      if (found === -1) S('se_miss', 'Not found anywhere in the stack.', undefined, `search(${v}) returned -1`);
      break;
    }

    case 'sortAscending':
    case 'sortDescending': {
      const asc = opId === 'sortAscending';
      const [mOuter, mInner, mCmp, mSwap] = asc
        ? ['sasc_outer', 'sasc_inner', 'sasc_cmp', 'sasc_swap']
        : ['sdesc_outer', 'sdesc_inner', 'sdesc_cmp', 'sdesc_swap'];
      S(asc ? 'sasc' : 'sdesc', `Called sort${asc ? 'Ascending' : 'Descending'}() — bubble sort on the backing array, bottom to top.`);
      for (let i = 0; i < st.top; i++) {
        S(mOuter, `Pass ${i + 1}.`);
        for (let j = 0; j < st.top - i; j++) {
          S(mInner, `Comparing arr[${j}]=${st.arr[j]} and arr[${j + 1}]=${st.arr[j + 1]}.`, M({ hi: [j, j + 1] }));
          const swap = asc ? (st.arr[j] as number) > (st.arr[j + 1] as number) : (st.arr[j] as number) < (st.arr[j + 1] as number);
          S(mCmp, `→ ${swap}.`);
          if (swap) { const t = st.arr[j]; st.arr[j] = st.arr[j + 1]; st.arr[j + 1] = t; S(mSwap, `Swapped.`, M({ hi: [j, j + 1] })); }
        }
      }
      break;
    }

    case 'reverseByK': {
      const k = Math.max(1, a.k);
      const n = st.top + 1;
      S('revk', `Called reverseByK(${k}).`);
      S('revk_n', `n = top + 1 = ${n}.`);
      const doReverse = (start: number, end: number) => {
        S('rev', `reverseRange(${start}, ${end}).`);
        while (start < end) {
          S('rev_while', `start (${start}) < end (${end}) → true.`, M({ hi: [start, end] }));
          const t = st.arr[start]; st.arr[start] = st.arr[end]; st.arr[end] = t;
          S('rev_swap', `Swapped arr[${start}] and arr[${end}].`, M({ hi: [start, end] }));
          start++; end--;
          S('rev_move', `start++, end-- → ${start}, ${end}.`);
        }
      };
      for (let start = 0; start < n; start += k) {
        let end = start + k - 1;
        S('revk_loop', `Block at ${start}.`, M({ hi: [start] }));
        if (end >= n) { end = n - 1; S('revk_clamp', `Clamped end to ${end} (final short block).`); }
        S('revk_end', `end = ${start + k - 1}.`);
        doReverse(start, end);
      }
      break;
    }

    case 'rotateLeft':
    case 'rotateRight': {
      const isLeft = opId === 'rotateLeft';
      const n = st.top + 1;
      S(isLeft ? 'rotl' : 'rotr', `Called ${isLeft ? 'rotateLeft' : 'rotateRight'}(${a.k}).`);
      S(isLeft ? 'rotl_n' : 'rotr_n', `n = top + 1 = ${n}.`);
      if (n <= 1) break;
      const k = ((a.k % n) + n) % n;
      S(isLeft ? 'rotl_k' : 'rotr_k', `k = ${a.k} % ${n} = ${k}.`);
      const doReverse = (start: number, end: number) => {
        while (start < end) { const t = st.arr[start]; st.arr[start] = st.arr[end]; st.arr[end] = t; start++; end--; }
      };
      if (isLeft) {
        doReverse(0, k - 1); S('rotl_1', `reverseRange(0, ${k - 1}) — reverse the block moving to the back.`, M({ hi: Array.from({ length: k }, (_, i) => i) }));
        doReverse(k, n - 1); S('rotl_2', `reverseRange(${k}, ${n - 1}) — reverse the rest.`);
        doReverse(0, n - 1); S('rotl_3', `reverseRange(0, ${n - 1}) — reverse everything to lock it in.`);
      } else {
        doReverse(0, n - 1); S('rotr_1', `reverseRange(0, ${n - 1}) — reverse everything.`);
        doReverse(0, k - 1); S('rotr_2', `reverseRange(0, ${k - 1}) — un-reverse the wrapped block.`);
        doReverse(k, n - 1); S('rotr_3', `reverseRange(${k}, ${n - 1}) — un-reverse the rest.`);
      }
      break;
    }

    case 'removeDuplicates': {
      S('dedup', 'Called removeDuplicates() — keeps the first occurrence from the bottom.');
      S('dedup_init', 'newTop = -1.');
      let newTop = -1;
      for (let i = 0; i <= st.top; i++) {
        S('dedup_outer', `i = ${i}, arr[${i}] = ${st.arr[i]}.`, M({ hi: [i] }));
        let dup = false;
        S('dedup_flag', 'duplicate = false.');
        for (let j = 0; j <= newTop; j++) {
          S('dedup_inner', `Checking against arr[${j}] = ${st.arr[j]}.`, M({ hi: [i], hi2: [j] }));
          S('dedup_cmp', `→ ${st.arr[j] === st.arr[i]}.`);
          if (st.arr[j] === st.arr[i]) { dup = true; S('dedup_mark', 'duplicate = true, break.'); break; }
        }
        if (!dup) { newTop++; st.arr[newTop] = st.arr[i]; S('dedup_keep', `arr[${newTop}] = ${st.arr[i]} — kept.`, M({ hi: [newTop] })); }
      }
      st.top = newTop;
      S('dedup_top', `top = newTop = ${newTop}.`);
      break;
    }

    case 'frequencyCount': {
      S('freq', 'Called frequencyCount().');
      const counted = new Array(st.top + 1).fill(false);
      for (let i = 0; i <= st.top; i++) {
        S('freq_outer', `i = ${i}, arr[${i}] = ${st.arr[i]}.`, M({ hi: [i] }));
        S('freq_skip', `counted[${i}] → ${counted[i]}.`);
        if (counted[i]) continue;
        let count = 1;
        S('freq_start', 'count = 1.');
        for (let j = i + 1; j <= st.top; j++) {
          const eq = st.arr[j] === st.arr[i];
          S('freq_inner', `Comparing arr[${j}] = ${st.arr[j]}.`, M({ hi: [i], hi2: [j] }));
          S('freq_cmp', `→ ${eq}.`);
          if (eq) { count++; counted[j] = true; S('freq_bump', `count++ → ${count}.`); }
        }
        S('freq_print', `arr[${i}] occurs ${count} time(s).`, undefined, `${st.arr[i]} -> ${count}`);
      }
      break;
    }

    case 'display': {
      S('disp', 'Called display().');

      S('disp_check', `isEmpty() → ${st.top === -1 ? 'true' : 'false'}.`);
      if (st.top === -1) { S('disp_empty', 'Nothing to print.', undefined, 'Stack is Empty!'); break; }
      let line = '';
      for (let i = st.top; i >= 0; i--) {
        line += `${st.arr[i]} `;
        S('disp_loop', `i = ${i} → printed ${st.arr[i]}. The loop counts DOWN from top, so the output reads top-to-bottom.`, M({ hi: [i] }));
      }
      S('disp_end', 'Loop finished at i = -1.', undefined, line.trim());
      break;
    }
  }
  return steps;
}

export const stackLab: Lab = {
  id: 'stack',
  title: 'Stack Class (array based)',
  icon: '🥞',
  className: 'Stack',
  blurb: 'One integer — top — is the entire bookkeeping for a stack. Watch it move before the write on push and after the read on pop, and watch popped values linger in memory until overwritten.',
  code: stk.code,
  marks: stk.marks,
  ops: [
    { id: 'push', label: 'Push', sig: 'void push(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(1)' },
    { id: 'pop', label: 'Pop', sig: 'int pop()', params: [], big: 'O(1)' },
    { id: 'peek', label: 'Peek', sig: 'int peek()', params: [], big: 'O(1)' },
    { id: 'getSize', label: 'Get size', sig: 'int getSize()', params: [], big: 'O(1)' },
    { id: 'insertAtStart', label: 'Insert at start', sig: 'void insertAtStart(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(n)' },
    { id: 'insertAtEnd', label: 'Insert at end (= push)', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(1)' },
    { id: 'insertAtPosition', label: 'Insert at position', sig: 'void insertAtPosition(int value, int pos)', params: [{ name: 'value', label: 'value', def: 99 }, { name: 'pos', label: 'pos (from bottom)', def: 1 }], big: 'O(n)' },
    { id: 'removeAtStart', label: 'Remove from start', sig: 'int removeAtStart()', params: [], big: 'O(n)' },
    { id: 'removeAtEnd', label: 'Remove from end (= pop)', sig: 'int removeAtEnd()', params: [], big: 'O(1)' },
    { id: 'removeAtPosition', label: 'Remove at position', sig: 'int removeAtPosition(int pos)', params: [{ name: 'pos', label: 'pos (from bottom)', def: 1 }], big: 'O(n)' },
    { id: 'updateAtStart', label: 'Update at start', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 111 }], big: 'O(1)' },
    { id: 'updateAtPosition', label: 'Update at position', sig: 'void updateAtPosition(int pos, int value)', params: [{ name: 'pos', label: 'pos (from bottom)', def: 1 }, { name: 'value', label: 'value', def: 77 }], big: 'O(1)' },
    { id: 'updateAtEnd', label: 'Update at end', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 222 }], big: 'O(1)' },
    { id: 'traverse', label: 'Traverse', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 20 }], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n²)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n²)' },
    { id: 'reverseByK', label: 'Reverse by k', sig: 'void reverseByK(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateLeft', label: 'Rotate left by k', sig: 'void rotateLeft(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'rotateRight', label: 'Rotate right by k', sig: 'void rotateRight(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'removeDuplicates', label: 'Remove duplicates', sig: 'void removeDuplicates()', params: [], big: 'O(n²)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'display', label: 'Display', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: (): StkState => ({ arr: [10, 20, 30, null, null, null], top: 2, capacity: 6 }),
  snapshot: stkSnap,
  run: runStk,
};

/* ══════════════════════════════════════════════════════════════════════════
   QUEUE — circular array, front / rear / count
   ══════════════════════════════════════════════════════════════════════════ */
const que = parseCode(`
class Queue
{
private:
	int* arr;
	int front;
	int rear;
	int count;
	int capacity;

public:
	Queue(int capacity)
	{
		this->capacity = capacity;
		arr = new int[capacity];
		front = 0;
		rear = -1;
		count = 0;
	}

	bool isEmpty() /*@empty*/
	{
		return count == 0;
	}

	bool isFull() /*@full*/
	{
		return count == capacity;
	}

	// Enqueue (insert at rear)
	void enqueue(int value) /*@enq*/
	{
		if (isFull()) /*@enq_check*/
		{
			cout << "Queue Overflow!" << endl; /*@enq_over*/
			return;
		}

		rear = (rear + 1) % capacity; /*@enq_rear*/
		arr[rear] = value; /*@enq_set*/

		count++; /*@enq_count*/
	}

	// Dequeue (remove from front)
	int dequeue() /*@deq*/
	{
		if (isEmpty()) /*@deq_check*/
		{
			cout << "Queue Underflow!" << endl; /*@deq_under*/
			return -1;
		}

		int value = arr[front]; /*@deq_read*/
		front = (front + 1) % capacity; /*@deq_front*/

		count--; /*@deq_count*/

		return value; /*@deq_ret*/
	}

	// Front element
	int getFront() /*@gf*/
	{
		if (isEmpty()) /*@gf_check*/
		{
			cout << "Queue is Empty!" << endl; /*@gf_empty*/
			return -1;
		}

		return arr[front]; /*@gf_ret*/
	}

	// Insert at Start (front — O(1): move front backward into the ring)
	void insertAtStart(int value) /*@is*/
	{
		if (isFull()) /*@is_check*/
		{
			cout << "Queue Overflow!" << endl; /*@is_over*/
			return;
		}

		front = (front - 1 + capacity) % capacity; /*@is_front*/
		arr[front] = value; /*@is_set*/

		count++; /*@is_count*/
	}

	// Insert at End — identical to enqueue()
	void insertAtEnd(int value) /*@ie*/
	{
		enqueue(value); /*@ie_call*/
	}

	// Insert at Position (counted from the FRONT, 0 = front)
	void insertAtPosition(int value, int pos) /*@ip*/
	{
		if (isFull()) /*@ip_check*/
		{
			cout << "Queue Overflow!" << endl; /*@ip_over*/
			return;
		}

		if (pos < 0 || pos > count) /*@ip_range*/
		{
			cout << "Invalid Position!" << endl; /*@ip_bad*/
			return;
		}

		for (int i = count; i > pos; i--) /*@ip_shift*/
		{
			int dest = (front + i) % capacity;
			int src = (front + i - 1) % capacity;
			arr[dest] = arr[src];
		}

		int idx = (front + pos) % capacity; /*@ip_idx*/
		arr[idx] = value; /*@ip_set*/

		count++; /*@ip_count*/
		rear = (front + count - 1) % capacity; /*@ip_rear*/
	}

	// Remove from Start — identical to dequeue()
	int removeAtStart() /*@rs*/
	{
		return dequeue(); /*@rs_call*/
	}

	// Remove from End (removes the most recently enqueued element — O(1))
	int removeAtEnd() /*@re*/
	{
		if (isEmpty()) /*@re_check*/
		{
			cout << "Queue Underflow!" << endl; /*@re_under*/
			return -1;
		}

		int value = arr[rear]; /*@re_read*/
		rear = (rear - 1 + capacity) % capacity; /*@re_rear*/

		count--; /*@re_count*/

		return value; /*@re_ret*/
	}

	// Remove at Position (counted from the front)
	int removeAtPosition(int pos) /*@rp*/
	{
		if (pos < 0 || pos >= count) /*@rp_check*/
		{
			cout << "Invalid Position!" << endl; /*@rp_bad*/
			return -1;
		}

		int idx = (front + pos) % capacity; /*@rp_idx*/
		int value = arr[idx]; /*@rp_read*/

		for (int i = pos; i < count - 1; i++) /*@rp_shift*/
		{
			int dest = (front + i) % capacity;
			int src = (front + i + 1) % capacity;
			arr[dest] = arr[src];
		}

		count--; /*@rp_count*/
		rear = (front + count - 1 + capacity) % capacity; /*@rp_rear*/

		return value; /*@rp_ret*/
	}

	// Update at Start (front)
	void updateAtStart(int value) /*@ust*/
	{
		if (isEmpty()) /*@ust_check*/
		{
			cout << "Queue is Empty!" << endl; /*@ust_msg*/
			return;
		}

		arr[front] = value; /*@ust_set*/
	}

	// Update at Position (counted from the front)
	void updateAtPosition(int pos, int value) /*@up*/
	{
		if (pos < 0 || pos >= count) /*@up_check*/
		{
			cout << "Invalid Position!" << endl; /*@up_bad*/
			return;
		}

		int idx = (front + pos) % capacity; /*@up_idx*/
		arr[idx] = value; /*@up_set*/
	}

	// Update at End (rear)
	void updateAtEnd(int value) /*@uen*/
	{
		if (isEmpty()) /*@uen_check*/
		{
			cout << "Queue is Empty!" << endl; /*@uen_msg*/
			return;
		}

		arr[rear] = value; /*@uen_set*/
	}

	// Traverse (front to rear)
	void traverse() /*@tv*/
	{

		for (int i = 0; i < count; i++) /*@tv_loop*/
		{
			int idx = (front + i) % capacity;
			cout << arr[idx] << " "; /*@tv_print*/
		}

		cout << endl; /*@tv_done*/
	}

	// Search (distance from the front; -1 if not found)
	int search(int value) /*@se*/
	{
		for (int i = 0; i < count; i++) /*@se_loop*/
		{
			int idx = (front + i) % capacity;

			if (arr[idx] == value) /*@se_hit*/
			{
				return i; /*@se_found*/
			}
		}

		return -1; /*@se_miss*/
	}

	// Reverse a LOGICAL range [lstart, lend] (mapped through the circular buffer)
	void reverseRange(int lstart, int lend) /*@rev*/
	{
		while (lstart < lend) /*@rev_while*/
		{
			int a = (front + lstart) % capacity;
			int b = (front + lend) % capacity;

			int t = arr[a]; /*@rev_swap*/
			arr[a] = arr[b];
			arr[b] = t;

			lstart++;
			lend--; /*@rev_move*/
		}
	}

	// Reverse in blocks of k
	void reverseByK(int k) /*@revk*/
	{
		for (int start = 0; start < count; start += k) /*@revk_loop*/
		{
			int end = start + k - 1; /*@revk_end*/

			if (end >= count) /*@revk_clamp*/
			{
				end = count - 1;
			}

			reverseRange(start, end); /*@revk_call*/
		}
	}

	// Rotate Left by k (rotates only the LIVE elements — the dead slots are untouched)
	void rotateLeft(int k) /*@rotl*/
	{
		if (count <= 1) return;

		k = k % count; /*@rotl_k*/

		reverseRange(0, k - 1); /*@rotl_1*/
		reverseRange(k, count - 1); /*@rotl_2*/
		reverseRange(0, count - 1); /*@rotl_3*/
	}

	// Rotate Right by k
	void rotateRight(int k) /*@rotr*/
	{
		if (count <= 1) return;

		k = k % count; /*@rotr_k*/

		reverseRange(0, count - 1); /*@rotr_1*/
		reverseRange(0, k - 1); /*@rotr_2*/
		reverseRange(k, count - 1); /*@rotr_3*/
	}

	// Sort Ascending (bubble sort over LOGICAL positions)
	void sortAscending() /*@sasc*/
	{
		for (int i = 0; i < count - 1; i++) /*@sasc_outer*/
		{
			for (int j = 0; j < count - 1 - i; j++) /*@sasc_inner*/
			{
				int a = (front + j) % capacity;
				int b = (front + j + 1) % capacity;

				if (arr[a] > arr[b]) /*@sasc_cmp*/
				{
					int t = arr[a]; /*@sasc_swap*/
					arr[a] = arr[b];
					arr[b] = t;
				}
			}
		}
	}

	// Sort Descending
	void sortDescending() /*@sdesc*/
	{
		for (int i = 0; i < count - 1; i++) /*@sdesc_outer*/
		{
			for (int j = 0; j < count - 1 - i; j++) /*@sdesc_inner*/
			{
				int a = (front + j) % capacity;
				int b = (front + j + 1) % capacity;

				if (arr[a] < arr[b]) /*@sdesc_cmp*/
				{
					int t = arr[a]; /*@sdesc_swap*/
					arr[a] = arr[b];
					arr[b] = t;
				}
			}
		}
	}

	// Remove Duplicates (keeps first occurrence from the front)
	void removeDuplicates() /*@dedup*/
	{
		int newCount = 0; /*@dedup_init*/

		for (int i = 0; i < count; i++) /*@dedup_outer*/
		{
			int srcIdx = (front + i) % capacity;
			bool duplicate = false; /*@dedup_flag*/

			for (int j = 0; j < newCount; j++) /*@dedup_inner*/
			{
				int cmpIdx = (front + j) % capacity;

				if (arr[cmpIdx] == arr[srcIdx]) /*@dedup_cmp*/
				{
					duplicate = true; /*@dedup_mark*/
					break;
				}
			}

			if (!duplicate) /*@dedup_check*/
			{
				int destIdx = (front + newCount) % capacity;
				arr[destIdx] = arr[srcIdx]; /*@dedup_keep*/
				newCount++;
			}
		}

		count = newCount; /*@dedup_count*/
		rear = (front + count - 1 + capacity) % capacity; /*@dedup_rear*/
	}

	// Frequency Count
	void frequencyCount() /*@freq*/
	{
		bool counted[64] = { false }; /*@freq_init*/

		for (int i = 0; i < count; i++) /*@freq_outer*/
		{
			if (counted[i]) /*@freq_skip*/
			{
				continue;
			}

			int idxI = (front + i) % capacity;
			int cnt = 1; /*@freq_start*/

			for (int j = i + 1; j < count; j++) /*@freq_inner*/
			{
				int idxJ = (front + j) % capacity;

				if (arr[idxJ] == arr[idxI]) /*@freq_cmp*/
				{
					cnt++; /*@freq_bump*/
					counted[j] = true;
				}
			}

			cout << arr[idxI] << " -> " << cnt << endl; /*@freq_print*/
		}
	}

	// Display (front to rear)
	void display() /*@disp*/
	{
		if (isEmpty()) /*@disp_check*/
		{
			cout << "Queue is Empty!" << endl; /*@disp_empty*/
			return;
		}

		for (int i = 0; i < count; i++) /*@disp_loop*/
		{
			cout << arr[(front + i) % capacity] << " ";
		}

		cout << endl; /*@disp_end*/
	}

	~Queue()
	{
		delete[] arr;
		arr = nullptr;
	}
};
`);

interface QState { arr: (number | null)[]; front: number; rear: number; count: number; capacity: number; }

const qSnap = (st: QState): ArraySnap => {
  const live: number[] = [];
  for (let i = 0; i < st.count; i++) live.push((st.front + i) % st.capacity);
  const dead: number[] = [];
  for (let i = 0; i < st.capacity; i++) if (!live.includes(i)) dead.push(i);
  return {
    kind: 'array',
    cells: st.arr.slice(),
    size: st.count,
    capacity: st.capacity,
    hi: [], hi2: [], layout: 'ring', dead,
    ptrs: [
      { name: 'front', index: st.front, color: 'cyan' },
      { name: 'rear', index: st.rear < 0 ? 0 : st.rear, color: 'purple' },
    ],
  };
};

function runQ(st: QState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(que.marks, () => qSnap(st));
  const M = (p: Partial<ArraySnap>) => p as Partial<ArraySnap>;

  switch (opId) {
    case 'enqueue': {
      const v = a.value;
      S('enq', `Called enqueue(${v}).`);
      S('enq_check', `isFull(): count (${st.count}) == capacity (${st.capacity}) → ${st.count === st.capacity ? 'true' : 'false'}. Note the test is on COUNT, not on rear — that is exactly why a count field exists.`);
      if (st.count === st.capacity) { S('enq_over', 'Queue is genuinely full.', undefined, 'Queue Overflow!'); break; }
      const prev = st.rear;
      st.rear = (st.rear + 1) % st.capacity;
      S('enq_rear', `rear = (${prev} + 1) % ${st.capacity} = ${st.rear}.${st.rear < prev ? ' The modulo just WRAPPED rear back to the start of the array — those early slots were freed by earlier dequeues, so reusing them is correct, not a bug.' : ''}`, M({ hi: [st.rear] }));
      st.arr[st.rear] = v;
      S('enq_set', `arr[${st.rear}] = ${v}.`, M({ hi: [st.rear] }));
      st.count++;
      S('enq_count', `count++ → ${st.count}. O(1), and nothing was shifted — a naive queue that shifts everything left on dequeue would be O(n).`, M({ hi: [st.rear] }));
      break;
    }
    case 'dequeue': {
      S('deq', 'Called dequeue().');
      S('deq_check', `isEmpty(): count == 0 → ${st.count === 0 ? 'true' : 'false'}.`);
      if (st.count === 0) { S('deq_under', 'Nothing to remove.', undefined, 'Queue Underflow!'); break; }
      const v = st.arr[st.front];
      S('deq_read', `int value = arr[${st.front}] → ${v}. FIFO: whatever has waited longest leaves first.`, M({ hi: [st.front] }));
      const prev = st.front;
      st.front = (st.front + 1) % st.capacity;
      S('deq_front', `front = (${prev} + 1) % ${st.capacity} = ${st.front}.${st.front < prev ? ' front wrapped around too.' : ''} Slot ${prev} is now free for a future enqueue.`, M({ hi2: [prev] }));
      st.count--;
      S('deq_count', `count-- → ${st.count}.`, M({ hi2: [prev] }));
      S('deq_ret', `return ${v}.`, M({ hi2: [prev] }), `dequeue() returned ${v}`);
      break;
    }
    case 'getFront': {
      S('gf', 'Called getFront().');
      S('gf_check', `isEmpty() → ${st.count === 0 ? 'true' : 'false'}.`);
      if (st.count === 0) { S('gf_empty', 'Empty queue.', undefined, 'Queue is Empty!'); break; }
      S('gf_ret', `return arr[${st.front}] → ${st.arr[st.front]}. Read only, nothing is removed.`, M({ hi: [st.front] }), `getFront() returned ${st.arr[st.front]}`);
      break;
    }

    case 'insertAtStart': {
      const v = a.value;
      S('is', `Called insertAtStart(${v}).`);
      S('is_check', `isFull() → ${st.count === st.capacity ? 'true' : 'false'}.`);
      if (st.count === st.capacity) { S('is_over', 'Full.', undefined, 'Queue Overflow!'); break; }
      const prevFront = st.front;
      st.front = (st.front - 1 + st.capacity) % st.capacity;
      S('is_front', `front = (${prevFront} - 1 + ${st.capacity}) % ${st.capacity} = ${st.front}. Moving front BACKWARD makes room at the new logical start — no shifting needed anywhere else.`, M({ ptrs: [{ name: 'front', index: st.front, color: 'cyan' }, { name: 'rear', index: st.rear, color: 'purple' }] }));
      st.arr[st.front] = v;
      S('is_set', `arr[${st.front}] = ${v}.`, M({ hi: [st.front] }));
      st.count++;
      S('is_count', `count++ → ${st.count}. O(1) — the circular buffer means "insert at front" costs the same as enqueue.`);
      break;
    }

    case 'insertAtEnd': {
      const v = a.value;
      S('ie', `Called insertAtEnd(${v}).`);
      S('ie_call', 'insertAtEnd delegates straight to enqueue() — the rear already IS "the end".');
      if (st.count === st.capacity) { S('enq_over', 'Full.', undefined, 'Queue Overflow!'); break; }
      st.rear = (st.rear + 1) % st.capacity;
      st.arr[st.rear] = v;
      st.count++;
      S('enq_set', `enqueue(${v}) → rear = ${st.rear}, arr[${st.rear}] = ${v}, count = ${st.count}.`, M({ hi: [st.rear] }));
      break;
    }

    case 'insertAtPosition': {
      const v = a.value, pos = a.pos;
      S('ip', `Called insertAtPosition(${v}, ${pos}) — position counted from the FRONT (0 = front).`);
      S('ip_check', `isFull() → ${st.count === st.capacity ? 'true' : 'false'}.`);
      if (st.count === st.capacity) { S('ip_over', 'Full.', undefined, 'Queue Overflow!'); break; }
      S('ip_range', `Guard: ${pos} < 0 || ${pos} > ${st.count} → ${pos < 0 || pos > st.count ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos > st.count) { S('ip_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      for (let i = st.count; i > pos; i--) {
        const dest = (st.front + i) % st.capacity, src = (st.front + i - 1) % st.capacity;
        st.arr[dest] = st.arr[src];
        S('ip_shift', `arr[${dest}] = arr[${src}] — logical slot ${i - 1} slides to ${i} to make room.`, M({ hi: [dest, src] }));
      }
      const idx = (st.front + pos) % st.capacity;
      S('ip_idx', `idx = (front + ${pos}) % capacity = ${idx}.`);
      st.arr[idx] = v;
      S('ip_set', `arr[${idx}] = ${v}.`, M({ hi: [idx] }));
      st.count++;
      S('ip_count', `count++ → ${st.count}.`);
      st.rear = (st.front + st.count - 1) % st.capacity;
      S('ip_rear', `rear recomputed → ${st.rear}.`);
      break;
    }

    case 'removeAtStart': {
      S('rs', 'Called removeAtStart().');
      S('rs_call', 'removeAtStart delegates straight to dequeue().');
      if (st.count === 0) { S('deq_under', 'Empty.', undefined, 'Queue Underflow!'); break; }
      const v = st.arr[st.front];
      S('deq_read', `dequeue() → int value = arr[${st.front}] = ${v}.`, M({ hi: [st.front] }));
      st.front = (st.front + 1) % st.capacity;
      st.count--;
      S('deq_front', `front → ${st.front}, count → ${st.count}.`);
      S('deq_ret', `return ${v}.`, undefined, `removeAtStart() returned ${v}`);
      break;
    }

    case 'removeAtEnd': {
      S('re', 'Called removeAtEnd() — removes the most recently enqueued element.');
      S('re_check', `isEmpty() → ${st.count === 0 ? 'true' : 'false'}.`);
      if (st.count === 0) { S('re_under', 'Empty.', undefined, 'Queue Underflow!'); break; }
      const v = st.arr[st.rear];
      S('re_read', `int value = arr[${st.rear}] → ${v}.`, M({ hi: [st.rear] }));
      const prevRear = st.rear;
      st.rear = (st.rear - 1 + st.capacity) % st.capacity;
      S('re_rear', `rear = (${prevRear} - 1 + ${st.capacity}) % ${st.capacity} = ${st.rear}. O(1) — no shifting, just moving rear backward.`);
      st.count--;
      S('re_count', `count-- → ${st.count}.`);
      S('re_ret', `return ${v}.`, undefined, `removeAtEnd() returned ${v}`);
      break;
    }

    case 'removeAtPosition': {
      const pos = a.pos;
      S('rp', `Called removeAtPosition(${pos}).`);
      S('rp_check', `Guard: ${pos} < 0 || ${pos} >= ${st.count} → ${pos < 0 || pos >= st.count ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos >= st.count) { S('rp_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      const idx = (st.front + pos) % st.capacity;
      S('rp_idx', `idx = (front + ${pos}) % capacity = ${idx}.`);
      const v = st.arr[idx];
      S('rp_read', `int value = arr[${idx}] → ${v}.`, M({ hi: [idx] }));
      for (let i = pos; i < st.count - 1; i++) {
        const dest = (st.front + i) % st.capacity, src = (st.front + i + 1) % st.capacity;
        st.arr[dest] = st.arr[src];
        S('rp_shift', `arr[${dest}] = arr[${src}].`, M({ hi: [dest, src] }));
      }
      st.count--;
      S('rp_count', `count-- → ${st.count}.`);
      st.rear = (st.front + st.count - 1 + st.capacity) % st.capacity;
      S('rp_rear', `rear recomputed → ${st.rear}.`);
      S('rp_ret', `return ${v}.`, undefined, `removeAtPosition(${pos}) returned ${v}`);
      break;
    }

    case 'updateAtStart': {
      S('ust', `Called updateAtStart(${a.value}).`);
      S('ust_check', `isEmpty() → ${st.count === 0 ? 'true' : 'false'}.`);
      if (st.count === 0) { S('ust_msg', 'Empty.', undefined, 'Queue is Empty!'); break; }
      st.arr[st.front] = a.value;
      S('ust_set', `arr[front] = ${a.value}.`, M({ hi: [st.front] }));
      break;
    }

    case 'updateAtPosition': {
      const pos = a.pos, v = a.value;
      S('up', `Called updateAtPosition(${pos}, ${v}).`);
      S('up_check', `Guard: ${pos} < 0 || ${pos} >= ${st.count} → ${pos < 0 || pos >= st.count ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos >= st.count) { S('up_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      const idx = (st.front + pos) % st.capacity;
      S('up_idx', `idx = (front + ${pos}) % capacity = ${idx}.`);
      st.arr[idx] = v;
      S('up_set', `arr[${idx}] = ${v}.`, M({ hi: [idx] }));
      break;
    }

    case 'updateAtEnd': {
      S('uen', `Called updateAtEnd(${a.value}).`);
      S('uen_check', `isEmpty() → ${st.count === 0 ? 'true' : 'false'}.`);
      if (st.count === 0) { S('uen_msg', 'Empty.', undefined, 'Queue is Empty!'); break; }
      st.arr[st.rear] = a.value;
      S('uen_set', `arr[rear] = ${a.value}.`, M({ hi: [st.rear] }));
      break;
    }

    case 'traverse': {
      S('tv', 'Called traverse() — front to rear.');
      for (let i = 0; i < st.count; i++) {
        const idx = (st.front + i) % st.capacity;
        S('tv_loop', `i = ${i} → idx = ${idx}.`, M({ hi: [idx] }));
        S('tv_print', `cout << arr[${idx}] → printed ${st.arr[idx]}.`, M({ hi: [idx] }), `${st.arr[idx]}`);
      }
      S('tv_done', 'Printed exactly count elements, front to rear.');
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}).`);
      let found = -1;
      for (let i = 0; i < st.count; i++) {
        const idx = (st.front + i) % st.capacity;
        S('se_loop', `i = ${i} → idx = ${idx}, arr[${idx}] = ${st.arr[idx]}.`, M({ hi: [idx] }));
        S('se_hit', `arr[${idx}] == ${v} → ${st.arr[idx] === v}.`);
        if (st.arr[idx] === v) { found = i; S('se_found', `Found at distance ${i} from the front.`, M({ hi: [idx] }), `search(${v}) returned ${i}`); break; }
      }
      if (found === -1) S('se_miss', 'Not found.', undefined, `search(${v}) returned -1`);
      break;
    }

    case 'sortAscending':
    case 'sortDescending': {
      const asc = opId === 'sortAscending';
      const [mOuter, mInner, mCmp, mSwap] = asc
        ? ['sasc_outer', 'sasc_inner', 'sasc_cmp', 'sasc_swap']
        : ['sdesc_outer', 'sdesc_inner', 'sdesc_cmp', 'sdesc_swap'];
      S(asc ? 'sasc' : 'sdesc', `Called sort${asc ? 'Ascending' : 'Descending'}() — bubble sort over LOGICAL positions, mapped through the circular buffer.`);
      for (let i = 0; i < st.count - 1; i++) {
        S(mOuter, `Pass ${i + 1}.`);
        for (let j = 0; j < st.count - 1 - i; j++) {
          const ai = (st.front + j) % st.capacity, bi = (st.front + j + 1) % st.capacity;
          S(mInner, `Comparing logical ${j} (arr[${ai}]=${st.arr[ai]}) and logical ${j + 1} (arr[${bi}]=${st.arr[bi]}).`, M({ hi: [ai, bi] }));
          const swap = asc ? (st.arr[ai] as number) > (st.arr[bi] as number) : (st.arr[ai] as number) < (st.arr[bi] as number);
          S(mCmp, `→ ${swap}.`);
          if (swap) { const t = st.arr[ai]; st.arr[ai] = st.arr[bi]; st.arr[bi] = t; S(mSwap, 'Swapped.', M({ hi: [ai, bi] })); }
        }
      }
      break;
    }

    case 'reverseByK': {
      const k = Math.max(1, a.k);
      S('revk', `Called reverseByK(${k}) over ${st.count} logical elements.`);
      const doReverse = (lstart: number, lend: number) => {
        S('rev', `reverseRange(${lstart}, ${lend}).`);
        while (lstart < lend) {
          const ai = (st.front + lstart) % st.capacity, bi = (st.front + lend) % st.capacity;
          S('rev_while', `lstart (${lstart}) < lend (${lend}).`, M({ hi: [ai, bi] }));
          const t = st.arr[ai]; st.arr[ai] = st.arr[bi]; st.arr[bi] = t;
          S('rev_swap', `Swapped arr[${ai}] and arr[${bi}].`, M({ hi: [ai, bi] }));
          lstart++; lend--;
          S('rev_move', `lstart++, lend-- → ${lstart}, ${lend}.`);
        }
      };
      for (let start = 0; start < st.count; start += k) {
        let end = start + k - 1;
        S('revk_loop', `Block at logical ${start}.`);
        if (end >= st.count) { end = st.count - 1; S('revk_clamp', `Clamped to ${end} (final short block).`); }
        S('revk_end', `end = ${start + k - 1}.`);
        doReverse(start, end);
      }
      break;
    }

    case 'rotateLeft':
    case 'rotateRight': {
      const isLeft = opId === 'rotateLeft';
      S(isLeft ? 'rotl' : 'rotr', `Called ${isLeft ? 'rotateLeft' : 'rotateRight'}(${a.k}) — this rotates only the ${st.count} LIVE elements; the empty slots are untouched.`);
      if (st.count <= 1) break;
      const k = ((a.k % st.count) + st.count) % st.count;
      S(isLeft ? 'rotl_k' : 'rotr_k', `k = ${a.k} % ${st.count} = ${k}.`);
      const doReverse = (lstart: number, lend: number) => {
        while (lstart < lend) { const ai = (st.front + lstart) % st.capacity, bi = (st.front + lend) % st.capacity; const t = st.arr[ai]; st.arr[ai] = st.arr[bi]; st.arr[bi] = t; lstart++; lend--; }
      };
      if (isLeft) {
        doReverse(0, k - 1); S('rotl_1', `reverseRange(0, ${k - 1}).`);
        doReverse(k, st.count - 1); S('rotl_2', `reverseRange(${k}, ${st.count - 1}).`);
        doReverse(0, st.count - 1); S('rotl_3', `reverseRange(0, ${st.count - 1}).`);
      } else {
        doReverse(0, st.count - 1); S('rotr_1', `reverseRange(0, ${st.count - 1}).`);
        doReverse(0, k - 1); S('rotr_2', `reverseRange(0, ${k - 1}).`);
        doReverse(k, st.count - 1); S('rotr_3', `reverseRange(${k}, ${st.count - 1}).`);
      }
      break;
    }

    case 'removeDuplicates': {
      S('dedup', 'Called removeDuplicates() — keeps the first occurrence from the front.');
      S('dedup_init', 'newCount = 0.');
      let newCount = 0;
      for (let i = 0; i < st.count; i++) {
        const srcIdx = (st.front + i) % st.capacity;
        S('dedup_outer', `i = ${i} → arr[${srcIdx}] = ${st.arr[srcIdx]}.`, M({ hi: [srcIdx] }));
        let dup = false;
        S('dedup_flag', 'duplicate = false.');
        for (let j = 0; j < newCount; j++) {
          const cmpIdx = (st.front + j) % st.capacity;
          S('dedup_inner', `Comparing against kept logical slot ${j} (arr[${cmpIdx}] = ${st.arr[cmpIdx]}).`, M({ hi: [srcIdx], hi2: [cmpIdx] }));
          S('dedup_cmp', `→ ${st.arr[cmpIdx] === st.arr[srcIdx]}.`);
          if (st.arr[cmpIdx] === st.arr[srcIdx]) { dup = true; S('dedup_mark', 'duplicate = true, break.'); break; }
        }
        if (!dup) {
          const destIdx = (st.front + newCount) % st.capacity;
          st.arr[destIdx] = st.arr[srcIdx];
          S('dedup_keep', `arr[${destIdx}] = ${st.arr[srcIdx]} — kept at logical slot ${newCount}.`, M({ hi: [destIdx] }));
          newCount++;
        }
      }
      st.count = newCount;
      S('dedup_count', `count = newCount = ${newCount}.`);
      st.rear = (st.front + st.count - 1 + st.capacity) % st.capacity;
      S('dedup_rear', `rear recomputed → ${st.rear}.`);
      break;
    }

    case 'frequencyCount': {
      S('freq', 'Called frequencyCount().');
      const counted = new Array(st.count).fill(false);
      for (let i = 0; i < st.count; i++) {
        const idxI = (st.front + i) % st.capacity;
        S('freq_outer', `i = ${i} → arr[${idxI}] = ${st.arr[idxI]}.`, M({ hi: [idxI] }));
        S('freq_skip', `counted[${i}] → ${counted[i]}.`);
        if (counted[i]) continue;
        let cnt = 1;
        S('freq_start', 'cnt = 1.');
        for (let j = i + 1; j < st.count; j++) {
          const idxJ = (st.front + j) % st.capacity;
          const eq = st.arr[idxJ] === st.arr[idxI];
          S('freq_inner', `Comparing arr[${idxJ}] = ${st.arr[idxJ]}.`, M({ hi: [idxI], hi2: [idxJ] }));
          S('freq_cmp', `→ ${eq}.`);
          if (eq) { cnt++; counted[j] = true; S('freq_bump', `cnt++ → ${cnt}.`); }
        }
        S('freq_print', `arr[${idxI}] occurs ${cnt} time(s).`, undefined, `${st.arr[idxI]} -> ${cnt}`);
      }
      break;
    }

    case 'display': {
      S('disp', 'Called display().');

      S('disp_check', `isEmpty() → ${st.count === 0 ? 'true' : 'false'}.`);
      if (st.count === 0) { S('disp_empty', 'Nothing to print.', undefined, 'Queue is Empty!'); break; }
      let line = '';
      for (let i = 0; i < st.count; i++) {
        const idx = (st.front + i) % st.capacity;
        line += `${st.arr[idx]} `;
        S('disp_loop', `i = ${i} → arr[(front + ${i}) % ${st.capacity}] = arr[${idx}] = ${st.arr[idx]}. The loop counts from 0 to count, never from front to rear — that is what makes a wrapped queue print in the right order.`, M({ hi: [idx] }));
      }
      S('disp_end', 'Printed exactly count elements, in arrival order.', undefined, line.trim());
      break;
    }
  }
  return steps;
}

export const queueLab: Lab = {
  id: 'queue',
  title: 'Circular Queue Class',
  icon: '🚦',
  className: 'Queue',
  blurb: 'The queue that does not waste space. Dequeue a few times, then enqueue until rear wraps past the end of the array — the modulo is where a linear queue would have falsely reported "full".',
  code: que.code,
  marks: que.marks,
  ops: [
    { id: 'enqueue', label: 'Enqueue', sig: 'void enqueue(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(1)' },
    { id: 'dequeue', label: 'Dequeue', sig: 'int dequeue()', params: [], big: 'O(1)' },
    { id: 'getFront', label: 'Get front', sig: 'int getFront()', params: [], big: 'O(1)' },
    { id: 'insertAtStart', label: 'Insert at start', sig: 'void insertAtStart(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(1)' },
    { id: 'insertAtEnd', label: 'Insert at end (= enqueue)', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(1)' },
    { id: 'insertAtPosition', label: 'Insert at position', sig: 'void insertAtPosition(int value, int pos)', params: [{ name: 'value', label: 'value', def: 99 }, { name: 'pos', label: 'pos (from front)', def: 1 }], big: 'O(n)' },
    { id: 'removeAtStart', label: 'Remove from start (= dequeue)', sig: 'int removeAtStart()', params: [], big: 'O(1)' },
    { id: 'removeAtEnd', label: 'Remove from end', sig: 'int removeAtEnd()', params: [], big: 'O(1)' },
    { id: 'removeAtPosition', label: 'Remove at position', sig: 'int removeAtPosition(int pos)', params: [{ name: 'pos', label: 'pos (from front)', def: 1 }], big: 'O(n)' },
    { id: 'updateAtStart', label: 'Update at start', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 111 }], big: 'O(1)' },
    { id: 'updateAtPosition', label: 'Update at position', sig: 'void updateAtPosition(int pos, int value)', params: [{ name: 'pos', label: 'pos (from front)', def: 1 }, { name: 'value', label: 'value', def: 77 }], big: 'O(1)' },
    { id: 'updateAtEnd', label: 'Update at end', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 222 }], big: 'O(1)' },
    { id: 'traverse', label: 'Traverse', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 20 }], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n²)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n²)' },
    { id: 'reverseByK', label: 'Reverse by k', sig: 'void reverseByK(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateLeft', label: 'Rotate left by k', sig: 'void rotateLeft(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'rotateRight', label: 'Rotate right by k', sig: 'void rotateRight(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'removeDuplicates', label: 'Remove duplicates', sig: 'void removeDuplicates()', params: [], big: 'O(n²)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'display', label: 'Display', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: (): QState => ({ arr: [10, 20, 30, null, null, null], front: 0, rear: 2, count: 3, capacity: 6 }),
  snapshot: qSnap,
  run: runQ,
};
