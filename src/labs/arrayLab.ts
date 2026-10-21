import { parseCode, stepper, type ArraySnap, type Lab, type LabStep } from './core';

/* The class body below is the reference Array implementation used across the
   site. Only the inline @mark annotations are stripped before display — the
   C++ itself is shown to the learner exactly as it is executed here. */
const { code, marks } = parseCode(`
class Array
{
private:
	int* arr;
	int size;
	int capacity;

	bool isFull()
	{
		if (size == capacity) /*@isfull*/
		{
			return true;
		}

		return false;
	}

	void regrow()
	{
		int* newArr = new int[capacity * 2]; /*@regrow_alloc*/

		for (int i = 0; i < size; i++) /*@regrow_copy*/
		{
			newArr[i] = arr[i];
		}

		delete[] arr; /*@regrow_free*/

		arr = newArr;
		capacity = capacity * 2; /*@regrow_done*/
	}

	// Shifting
	void shiftRight(int fromIndex)
	{
		for (int i = size - 1; i >= fromIndex; i--)
		{
			arr[i + 1] = arr[i]; /*@shift_right*/
		}
	}

	void shiftLeft(int fromIndex)
	{
		for (int i = fromIndex; i < size - 1; i++)
		{
			arr[i] = arr[i + 1]; /*@shift_left*/
		}
	}

public:

	// Default Constructor
	Array()
	{
		capacity = 2;
		arr = new int[capacity];
		size = 0;
	}

	// Parameterized Constructor
	Array(int capacity)
	{
		if (capacity <= 0)
		{
			capacity = 2;
		}

		this->capacity = capacity;
		arr = new int[capacity];
		size = 0;
	}

	// Insertion at Start
	void insertAtStart(int value) /*@ins_start*/
	{
		if (isFull())
		{
			regrow();
		}

		if (size > 0)
		{
			shiftRight(0); /*@ins_start_shift*/
		}

		arr[0] = value; /*@ins_start_assign*/
		size++; /*@ins_start_size*/
	}

	// Insertion at Index
	void insertAtIndex(int value, int index) /*@ins_idx*/
	{
		if (index < 0 || index > size) /*@ins_idx_check*/
		{
			cout << "Invalid Index!" << endl; /*@ins_idx_bad*/
			return;
		}

		if (isFull())
		{
			regrow();
		}

		if (index < size)
		{
			shiftRight(index); /*@ins_idx_shift*/
		}

		arr[index] = value; /*@ins_idx_assign*/
		size++; /*@ins_idx_size*/
	}

	// Insertion at End
	void insertAtEnd(int value) /*@ins_end*/
	{
		if (isFull())
		{
			regrow();
		}

		arr[size] = value; /*@ins_end_assign*/
		size++; /*@ins_end_size*/
	}

	// Deletion from Start
	void deleteFromStart() /*@del_start*/
	{
		if (size == 0) /*@del_start_empty*/
		{
			cout << "Array is Empty!" << endl; /*@del_start_msg*/
			return;
		}

		shiftLeft(0); /*@del_start_shift*/
		size--; /*@del_start_size*/
	}

	// Deletion from Index
	void deleteFromIndex(int index) /*@del_idx*/
	{
		if (index < 0 || index >= size) /*@del_idx_check*/
		{
			cout << "Invalid Index!" << endl; /*@del_idx_bad*/
			return;
		}

		shiftLeft(index); /*@del_idx_shift*/
		size--; /*@del_idx_size*/
	}

	// Deletion from End
	void deleteFromEnd() /*@del_end*/
	{
		if (size == 0) /*@del_end_empty*/
		{
			cout << "Array is Empty!" << endl; /*@del_end_msg*/
			return;
		}

		size--; /*@del_end_size*/
	}

	// Update at Start
	void updateAtStart(int value) /*@upd_start*/
	{
		if (size == 0) /*@upd_start_empty*/
		{
			cout << "Array is Empty!" << endl; /*@upd_start_msg*/
			return;
		}

		arr[0] = value; /*@upd_start_assign*/
	}

	// Update at Index
	void updateAtIndex(int index, int value) /*@upd_idx*/
	{
		if (index < 0 || index >= size) /*@upd_idx_check*/
		{
			cout << "Invalid Index!" << endl; /*@upd_idx_bad*/
			return;
		}

		arr[index] = value; /*@upd_idx_assign*/
	}

	// Update at End
	void updateAtEnd(int value) /*@upd_end*/
	{
		if (size == 0) /*@upd_end_empty*/
		{
			cout << "Array is Empty!" << endl; /*@upd_end_msg*/
			return;
		}

		arr[size - 1] = value; /*@upd_end_assign*/
	}

	// Reverse Array
	void reverse(int start, int end) /*@rev*/
	{
		while (start < end) /*@rev_while*/
		{
			int temp = arr[start]; /*@rev_swap*/
			arr[start] = arr[end];
			arr[end] = temp;

			start++;
			end--; /*@rev_move*/
		}
	}

	// Reverse in blocks of k
	void reverseByK(int k) /*@revk*/
	{
		for (int start = 0; start < size; start += k) /*@revk_loop*/
		{
			int end = start + k - 1; /*@revk_end*/

			if (end >= size)
			{
				end = size - 1; /*@revk_clamp*/
			}

			reverse(start, end); /*@revk_call*/
		}
	}

	// Rotate Right
	void rotateRight(int k) /*@rot_r*/
	{
		if (size <= 1)
		{
			return;
		}

		k = k % size; /*@rot_r_k*/

		reverse(0, size - 1); /*@rot_r_1*/
		reverse(0, k - 1); /*@rot_r_2*/
		reverse(k, size - 1); /*@rot_r_3*/
	}

	// Rotate Left
	void rotateLeft(int k) /*@rot_l*/
	{
		if (size <= 1)
		{
			return;
		}

		k = k % size; /*@rot_l_k*/

		reverse(0, k - 1); /*@rot_l_1*/
		reverse(k, size - 1); /*@rot_l_2*/
		reverse(0, size - 1); /*@rot_l_3*/
	}

	// Linear Search
	int search(int value) /*@search*/
	{
		for (int i = 0; i < size; i++) /*@search_loop*/
		{
			if (arr[i] == value) /*@search_hit*/
			{
				return i;
			}
		}

		return -1; /*@search_miss*/
	}

	// Traverse (visit every element from index 0 to size-1)
	void traverse() /*@trav*/
	{
		for (int i = 0; i < size; i++) /*@trav_loop*/
		{
			cout << "Index " << i << ": " << arr[i] << endl; /*@trav_print*/
		}

		cout << endl; /*@trav_done*/
	}

	// Sort Ascending (bubble sort)
	void sortAscending() /*@sasc*/
	{
		for (int i = 0; i < size - 1; i++) /*@sasc_outer*/
		{
			for (int j = 0; j < size - 1 - i; j++) /*@sasc_inner*/
			{
				if (arr[j] > arr[j + 1]) /*@sasc_cmp*/
				{
					int temp = arr[j]; /*@sasc_swap*/
					arr[j] = arr[j + 1];
					arr[j + 1] = temp;
				}
			}
		}
	}

	// Sort Descending (bubble sort, flipped comparison)
	void sortDescending() /*@sdesc*/
	{
		for (int i = 0; i < size - 1; i++) /*@sdesc_outer*/
		{
			for (int j = 0; j < size - 1 - i; j++) /*@sdesc_inner*/
			{
				if (arr[j] < arr[j + 1]) /*@sdesc_cmp*/
				{
					int temp = arr[j]; /*@sdesc_swap*/
					arr[j] = arr[j + 1];
					arr[j + 1] = temp;
				}
			}
		}
	}

	// Remove Duplicates (keeps first occurrence, preserves order)
	void removeDuplicates() /*@dedup*/
	{
		int newSize = 0; /*@dedup_init*/

		for (int i = 0; i < size; i++) /*@dedup_outer*/
		{
			bool duplicate = false; /*@dedup_flag*/

			for (int j = 0; j < newSize; j++) /*@dedup_inner*/
			{
				if (arr[j] == arr[i]) /*@dedup_cmp*/
				{
					duplicate = true; /*@dedup_mark*/
					break;
				}
			}

			if (!duplicate) /*@dedup_check*/
			{
				arr[newSize] = arr[i]; /*@dedup_keep*/
				newSize++;
			}
		}

		size = newSize; /*@dedup_size*/
	}

	// Frequency Count (how many times each distinct value appears)
	void frequencyCount() /*@freq*/
	{
		bool counted[64] = { false }; /*@freq_init*/

		for (int i = 0; i < size; i++) /*@freq_outer*/
		{
			if (counted[i]) /*@freq_skip*/
			{
				continue;
			}

			int count = 1; /*@freq_start*/

			for (int j = i + 1; j < size; j++) /*@freq_inner*/
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

	// Display
	void display() /*@disp*/
	{
		if (size > 0)
		{
			cout << "\\nArray is: [";

			for (int i = 0; i < size; i++) /*@disp_loop*/
			{
				cout << arr[i];

				if (i != size - 1)
				{
					cout << ",";
				}
			}

			cout << "]" << endl; /*@disp_end*/
		}
		else
		{
			cout << "Array is Empty!!" << endl; /*@disp_empty*/
		}
	}

	// Destructor
	~Array()
	{
		delete[] arr;
		arr = nullptr;
	}
};
`);

interface ArrState {
  arr: (number | null)[];
  size: number;
  capacity: number;
}

function snapshot(st: ArrState): ArraySnap {
  return {
    kind: 'array',
    cells: st.arr.slice(),
    size: st.size,
    capacity: st.capacity,
    hi: [],
    hi2: [],
    ptrs: [],
    layout: 'row',
  };
}

function run(st: ArrState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(marks, () => snapshot(st));

  /* isFull() + regrow() — shared by all three insert paths */
  const ensureCapacity = () => {
    S('isfull', `isFull(): size (${st.size}) == capacity (${st.capacity}) → ${st.size === st.capacity ? 'true' : 'false'}`);
    if (st.size !== st.capacity) return;
    S('regrow_alloc', `Array is full. Allocating a brand-new block of ${st.capacity * 2} ints on the heap.`);
    const nw: (number | null)[] = Array(st.capacity * 2).fill(null);
    for (let i = 0; i < st.size; i++) nw[i] = st.arr[i];
    S('regrow_copy', `Copying all ${st.size} existing elements into the new block — this copy is why a regrow costs O(n).`);
    st.arr = nw;
    S('regrow_free', 'delete[] on the OLD block. Forgetting this line is the classic memory leak in a dynamic array.');
    st.capacity = st.capacity * 2;
    S('regrow_done', `arr now points at the new block and capacity is ${st.capacity}. Amortised over many inserts this still averages O(1).`);
  };

  const shiftRight = (from: number) => {
    for (let i = st.size - 1; i >= from; i--) {
      st.arr[i + 1] = st.arr[i];
      S('shift_right', `arr[${i + 1}] = arr[${i}] → moved ${st.arr[i]} one slot right to open up index ${from}.`, {
        hi: [i + 1], hi2: [i],
        ptrs: [{ name: 'i', index: i, color: 'orange' }],
      } as Partial<ArraySnap>);
    }
  };

  const shiftLeft = (from: number) => {
    for (let i = from; i < st.size - 1; i++) {
      st.arr[i] = st.arr[i + 1];
      S('shift_left', `arr[${i}] = arr[${i + 1}] → pulled ${st.arr[i]} one slot left to close the gap at index ${from}.`, {
        hi: [i], hi2: [i + 1],
        ptrs: [{ name: 'i', index: i, color: 'orange' }],
      } as Partial<ArraySnap>);
    }
  };

  /* reverse(start, end) — used directly, and three times by each rotate */
  const doReverse = (start: number, end: number, why: string) => {
    S('rev', `reverse(${start}, ${end})${why}`, {
      hi: [], hi2: start <= end ? rangeOf(start, end) : [],
      ptrs: [
        { name: 'start', index: start, color: 'cyan' },
        { name: 'end', index: end, color: 'purple' },
      ],
    } as Partial<ArraySnap>);
    if (start >= end) {
      S('rev_while', `start (${start}) < end (${end}) is false — nothing to swap, this call returns immediately.`);
      return;
    }
    let s = start, e = end;
    while (s < e) {
      const tmp = st.arr[s];
      st.arr[s] = st.arr[e];
      st.arr[e] = tmp;
      S('rev_swap', `Swapped arr[${s}] and arr[${e}] → ${st.arr[s]} ↔ ${st.arr[e]}.`, {
        hi: [s, e],
        ptrs: [
          { name: 'start', index: s, color: 'cyan' },
          { name: 'end', index: e, color: 'purple' },
        ],
      } as Partial<ArraySnap>);
      s++; e--;
      if (s < e) {
        S('rev_move', `start++ → ${s}, end-- → ${e}. The two pointers keep walking toward each other.`, {
          ptrs: [
            { name: 'start', index: s, color: 'cyan' },
            { name: 'end', index: e, color: 'purple' },
          ],
        } as Partial<ArraySnap>);
      }
    }
    S('rev_while', `start (${s}) < end (${e}) is now false — this reverse is done.`);
  };

  switch (opId) {
    /* ── INSERT ─────────────────────────────────────────────────────────── */
    case 'insertAtStart': {
      const v = a.value;
      S('ins_start', `Called insertAtStart(${v}). Everything already in the array has to slide right by one.`);
      ensureCapacity();
      if (st.size > 0) {
        S('ins_start_shift', `size > 0, so shiftRight(0) runs — ${st.size} element(s) move.`);
        shiftRight(0);
      }
      st.arr[0] = v;
      S('ins_start_assign', `arr[0] = ${v}. Index 0 was freed by the shift.`, { hi: [0] } as Partial<ArraySnap>);
      st.size++;
      S('ins_start_size', `size++ → ${st.size}. Total cost O(n), because of the shift.`, { hi: [0] } as Partial<ArraySnap>);
      break;
    }
    case 'insertAtEnd': {
      const v = a.value;
      S('ins_end', `Called insertAtEnd(${v}). No shifting needed — the free slot is already at the end.`);
      ensureCapacity();
      st.arr[st.size] = v;
      S('ins_end_assign', `arr[${st.size}] = ${v}. This slot was the first unused one.`, { hi: [st.size] } as Partial<ArraySnap>);
      st.size++;
      S('ins_end_size', `size++ → ${st.size}. O(1) amortised — the cheapest insert an array offers.`, { hi: [st.size - 1] } as Partial<ArraySnap>);
      break;
    }
    case 'insertAtIndex': {
      const v = a.value, idx = a.index;
      S('ins_idx', `Called insertAtIndex(${v}, ${idx}).`);
      S('ins_idx_check', `Guard: index < 0 || index > size → ${idx} < 0 || ${idx} > ${st.size} → ${idx < 0 || idx > st.size ? 'true (rejected)' : 'false (valid)'}. Note it is > size, not >= size, because inserting AT size is a legal append.`);
      if (idx < 0 || idx > st.size) {
        S('ins_idx_bad', 'Invalid index — the function prints and returns without touching the array.', undefined, 'Invalid Index!');
        break;
      }
      ensureCapacity();
      if (idx < st.size) {
        S('ins_idx_shift', `index (${idx}) < size (${st.size}), so shiftRight(${idx}) opens the slot.`);
        shiftRight(idx);
      }
      st.arr[idx] = v;
      S('ins_idx_assign', `arr[${idx}] = ${v}.`, { hi: [idx] } as Partial<ArraySnap>);
      st.size++;
      S('ins_idx_size', `size++ → ${st.size}. O(n) in the worst case (inserting at the front).`, { hi: [idx] } as Partial<ArraySnap>);
      break;
    }

    /* ── DELETE ─────────────────────────────────────────────────────────── */
    case 'deleteFromStart': {
      S('del_start', 'Called deleteFromStart().');
      S('del_start_empty', `Guard: size == 0 → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) {
        S('del_start_msg', 'Nothing to delete.', undefined, 'Array is Empty!');
        break;
      }
      S('del_start_shift', 'shiftLeft(0) — every later element slides one slot left, overwriting the old front.');
      shiftLeft(0);
      st.size--;
      S('del_start_size', `size-- → ${st.size}. The slot at index ${st.size} still physically holds ${st.arr[st.size]}, but it is now outside the live region and will be overwritten by the next insert.`, {
        hi2: [st.size],
      } as Partial<ArraySnap>);
      break;
    }
    case 'deleteFromIndex': {
      const idx = a.index;
      S('del_idx', `Called deleteFromIndex(${idx}).`);
      S('del_idx_check', `Guard: index < 0 || index >= size → ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}. Here it IS >= size, because index size is not a real element.`);
      if (idx < 0 || idx >= st.size) {
        S('del_idx_bad', 'Invalid index — nothing is removed.', undefined, 'Invalid Index!');
        break;
      }
      S('del_idx_shift', `shiftLeft(${idx}) — the gap left by arr[${idx}] gets closed.`);
      shiftLeft(idx);
      st.size--;
      S('del_idx_size', `size-- → ${st.size}. O(n) because of the shift.`, { hi2: [st.size] } as Partial<ArraySnap>);
      break;
    }
    case 'deleteFromEnd': {
      S('del_end', 'Called deleteFromEnd().');
      S('del_end_empty', `Guard: size == 0 → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) {
        S('del_end_msg', 'Nothing to delete.', undefined, 'Array is Empty!');
        break;
      }
      st.size--;
      S('del_end_size', `size-- → ${st.size}. No shifting, no erasing — the last value (${st.arr[st.size]}) is simply no longer inside the live region. O(1).`, {
        hi2: [st.size],
      } as Partial<ArraySnap>);
      break;
    }

    /* ── UPDATE ─────────────────────────────────────────────────────────── */
    case 'updateAtStart': {
      S('upd_start', `Called updateAtStart(${a.value}).`);
      S('upd_start_empty', `Guard: size == 0 → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) { S('upd_start_msg', 'Nothing to update.', undefined, 'Array is Empty!'); break; }
      st.arr[0] = a.value;
      S('upd_start_assign', `arr[0] = ${a.value}. Direct index access — O(1), no shifting at all.`, { hi: [0] } as Partial<ArraySnap>);
      break;
    }
    case 'updateAtIndex': {
      const idx = a.index;
      S('upd_idx', `Called updateAtIndex(${idx}, ${a.value}).`);
      S('upd_idx_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('upd_idx_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      st.arr[idx] = a.value;
      S('upd_idx_assign', `arr[${idx}] = ${a.value}. O(1) — this constant-time random access is the array's whole selling point.`, { hi: [idx] } as Partial<ArraySnap>);
      break;
    }
    case 'updateAtEnd': {
      S('upd_end', `Called updateAtEnd(${a.value}).`);
      S('upd_end_empty', `Guard: size == 0 → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) { S('upd_end_msg', 'Nothing to update.', undefined, 'Array is Empty!'); break; }
      st.arr[st.size - 1] = a.value;
      S('upd_end_assign', `arr[size - 1] = arr[${st.size - 1}] = ${a.value}.`, { hi: [st.size - 1] } as Partial<ArraySnap>);
      break;
    }

    /* ── REVERSE / ROTATE ───────────────────────────────────────────────── */
    case 'reverse': {
      doReverse(0, st.size - 1, ' — reversing the whole live region.');
      break;
    }
    case 'reverseByK': {
      const k = Math.max(1, a.k);
      S('revk', `Called reverseByK(${k}). Every consecutive block of ${k} elements gets reversed in place.`);
      for (let start = 0; start < st.size; start += k) {
        S('revk_loop', `Block starting at index ${start}.`, { ptrs: [{ name: 'start', index: start, color: 'orange' }] } as Partial<ArraySnap>);
        let end = start + k - 1;
        S('revk_end', `end = start + k - 1 = ${end}.`);
        if (end >= st.size) {
          end = st.size - 1;
          S('revk_clamp', `end (${start + k - 1}) reached past the array — clamped to the last valid index, ${end}. The final block is allowed to be shorter than k.`);
        }
        doReverse(start, end, ` — reversing this block (${start}..${end}).`);
      }
      break;
    }
    case 'rotateRight': {
      const k0 = a.k;
      S('rot_r', `Called rotateRight(${k0}).`);
      if (st.size <= 1) { S('rot_r', 'size <= 1 — a single element (or none) cannot rotate. Returning.'); break; }
      const k = ((k0 % st.size) + st.size) % st.size;
      S('rot_r_k', `k = ${k0} % ${st.size} = ${k}. Rotating by size is the same as not rotating at all, so the modulo keeps the work bounded.`);
      doReverse(0, st.size - 1, ' — step 1 of 3: reverse everything.');
      doReverse(0, k - 1, ' — step 2 of 3: un-reverse the first k elements (the block that wrapped around).');
      doReverse(k, st.size - 1, ' — step 3 of 3: un-reverse the remaining elements.');
      S('rot_r_3', `Done. Three reversals = O(n) time and O(1) extra space — no temporary array needed.`);
      break;
    }
    case 'rotateLeft': {
      const k0 = a.k;
      S('rot_l', `Called rotateLeft(${k0}).`);
      if (st.size <= 1) { S('rot_l', 'size <= 1 — nothing to rotate. Returning.'); break; }
      const k = ((k0 % st.size) + st.size) % st.size;
      S('rot_l_k', `k = ${k0} % ${st.size} = ${k}.`);
      doReverse(0, k - 1, ' — step 1 of 3: reverse the first k elements (the block that moves to the back).');
      doReverse(k, st.size - 1, ' — step 2 of 3: reverse the rest.');
      doReverse(0, st.size - 1, ' — step 3 of 3: reverse the whole thing to lock it in.');
      S('rot_l_3', 'Done. Same three-reversal trick as rotateRight, just applied in the opposite order.');
      break;
    }

    /* ── SEARCH / TRAVERSE ──────────────────────────────────────────────── */
    case 'search': {
      const v = a.value;
      S('search', `Called search(${v}). Linear scan — nothing is sorted here, so every index has to be checked.`);
      let found = -1;
      for (let i = 0; i < st.size; i++) {
        S('search_loop', `Checking arr[${i}] = ${st.arr[i]}.`, { hi: [i], ptrs: [{ name: 'i', index: i, color: 'orange' }] } as Partial<ArraySnap>);
        S('search_hit', `arr[${i}] == ${v} → ${st.arr[i] === v ? 'true — found it!' : 'false, keep going.'}`);
        if (st.arr[i] === v) { found = i; break; }
      }
      if (found === -1) S('search_miss', `Reached the end without a match. Returning -1.`, undefined, `Not found`);
      else S('search_hit', `Found ${v} at index ${found}.`, { hi: [found] } as Partial<ArraySnap>, `Found at index ${found}`);
      break;
    }
    case 'traverse': {
      S('trav', 'Called traverse().');
      for (let i = 0; i < st.size; i++) {
        S('trav_print', `cout << "Index ${i}: " << arr[${i}] → printed ${st.arr[i]}.`, {
          hi: [i], ptrs: [{ name: 'i', index: i, color: 'orange' }],
        } as Partial<ArraySnap>, `Index ${i}: ${st.arr[i]}`);
      }
      S('trav_done', `Every index from 0 to size-1 was visited exactly once — that's what makes this a traversal.`);
      break;
    }

    /* ── SORT ───────────────────────────────────────────────────────────── */
    case 'sortAscending': {
      S('sasc', 'Called sortAscending() — classic bubble sort: repeatedly swap adjacent out-of-order pairs.');
      for (let i = 0; i < st.size - 1; i++) {
        S('sasc_outer', `Pass ${i + 1}: after this pass, the ${i + 1} largest element(s) are locked into place at the end.`);
        for (let j = 0; j < st.size - 1 - i; j++) {
          S('sasc_inner', `Comparing arr[${j}]=${st.arr[j]} and arr[${j + 1}]=${st.arr[j + 1]}.`, {
            hi: [j, j + 1], ptrs: [{ name: 'j', index: j, color: 'orange' }],
          } as Partial<ArraySnap>);
          const swap = (st.arr[j] as number) > (st.arr[j + 1] as number);
          S('sasc_cmp', `arr[${j}] > arr[${j + 1}] → ${swap ? 'true, swap them' : 'false, already in order'}.`);
          if (swap) {
            const t = st.arr[j]; st.arr[j] = st.arr[j + 1]; st.arr[j + 1] = t;
            S('sasc_swap', `Swapped → arr[${j}]=${st.arr[j]}, arr[${j + 1}]=${st.arr[j + 1]}.`, { hi: [j, j + 1] } as Partial<ArraySnap>);
          }
        }
      }
      S('sasc', `Done — O(n²) time, O(1) extra space. ${st.size} elements needed at most ${st.size - 1} passes.`);
      break;
    }
    case 'sortDescending': {
      S('sdesc', 'Called sortDescending() — same bubble sort, comparison flipped so bigger values bubble to the front.');
      for (let i = 0; i < st.size - 1; i++) {
        S('sdesc_outer', `Pass ${i + 1}.`);
        for (let j = 0; j < st.size - 1 - i; j++) {
          S('sdesc_inner', `Comparing arr[${j}]=${st.arr[j]} and arr[${j + 1}]=${st.arr[j + 1]}.`, {
            hi: [j, j + 1], ptrs: [{ name: 'j', index: j, color: 'orange' }],
          } as Partial<ArraySnap>);
          const swap = (st.arr[j] as number) < (st.arr[j + 1] as number);
          S('sdesc_cmp', `arr[${j}] < arr[${j + 1}] → ${swap ? 'true, swap them' : 'false, already in order'}.`);
          if (swap) {
            const t = st.arr[j]; st.arr[j] = st.arr[j + 1]; st.arr[j + 1] = t;
            S('sdesc_swap', `Swapped → arr[${j}]=${st.arr[j]}, arr[${j + 1}]=${st.arr[j + 1]}.`, { hi: [j, j + 1] } as Partial<ArraySnap>);
          }
        }
      }
      S('sdesc', 'Done.');
      break;
    }

    /* ── DEDUP / FREQUENCY ─────────────────────────────────────────────── */
    case 'removeDuplicates': {
      S('dedup', 'Called removeDuplicates(). Every value already placed gets checked before a new one is kept.');
      S('dedup_init', 'newSize = 0 — this will become the size of the deduplicated array.');
      let newSize = 0;
      for (let i = 0; i < st.size; i++) {
        S('dedup_outer', `Looking at arr[${i}] = ${st.arr[i]}.`, { hi: [i], ptrs: [{ name: 'i', index: i, color: 'orange' }] } as Partial<ArraySnap>);
        S('dedup_flag', 'duplicate = false.');
        let dup = false;
        for (let j = 0; j < newSize; j++) {
          S('dedup_inner', `Checking against arr[${j}] = ${st.arr[j]} (already kept).`, {
            hi: [i], hi2: [j], ptrs: [{ name: 'i', index: i, color: 'orange' }, { name: 'j', index: j, color: 'cyan' }],
          } as Partial<ArraySnap>);
          S('dedup_cmp', `arr[${j}] == arr[${i}] → ${st.arr[j] === st.arr[i] ? 'true — it is a duplicate' : 'false'}.`);
          if (st.arr[j] === st.arr[i]) { dup = true; S('dedup_mark', 'duplicate = true, break — no need to check further.'); break; }
        }
        S('dedup_check', `!duplicate → ${!dup}.`);
        if (!dup) {
          st.arr[newSize] = st.arr[i];
          S('dedup_keep', `arr[${newSize}] = ${st.arr[i]} — kept, newSize becomes ${newSize + 1}.`, { hi: [newSize] } as Partial<ArraySnap>);
          newSize++;
        }
      }
      const oldSize = st.size;
      st.size = newSize;
      S('dedup_size', `size = newSize = ${newSize}. The slots from here to the old size are now stale — same idea as deleteFromEnd.`, { hi2: newSize < oldSize ? rangeOf(newSize, oldSize - 1) : [] } as Partial<ArraySnap>);
      break;
    }
    case 'frequencyCount': {
      S('freq', 'Called frequencyCount(). A counted[] flag array stops a value from being reported more than once.');
      S('freq_init', 'counted[] starts all false.');
      const counted = new Array(st.size).fill(false);
      for (let i = 0; i < st.size; i++) {
        S('freq_outer', `i = ${i}, arr[${i}] = ${st.arr[i]}.`, { hi: [i], ptrs: [{ name: 'i', index: i, color: 'orange' }] } as Partial<ArraySnap>);
        S('freq_skip', `counted[${i}] → ${counted[i] ? 'true, already reported — skip' : 'false, this is a new value'}.`);
        if (counted[i]) continue;
        let count = 1;
        S('freq_start', `count = 1 (counting arr[${i}] itself).`);
        for (let j = i + 1; j < st.size; j++) {
          S('freq_inner', `Comparing with arr[${j}] = ${st.arr[j]}.`, { hi: [i], hi2: [j] } as Partial<ArraySnap>);
          const eq = st.arr[j] === st.arr[i];
          S('freq_cmp', `arr[${j}] == arr[${i}] → ${eq}.`);
          if (eq) { count++; counted[j] = true; S('freq_bump', `count++ → ${count}. Flagged index ${j} so it won't be reported again.`); }
        }
        S('freq_print', `arr[${i}] = ${st.arr[i]} occurs ${count} time(s).`, undefined, `${st.arr[i]} -> ${count}`);
      }
      break;
    }

    /* ── DISPLAY ────────────────────────────────────────────────────────── */
    case 'display': {
      S('disp', 'Called display().');
      if (st.size === 0) {
        S('disp_empty', 'size is 0, so the else-branch runs.', undefined, 'Array is Empty!!');
        break;
      }
      let line = 'Array is: [';
      for (let i = 0; i < st.size; i++) {
        line += st.arr[i];
        if (i !== st.size - 1) line += ',';
        S('disp_loop', `cout << arr[${i}] → printed ${st.arr[i]}${i !== st.size - 1 ? ', then a comma because i != size - 1' : ''}.`, {
          hi: [i], ptrs: [{ name: 'i', index: i, color: 'orange' }],
        } as Partial<ArraySnap>);
      }
      line += ']';
      S('disp_end', 'Closing bracket printed. The loop only ever touched indices 0..size-1 — the slots past size are never printed.', undefined, line);
      break;
    }
  }

  return steps;
}

function rangeOf(a: number, b: number) {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

export const arrayLab: Lab = {
  id: 'array',
  title: 'Dynamic Array Class',
  icon: '📦',
  className: 'Array',
  blurb: 'A hand-rolled dynamic array: raw heap pointer, manual size/capacity tracking, and a regrow() that doubles the block when it fills up. Pick an operation and watch every shift happen slot by slot.',
  code,
  marks,
  ops: [
    { id: 'insertAtStart', label: 'Insert at start', sig: 'void insertAtStart(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(n)' },
    { id: 'insertAtIndex', label: 'Insert at index', sig: 'void insertAtIndex(int value, int index)', params: [{ name: 'value', label: 'value', def: 99 }, { name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'insertAtEnd', label: 'Insert at end', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(1) amortised' },
    { id: 'deleteFromStart', label: 'Delete from start', sig: 'void deleteFromStart()', params: [], big: 'O(n)' },
    { id: 'deleteFromIndex', label: 'Delete from index', sig: 'void deleteFromIndex(int index)', params: [{ name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'deleteFromEnd', label: 'Delete from end', sig: 'void deleteFromEnd()', params: [], big: 'O(1)' },
    { id: 'updateAtStart', label: 'Update at start', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 100 }], big: 'O(1)' },
    { id: 'updateAtIndex', label: 'Update at index', sig: 'void updateAtIndex(int index, int value)', params: [{ name: 'index', label: 'index', def: 1 }, { name: 'value', label: 'value', def: 200 }], big: 'O(1)' },
    { id: 'updateAtEnd', label: 'Update at end', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 300 }], big: 'O(1)' },
    { id: 'reverse', label: 'Reverse', sig: 'void reverse(int start, int end)', params: [], big: 'O(n)' },
    { id: 'reverseByK', label: 'Reverse by k', sig: 'void reverseByK(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateRight', label: 'Rotate right by k', sig: 'void rotateRight(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateLeft', label: 'Rotate left by k', sig: 'void rotateLeft(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 20 }], big: 'O(n)' },
    { id: 'traverse', label: 'Traverse', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n²)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n²)' },
    { id: 'removeDuplicates', label: 'Remove duplicates', sig: 'void removeDuplicates()', params: [], big: 'O(n²)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'display', label: 'Display', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: (): ArrState => ({
    arr: [10, 20, 30, null, null, null, null, null],
    size: 3,
    capacity: 8,
  }),
  snapshot,
  run,
};
