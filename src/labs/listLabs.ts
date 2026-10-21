import { parseCode, stepper, nextId, type Lab, type ListSnap, type LabStep, type Ptr } from './core';

/* ──────────────────────────────────────────────────────────────────────────
   Shared state shape for all three linked-list flavours.
   `order` is the PHYSICAL left-to-right layout. Nodes never move inside it —
   only the pointers change. That is why reverse() looks the way it does.
   ────────────────────────────────────────────────────────────────────────── */
interface LState {
  order: number[];
  floating: number[];
  vals: Record<number, number>;
  next: Record<number, number | null>;
  prev: Record<number, number | null>;
  head: number | null;
  tail: number | null;
  size: number;
}

function buildList(values: number[], kind: 'sll' | 'dll' | 'cll'): LState {
  const st: LState = { order: [], floating: [], vals: {}, next: {}, prev: {}, head: null, tail: null, size: 0 };
  let last: number | null = null;
  for (const v of values) {
    const id = nextId();
    st.order.push(id);
    st.vals[id] = v;
    st.next[id] = null;
    st.prev[id] = last;
    if (last !== null) st.next[last] = id;
    else st.head = id;
    last = id;
    st.size++;
  }
  st.tail = last;
  if (kind === 'cll' && last !== null && st.head !== null) st.next[last] = st.head;
  return st;
}

const snapOf = (st: LState, kind: 'sll' | 'dll' | 'cll'): ListSnap => ({
  kind: 'list',
  order: st.order.slice(),
  floating: st.floating.slice(),
  vals: { ...st.vals },
  next: { ...st.next },
  prev: kind === 'dll' ? { ...st.prev } : undefined,
  head: st.head,
  tail: kind === 'dll' ? st.tail : undefined,
  ptrs: [],
  hiNode: [],
  hiLink: [],
  doubly: kind === 'dll',
  circular: kind === 'cll',
});

const P = (name: string, id: number | null, color: Ptr['color'] = 'cyan'): Ptr => ({ name, id, color });
const valOf = (st: LState, id: number | null) => (id === null ? 'NULL' : String(st.vals[id]));

/* ══════════════════════════════════════════════════════════════════════════
   1. SINGLY LINKED LIST
   ══════════════════════════════════════════════════════════════════════════ */
const sll = parseCode(`
class Node
{
public:
	int data;
	Node* next;
	bool counted; // scratch flag used by frequencyCount()

	Node(int value) /*@node_ctor*/
	{
		data = value;
		next = nullptr;
		counted = false;
	}
};

class SinglyLinkedList
{
private:
	Node* head;
	int size;

public:
	SinglyLinkedList()
	{
		head = nullptr;
		size = 0;
	}

	// Insertion at Start
	void insertAtStart(int value) /*@is*/
	{
		Node* newNode = new Node(value); /*@is_new*/

		newNode->next = head; /*@is_link*/
		head = newNode; /*@is_head*/

		size++; /*@is_size*/
	}

	// Insertion at End
	void insertAtEnd(int value) /*@ie*/
	{
		Node* newNode = new Node(value); /*@ie_new*/

		if (head == nullptr) /*@ie_empty*/
		{
			head = newNode; /*@ie_first*/
			size++;
			return;
		}

		Node* temp = head; /*@ie_temp*/

		while (temp->next != nullptr) /*@ie_while*/
		{
			temp = temp->next; /*@ie_walk*/
		}

		temp->next = newNode; /*@ie_link*/

		size++; /*@ie_size*/
	}

	// Insertion at Index
	void insertAtIndex(int value, int index) /*@ii*/
	{
		if (index < 0 || index > size) /*@ii_check*/
		{
			cout << "Invalid Index!" << endl; /*@ii_bad*/
			return;
		}

		if (index == 0) /*@ii_zero*/
		{
			insertAtStart(value);
			return;
		}

		Node* newNode = new Node(value); /*@ii_new*/
		Node* temp = head; /*@ii_temp*/

		for (int i = 0; i < index - 1; i++) /*@ii_for*/
		{
			temp = temp->next; /*@ii_walk*/
		}

		newNode->next = temp->next; /*@ii_link1*/
		temp->next = newNode; /*@ii_link2*/

		size++; /*@ii_size*/
	}

	// Deletion from Start
	void deleteFromStart() /*@ds*/
	{
		if (head == nullptr) /*@ds_empty*/
		{
			cout << "List is Empty!" << endl; /*@ds_msg*/
			return;
		}

		Node* temp = head; /*@ds_temp*/
		head = head->next; /*@ds_head*/

		delete temp; /*@ds_free*/

		size--; /*@ds_size*/
	}

	// Deletion from End
	void deleteFromEnd() /*@de*/
	{
		if (head == nullptr) /*@de_empty*/
		{
			cout << "List is Empty!" << endl; /*@de_msg*/
			return;
		}

		if (head->next == nullptr) /*@de_single*/
		{
			delete head;
			head = nullptr; /*@de_single_done*/
			size--;
			return;
		}

		Node* temp = head; /*@de_temp*/

		while (temp->next->next != nullptr) /*@de_while*/
		{
			temp = temp->next; /*@de_walk*/
		}

		delete temp->next; /*@de_free*/
		temp->next = nullptr; /*@de_null*/

		size--; /*@de_size*/
	}

	// Deletion from Index
	void deleteFromIndex(int index) /*@di*/
	{
		if (index < 0 || index >= size) /*@di_check*/
		{
			cout << "Invalid Index!" << endl; /*@di_bad*/
			return;
		}

		if (index == 0) /*@di_zero*/
		{
			deleteFromStart();
			return;
		}

		Node* temp = head; /*@di_temp*/

		for (int i = 0; i < index - 1; i++) /*@di_for*/
		{
			temp = temp->next; /*@di_walk*/
		}

		Node* target = temp->next; /*@di_target*/
		temp->next = target->next; /*@di_bypass*/

		delete target; /*@di_free*/

		size--; /*@di_size*/
	}

	// Search
	int search(int value) /*@se*/
	{
		Node* temp = head; /*@se_temp*/
		int index = 0;

		while (temp != nullptr) /*@se_while*/
		{
			if (temp->data == value) /*@se_check*/
			{
				return index; /*@se_found*/
			}

			temp = temp->next; /*@se_walk*/
			index++;
		}

		return -1; /*@se_none*/
	}

	// Update at Index
	void updateAtIndex(int index, int value) /*@up*/
	{
		if (index < 0 || index >= size) /*@up_check*/
		{
			cout << "Invalid Index!" << endl; /*@up_bad*/
			return;
		}

		Node* temp = head; /*@up_temp*/

		for (int i = 0; i < index; i++) /*@up_for*/
		{
			temp = temp->next; /*@up_walk*/
		}

		temp->data = value; /*@up_set*/
	}

	// Reverse (3-pointer technique)
	void reverse() /*@rv*/
	{
		Node* prev = nullptr; /*@rv_init*/
		Node* curr = head;
		Node* nextNode = nullptr;

		while (curr != nullptr) /*@rv_while*/
		{
			nextNode = curr->next; /*@rv_save*/
			curr->next = prev; /*@rv_flip*/

			prev = curr; /*@rv_advance*/
			curr = nextNode;
		}

		head = prev; /*@rv_head*/
	}

	// Find Middle (slow / fast pointers)
	int findMiddle() /*@fm*/
	{
		if (head == nullptr)
		{
			return -1;
		}

		Node* slow = head; /*@fm_init*/
		Node* fast = head;

		while (fast != nullptr && fast->next != nullptr) /*@fm_while*/
		{
			slow = slow->next; /*@fm_move*/
			fast = fast->next->next;
		}

		return slow->data; /*@fm_done*/
	}

	// Detect Cycle (Floyd's Tortoise and Hare)
	bool detectCycle() /*@dc*/
	{
		Node* slow = head; /*@dc_init*/
		Node* fast = head;

		while (fast != nullptr && fast->next != nullptr) /*@dc_while*/
		{
			slow = slow->next; /*@dc_move*/
			fast = fast->next->next;

			if (slow == fast) /*@dc_check*/
			{
				return true; /*@dc_yes*/
			}
		}

		return false; /*@dc_no*/
	}

	// Remove the cycle (Floyd's algorithm, phase 2)
	void removeCycle() /*@rc*/
	{
		Node* slow = head; /*@rc_init*/
		Node* fast = head;

		while (fast != nullptr && fast->next != nullptr) /*@rc_while*/
		{
			slow = slow->next; /*@rc_move*/
			fast = fast->next->next;

			if (slow == fast) break; /*@rc_meet*/
		}

		if (fast == nullptr || fast->next == nullptr) return; /*@rc_none*/

		slow = head; /*@rc_reset*/

		if (slow == fast) /*@rc_head*/
		{
			while (fast->next != slow) /*@rc_headloop*/
				fast = fast->next;
		}
		else
		{
			while (slow->next != fast->next) /*@rc_find*/
			{
				slow = slow->next; /*@rc_find_move*/
				fast = fast->next;
			}
		}

		fast->next = nullptr; /*@rc_cut*/
	}

	// Update at Start
	void updateAtStart(int value) /*@ust*/
	{
		if (head == nullptr) /*@ust_empty*/
		{
			cout << "List is Empty!" << endl; /*@ust_msg*/
			return;
		}

		head->data = value; /*@ust_set*/
	}

	// Update at End
	void updateAtEnd(int value) /*@uen*/
	{
		if (head == nullptr) /*@uen_empty*/
		{
			cout << "List is Empty!" << endl; /*@uen_msg*/
			return;
		}

		Node* temp = head; /*@uen_temp*/

		while (temp->next != nullptr) /*@uen_while*/
		{
			temp = temp->next; /*@uen_walk*/
		}

		temp->data = value; /*@uen_set*/
	}

	// Traverse (visit every node from head to the end)
	void traverse() /*@tv*/
	{
		Node* temp = head; /*@tv_temp*/

		while (temp != nullptr) /*@tv_while*/
		{
			cout << temp->data << " "; /*@tv_print*/
			temp = temp->next; /*@tv_walk*/
		}

		cout << endl; /*@tv_done*/
	}

	// Sort Ascending (bubble sort — swaps node DATA, links stay untouched)
	void sortAscending() /*@sasc*/
	{
		if (head == nullptr) return;

		bool swapped = true; /*@sasc_flag*/

		while (swapped) /*@sasc_outer*/
		{
			swapped = false;
			Node* temp = head; /*@sasc_temp*/

			while (temp->next != nullptr) /*@sasc_inner*/
			{
				if (temp->data > temp->next->data) /*@sasc_cmp*/
				{
					int t = temp->data; /*@sasc_swap*/
					temp->data = temp->next->data;
					temp->next->data = t;
					swapped = true; /*@sasc_flagset*/
				}

				temp = temp->next; /*@sasc_walk*/
			}
		}
	}

	// Sort Descending
	void sortDescending() /*@sdesc*/
	{
		if (head == nullptr) return;

		bool swapped = true; /*@sdesc_flag*/

		while (swapped) /*@sdesc_outer*/
		{
			swapped = false;
			Node* temp = head; /*@sdesc_temp*/

			while (temp->next != nullptr) /*@sdesc_inner*/
			{
				if (temp->data < temp->next->data) /*@sdesc_cmp*/
				{
					int t = temp->data; /*@sdesc_swap*/
					temp->data = temp->next->data;
					temp->next->data = t;
					swapped = true; /*@sdesc_flagset*/
				}

				temp = temp->next; /*@sdesc_walk*/
			}
		}
	}

	// Reverse in blocks of k (collect a block, then swap DATA symmetrically)
	void reverseByK(int k) /*@revk*/
	{
		Node* temp = head; /*@revk_outer*/

		while (temp != nullptr) /*@revk_while*/
		{
			Node* nodes[64]; /*@revk_collect*/
			int count = 0;
			Node* walker = temp;

			while (walker != nullptr && count < k) /*@revk_gather*/
			{
				nodes[count] = walker; /*@revk_store*/
				walker = walker->next;
				count++;
			}

			int l = 0, r = count - 1; /*@revk_lr*/

			while (l < r) /*@revk_swaploop*/
			{
				int t = nodes[l]->data; /*@revk_swap*/
				nodes[l]->data = nodes[r]->data;
				nodes[r]->data = t;
				l++;
				r--;
			}

			temp = walker; /*@revk_advance*/
		}
	}

	// Rotate Left by k (the first k nodes move to the back)
	void rotateLeft(int k) /*@rotl*/
	{
		if (head == nullptr || head->next == nullptr) /*@rotl_guard*/
		{
			return;
		}

		k = k % size; /*@rotl_k*/

		if (k == 0) /*@rotl_zero*/
		{
			return;
		}

		Node* newTail = head; /*@rotl_newtail*/

		for (int i = 0; i < k - 1; i++) /*@rotl_walk1*/
		{
			newTail = newTail->next;
		}

		Node* newHead = newTail->next; /*@rotl_newhead*/
		newTail->next = nullptr; /*@rotl_cut*/

		Node* oldTail = newHead; /*@rotl_oldtail*/

		while (oldTail->next != nullptr) /*@rotl_walk2*/
		{
			oldTail = oldTail->next;
		}

		oldTail->next = head; /*@rotl_link*/
		head = newHead; /*@rotl_head*/
	}

	// Rotate Right by k (the last k nodes move to the front)
	void rotateRight(int k) /*@rotr*/
	{
		if (head == nullptr || head->next == nullptr) /*@rotr_guard*/
		{
			return;
		}

		k = k % size; /*@rotr_k*/

		if (k == 0) /*@rotr_zero*/
		{
			return;
		}

		rotateLeft(size - k); /*@rotr_call*/
	}

	// Remove Duplicates (keeps first occurrence, works on any order)
	void removeDuplicates() /*@dedup*/
	{
		if (head == nullptr) return;

		Node* outer = head; /*@dedup_outer*/

		while (outer != nullptr) /*@dedup_owhile*/
		{
			Node* runner = outer; /*@dedup_runner*/

			while (runner->next != nullptr) /*@dedup_rwhile*/
			{
				if (runner->next->data == outer->data) /*@dedup_cmp*/
				{
					Node* dup = runner->next; /*@dedup_target*/
					runner->next = runner->next->next; /*@dedup_bypass*/
					delete dup; /*@dedup_free*/
					size--;
				}
				else
				{
					runner = runner->next; /*@dedup_advance*/
				}
			}

			outer = outer->next; /*@dedup_next*/
		}
	}

	// Frequency Count (prints how many times each distinct value appears)
	void frequencyCount() /*@freq*/
	{
		Node* outer = head; /*@freq_outer*/

		while (outer != nullptr) /*@freq_owhile*/
		{
			if (!outer->counted) /*@freq_check*/
			{
				int count = 1; /*@freq_init*/
				Node* inner = outer->next; /*@freq_inner*/

				while (inner != nullptr) /*@freq_iwhile*/
				{
					if (!inner->counted && inner->data == outer->data) /*@freq_cmp*/
					{
						count++; /*@freq_bump*/
						inner->counted = true;
					}

					inner = inner->next; /*@freq_iwalk*/
				}

				cout << outer->data << " -> " << count << endl; /*@freq_print*/
			}

			outer = outer->next; /*@freq_owalk*/
		}
	}

	// Display
	void display() /*@dp*/
	{
		Node* temp = head; /*@dp_temp*/

		while (temp != nullptr) /*@dp_while*/
		{
			cout << temp->data << " -> "; /*@dp_print*/
			temp = temp->next;
		}

		cout << "NULL" << endl; /*@dp_null*/
	}

	// Destructor
	~SinglyLinkedList()
	{
		Node* temp = head;

		while (temp != nullptr)
		{
			Node* nextNode = temp->next;
			delete temp;
			temp = nextNode;
		}

		head = nullptr;
	}
};
`);

function runSllCore(st: LState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(sll.marks, () => snapOf(st, 'sll'));
  const M = (p: Partial<ListSnap>) => p as Partial<ListSnap>;

  /* after reverse the physical order no longer matches traversal order —
     this redraws the list left-to-right from head without changing anything */
  const relayout = () => {
    const seen = new Set<number>();
    const out: number[] = [];
    let cur = st.head;
    while (cur !== null && !seen.has(cur)) { seen.add(cur); out.push(cur); cur = st.next[cur]; }
    for (const id of st.order) if (!seen.has(id)) out.push(id);
    st.order = out;
  };

  const insertAtStart = (v: number) => {
    const id = nextId();
    st.vals[id] = v; st.next[id] = null; st.floating.push(id);
    S('is_new', `Node* newNode = new Node(${v}) — memory is allocated on the heap. newNode->next is nullptr and the node is floating free, not part of the list yet.`,
      M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green'), P('head', st.head)] }));
    st.next[id] = st.head;
    S('is_link', `newNode->next = head — the new node now points at the OLD first node (${valOf(st, st.head)}). Order matters: if you moved head first, you would lose the rest of the list forever.`,
      M({ floating: [id], hiNode: [id], hiLink: [id], ptrs: [P('newNode', id, 'green'), P('head', st.head)] }));
    st.head = id;
    st.order.unshift(id);
    st.floating = st.floating.filter(x => x !== id);
    S('is_head', `head = newNode — the list officially starts at ${v} now.`,
      M({ hiNode: [id], ptrs: [P('head', id)] }));
    st.size++;
    S('is_size', `size++ → ${st.size}. No traversal, no shifting: O(1). This is the one thing a linked list does better than an array.`, M({ ptrs: [P('head', st.head)] }));
  };

  /* A list with a cycle has no end: every op that walks "until nullptr" would never stop (and would
     fill the browser's memory with steps). Only the two cycle ops may run on such a list. */
  {
    const seenC = new Set<number>();
    let c: number | null | undefined = st.head;
    let cyclic = false;
    while (c !== null && c !== undefined) { if (seenC.has(c)) { cyclic = true; break; } seenC.add(c); c = st.next[c]; }
    if (cyclic && opId !== 'detectCycle' && opId !== 'removeCycle') {
      S('dc', 'This list has a cycle — the tail points back into the list, so there is no nullptr at the end. Any operation that walks until nullptr would loop forever. Run “Detect cycle”, then “Remove the cycle” (or press Reset object) to continue.');
      return steps;
    }
  }

  switch (opId) {
    case 'insertAtStart': {
      S('is', `Called insertAtStart(${a.value}).`);
      insertAtStart(a.value);
      break;
    }

    case 'insertAtEnd': {
      const v = a.value;
      S('ie', `Called insertAtEnd(${v}).`);
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.floating.push(id);
      S('ie_new', `Node* newNode = new Node(${v}) — allocated, next = nullptr, still floating outside the list.`,
        M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      S('ie_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`, M({ floating: [id], ptrs: [P('head', st.head)] }));
      if (st.head === null) {
        st.head = id; st.order.push(id); st.floating = [];
        st.size++;
        S('ie_first', `The list was empty, so head = newNode and we return early. size → ${st.size}.`, M({ hiNode: [id], ptrs: [P('head', id)] }));
        break;
      }
      let temp: number = st.head;
      S('ie_temp', `Node* temp = head — temp is the walker. We cannot jump to the end, so we have to walk there.`,
        M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      while (st.next[temp] !== null) {
        S('ie_while', `temp->next != nullptr → true (temp is at ${valOf(st, temp)}, its next is ${valOf(st, st.next[temp])}). Keep walking.`,
          M({ floating: [id], hiNode: [temp], hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
        temp = st.next[temp]!;
        S('ie_walk', `temp = temp->next → temp is now sitting on ${valOf(st, temp)}.`,
          M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      }
      S('ie_while', `temp->next != nullptr → false. temp is on ${valOf(st, temp)}, the LAST node. Loop exits.`,
        M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.next[temp] = id;
      st.order.push(id);
      st.floating = st.floating.filter(x => x !== id);
      S('ie_link', `temp->next = newNode — one single pointer write, and ${v} is part of the list. Nothing was copied or moved.`,
        M({ hiNode: [id], hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.size++;
      S('ie_size', `size++ → ${st.size}. The walk made this O(n) — keeping a tail pointer would make it O(1).`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'insertAtIndex': {
      const v = a.value, idx = a.index;
      S('ii', `Called insertAtIndex(${v}, ${idx}).`);
      S('ii_check', `Guard: ${idx} < 0 || ${idx} > ${st.size} → ${idx < 0 || idx > st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx > st.size) { S('ii_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      S('ii_zero', `index == 0? → ${idx === 0 ? 'true — hand off to insertAtStart()' : 'false'}.`);
      if (idx === 0) { insertAtStart(v); break; }
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.floating.push(id);
      S('ii_new', `Node* newNode = new Node(${v}).`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      let temp: number = st.head!;
      S('ii_temp', `Node* temp = head. We need to stop on the node BEFORE index ${idx}, i.e. index ${idx - 1}.`,
        M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      for (let i = 0; i < idx - 1; i++) {
        S('ii_for', `i = ${i} < index - 1 = ${idx - 1} → walk once more.`, M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp]!;
        S('ii_walk', `temp = temp->next → temp is on ${valOf(st, temp)} (index ${i + 1}).`,
          M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      }
      st.next[id] = st.next[temp];
      S('ii_link1', `newNode->next = temp->next — newNode grabs the rest of the list (${valOf(st, st.next[temp])}) FIRST. Do this before the next line or that tail is lost.`,
        M({ floating: [id], hiNode: [id], hiLink: [id], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.next[temp] = id;
      const pos = st.order.indexOf(temp);
      st.order.splice(pos + 1, 0, id);
      st.floating = st.floating.filter(x => x !== id);
      S('ii_link2', `temp->next = newNode — the node before it now points at newNode. The chain is whole again, with ${v} spliced into position ${idx}.`,
        M({ hiNode: [id], hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.size++;
      S('ii_size', `size++ → ${st.size}. O(n) to walk, O(1) to splice.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'deleteFromStart': {
      S('ds', 'Called deleteFromStart().');
      S('ds_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('ds_msg', 'Nothing to delete.', undefined, 'List is Empty!'); break; }
      const old = st.head;
      S('ds_temp', `Node* temp = head — we must hold onto the old first node, otherwise after moving head we would have no pointer left to free it (a memory leak).`,
        M({ hiNode: [old], ptrs: [P('temp', old, 'orange'), P('head', old)] }));
      st.head = st.next[old];
      S('ds_head', `head = head->next → head now points at ${valOf(st, st.head)}.`,
        M({ hiNode: [old], dying: [old], ptrs: [P('temp', old, 'orange'), P('head', st.head)] }));
      st.order = st.order.filter(x => x !== old);
      delete st.next[old]; delete st.vals[old];
      S('ds_free', 'delete temp — the old node is handed back to the heap. In C++ nobody does this for you.',
        M({ ptrs: [P('head', st.head)] }));
      st.size--;
      S('ds_size', `size-- → ${st.size}. O(1), no walking needed.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'deleteFromEnd': {
      S('de', 'Called deleteFromEnd().');
      S('de_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('de_msg', 'Nothing to delete.', undefined, 'List is Empty!'); break; }
      S('de_single', `head->next == nullptr? → ${st.next[st.head] === null ? 'true — only one node in the list' : 'false'}.`, M({ hiNode: [st.head], ptrs: [P('head', st.head)] }));
      if (st.next[st.head] === null) {
        const only = st.head;
        st.head = null; st.order = []; st.size--;
        delete st.next[only]; delete st.vals[only];
        S('de_single_done', `Freed the only node and set head = nullptr. size → ${st.size}.`, M({ ptrs: [P('head', null)] }));
        break;
      }
      let temp: number = st.head;
      S('de_temp', 'Node* temp = head. We need the SECOND-last node, because in a singly list a node cannot reach backwards to its predecessor.',
        M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      while (st.next[st.next[temp]!] !== null) {
        S('de_while', `temp->next->next != nullptr → true (temp is on ${valOf(st, temp)}). Not there yet.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp]!;
        S('de_walk', `temp = temp->next → temp is on ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      const last = st.next[temp]!;
      S('de_while', `temp->next->next != nullptr → false. temp (${valOf(st, temp)}) is the second-last node, temp->next (${valOf(st, last)}) is the tail.`,
        M({ hiNode: [temp, last], dying: [last], ptrs: [P('temp', temp, 'orange')] }));
      S('de_free', `delete temp->next — the tail node ${valOf(st, last)} is freed.`, M({ hiNode: [temp], dying: [last], ptrs: [P('temp', temp, 'orange')] }));
      st.next[temp] = null;
      st.order = st.order.filter(x => x !== last);
      delete st.next[last]; delete st.vals[last];
      S('de_null', 'temp->next = nullptr — critical. Skipping this leaves a dangling pointer to freed memory, and the next traversal crashes.',
        M({ hiNode: [temp], hiLink: [temp], ptrs: [P('temp', temp, 'orange')] }));
      st.size--;
      S('de_size', `size-- → ${st.size}. O(n), because the walk is unavoidable without a prev pointer.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'deleteFromIndex': {
      const idx = a.index;
      S('di', `Called deleteFromIndex(${idx}).`);
      S('di_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('di_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      S('di_zero', `index == 0? → ${idx === 0 ? 'true — deleteFromStart() handles it' : 'false'}.`);
      if (idx === 0) {
        const old = st.head!;
        st.head = st.next[old];
        st.order = st.order.filter(x => x !== old);
        delete st.next[old]; delete st.vals[old];
        st.size--;
        S('ds_size', `Delegated to deleteFromStart(). size → ${st.size}.`, M({ ptrs: [P('head', st.head)] }));
        break;
      }
      let temp: number = st.head!;
      S('di_temp', `Node* temp = head. Stop on index ${idx - 1}, the node just before the victim.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx - 1; i++) {
        temp = st.next[temp]!;
        S('di_walk', `temp = temp->next → temp is on ${valOf(st, temp)} (index ${i + 1}).`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      const target = st.next[temp]!;
      S('di_target', `Node* target = temp->next → target is ${valOf(st, target)}, the node we are removing.`,
        M({ hiNode: [target], ptrs: [P('temp', temp, 'orange'), P('target', target, 'pink')] }));
      st.next[temp] = st.next[target];
      S('di_bypass', `temp->next = target->next — the list now routes AROUND target, straight to ${valOf(st, st.next[target])}.`,
        M({ hiLink: [temp], dying: [target], ptrs: [P('temp', temp, 'orange'), P('target', target, 'pink')] }));
      st.order = st.order.filter(x => x !== target);
      delete st.next[target]; delete st.vals[target];
      S('di_free', 'delete target — only now is it safe to free it, because nothing points at it any more.', M({ hiNode: [temp] }));
      st.size--;
      S('di_size', `size-- → ${st.size}.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}).`);
      let temp = st.head, index = 0;
      S('se_temp', 'Node* temp = head, int index = 0. No random access here — we must compare node by node.', M({ ptrs: [P('temp', temp, 'orange')] }));
      while (temp !== null) {
        S('se_while', `temp != nullptr → true.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        S('se_check', `temp->data (${st.vals[temp]}) == ${v}? → ${st.vals[temp] === v ? 'YES' : 'no'}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        if (st.vals[temp] === v) {
          S('se_found', `Found at index ${index}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }), `search(${v}) returned ${index}`);
          temp = null;
          break;
        }
        temp = st.next[temp];
        index++;
        if (temp !== null) S('se_walk', `Not a match. temp = temp->next → index is now ${index}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      if (index === st.size) {
        S('se_while', 'temp != nullptr → false. We walked off the end of the list.', M({ ptrs: [P('temp', null, 'orange')] }));
        S('se_none', 'return -1 — the value is not in the list. Worst case O(n).', undefined, `search(${v}) returned -1`);
      }
      break;
    }

    case 'updateAtIndex': {
      const idx = a.index, v = a.value;
      S('up', `Called updateAtIndex(${idx}, ${v}).`);
      S('up_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('up_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      let temp: number = st.head!;
      S('up_temp', 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx; i++) {
        temp = st.next[temp]!;
        S('up_walk', `temp = temp->next → index ${i + 1}, value ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      st.vals[temp] = v;
      S('up_set', `temp->data = ${v}. Only the payload changed — every pointer in the list is untouched.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      break;
    }

    case 'reverse': {
      S('rv', 'Called reverse(). Watch closely: the boxes never move. Only the arrows flip.');
      let prev: number | null = null;
      let curr: number | null = st.head;
      let nxt: number | null = null;
      S('rv_init', 'prev = nullptr, curr = head, nextNode = nullptr. Three pointers, O(1) extra space.',
        M({ ptrs: [P('prev', prev, 'purple'), P('curr', curr, 'orange'), P('nextNode', nxt, 'green')] }));
      while (curr !== null) {
        S('rv_while', `curr != nullptr → true (curr is on ${valOf(st, curr)}).`,
          M({ hiNode: [curr], ptrs: [P('prev', prev, 'purple'), P('curr', curr, 'orange')] }));
        nxt = st.next[curr];
        S('rv_save', `nextNode = curr->next → saved ${valOf(st, nxt)}. This save is mandatory: the very next line destroys curr->next.`,
          M({ hiNode: [curr], ptrs: [P('prev', prev, 'purple'), P('curr', curr, 'orange'), P('nextNode', nxt, 'green')] }));
        st.next[curr] = prev;
        S('rv_flip', `curr->next = prev → ${valOf(st, curr)} now points ${prev === null ? 'at nullptr (it is becoming the new tail)' : `BACKWARDS at ${valOf(st, prev)}`}.`,
          M({ hiNode: [curr], hiLink: [curr], ptrs: [P('prev', prev, 'purple'), P('curr', curr, 'orange'), P('nextNode', nxt, 'green')] }));
        prev = curr;
        curr = nxt;
        S('rv_advance', `prev = curr, curr = nextNode → the window slides one node right. prev is on ${valOf(st, prev)}, curr on ${valOf(st, curr)}.`,
          M({ ptrs: [P('prev', prev, 'purple'), P('curr', curr, 'orange'), P('nextNode', nxt, 'green')] }));
      }
      S('rv_while', 'curr != nullptr → false. Every link has been flipped.', M({ ptrs: [P('prev', prev, 'purple'), P('curr', null, 'orange')] }));
      st.head = prev;
      S('rv_head', `head = prev → head is now ${valOf(st, prev)}, the old tail. O(n) time, O(1) space.`, M({ ptrs: [P('head', st.head)] }));
      relayout();
      S('rv_head', 'Same list, just redrawn left-to-right starting from head — nothing in memory moved.', M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'findMiddle': {
      S('fm', 'Called findMiddle() — the slow/fast (tortoise and hare) trick, one pass only.');
      if (st.head === null) { S('fm', 'Empty list, returning -1.', undefined, 'findMiddle() returned -1'); break; }
      let slow: number | null = st.head, fast: number | null = st.head;
      S('fm_init', 'slow = head, fast = head.', M({ hiNode: [slow!], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      while (fast !== null && st.next[fast] !== null) {
        S('fm_while', `fast != nullptr && fast->next != nullptr → true.`, M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        slow = st.next[slow!];
        fast = st.next[st.next[fast]!];
        S('fm_move', `slow moves 1 → ${valOf(st, slow)}, fast moves 2 → ${valOf(st, fast)}. Fast covers twice the ground, so when it hits the end slow is exactly halfway.`,
          M({ hiNode: slow !== null ? [slow] : [], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      }
      S('fm_while', 'fast reached the end (or its next is nullptr). Loop exits.', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      S('fm_done', `return slow->data → the middle element is ${valOf(st, slow)}.`,
        M({ hiNode: slow !== null ? [slow] : [], ptrs: [P('slow', slow, 'cyan')] }), `findMiddle() returned ${valOf(st, slow)}`);
      break;
    }

    case 'makeCycle': {
      if (st.size < 2) { S('dc', 'Need at least 2 nodes to build a cycle.'); break; }
      const last = st.order[st.order.length - 1];
      const target = st.order[Math.min(a.index ?? 1, st.order.length - 2)];
      st.next[last] = target;
      S('dc', `Manually wired the tail's next pointer back to ${valOf(st, target)}. The list now has a cycle — display() would loop forever. Run detectCycle() next.`,
        M({ hiLink: [last], hiNode: [target] }));
      break;
    }

    case 'detectCycle': {
      S('dc', "Called detectCycle() — Floyd's tortoise and hare.");
      let slow: number | null = st.head, fast: number | null = st.head;
      S('dc_init', 'slow = head, fast = head. Both start at the same place.', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      let guard = 0;
      while (fast !== null && st.next[fast] !== undefined && st.next[fast] !== null && guard++ < 60) {
        S('dc_while', 'fast != nullptr && fast->next != nullptr → true.', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        slow = st.next[slow!]!;
        fast = st.next[st.next[fast]!]!;
        S('dc_move', `slow → ${valOf(st, slow)}, fast → ${valOf(st, fast)}.`,
          M({ hiNode: [slow, fast].filter(x => x !== null) as number[], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        S('dc_check', `slow == fast? → ${slow === fast ? 'YES — they met' : 'no'}.`, M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        if (slow === fast) {
          S('dc_yes', 'Two pointers moving at different speeds inside a loop MUST eventually collide. A cycle exists. O(n) time, O(1) space.',
            M({ hiNode: [slow!], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }), 'detectCycle() returned true');
          return steps;
        }
      }
      S('dc_while', 'fast walked off the end — a node with a nullptr next cannot be part of a loop.', M({ ptrs: [P('fast', null, 'pink')] }));
      S('dc_no', 'return false — no cycle.', undefined, 'detectCycle() returned false');
      break;
    }

    case 'removeCycle': {
      S('rc', "Called removeCycle() — Floyd's algorithm, phase 2: first meet inside the loop, then find where the loop starts.");
      let slow: number | null = st.head, fast: number | null = st.head;
      S('rc_init', 'slow = head, fast = head.', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      let met = false, guard = 0;
      while (fast !== null && st.next[fast] !== undefined && st.next[fast] !== null && guard++ < 80) {
        S('rc_while', 'fast != nullptr && fast->next != nullptr → true.', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        slow = st.next[slow!]!;
        fast = st.next[st.next[fast]!]!;
        S('rc_move', `slow moves 1 step → ${valOf(st, slow)}, fast moves 2 steps → ${valOf(st, fast)}.`, M({ hiNode: [slow, fast].filter(x => x !== null) as number[], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        const same = slow === fast;
        S('rc_meet', same ? 'slow == fast → they met inside the loop. break.' : 'slow == fast? no — keep going.', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        if (same) { met = true; break; }
      }
      if (!met || fast === null) {
        S('rc_none', 'fast reached the end → there is no cycle, nothing to remove.', undefined, 'No cycle found');
        break;
      }
      slow = st.head;
      S('rc_reset', 'Reset slow to head. The distance head → loop start equals the distance meeting point → loop start (going around), so moving both one step at a time makes them reach the loop start together.',
        M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      if (slow === fast) {
        S('rc_head', 'slow == fast right away → the loop starts at head itself. Walk fast around to the LAST node of the loop (the one whose next is head).', M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        let g2 = 0;
        while (st.next[fast!] !== slow && g2++ < 80) {
          S('rc_headloop', `fast->next (${valOf(st, st.next[fast!] ?? null)}) != head → move fast forward.`, M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
          fast = st.next[fast!]!;
        }
        S('rc_headloop', 'fast->next == head → fast is the last node of the loop.', M({ hiNode: [fast!], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      } else {
        let g2 = 0;
        while (st.next[slow!] !== st.next[fast!] && g2++ < 80) {
          S('rc_find', `slow->next (${valOf(st, st.next[slow!] ?? null)}) != fast->next (${valOf(st, st.next[fast!] ?? null)}) → advance both by one.`, M({ ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
          slow = st.next[slow!]!;
          fast = st.next[fast!]!;
          S('rc_find_move', `slow → ${valOf(st, slow)}, fast → ${valOf(st, fast)}.`, M({ hiNode: [slow, fast].filter(x => x !== null) as number[], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
        }
        S('rc_find', `slow->next == fast->next == ${valOf(st, st.next[fast!] ?? null)}: that node is where the loop starts, and fast is the last node inside the loop.`, M({ hiNode: [fast!], ptrs: [P('slow', slow, 'cyan'), P('fast', fast, 'pink')] }));
      }
      st.next[fast!] = null;
      S('rc_cut', `fast->next = nullptr — the loop is cut. The list ends normally again.`, M({ hiLink: [fast!], ptrs: [P('fast', fast, 'pink')] }), 'Cycle removed');
      break;
    }

    case 'updateAtStart': {
      S('ust', `Called updateAtStart(${a.value}).`);
      S('ust_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('ust_msg', 'Nothing to update.', undefined, 'List is Empty!'); break; }
      st.vals[st.head] = a.value;
      S('ust_set', `head->data = ${a.value}. O(1) — no walking needed, head is already known.`, M({ hiNode: [st.head], ptrs: [P('head', st.head)] }));
      break;
    }

    case 'updateAtEnd': {
      S('uen', `Called updateAtEnd(${a.value}).`);
      S('uen_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('uen_msg', 'Nothing to update.', undefined, 'List is Empty!'); break; }
      let temp: number = st.head;
      S('uen_temp', 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      while (st.next[temp] !== null) {
        S('uen_while', `temp->next != nullptr → true. Keep walking — a singly list cannot jump straight to the tail.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp]!;
        S('uen_walk', `temp = temp->next → now on ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      S('uen_while', 'temp->next != nullptr → false. temp is the tail.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      st.vals[temp] = a.value;
      S('uen_set', `temp->data = ${a.value}. O(n) here — no tail pointer is kept in this class.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      break;
    }

    case 'traverse': {
      S('tv', 'Called traverse().');
      let temp = st.head;
      S('tv_temp', 'Node* temp = head.', M({ ptrs: [P('temp', temp, 'orange')] }));
      let guard = 0;
      while (temp !== null && guard++ < 40) {
        S('tv_while', `temp != nullptr → true (on ${valOf(st, temp)}).`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        S('tv_print', `cout << temp->data → printed ${st.vals[temp]}.`, M({ hiNode: [temp] }), `${st.vals[temp]}`);
        temp = st.next[temp];
        if (temp !== null) S('tv_walk', `temp = temp->next → now on ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      S('tv_while', 'temp != nullptr → false. Every node was visited exactly once.', M({ ptrs: [P('temp', null, 'orange')] }));
      S('tv_done', 'Traversal complete.');
      break;
    }
    case 'sortAscending':
    case 'sortDescending': {
      const asc = opId === 'sortAscending';
      const [mOuter, mInner, mTemp, mCmp, mSwap, mFlag, mFlagSet] = asc
        ? ['sasc_outer', 'sasc_inner', 'sasc_temp', 'sasc_cmp', 'sasc_swap', 'sasc_flag', 'sasc_flagset']
        : ['sdesc_outer', 'sdesc_inner', 'sdesc_temp', 'sdesc_cmp', 'sdesc_swap', 'sdesc_flag', 'sdesc_flagset'];
      S(asc ? 'sasc' : 'sdesc', `Called sort${asc ? 'Ascending' : 'Descending'}() — bubble sort by swapping node DATA. The links never change; only the payload each box holds does.`);
      if (st.head === null) break;
      let swapped = true;
      let pass = 0;
      while (swapped) {
        swapped = false;
        S(mFlag, `Pass ${++pass}: swapped = false.`);
        let temp: number = st.head;
        S(mTemp, 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        while (st.next[temp] !== null) {
          S(mInner, `temp->next != nullptr → true. Comparing ${valOf(st, temp)} and ${valOf(st, st.next[temp])}.`, {
            hiNode: [temp, st.next[temp]!], ptrs: [P('temp', temp, 'orange')],
          } as Partial<ListSnap>);
          const nx = st.next[temp]!;
          const doSwap = asc ? st.vals[temp] > st.vals[nx] : st.vals[temp] < st.vals[nx];
          S(mCmp, `temp->data ${asc ? '>' : '<'} temp->next->data → ${st.vals[temp]} ${asc ? '>' : '<'} ${st.vals[nx]} → ${doSwap}.`);
          if (doSwap) {
            const t = st.vals[temp]; st.vals[temp] = st.vals[nx]; st.vals[nx] = t;
            swapped = true;
            S(mSwap, `Swapped the DATA → temp is now ${st.vals[temp]}, temp->next is now ${st.vals[nx]}.`, { hiNode: [temp, nx] } as Partial<ListSnap>);
            S(mFlagSet, 'swapped = true — at least one more pass will be needed.');
          }
          temp = nx;
        }
        S(mOuter, `temp->next == nullptr — reached the end of this pass. swapped = ${swapped}.`);
      }
      break;
    }

    case 'reverseByK': {
      const k = Math.max(1, a.k);
      S('revk', `Called reverseByK(${k}). Each block of ${k} nodes has its DATA reversed — the links stay exactly as they were.`);
      let temp: number | null = st.head;
      let guard = 0;
      while (temp !== null && guard++ < 20) {
        S('revk_outer', `Starting a new block at ${valOf(st, temp)}.`, { hiNode: [temp], ptrs: [P('temp', temp, 'orange')] } as Partial<ListSnap>);
        const block: number[] = [];
        let walker: number | null = temp;
        while (walker !== null && block.length < k) {
          block.push(walker);
          S('revk_store', `nodes[${block.length - 1}] = ${valOf(st, walker)} — collected into a scratch array (max size ${k}), since a singly node can't be walked backwards.`, {
            hiNode: block.slice(), ptrs: [P('walker', walker, 'green')],
          } as Partial<ListSnap>);
          walker = st.next[walker];
        }
        let l = 0, r = block.length - 1;
        S('revk_lr', `l = 0, r = ${r} — two indices into the scratch array, working inward.`);
        while (l < r) {
          const a1 = block[l], a2 = block[r];
          const t = st.vals[a1]; st.vals[a1] = st.vals[a2]; st.vals[a2] = t;
          S('revk_swap', `Swapped nodes[${l}] (${valOf(st, a1)}) and nodes[${r}] (${valOf(st, a2)}).`, { hiNode: [a1, a2] } as Partial<ListSnap>);
          l++; r--;
        }
        temp = walker;
      }
      S('revk_advance', 'Done — every block has been reversed in place.');
      break;
    }

    case 'rotateLeft':
    case 'rotateRight': {
      const isLeft = opId === 'rotateLeft';
      S(isLeft ? 'rotl' : 'rotr', `Called ${isLeft ? 'rotateLeft' : 'rotateRight'}(${a.k}).`);
      S(isLeft ? 'rotl_guard' : 'rotr_guard', `head == nullptr || head->next == nullptr → ${st.head === null || st.next[st.head] === null ? 'true — nothing to rotate' : 'false'}.`);
      if (st.head === null || st.next[st.head] === null) break;
      let k = ((a.k % st.size) + st.size) % st.size;
      S(isLeft ? 'rotl_k' : 'rotr_k', `k = ${a.k} % ${st.size} = ${k}.`);
      if (k === 0) { S(isLeft ? 'rotl_zero' : 'rotr_zero', 'k == 0 — rotating by a full cycle (or none) changes nothing. Returning.'); break; }
      const effK = isLeft ? k : st.size - k;
      if (!isLeft) S('rotr_call', `rotateRight(${a.k}) delegates to rotateLeft(size - k) = rotateLeft(${effK}) — moving the LAST k nodes to the front is the same as moving the first (size-k) to the back.`);
      let newTail: number = st.head;
      S('rotl_newtail', `Node* newTail = head. Walk ${effK - 1} more step(s) to land on node ${effK} — that becomes the new tail.`, { hiNode: [newTail], ptrs: [P('newTail', newTail, 'orange')] } as Partial<ListSnap>);
      for (let i = 0; i < effK - 1; i++) {
        newTail = st.next[newTail]!;
        S('rotl_walk1', `newTail = newTail->next → now on ${valOf(st, newTail)}.`, { hiNode: [newTail], ptrs: [P('newTail', newTail, 'orange')] } as Partial<ListSnap>);
      }
      const newHead = st.next[newTail]!;
      S('rotl_newhead', `Node* newHead = newTail->next → ${valOf(st, newHead)}. This node becomes the new front of the list.`, {
        hiNode: [newHead], ptrs: [P('newTail', newTail, 'orange'), P('newHead', newHead, 'green')],
      } as Partial<ListSnap>);
      st.next[newTail] = null;
      S('rotl_cut', `newTail->next = nullptr — the list is split into two pieces here.`, { hiLink: [newTail] } as Partial<ListSnap>);
      let oldTail: number = newHead;
      S('rotl_oldtail', `Node* oldTail = newHead — walk to the end of the SECOND piece.`, { hiNode: [oldTail], ptrs: [P('oldTail', oldTail, 'pink')] } as Partial<ListSnap>);
      while (st.next[oldTail] !== null) {
        oldTail = st.next[oldTail]!;
        S('rotl_walk2', `oldTail = oldTail->next → now on ${valOf(st, oldTail)}.`, { hiNode: [oldTail], ptrs: [P('oldTail', oldTail, 'pink')] } as Partial<ListSnap>);
      }
      st.next[oldTail] = st.head;
      S('rotl_link', `oldTail->next = head — the old front of the list is stitched onto the end of the second piece.`, { hiLink: [oldTail] } as Partial<ListSnap>);
      st.head = newHead;
      st.order = (() => {
        const seen = new Set<number>(); const out: number[] = []; let cur: number | null = st.head;
        while (cur !== null && !seen.has(cur)) { seen.add(cur); out.push(cur); cur = st.next[cur]; }
        return out;
      })();
      S('rotl_head', `head = newHead. The list is now rotated — redrawn left-to-right from the new head.`, { ptrs: [P('head', st.head)] } as Partial<ListSnap>);
      break;
    }

    case 'removeDuplicates': {
      S('dedup', 'Called removeDuplicates(). For each node, an inner "runner" scans everything after it and deletes any repeat.');
      if (st.head === null) break;
      let outer: number | null = st.head;
      let guardO = 0;
      while (outer !== null && guardO++ < 30) {
        S('dedup_outer', `outer is on ${valOf(st, outer)} — this value is now the standard to check the rest of the list against.`, { hiNode: [outer], ptrs: [P('outer', outer, 'cyan')] } as Partial<ListSnap>);
        let runner: number = outer;
        S('dedup_runner', 'Node* runner = outer.', { ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')] } as Partial<ListSnap>);
        let guardR = 0;
        while (st.next[runner] !== null && guardR++ < 30) {
          const nx = st.next[runner]!;
          S('dedup_rwhile', `runner->next != nullptr → true. Comparing runner->next (${valOf(st, nx)}) against outer (${valOf(st, outer)}).`, {
            hiNode: [runner, nx], ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')],
          } as Partial<ListSnap>);
          const isDup = st.vals[nx] === st.vals[outer];
          S('dedup_cmp', `runner->next->data == outer->data → ${st.vals[nx]} == ${st.vals[outer]} → ${isDup}.`);
          if (isDup) {
            S('dedup_target', `Node* dup = runner->next → ${valOf(st, nx)} is a duplicate of ${valOf(st, outer)}.`, { hiNode: [nx], dying: [nx] } as Partial<ListSnap>);
            st.next[runner] = st.next[nx];
            S('dedup_bypass', `runner->next = runner->next->next — the list now routes around the duplicate.`, { hiLink: [runner], dying: [nx] } as Partial<ListSnap>);
            st.order = st.order.filter(x => x !== nx);
            delete st.next[nx]; delete st.vals[nx];
            st.size--;
            S('dedup_free', `delete dup — freed. size → ${st.size}.`, { hiNode: [runner] } as Partial<ListSnap>);
          } else {
            runner = nx;
            S('dedup_advance', `Not a duplicate — runner = runner->next → ${valOf(st, runner)}.`, { ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')] } as Partial<ListSnap>);
          }
        }
        outer = st.next[outer];
        if (outer !== null) S('dedup_next', `outer = outer->next → moving on to ${valOf(st, outer)}.`, { ptrs: [P('outer', outer, 'cyan')] } as Partial<ListSnap>);
      }
      S('dedup_next', 'outer reached nullptr — every node has now stood as the standard once. Done.');
      break;
    }

    case 'frequencyCount': {
      S('freq', 'Called frequencyCount(). A counted flag on each node stops a value from being reported twice.');
      const counted = new Set<number>();
      let outer: number | null = st.head;
      let guard = 0;
      while (outer !== null && guard++ < 30) {
        S('freq_owhile', `outer on ${valOf(st, outer)}.`, { hiNode: [outer], ptrs: [P('outer', outer, 'cyan')] } as Partial<ListSnap>);
        S('freq_check', `outer->counted → ${counted.has(outer) ? 'true — already reported, skip' : 'false — new value'}.`);
        if (!counted.has(outer)) {
          let count = 1;
          S('freq_init', `count = 1 (counting ${valOf(st, outer)} itself).`);
          let inner: number | null = st.next[outer];
          S('freq_inner', 'Node* inner = outer->next.', { hiNode: [outer], hi2: inner !== null ? [inner] : [] } as any);
          let guard2 = 0;
          while (inner !== null && guard2++ < 30) {
            S('freq_iwhile', `inner on ${valOf(st, inner)}.`, { hiNode: [outer, inner] } as Partial<ListSnap>);
            const eq = !counted.has(inner) && st.vals[inner] === st.vals[outer];
            S('freq_cmp', `!inner->counted && inner->data == outer->data → ${eq}.`);
            if (eq) { count++; counted.add(inner); S('freq_bump', `count++ → ${count}. Flagged ${valOf(st, inner)} so it is skipped later.`); }
            inner = st.next[inner];
            if (inner !== null) S('freq_iwalk', `inner = inner->next → ${valOf(st, inner)}.`);
          }
          S('freq_print', `${valOf(st, outer)} occurs ${count} time(s).`, undefined, `${st.vals[outer]} -> ${count}`);
        }
        outer = st.next[outer];
      }
      break;
    }

    case 'display': {
      S('dp', 'Called display().');
      let temp = st.head;

      let line = '';
      S('dp_temp', 'Node* temp = head.', M({ ptrs: [P('temp', temp, 'orange')] }));
      let guard = 0;
      while (temp !== null && guard++ < 40) {
        line += `${st.vals[temp]} -> `;
        S('dp_print', `cout << temp->data → printed ${st.vals[temp]}, then temp = temp->next.`,
          M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp];
      }
      S('dp_null', 'temp is nullptr, so the loop exits and "NULL" is printed.', M({ ptrs: [P('temp', null, 'orange')] }), line + 'NULL');
      break;
    }
  }
  return steps;
}

/* A freshly created node should hover above the list while its pointers are wired up, and only slide into the row
   when the wiring is finished. The ops already keep the node "floating" while it is being linked; this pass keeps it
   floating through every remaining step (head = newNode, closing a ring, …) and lets the LAST step of the operation
   show the finished linear list. */
function delayJoin(steps: LabStep[]): LabStep[] {
  const everFloating = new Set<number>();
  const held = new Set<number>();          // nodes currently drawn above the row although they are already linked
  const finished = new Set<number>();      // nodes that have been shown inside the row
  const out: LabStep[] = [];
  const lastIdx = steps.length - 1;
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const sn = st.snap as ListSnap;
    const candidates = sn.order.filter(id => everFloating.has(id) && !sn.floating.includes(id) && !finished.has(id));
    sn.floating.forEach(id => everFloating.add(id));
    if (candidates.length === 0) { sn.order.forEach(id => finished.add(id)); out.push(st); continue; }
    const hold = i < lastIdx ? candidates : candidates.filter(id => !held.has(id));
    const show = candidates.filter(id => !hold.includes(id));
    if (hold.length) {
      hold.forEach(id => held.add(id));
      out.push({ ...st, snap: { ...sn, order: sn.order.filter(id => !hold.includes(id)), floating: [...sn.floating, ...hold] } as ListSnap });
      show.forEach(id => finished.add(id));
      if (i === lastIdx) {
        sn.order.forEach(id => finished.add(id));
        out.push({ ...st, note: 'Done — the new node now sits in the list, and the row is redrawn in its final linear order.', out: undefined, snap: sn });
      }
    } else {
      sn.order.forEach(id => finished.add(id));
      out.push(st);
    }
  }
  return out;
}

/* A node whose `next` / `prev` entry is simply missing (instead of null) used to slip through the `!== null`
   checks and made some operations loop on "undefined" nodes (e.g. removeDuplicates shrank size to -800).
   Every node always gets an explicit null before and after each operation. */
function normalizeLinks(st: LState) {
  for (const id of [...st.order, ...st.floating]) {
    if (st.next[id] === undefined) st.next[id] = null;
    if (st.prev[id] === undefined) st.prev[id] = null;
  }
}
function runSll(st: LState, opId: string, a: Record<string, number>): LabStep[] {
  normalizeLinks(st);
  const out = delayJoin(runSllCore(st, opId, a));
  normalizeLinks(st);
  return out;
}
function runDll(st: LState, opId: string, a: Record<string, number>): LabStep[] {
  normalizeLinks(st);
  const out = delayJoin(runDllCore(st, opId, a));
  normalizeLinks(st);
  return out;
}

export const sllLab: Lab = {
  id: 'sll',
  title: 'Singly Linked List Class',
  icon: '🔗',
  className: 'SinglyLinkedList',
  blurb: 'Every pointer write is a separate step here — see newNode get allocated, watch temp walk to the tail, and watch the exact moment temp->next = newNode joins it to the list.',
  code: sll.code,
  marks: sll.marks,
  ops: [
    { id: 'insertAtStart', label: 'Insert at start', sig: 'void insertAtStart(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(1)' },
    { id: 'insertAtEnd', label: 'Insert at end', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(n)' },
    { id: 'insertAtIndex', label: 'Insert at index', sig: 'void insertAtIndex(int value, int index)', params: [{ name: 'value', label: 'value', def: 99 }, { name: 'index', label: 'index', def: 2 }], big: 'O(n)' },
    { id: 'deleteFromStart', label: 'Delete from start', sig: 'void deleteFromStart()', params: [], big: 'O(1)' },
    { id: 'deleteFromEnd', label: 'Delete from end', sig: 'void deleteFromEnd()', params: [], big: 'O(n)' },
    { id: 'deleteFromIndex', label: 'Delete from index', sig: 'void deleteFromIndex(int index)', params: [{ name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 30 }], big: 'O(n)' },
    { id: 'updateAtStart', label: 'Update at start', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 111 }], big: 'O(1)' },
    { id: 'updateAtIndex', label: 'Update at index', sig: 'void updateAtIndex(int index, int value)', params: [{ name: 'index', label: 'index', def: 1 }, { name: 'value', label: 'value', def: 77 }], big: 'O(n)' },
    { id: 'updateAtEnd', label: 'Update at end', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 222 }], big: 'O(n)' },
    { id: 'traverse', label: 'Traverse', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n²)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n²)' },
    { id: 'reverseByK', label: 'Reverse by k', sig: 'void reverseByK(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateLeft', label: 'Rotate left by k', sig: 'void rotateLeft(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'rotateRight', label: 'Rotate right by k', sig: 'void rotateRight(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'removeDuplicates', label: 'Remove duplicates', sig: 'void removeDuplicates()', params: [], big: 'O(n²)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'reverse', label: 'Reverse (3 pointers)', sig: 'void reverse()', params: [], big: 'O(n)' },
    { id: 'findMiddle', label: 'Find middle (slow/fast)', sig: 'int findMiddle()', params: [], big: 'O(n)' },
    { id: 'makeCycle', label: 'Create a cycle (demo)', sig: '// tail->next = node[index]', params: [{ name: 'index', label: 'link tail to index', def: 1 }], big: '—' },
    { id: 'detectCycle', label: "Detect cycle (Floyd's)", sig: 'bool detectCycle()', params: [], big: 'O(n)' },
    { id: 'removeCycle', label: 'Remove the cycle (Floyd phase 2)', sig: 'void removeCycle()', params: [], big: 'O(n)' },
    { id: 'display', label: 'Display', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: () => buildList([10, 20, 30], 'sll'),
  snapshot: (st: LState) => snapOf(st, 'sll'),
  run: runSll,
};

/* ══════════════════════════════════════════════════════════════════════════
   2. DOUBLY LINKED LIST
   ══════════════════════════════════════════════════════════════════════════ */
const dll = parseCode(`
class Node
{
public:
	int data;
	Node* prev;
	Node* next;
	bool counted; // scratch flag used by frequencyCount()

	Node(int value)
	{
		data = value;
		prev = nullptr;
		next = nullptr;
		counted = false;
	}
};

class DoublyLinkedList
{
private:
	Node* head;
	Node* tail;
	int size;

public:
	DoublyLinkedList()
	{
		head = nullptr;
		tail = nullptr;
		size = 0;
	}

	// Insertion at Start
	void insertAtStart(int value) /*@is*/
	{
		Node* newNode = new Node(value); /*@is_new*/

		if (head == nullptr) /*@is_empty*/
		{
			head = newNode;
			tail = newNode; /*@is_first*/
			size++;
			return;
		}

		newNode->next = head; /*@is_fwd*/
		head->prev = newNode; /*@is_back*/
		head = newNode; /*@is_head*/

		size++; /*@is_size*/
	}

	// Insertion at End
	void insertAtEnd(int value) /*@ie*/
	{
		Node* newNode = new Node(value); /*@ie_new*/

		if (tail == nullptr) /*@ie_empty*/
		{
			head = newNode;
			tail = newNode; /*@ie_first*/
			size++;
			return;
		}

		tail->next = newNode; /*@ie_fwd*/
		newNode->prev = tail; /*@ie_back*/
		tail = newNode; /*@ie_tail*/

		size++; /*@ie_size*/
	}

	// Insertion at Index
	void insertAtIndex(int value, int index) /*@ii*/
	{
		if (index < 0 || index > size) /*@ii_check*/
		{
			cout << "Invalid Index!" << endl; /*@ii_bad*/
			return;
		}

		if (index == 0) /*@ii_zero*/
		{
			insertAtStart(value);
			return;
		}

		if (index == size) /*@ii_last*/
		{
			insertAtEnd(value);
			return;
		}

		Node* newNode = new Node(value); /*@ii_new*/
		Node* temp = head; /*@ii_temp*/

		for (int i = 0; i < index - 1; i++) /*@ii_for*/
		{
			temp = temp->next; /*@ii_walk*/
		}

		newNode->next = temp->next; /*@ii_l1*/
		newNode->prev = temp; /*@ii_l2*/
		temp->next->prev = newNode; /*@ii_l3*/
		temp->next = newNode; /*@ii_l4*/

		size++; /*@ii_size*/
	}

	// Deletion from Start
	void deleteFromStart() /*@ds*/
	{
		if (head == nullptr) /*@ds_empty*/
		{
			cout << "List is Empty!" << endl; /*@ds_msg*/
			return;
		}

		Node* temp = head; /*@ds_temp*/
		head = head->next; /*@ds_head*/

		if (head != nullptr) /*@ds_check*/
		{
			head->prev = nullptr; /*@ds_cut*/
		}
		else
		{
			tail = nullptr; /*@ds_tail*/
		}

		delete temp; /*@ds_free*/

		size--; /*@ds_size*/
	}

	// Deletion from End
	void deleteFromEnd() /*@de*/
	{
		if (tail == nullptr) /*@de_empty*/
		{
			cout << "List is Empty!" << endl; /*@de_msg*/
			return;
		}

		Node* temp = tail; /*@de_temp*/
		tail = tail->prev; /*@de_tail*/

		if (tail != nullptr) /*@de_check*/
		{
			tail->next = nullptr; /*@de_cut*/
		}
		else
		{
			head = nullptr; /*@de_head*/
		}

		delete temp; /*@de_free*/

		size--; /*@de_size*/
	}

	// Deletion from Index
	void deleteFromIndex(int index) /*@di*/
	{
		if (index < 0 || index >= size) /*@di_check*/
		{
			cout << "Invalid Index!" << endl; /*@di_bad*/
			return;
		}

		if (index == 0) /*@di_zero*/
		{
			deleteFromStart();
			return;
		}

		if (index == size - 1) /*@di_last*/
		{
			deleteFromEnd();
			return;
		}

		Node* temp = head; /*@di_temp*/

		for (int i = 0; i < index; i++) /*@di_for*/
		{
			temp = temp->next; /*@di_walk*/
		}

		temp->prev->next = temp->next; /*@di_l1*/
		temp->next->prev = temp->prev; /*@di_l2*/

		delete temp; /*@di_free*/

		size--; /*@di_size*/
	}

	// Search
	int search(int value) /*@se*/
	{
		Node* temp = head; /*@se_temp*/
		int index = 0;

		while (temp != nullptr) /*@se_while*/
		{
			if (temp->data == value) /*@se_check*/
			{
				return index; /*@se_found*/
			}

			temp = temp->next; /*@se_walk*/
			index++;
		}

		return -1; /*@se_none*/
	}

	// Update at Start
	void updateAtStart(int value) /*@ust*/
	{
		if (head == nullptr) /*@ust_empty*/
		{
			cout << "List is Empty!" << endl; /*@ust_msg*/
			return;
		}

		head->data = value; /*@ust_set*/
	}

	// Update at Index
	void updateAtIndex(int index, int value) /*@up*/
	{
		if (index < 0 || index >= size) /*@up_check*/
		{
			cout << "Invalid Index!" << endl; /*@up_bad*/
			return;
		}

		Node* temp = head; /*@up_temp*/

		for (int i = 0; i < index; i++) /*@up_for*/
		{
			temp = temp->next; /*@up_walk*/
		}

		temp->data = value; /*@up_set*/
	}

	// Update at End (O(1) — the tail pointer means no walking is needed)
	void updateAtEnd(int value) /*@uen*/
	{
		if (tail == nullptr) /*@uen_empty*/
		{
			cout << "List is Empty!" << endl; /*@uen_msg*/
			return;
		}

		tail->data = value; /*@uen_set*/
	}

	// Traverse (visit every node from head to the end)
	void traverse() /*@tv*/
	{
		Node* temp = head; /*@tv_temp*/

		while (temp != nullptr) /*@tv_while*/
		{
			cout << temp->data << " "; /*@tv_print*/
			temp = temp->next; /*@tv_walk*/
		}

		cout << endl; /*@tv_done*/
	}

	// Sort Ascending (bubble sort — swaps node DATA, links stay untouched)
	void sortAscending() /*@sasc*/
	{
		if (head == nullptr) return;

		bool swapped = true; /*@sasc_flag*/

		while (swapped) /*@sasc_outer*/
		{
			swapped = false;
			Node* temp = head; /*@sasc_temp*/

			while (temp->next != nullptr) /*@sasc_inner*/
			{
				if (temp->data > temp->next->data) /*@sasc_cmp*/
				{
					int t = temp->data; /*@sasc_swap*/
					temp->data = temp->next->data;
					temp->next->data = t;
					swapped = true; /*@sasc_flagset*/
				}

				temp = temp->next; /*@sasc_walk*/
			}
		}
	}

	// Sort Descending
	void sortDescending() /*@sdesc*/
	{
		if (head == nullptr) return;

		bool swapped = true; /*@sdesc_flag*/

		while (swapped) /*@sdesc_outer*/
		{
			swapped = false;
			Node* temp = head; /*@sdesc_temp*/

			while (temp->next != nullptr) /*@sdesc_inner*/
			{
				if (temp->data < temp->next->data) /*@sdesc_cmp*/
				{
					int t = temp->data; /*@sdesc_swap*/
					temp->data = temp->next->data;
					temp->next->data = t;
					swapped = true; /*@sdesc_flagset*/
				}

				temp = temp->next; /*@sdesc_walk*/
			}
		}
	}

	// Reverse in blocks of k (collect a block, then swap DATA symmetrically)
	void reverseByK(int k) /*@revk*/
	{
		Node* temp = head; /*@revk_outer*/

		while (temp != nullptr) /*@revk_while*/
		{
			Node* nodes[64]; /*@revk_collect*/
			int count = 0;
			Node* walker = temp;

			while (walker != nullptr && count < k) /*@revk_gather*/
			{
				nodes[count] = walker; /*@revk_store*/
				walker = walker->next;
				count++;
			}

			int l = 0, r = count - 1; /*@revk_lr*/

			while (l < r) /*@revk_swaploop*/
			{
				int t = nodes[l]->data; /*@revk_swap*/
				nodes[l]->data = nodes[r]->data;
				nodes[r]->data = t;
				l++;
				r--;
			}

			temp = walker; /*@revk_advance*/
		}
	}

	// Rotate Left by k (first k nodes move to the back)
	void rotateLeft(int k) /*@rotl*/
	{
		if (head == nullptr || head->next == nullptr) /*@rotl_guard*/
		{
			return;
		}

		k = k % size; /*@rotl_k*/

		if (k == 0) /*@rotl_zero*/
		{
			return;
		}

		Node* newTail = head; /*@rotl_newtail*/

		for (int i = 0; i < k - 1; i++) /*@rotl_walk1*/
		{
			newTail = newTail->next;
		}

		Node* newHead = newTail->next; /*@rotl_newhead*/
		newTail->next = nullptr; /*@rotl_cut*/
		newHead->prev = nullptr; /*@rotl_cutprev*/

		tail->next = head; /*@rotl_link*/
		head->prev = tail; /*@rotl_linkprev*/

		tail = newTail; /*@rotl_tail*/
		head = newHead; /*@rotl_head*/
	}

	// Rotate Right by k (last k nodes move to the front)
	void rotateRight(int k) /*@rotr*/
	{
		if (head == nullptr || head->next == nullptr) /*@rotr_guard*/
		{
			return;
		}

		k = k % size; /*@rotr_k*/

		if (k == 0) /*@rotr_zero*/
		{
			return;
		}

		rotateLeft(size - k); /*@rotr_call*/
	}

	// Remove Duplicates (keeps first occurrence, works on any order)
	void removeDuplicates() /*@dedup*/
	{
		if (head == nullptr) return;

		Node* outer = head; /*@dedup_outer*/

		while (outer != nullptr) /*@dedup_owhile*/
		{
			Node* runner = outer; /*@dedup_runner*/

			while (runner->next != nullptr) /*@dedup_rwhile*/
			{
				if (runner->next->data == outer->data) /*@dedup_cmp*/
				{
					Node* dup = runner->next; /*@dedup_target*/
					runner->next = dup->next; /*@dedup_bypass*/

					if (dup->next != nullptr) /*@dedup_checkback*/
					{
						dup->next->prev = runner; /*@dedup_fixback*/
					}
					else
					{
						tail = runner; /*@dedup_fixtail*/
					}

					delete dup; /*@dedup_free*/
					size--;
				}
				else
				{
					runner = runner->next; /*@dedup_advance*/
				}
			}

			outer = outer->next; /*@dedup_next*/
		}
	}

	// Frequency Count (prints how many times each distinct value appears)
	void frequencyCount() /*@freq*/
	{
		Node* outer = head; /*@freq_outer*/

		while (outer != nullptr) /*@freq_owhile*/
		{
			if (!outer->counted) /*@freq_check*/
			{
				int count = 1; /*@freq_init*/
				Node* inner = outer->next; /*@freq_inner*/

				while (inner != nullptr) /*@freq_iwhile*/
				{
					if (!inner->counted && inner->data == outer->data) /*@freq_cmp*/
					{
						count++; /*@freq_bump*/
						inner->counted = true;
					}

					inner = inner->next; /*@freq_iwalk*/
				}

				cout << outer->data << " -> " << count << endl; /*@freq_print*/
			}

			outer = outer->next; /*@freq_owalk*/
		}
	}

	// Forward Traversal
	void displayForward() /*@df*/
	{
		Node* temp = head; /*@df_temp*/

		while (temp != nullptr) /*@df_while*/
		{
			cout << temp->data << " <-> "; /*@df_print*/
			temp = temp->next;
		}

		cout << "NULL" << endl; /*@df_null*/
	}

	// Backward Traversal
	void displayBackward() /*@db*/
	{
		Node* temp = tail; /*@db_temp*/

		while (temp != nullptr) /*@db_while*/
		{
			cout << temp->data << " <-> "; /*@db_print*/
			temp = temp->prev;
		}

		cout << "NULL" << endl; /*@db_null*/
	}

	// Destructor
	~DoublyLinkedList()
	{
		Node* temp = head;

		while (temp != nullptr)
		{
			Node* nextNode = temp->next;
			delete temp;
			temp = nextNode;
		}

		head = nullptr;
		tail = nullptr;
	}
};
`);

function runDllCore(st: LState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(dll.marks, () => snapOf(st, 'dll'));
  const M = (p: Partial<ListSnap>) => p as Partial<ListSnap>;
  const HT = () => [P('head', st.head), P('tail', st.tail, 'purple')];

  switch (opId) {
    case 'insertAtStart': {
      const v = a.value;
      S('is', `Called insertAtStart(${v}).`);
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.prev[id] = null; st.floating.push(id);
      S('is_new', `Node* newNode = new Node(${v}) — both prev and next start as nullptr.`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      S('is_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`, M({ floating: [id], ptrs: HT() }));
      if (st.head === null) {
        st.head = id; st.tail = id; st.order.push(id); st.floating = []; st.size++;
        S('is_first', 'Empty list, so head AND tail both point at the new node.', M({ hiNode: [id], ptrs: HT() }));
        break;
      }
      const oldHead = st.head;
      st.next[id] = oldHead;
      S('is_fwd', `newNode->next = head — the forward link to ${valOf(st, oldHead)} is set.`, M({ floating: [id], hiLink: [id], ptrs: [P('newNode', id, 'green'), ...HT()] }));
      st.prev[oldHead] = id;
      S('is_back', `head->prev = newNode — this is the line a singly list never has. The old head can now reach backwards.`,
        M({ floating: [id], hiPrevLink: [oldHead], hiNode: [oldHead], ptrs: [P('newNode', id, 'green'), ...HT()] }));
      st.head = id; st.order.unshift(id); st.floating = st.floating.filter(x => x !== id);
      S('is_head', `head = newNode. Both directions are consistent — that is the invariant you must never break.`, M({ hiNode: [id], ptrs: HT() }));
      st.size++;
      S('is_size', `size++ → ${st.size}. O(1).`, M({ ptrs: HT() }));
      break;
    }

    case 'insertAtEnd': {
      const v = a.value;
      S('ie', `Called insertAtEnd(${v}).`);
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.prev[id] = null; st.floating.push(id);
      S('ie_new', `Node* newNode = new Node(${v}).`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      S('ie_empty', `tail == nullptr? → ${st.tail === null ? 'true' : 'false'}.`, M({ floating: [id], ptrs: HT() }));
      if (st.tail === null) {
        st.head = id; st.tail = id; st.order.push(id); st.floating = []; st.size++;
        S('ie_first', 'Empty list — head and tail both become the new node.', M({ hiNode: [id], ptrs: HT() }));
        break;
      }
      const oldTail = st.tail;
      st.next[oldTail] = id;
      S('ie_fwd', `tail->next = newNode. Notice there is NO while loop here — the tail pointer means we never walk the list.`,
        M({ floating: [id], hiLink: [oldTail], ptrs: [P('newNode', id, 'green'), ...HT()] }));
      st.prev[id] = oldTail;
      S('ie_back', `newNode->prev = tail — the backward link closes the pair.`, M({ floating: [id], hiPrevLink: [id], ptrs: [P('newNode', id, 'green'), ...HT()] }));
      st.tail = id; st.order.push(id); st.floating = st.floating.filter(x => x !== id);
      S('ie_tail', 'tail = newNode.', M({ hiNode: [id], ptrs: HT() }));
      st.size++;
      S('ie_size', `size++ → ${st.size}. O(1) — compare that with the singly list, where the same operation is O(n).`, M({ ptrs: HT() }));
      break;
    }

    case 'insertAtIndex': {
      const v = a.value, idx = a.index;
      S('ii', `Called insertAtIndex(${v}, ${idx}).`);
      S('ii_check', `Guard: ${idx} < 0 || ${idx} > ${st.size} → ${idx < 0 || idx > st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx > st.size) { S('ii_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      if (idx === 0) { S('ii_zero', 'index == 0 → insertAtStart() handles it.'); return steps.concat(runDll(st, 'insertAtStart', a)); }
      if (idx === st.size) { S('ii_last', 'index == size → insertAtEnd() handles it.'); return steps.concat(runDll(st, 'insertAtEnd', a)); }
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.prev[id] = null; st.floating.push(id);
      S('ii_new', `Node* newNode = new Node(${v}).`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      let temp: number = st.head!;
      S('ii_temp', `Node* temp = head. Walk to index ${idx - 1}.`, M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx - 1; i++) {
        temp = st.next[temp]!;
        S('ii_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      const after = st.next[temp]!;
      st.next[id] = after;
      S('ii_l1', `newNode->next = temp->next → forward link to ${valOf(st, after)}.`, M({ floating: [id], hiLink: [id], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.prev[id] = temp;
      S('ii_l2', `newNode->prev = temp → backward link to ${valOf(st, temp)}.`, M({ floating: [id], hiPrevLink: [id], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.prev[after] = id;
      S('ii_l3', `temp->next->prev = newNode → ${valOf(st, after)} now reaches backwards to newNode.`, M({ floating: [id], hiPrevLink: [after], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.next[temp] = id;
      const pos = st.order.indexOf(temp);
      st.order.splice(pos + 1, 0, id);
      st.floating = st.floating.filter(x => x !== id);
      S('ii_l4', 'temp->next = newNode — the fourth and last pointer. A doubly list insert always costs exactly 4 pointer writes.',
        M({ hiNode: [id], hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.size++;
      S('ii_size', `size++ → ${st.size}.`, M({ ptrs: HT() }));
      break;
    }

    case 'deleteFromStart': {
      S('ds', 'Called deleteFromStart().');
      S('ds_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('ds_msg', 'Nothing to delete.', undefined, 'List is Empty!'); break; }
      const old = st.head;
      S('ds_temp', 'Node* temp = head — hold the victim so it can be freed.', M({ hiNode: [old], dying: [old], ptrs: [P('temp', old, 'orange'), ...HT()] }));
      st.head = st.next[old];
      S('ds_head', `head = head->next → ${valOf(st, st.head)}.`, M({ dying: [old], ptrs: HT() }));
      S('ds_check', `head != nullptr? → ${st.head !== null ? 'true' : 'false'}.`, M({ dying: [old], ptrs: HT() }));
      if (st.head !== null) {
        st.prev[st.head] = null;
        S('ds_cut', 'head->prev = nullptr — cut the backward link, otherwise the new head still points at freed memory.', M({ dying: [old], hiPrevLink: [st.head], ptrs: HT() }));
      } else {
        st.tail = null;
        S('ds_tail', 'The list is now empty, so tail = nullptr too.', M({ ptrs: HT() }));
      }
      st.order = st.order.filter(x => x !== old);
      delete st.next[old]; delete st.prev[old]; delete st.vals[old];
      S('ds_free', 'delete temp.', M({ ptrs: HT() }));
      st.size--;
      S('ds_size', `size-- → ${st.size}. O(1).`, M({ ptrs: HT() }));
      break;
    }

    case 'deleteFromEnd': {
      S('de', 'Called deleteFromEnd().');
      S('de_empty', `tail == nullptr? → ${st.tail === null ? 'true' : 'false'}.`);
      if (st.tail === null) { S('de_msg', 'Nothing to delete.', undefined, 'List is Empty!'); break; }
      const old = st.tail;
      S('de_temp', 'Node* temp = tail.', M({ hiNode: [old], dying: [old], ptrs: [P('temp', old, 'orange'), ...HT()] }));
      st.tail = st.prev[old];
      S('de_tail', `tail = tail->prev → ${valOf(st, st.tail)}. The prev pointer is what makes this O(1) instead of the singly list's O(n) walk.`, M({ dying: [old], ptrs: HT() }));
      S('de_check', `tail != nullptr? → ${st.tail !== null ? 'true' : 'false'}.`, M({ dying: [old], ptrs: HT() }));
      if (st.tail !== null) {
        st.next[st.tail] = null;
        S('de_cut', 'tail->next = nullptr — no dangling pointer left behind.', M({ dying: [old], hiLink: [st.tail], ptrs: HT() }));
      } else {
        st.head = null;
        S('de_head', 'List is empty now, so head = nullptr too.', M({ ptrs: HT() }));
      }
      st.order = st.order.filter(x => x !== old);
      delete st.next[old]; delete st.prev[old]; delete st.vals[old];
      S('de_free', 'delete temp.', M({ ptrs: HT() }));
      st.size--;
      S('de_size', `size-- → ${st.size}. O(1).`, M({ ptrs: HT() }));
      break;
    }

    case 'deleteFromIndex': {
      const idx = a.index;
      S('di', `Called deleteFromIndex(${idx}).`);
      S('di_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('di_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      S('di_zero', `index == 0? → ${idx === 0 ? 'true — deleteFromStart() handles it' : 'false'}.`);
      if (idx === 0) return steps.concat(runDll(st, 'deleteFromStart', a));
      S('di_last', `index == size - 1? → ${idx === st.size - 1 ? 'true — deleteFromEnd() handles it' : 'false'}.`);
      if (idx === st.size - 1) return steps.concat(runDll(st, 'deleteFromEnd', a));
      let temp: number = st.head!;
      S('di_temp', `Node* temp = head. Walk to index ${idx}, the node being removed.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx; i++) {
        temp = st.next[temp]!;
        S('di_walk', `temp = temp->next → ${valOf(st, temp)} (index ${i + 1}).`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      const before = st.prev[temp]!, after = st.next[temp]!;
      st.next[before] = after;
      S('di_l1', `temp->prev->next = temp->next — ${valOf(st, before)} now points forward straight to ${valOf(st, after)}, skipping temp.`,
        M({ hiNode: [temp], dying: [temp], hiLink: [before], ptrs: [P('temp', temp, 'orange')] }));
      st.prev[after] = before;
      S('di_l2', `temp->next->prev = temp->prev — ${valOf(st, after)} now points backward straight to ${valOf(st, before)}. Both directions fixed.`,
        M({ dying: [temp], hiPrevLink: [after], ptrs: [P('temp', temp, 'orange')] }));
      st.order = st.order.filter(x => x !== temp);
      delete st.next[temp]; delete st.prev[temp]; delete st.vals[temp];
      S('di_free', 'delete temp.', M({ ptrs: HT() }));
      st.size--;
      S('di_size', `size-- → ${st.size}.`, M({ ptrs: HT() }));
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}).`);
      let temp = st.head, index = 0;
      S('se_temp', 'Node* temp = head, index = 0.', M({ ptrs: [P('temp', temp, 'orange')] }));
      while (temp !== null) {
        S('se_while', `temp != nullptr → true.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        S('se_check', `temp->data (${st.vals[temp]}) == ${v}? → ${st.vals[temp] === v ? 'YES' : 'no'}.`, M({ hiNode: [temp] }));
        if (st.vals[temp] === v) { S('se_found', `Found at index ${index}.`, M({ hiNode: [temp] }), `search(${v}) returned ${index}`); temp = null; break; }
        temp = st.next[temp]; index++;
        if (temp !== null) S('se_walk', `Not a match. temp = temp->next → index ${index}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      if (index === st.size) { S('se_while', 'temp != nullptr → false.', M({ ptrs: [P('temp', null, 'orange')] })); S('se_none', 'return -1.', undefined, `search(${v}) returned -1`); }
      break;
    }

    case 'updateAtStart': {
      S('ust', `Called updateAtStart(${a.value}).`);
      S('ust_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('ust_msg', 'Nothing to update.', undefined, 'List is Empty!'); break; }
      st.vals[st.head] = a.value;
      S('ust_set', `head->data = ${a.value}. O(1).`, M({ hiNode: [st.head], ptrs: HT() }));
      break;
    }

    case 'updateAtIndex': {
      const idx = a.index, v = a.value;
      S('up', `Called updateAtIndex(${idx}, ${v}).`);
      S('up_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('up_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      let temp: number = st.head!;
      S('up_temp', 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx; i++) {
        temp = st.next[temp]!;
        S('up_walk', `temp = temp->next → index ${i + 1}, value ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      st.vals[temp] = v;
      S('up_set', `temp->data = ${v}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      break;
    }

    case 'updateAtEnd': {
      S('uen', `Called updateAtEnd(${a.value}).`);
      S('uen_empty', `tail == nullptr? → ${st.tail === null ? 'true' : 'false'}.`);
      if (st.tail === null) { S('uen_msg', 'Nothing to update.', undefined, 'List is Empty!'); break; }
      st.vals[st.tail] = a.value;
      S('uen_set', `tail->data = ${a.value}. O(1) here — unlike the singly list, the tail pointer means no walking is needed.`, M({ hiNode: [st.tail], ptrs: HT() }));
      break;
    }

    case 'traverse': {
      S('tv', 'Called traverse().');
      let temp = st.head;
      S('tv_temp', 'Node* temp = head.', M({ ptrs: [P('temp', temp, 'orange')] }));
      let guard = 0;
      while (temp !== null && guard++ < 40) {
        S('tv_while', `temp != nullptr → true (on ${valOf(st, temp)}).`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        S('tv_print', `cout << temp->data → printed ${st.vals[temp]}.`, M({ hiNode: [temp] }), `${st.vals[temp]}`);
        temp = st.next[temp];
        if (temp !== null) S('tv_walk', `temp = temp->next → now on ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      S('tv_while', 'temp != nullptr → false. Every node was visited exactly once.', M({ ptrs: [P('temp', null, 'orange')] }));
      S('tv_done', 'Traversal complete.');
      break;
    }
    case 'sortAscending':
    case 'sortDescending': {
      const asc = opId === 'sortAscending';
      const [mOuter, mInner, mTemp, mCmp, mSwap, mFlag, mFlagSet] = asc
        ? ['sasc_outer', 'sasc_inner', 'sasc_temp', 'sasc_cmp', 'sasc_swap', 'sasc_flag', 'sasc_flagset']
        : ['sdesc_outer', 'sdesc_inner', 'sdesc_temp', 'sdesc_cmp', 'sdesc_swap', 'sdesc_flag', 'sdesc_flagset'];
      S(asc ? 'sasc' : 'sdesc', `Called sort${asc ? 'Ascending' : 'Descending'}() — bubble sort by swapping node DATA, forward direction only.`);
      if (st.head === null) break;
      let swapped = true, pass = 0;
      while (swapped) {
        swapped = false;
        S(mFlag, `Pass ${++pass}: swapped = false.`);
        let temp: number = st.head;
        S(mTemp, 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        while (st.next[temp] !== null) {
          const nx = st.next[temp]!;
          S(mInner, `Comparing ${valOf(st, temp)} and ${valOf(st, nx)}.`, M({ hiNode: [temp, nx], ptrs: [P('temp', temp, 'orange')] }));
          const doSwap = asc ? st.vals[temp] > st.vals[nx] : st.vals[temp] < st.vals[nx];
          S(mCmp, `temp->data ${asc ? '>' : '<'} temp->next->data → ${doSwap}.`);
          if (doSwap) {
            const t = st.vals[temp]; st.vals[temp] = st.vals[nx]; st.vals[nx] = t;
            swapped = true;
            S(mSwap, `Swapped DATA → ${st.vals[temp]}, ${st.vals[nx]}.`, M({ hiNode: [temp, nx] }));
            S(mFlagSet, 'swapped = true.');
          }
          temp = nx;
        }
        S(mOuter, `End of pass. swapped = ${swapped}.`);
      }
      break;
    }

    case 'reverseByK': {
      const k = Math.max(1, a.k);
      S('revk', `Called reverseByK(${k}). Blocks of ${k} nodes get their DATA reversed; the prev/next links never move.`);
      let temp: number | null = st.head;
      let guard = 0;
      while (temp !== null && guard++ < 20) {
        S('revk_outer', `New block starting at ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        const block: number[] = [];
        let walker: number | null = temp;
        while (walker !== null && block.length < k) {
          block.push(walker);
          S('revk_store', `nodes[${block.length - 1}] = ${valOf(st, walker)}.`, M({ hiNode: block.slice(), ptrs: [P('walker', walker, 'green')] }));
          walker = st.next[walker];
        }
        let l = 0, r = block.length - 1;
        S('revk_lr', `l = 0, r = ${r}.`);
        while (l < r) {
          const a1 = block[l], a2 = block[r];
          const t = st.vals[a1]; st.vals[a1] = st.vals[a2]; st.vals[a2] = t;
          S('revk_swap', `Swapped nodes[${l}] and nodes[${r}].`, M({ hiNode: [a1, a2] }));
          l++; r--;
        }
        temp = walker;
      }
      S('revk_advance', 'Done.');
      break;
    }

    case 'rotateLeft':
    case 'rotateRight': {
      const isLeft = opId === 'rotateLeft';
      S(isLeft ? 'rotl' : 'rotr', `Called ${isLeft ? 'rotateLeft' : 'rotateRight'}(${a.k}).`);
      S(isLeft ? 'rotl_guard' : 'rotr_guard', `head == nullptr || head->next == nullptr → ${st.head === null || st.next[st.head] === null ? 'true' : 'false'}.`);
      if (st.head === null || st.next[st.head] === null) break;
      const k = ((a.k % st.size) + st.size) % st.size;
      S(isLeft ? 'rotl_k' : 'rotr_k', `k = ${a.k} % ${st.size} = ${k}.`);
      if (k === 0) { S(isLeft ? 'rotl_zero' : 'rotr_zero', 'k == 0 — nothing changes.'); break; }
      const effK = isLeft ? k : st.size - k;
      if (!isLeft) S('rotr_call', `rotateRight(${a.k}) delegates to rotateLeft(size - k) = rotateLeft(${effK}).`);
      let newTail: number = st.head;
      S('rotl_newtail', `Node* newTail = head. Walk ${effK - 1} more step(s).`, M({ hiNode: [newTail], ptrs: [P('newTail', newTail, 'orange')] }));
      for (let i = 0; i < effK - 1; i++) {
        newTail = st.next[newTail]!;
        S('rotl_walk1', `newTail = newTail->next → ${valOf(st, newTail)}.`, M({ hiNode: [newTail], ptrs: [P('newTail', newTail, 'orange')] }));
      }
      const newHead = st.next[newTail]!;
      const oldHead = st.head, oldTail = st.tail!;
      S('rotl_newhead', `Node* newHead = newTail->next → ${valOf(st, newHead)}.`, M({ hiNode: [newHead], ptrs: [P('newTail', newTail, 'orange'), P('newHead', newHead, 'green')] }));
      st.next[newTail] = null;
      S('rotl_cut', `newTail->next = nullptr.`, M({ hiLink: [newTail] }));
      st.prev[newHead] = null;
      S('rotl_cutprev', `newHead->prev = nullptr — the list is now split into two independent pieces.`, M({ hiPrevLink: [newHead] }));
      st.next[oldTail] = oldHead;
      S('rotl_link', `tail->next = head — the OLD tail (${valOf(st, oldTail)}) connects forward to the OLD head (${valOf(st, oldHead)}).`, M({ hiLink: [oldTail] }));
      st.prev[oldHead] = oldTail;
      S('rotl_linkprev', `head->prev = tail — and backward too. No second walk needed to find this join point; the tail pointer already knew it.`, M({ hiPrevLink: [oldHead] }));
      st.tail = newTail;
      S('rotl_tail', `tail = newTail (${valOf(st, newTail)}).`, M({ ptrs: HT() }));
      st.head = newHead;
      st.order = (() => { const seen = new Set<number>(); const out: number[] = []; let cur: number | null = st.head; while (cur !== null && !seen.has(cur)) { seen.add(cur); out.push(cur); cur = st.next[cur]; } return out; })();
      S('rotl_head', `head = newHead. Rotated and redrawn left-to-right.`, M({ ptrs: HT() }));
      break;
    }

    case 'removeDuplicates': {
      S('dedup', 'Called removeDuplicates().');
      if (st.head === null) break;
      let outer: number | null = st.head, guardO = 0;
      while (outer !== null && guardO++ < 30) {
        S('dedup_outer', `outer on ${valOf(st, outer)}.`, M({ hiNode: [outer], ptrs: [P('outer', outer, 'cyan')] }));
        let runner: number = outer;
        S('dedup_runner', 'Node* runner = outer.', M({ ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')] }));
        let guardR = 0;
        while (st.next[runner] !== null && guardR++ < 30) {
          const nx = st.next[runner]!;
          S('dedup_rwhile', `Comparing runner->next (${valOf(st, nx)}) against outer (${valOf(st, outer)}).`, M({ hiNode: [runner, nx] }));
          const isDup = st.vals[nx] === st.vals[outer];
          S('dedup_cmp', `runner->next->data == outer->data → ${isDup}.`);
          if (isDup) {
            S('dedup_target', `Node* dup = runner->next → ${valOf(st, nx)}.`, M({ hiNode: [nx], dying: [nx] }));
            const after = st.next[nx];
            st.next[runner] = after;
            S('dedup_bypass', `runner->next = dup->next.`, M({ hiLink: [runner], dying: [nx] }));
            S('dedup_checkback', `dup->next != nullptr? → ${after !== null ? 'true' : 'false'}.`);
            if (after !== null) { st.prev[after] = runner; S('dedup_fixback', `dup->next->prev = runner — backward link repaired too.`, M({ hiPrevLink: [after], dying: [nx] })); }
            else { st.tail = runner; S('dedup_fixtail', `dup was the tail — tail = runner.`, M({ ptrs: HT() })); }
            st.order = st.order.filter(x => x !== nx);
            delete st.next[nx]; delete st.prev[nx]; delete st.vals[nx];
            st.size--;
            S('dedup_free', `delete dup. size → ${st.size}.`, M({ hiNode: [runner] }));
          } else {
            runner = nx;
            S('dedup_advance', `runner = runner->next → ${valOf(st, runner)}.`, M({ ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')] }));
          }
        }
        outer = st.next[outer];
        if (outer !== null) S('dedup_next', `outer = outer->next → ${valOf(st, outer)}.`, M({ ptrs: [P('outer', outer, 'cyan')] }));
      }
      S('dedup_next', 'outer reached nullptr. Done.');
      break;
    }

    case 'frequencyCount': {
      S('freq', 'Called frequencyCount().');
      const counted = new Set<number>();
      let outer: number | null = st.head, guard = 0;
      while (outer !== null && guard++ < 30) {
        S('freq_owhile', `outer on ${valOf(st, outer)}.`, M({ hiNode: [outer], ptrs: [P('outer', outer, 'cyan')] }));
        S('freq_check', `outer->counted → ${counted.has(outer)}.`);
        if (!counted.has(outer)) {
          let count = 1;
          S('freq_init', `count = 1.`);
          let inner: number | null = st.next[outer];
          S('freq_inner', 'Node* inner = outer->next.');
          let guard2 = 0;
          while (inner !== null && guard2++ < 30) {
            S('freq_iwhile', `inner on ${valOf(st, inner)}.`, M({ hiNode: [outer, inner] }));
            const eq = !counted.has(inner) && st.vals[inner] === st.vals[outer];
            S('freq_cmp', `!inner->counted && inner->data == outer->data → ${eq}.`);
            if (eq) { count++; counted.add(inner); S('freq_bump', `count++ → ${count}.`); }
            inner = st.next[inner];
            if (inner !== null) S('freq_iwalk', `inner = inner->next.`);
          }
          S('freq_print', `${valOf(st, outer)} occurs ${count} time(s).`, undefined, `${st.vals[outer]} -> ${count}`);
        }
        outer = st.next[outer];
      }
      break;
    }

    case 'displayForward': {
      S('df', 'Called displayForward().');
      let temp = st.head, line = '';

      S('df_temp', 'Node* temp = head.', M({ ptrs: [P('temp', temp, 'orange')] }));
      let g = 0;
      while (temp !== null && g++ < 40) {
        line += `${st.vals[temp]} <-> `;
        S('df_print', `printed ${st.vals[temp]}, then temp = temp->next.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp];
      }
      S('df_null', 'temp is nullptr — loop ends.', M({ ptrs: [P('temp', null, 'orange')] }), line + 'NULL');
      break;
    }

    case 'displayBackward': {
      S('db', 'Called displayBackward() — impossible in a singly linked list without recursion or a second pass.');
      let temp = st.tail, line = '';
      S('db_temp', 'Node* temp = tail — start from the far end.', M({ ptrs: [P('temp', temp, 'orange')] }));
      let g = 0;
      while (temp !== null && g++ < 40) {
        line += `${st.vals[temp]} <-> `;
        S('db_print', `printed ${st.vals[temp]}, then temp = temp->prev (walking left).`, M({ hiNode: [temp], hiPrevLink: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.prev[temp];
      }
      S('db_null', 'temp is nullptr — we walked off the front.', M({ ptrs: [P('temp', null, 'orange')] }), line + 'NULL');
      break;
    }
  }
  return steps;
}

export const dllLab: Lab = {
  id: 'dll',
  title: 'Doubly Linked List Class',
  icon: '⇄',
  className: 'DoublyLinkedList',
  blurb: 'Two pointers per node means four pointer writes per insert. Each one is its own step here, so you can see exactly which link is being set and why the order cannot be shuffled.',
  code: dll.code,
  marks: dll.marks,
  ops: [
    { id: 'insertAtStart', label: 'Insert at start', sig: 'void insertAtStart(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(1)' },
    { id: 'insertAtEnd', label: 'Insert at end', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(1)' },
    { id: 'insertAtIndex', label: 'Insert at index', sig: 'void insertAtIndex(int value, int index)', params: [{ name: 'value', label: 'value', def: 99 }, { name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'deleteFromStart', label: 'Delete from start', sig: 'void deleteFromStart()', params: [], big: 'O(1)' },
    { id: 'deleteFromEnd', label: 'Delete from end', sig: 'void deleteFromEnd()', params: [], big: 'O(1)' },
    { id: 'deleteFromIndex', label: 'Delete from index', sig: 'void deleteFromIndex(int index)', params: [{ name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 30 }], big: 'O(n)' },
    { id: 'updateAtStart', label: 'Update at start', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 111 }], big: 'O(1)' },
    { id: 'updateAtIndex', label: 'Update at index', sig: 'void updateAtIndex(int index, int value)', params: [{ name: 'index', label: 'index', def: 1 }, { name: 'value', label: 'value', def: 77 }], big: 'O(n)' },
    { id: 'updateAtEnd', label: 'Update at end', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 222 }], big: 'O(1)' },
    { id: 'traverse', label: 'Traverse', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n²)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n²)' },
    { id: 'reverseByK', label: 'Reverse by k', sig: 'void reverseByK(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateLeft', label: 'Rotate left by k', sig: 'void rotateLeft(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'rotateRight', label: 'Rotate right by k', sig: 'void rotateRight(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'removeDuplicates', label: 'Remove duplicates', sig: 'void removeDuplicates()', params: [], big: 'O(n²)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'displayForward', label: 'Display forward', sig: 'void displayForward()', params: [], big: 'O(n)' },
    { id: 'displayBackward', label: 'Display backward', sig: 'void displayBackward()', params: [], big: 'O(n)' },
  ],
  init: () => buildList([10, 20, 30], 'dll'),
  snapshot: (st: LState) => snapOf(st, 'dll'),
  run: runDll,
};

/* ══════════════════════════════════════════════════════════════════════════
   3. CIRCULAR LINKED LIST
   ══════════════════════════════════════════════════════════════════════════ */
const cll = parseCode(`
class Node
{
public:
	int data;
	Node* next;
	bool counted; // scratch flag used by frequencyCount()

	Node(int value)
	{
		data = value;
		next = nullptr;
		counted = false;
	}
};

class CircularLinkedList
{
private:
	Node* head;
	int size;

public:
	CircularLinkedList()
	{
		head = nullptr;
		size = 0;
	}

	// Insertion at Start
	void insertAtStart(int value) /*@is*/
	{
		Node* newNode = new Node(value); /*@is_new*/

		if (head == nullptr) /*@is_empty*/
		{
			head = newNode;
			newNode->next = newNode; /*@is_self*/
			size++;
			return;
		}

		Node* temp = head; /*@is_temp*/

		while (temp->next != head) /*@is_while*/
		{
			temp = temp->next; /*@is_walk*/
		}

		newNode->next = head; /*@is_l1*/
		temp->next = newNode; /*@is_l2*/
		head = newNode; /*@is_head*/

		size++; /*@is_size*/
	}

	// Insertion at End
	void insertAtEnd(int value) /*@ie*/
	{
		Node* newNode = new Node(value); /*@ie_new*/

		if (head == nullptr) /*@ie_empty*/
		{
			head = newNode;
			newNode->next = newNode; /*@ie_self*/
			size++;
			return;
		}

		Node* temp = head; /*@ie_temp*/

		while (temp->next != head) /*@ie_while*/
		{
			temp = temp->next; /*@ie_walk*/
		}

		temp->next = newNode; /*@ie_l1*/
		newNode->next = head; /*@ie_l2*/

		size++; /*@ie_size*/
	}

	// Deletion from Start
	void deleteFromStart() /*@ds*/
	{
		if (head == nullptr) /*@ds_empty*/
		{
			cout << "List is Empty!" << endl; /*@ds_msg*/
			return;
		}

		if (head->next == head) /*@ds_single*/
		{
			delete head;
			head = nullptr; /*@ds_single_done*/
			size--;
			return;
		}

		Node* temp = head; /*@ds_temp*/

		while (temp->next != head) /*@ds_while*/
		{
			temp = temp->next; /*@ds_walk*/
		}

		Node* target = head; /*@ds_target*/

		temp->next = head->next; /*@ds_relink*/
		head = head->next; /*@ds_head*/

		delete target; /*@ds_free*/

		size--; /*@ds_size*/
	}

	// Deletion from End
	void deleteFromEnd() /*@de*/
	{
		if (head == nullptr) /*@de_empty*/
		{
			cout << "List is Empty!" << endl; /*@de_msg*/
			return;
		}

		if (head->next == head) /*@de_single*/
		{
			delete head;
			head = nullptr; /*@de_single_done*/
			size--;
			return;
		}

		Node* temp = head; /*@de_temp*/

		while (temp->next->next != head) /*@de_while*/
		{
			temp = temp->next; /*@de_walk*/
		}

		delete temp->next; /*@de_free*/
		temp->next = head; /*@de_relink*/

		size--; /*@de_size*/
	}

	// Insertion at Index
	void insertAtIndex(int value, int index) /*@ii*/
	{
		if (index < 0 || index > size) /*@ii_check*/
		{
			cout << "Invalid Index!" << endl; /*@ii_bad*/
			return;
		}

		if (index == 0) /*@ii_zero*/
		{
			insertAtStart(value);
			return;
		}

		if (index == size) /*@ii_last*/
		{
			insertAtEnd(value);
			return;
		}

		Node* newNode = new Node(value); /*@ii_new*/
		Node* temp = head; /*@ii_temp*/

		for (int i = 0; i < index - 1; i++) /*@ii_for*/
		{
			temp = temp->next; /*@ii_walk*/
		}

		newNode->next = temp->next; /*@ii_l1*/
		temp->next = newNode; /*@ii_l2*/

		size++; /*@ii_size*/
	}

	// Deletion from Index
	void deleteFromIndex(int index) /*@di*/
	{
		if (index < 0 || index >= size) /*@di_check*/
		{
			cout << "Invalid Index!" << endl; /*@di_bad*/
			return;
		}

		if (index == 0) /*@di_zero*/
		{
			deleteFromStart();
			return;
		}

		Node* temp = head; /*@di_temp*/

		for (int i = 0; i < index - 1; i++) /*@di_for*/
		{
			temp = temp->next; /*@di_walk*/
		}

		Node* target = temp->next; /*@di_target*/
		temp->next = target->next; /*@di_bypass*/

		delete target; /*@di_free*/

		size--; /*@di_size*/
	}

	// Search (at most one full lap)
	int search(int value) /*@se*/
	{
		if (head == nullptr) /*@se_empty*/
		{
			return -1;
		}

		Node* temp = head; /*@se_temp*/
		int index = 0;

		do /*@se_do*/
		{
			if (temp->data == value) /*@se_check*/
			{
				return index; /*@se_found*/
			}

			temp = temp->next; /*@se_walk*/
			index++;
		}
		while (temp != head); /*@se_while*/

		return -1; /*@se_none*/
	}

	// Update at Start
	void updateAtStart(int value) /*@ust*/
	{
		if (head == nullptr) /*@ust_empty*/
		{
			cout << "List is Empty!" << endl; /*@ust_msg*/
			return;
		}

		head->data = value; /*@ust_set*/
	}

	// Update at Index
	void updateAtIndex(int index, int value) /*@up*/
	{
		if (index < 0 || index >= size) /*@up_check*/
		{
			cout << "Invalid Index!" << endl; /*@up_bad*/
			return;
		}

		Node* temp = head; /*@up_temp*/

		for (int i = 0; i < index; i++) /*@up_for*/
		{
			temp = temp->next; /*@up_walk*/
		}

		temp->data = value; /*@up_set*/
	}

	// Update at End
	void updateAtEnd(int value) /*@uen*/
	{
		if (head == nullptr) /*@uen_empty*/
		{
			cout << "List is Empty!" << endl; /*@uen_msg*/
			return;
		}

		Node* temp = head; /*@uen_temp*/

		while (temp->next != head) /*@uen_while*/
		{
			temp = temp->next; /*@uen_walk*/
		}

		temp->data = value; /*@uen_set*/
	}

	// Traverse (one full lap, from head back to head)
	void traverse() /*@tv*/
	{
		if (head == nullptr) return;

		Node* temp = head; /*@tv_temp*/

		do /*@tv_do*/
		{
			cout << temp->data << " "; /*@tv_print*/
			temp = temp->next; /*@tv_walk*/
		}
		while (temp != head); /*@tv_while*/

		cout << endl; /*@tv_done*/
	}

	// Sort Ascending (bubble sort — one lap per pass, stops the instant it would wrap)
	void sortAscending() /*@sasc*/
	{
		if (head == nullptr || head->next == head) return;

		bool swapped = true; /*@sasc_flag*/

		while (swapped) /*@sasc_outer*/
		{
			swapped = false;
			Node* temp = head; /*@sasc_temp*/

			while (temp->next != head) /*@sasc_inner*/
			{
				if (temp->data > temp->next->data) /*@sasc_cmp*/
				{
					int t = temp->data; /*@sasc_swap*/
					temp->data = temp->next->data;
					temp->next->data = t;
					swapped = true; /*@sasc_flagset*/
				}

				temp = temp->next; /*@sasc_walk*/
			}
		}
	}

	// Sort Descending
	void sortDescending() /*@sdesc*/
	{
		if (head == nullptr || head->next == head) return;

		bool swapped = true; /*@sdesc_flag*/

		while (swapped) /*@sdesc_outer*/
		{
			swapped = false;
			Node* temp = head; /*@sdesc_temp*/

			while (temp->next != head) /*@sdesc_inner*/
			{
				if (temp->data < temp->next->data) /*@sdesc_cmp*/
				{
					int t = temp->data; /*@sdesc_swap*/
					temp->data = temp->next->data;
					temp->next->data = t;
					swapped = true; /*@sdesc_flagset*/
				}

				temp = temp->next; /*@sdesc_walk*/
			}
		}
	}

	// Reverse in blocks of k (bounded by size, since there is no nullptr to stop at)
	void reverseByK(int k) /*@revk*/
	{
		if (head == nullptr) return;

		Node* temp = head; /*@revk_outer*/
		int visited = 0; /*@revk_visited*/

		while (visited < size) /*@revk_while*/
		{
			Node* nodes[64]; /*@revk_collect*/
			int count = 0;
			Node* walker = temp;

			while (count < k && visited < size) /*@revk_gather*/
			{
				nodes[count] = walker; /*@revk_store*/
				walker = walker->next;
				count++;
				visited++;
			}

			int l = 0, r = count - 1; /*@revk_lr*/

			while (l < r) /*@revk_swaploop*/
			{
				int t = nodes[l]->data; /*@revk_swap*/
				nodes[l]->data = nodes[r]->data;
				nodes[r]->data = t;
				l++;
				r--;
			}

			temp = walker; /*@revk_advance*/
		}
	}

	// Rotate Left by k — in a circular list this is just moving head forward,
	// no relinking at all, because the circle already connects everything.
	void rotateLeft(int k) /*@rotl*/
	{
		if (head == nullptr || head->next == head) /*@rotl_guard*/
		{
			return;
		}

		k = k % size; /*@rotl_k*/

		Node* temp = head; /*@rotl_temp*/

		for (int i = 0; i < k; i++) /*@rotl_walk*/
		{
			temp = temp->next;
		}

		head = temp; /*@rotl_head*/
	}

	// Rotate Right by k
	void rotateRight(int k) /*@rotr*/
	{
		if (head == nullptr || head->next == head) /*@rotr_guard*/
		{
			return;
		}

		k = k % size; /*@rotr_k*/

		rotateLeft(size - k); /*@rotr_call*/
	}

	// Remove Duplicates (keeps first occurrence; the head node is protected
	// even if a LATER node happens to share its value)
	void removeDuplicates() /*@dedup*/
	{
		if (head == nullptr || head->next == head) return;

		Node* outer = head; /*@dedup_outer*/
		int i = 0;

		while (i < size) /*@dedup_owhile*/
		{
			Node* runner = outer; /*@dedup_runner*/

			while (runner->next != outer) /*@dedup_rwhile*/
			{
				if (runner->next->data == outer->data) /*@dedup_cmp*/
				{
					Node* dup = runner->next; /*@dedup_target*/

					if (dup == head) /*@dedup_headcheck*/
					{
						head = dup->next; /*@dedup_headfix*/
					}

					runner->next = dup->next; /*@dedup_bypass*/
					delete dup; /*@dedup_free*/
					size--;
				}
				else
				{
					runner = runner->next; /*@dedup_advance*/
				}
			}

			outer = outer->next; /*@dedup_next*/
			i++;
		}
	}

	// Frequency Count (prints how many times each distinct value appears)
	void frequencyCount() /*@freq*/
	{
		if (head == nullptr) return;

		Node* outer = head; /*@freq_outer*/
		int i = 0;

		while (i < size) /*@freq_owhile*/
		{
			if (!outer->counted) /*@freq_check*/
			{
				int count = 1; /*@freq_init*/
				Node* inner = outer->next; /*@freq_inner*/

				while (inner != outer) /*@freq_iwhile*/
				{
					if (!inner->counted && inner->data == outer->data) /*@freq_cmp*/
					{
						count++; /*@freq_bump*/
						inner->counted = true;
					}

					inner = inner->next; /*@freq_iwalk*/
				}

				cout << outer->data << " -> " << count << endl; /*@freq_print*/
			}

			outer = outer->next; /*@freq_owalk*/
			i++;
		}
	}

	// Display (one full lap)
	void display() /*@dp*/
	{
		if (head == nullptr) /*@dp_empty*/
		{
			cout << "List is Empty!" << endl; /*@dp_msg*/
			return;
		}

		Node* temp = head; /*@dp_temp*/

		do /*@dp_do*/
		{
			cout << temp->data << " -> "; /*@dp_print*/
			temp = temp->next;
		}
		while (temp != head); /*@dp_while*/

		cout << "(back to head)" << endl; /*@dp_end*/
	}

	// Destructor
	~CircularLinkedList()
	{
		if (head == nullptr)
		{
			return;
		}

		Node* temp = head->next;

		while (temp != head)
		{
			Node* nextNode = temp->next;
			delete temp;
			temp = nextNode;
		}

		delete head;
		head = nullptr;
	}
};
`);

function runCll(st: LState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(cll.marks, () => snapOf(st, 'cll'));
  const M = (p: Partial<ListSnap>) => p as Partial<ListSnap>;

  const walkToLast = (markWhile: string, markWalk: string, extra: Partial<ListSnap>) => {
    let temp: number = st.head!;
    while (st.next[temp] !== st.head) {
      S(markWhile, `temp->next != head → true (temp is on ${valOf(st, temp)}). Keep lapping.`, { ...extra, hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('head', st.head)] } as Partial<ListSnap>);
      temp = st.next[temp]!;
      S(markWalk, `temp = temp->next → ${valOf(st, temp)}.`, { ...extra, hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('head', st.head)] } as Partial<ListSnap>);
    }
    S(markWhile, `temp->next == head → the loop stops. temp (${valOf(st, temp)}) is the last node. Note the exit test is "!= head", NOT "!= nullptr" — a circular list has no nullptr to find.`,
      { ...extra, hiNode: [temp], hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('head', st.head)] } as Partial<ListSnap>);
    return temp;
  };

  switch (opId) {
    case 'insertAtStart': {
      const v = a.value;
      S('is', `Called insertAtStart(${v}).`);
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.floating.push(id);
      S('is_new', `Node* newNode = new Node(${v}).`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      S('is_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`, M({ floating: [id], ptrs: [P('head', st.head)] }));
      if (st.head === null) {
        st.head = id; st.next[id] = id; st.order.push(id); st.floating = []; st.size++;
        S('is_self', 'First node in a circular list points at ITSELF. That single-node self-loop is what keeps every other method working unchanged.', M({ hiNode: [id], hiLink: [id], ptrs: [P('head', id)] }));
        break;
      }
      S('is_temp', 'Node* temp = head — we still need the last node, because it is the one holding the wrap-around link.', M({ floating: [id], ptrs: [P('temp', st.head, 'orange'), P('head', st.head)] }));
      const last = walkToLast('is_while', 'is_walk', { floating: [id] });
      st.next[id] = st.head;
      S('is_l1', `newNode->next = head → newNode points at the old first node (${valOf(st, st.head)}).`, M({ floating: [id], hiLink: [id], ptrs: [P('newNode', id, 'green'), P('temp', last, 'orange')] }));
      st.next[last] = id;
      st.order.unshift(id); st.floating = st.floating.filter(x => x !== id);
      S('is_l2', `temp->next = newNode → the last node's wrap-around link now lands on newNode instead. The ring is closed again.`,
        M({ hiNode: [id], hiLink: [last], ptrs: [P('newNode', id, 'green'), P('temp', last, 'orange')] }));
      st.head = id;
      S('is_head', 'head = newNode.', M({ hiNode: [id], ptrs: [P('head', id)] }));
      st.size++;
      S('is_size', `size++ → ${st.size}. O(n), purely because of the walk to find the last node. A tail pointer instead of a head pointer would make both ends O(1).`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'insertAtEnd': {
      const v = a.value;
      S('ie', `Called insertAtEnd(${v}).`);
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.floating.push(id);
      S('ie_new', `Node* newNode = new Node(${v}).`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      S('ie_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`, M({ floating: [id], ptrs: [P('head', st.head)] }));
      if (st.head === null) {
        st.head = id; st.next[id] = id; st.order.push(id); st.floating = []; st.size++;
        S('ie_self', 'Single node points at itself.', M({ hiNode: [id], hiLink: [id], ptrs: [P('head', id)] }));
        break;
      }
      S('ie_temp', 'Node* temp = head.', M({ floating: [id], ptrs: [P('temp', st.head, 'orange'), P('head', st.head)] }));
      const last = walkToLast('ie_while', 'ie_walk', { floating: [id] });
      st.next[last] = id;
      st.order.push(id); st.floating = st.floating.filter(x => x !== id);
      S('ie_l1', `temp->next = newNode — the old last node now points at newNode.`, M({ hiNode: [id], hiLink: [last], ptrs: [P('newNode', id, 'green'), P('temp', last, 'orange')] }));
      st.next[id] = st.head;
      S('ie_l2', `newNode->next = head — and newNode closes the ring by pointing back at head (${valOf(st, st.head)}). Miss this line and your circular list silently becomes a singly list.`,
        M({ hiNode: [id], hiLink: [id], ptrs: [P('newNode', id, 'green'), P('head', st.head)] }));
      st.size++;
      S('ie_size', `size++ → ${st.size}. O(n).`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'deleteFromStart': {
      S('ds', 'Called deleteFromStart().');
      S('ds_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('ds_msg', 'Nothing to delete.', undefined, 'List is Empty!'); break; }
      S('ds_single', `head->next == head? → ${st.next[st.head] === st.head ? 'true — the self-loop, only one node left' : 'false'}.`, M({ hiNode: [st.head], ptrs: [P('head', st.head)] }));
      if (st.next[st.head] === st.head) {
        const only = st.head;
        st.head = null; st.order = []; st.size--;
        delete st.next[only]; delete st.vals[only];
        S('ds_single_done', `Freed it and set head = nullptr. size → ${st.size}.`, M({ ptrs: [P('head', null)] }));
        break;
      }
      S('ds_temp', 'Node* temp = head — walk to the last node first, since it points at the node we are about to free.', M({ ptrs: [P('temp', st.head, 'orange'), P('head', st.head)] }));
      const last = walkToLast('ds_while', 'ds_walk', {});
      const target = st.head!;
      S('ds_target', `Node* target = head → ${valOf(st, target)} is the victim.`, M({ hiNode: [target], dying: [target], ptrs: [P('target', target, 'pink'), P('temp', last, 'orange')] }));
      st.next[last] = st.next[target];
      S('ds_relink', `temp->next = head->next — the last node now wraps to ${valOf(st, st.next[target])} instead.`, M({ dying: [target], hiLink: [last], ptrs: [P('temp', last, 'orange')] }));
      st.head = st.next[target];
      S('ds_head', `head = head->next → head is ${valOf(st, st.head)}.`, M({ dying: [target], ptrs: [P('head', st.head)] }));
      st.order = st.order.filter(x => x !== target);
      delete st.next[target]; delete st.vals[target];
      S('ds_free', 'delete target.', M({ ptrs: [P('head', st.head)] }));
      st.size--;
      S('ds_size', `size-- → ${st.size}.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'deleteFromEnd': {
      S('de', 'Called deleteFromEnd().');
      S('de_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('de_msg', 'Nothing to delete.', undefined, 'List is Empty!'); break; }
      S('de_single', `head->next == head? → ${st.next[st.head] === st.head ? 'true' : 'false'}.`, M({ hiNode: [st.head], ptrs: [P('head', st.head)] }));
      if (st.next[st.head] === st.head) {
        const only = st.head;
        st.head = null; st.order = []; st.size--;
        delete st.next[only]; delete st.vals[only];
        S('de_single_done', `Freed the only node. size → ${st.size}.`, M({ ptrs: [P('head', null)] }));
        break;
      }
      let temp: number = st.head;
      S('de_temp', 'Node* temp = head — this time we need the SECOND-last node.', M({ ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      while (st.next[st.next[temp]!] !== st.head) {
        S('de_while', `temp->next->next != head → true (temp on ${valOf(st, temp)}).`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp]!;
        S('de_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      const last = st.next[temp]!;
      S('de_while', `temp->next->next == head → stop. temp is ${valOf(st, temp)}, the node to free is ${valOf(st, last)}.`, M({ hiNode: [temp, last], dying: [last], ptrs: [P('temp', temp, 'orange')] }));
      S('de_free', `delete temp->next — ${valOf(st, last)} is gone.`, M({ dying: [last], ptrs: [P('temp', temp, 'orange')] }));
      st.next[temp] = st.head;
      st.order = st.order.filter(x => x !== last);
      delete st.next[last]; delete st.vals[last];
      S('de_relink', 'temp->next = head — the new last node takes over the wrap-around link. In a singly list this line would be "= nullptr" instead.',
        M({ hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      st.size--;
      S('de_size', `size-- → ${st.size}.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'insertAtIndex': {
      const v = a.value, idx = a.index;
      S('ii', `Called insertAtIndex(${v}, ${idx}).`);
      S('ii_check', `Guard: ${idx} < 0 || ${idx} > ${st.size} → ${idx < 0 || idx > st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx > st.size) { S('ii_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      S('ii_zero', `index == 0? → ${idx === 0 ? 'true — insertAtStart() handles it' : 'false'}.`);
      if (idx === 0) return steps.concat(runCll(st, 'insertAtStart', a));
      S('ii_last', `index == size? → ${idx === st.size ? 'true — insertAtEnd() handles it' : 'false'}.`);
      if (idx === st.size) return steps.concat(runCll(st, 'insertAtEnd', a));
      const id = nextId();
      st.vals[id] = v; st.next[id] = null; st.floating.push(id);
      S('ii_new', `Node* newNode = new Node(${v}).`, M({ floating: [id], hiNode: [id], ptrs: [P('newNode', id, 'green')] }));
      let temp: number = st.head!;
      S('ii_temp', `Node* temp = head. Walk to index ${idx - 1}.`, M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx - 1; i++) {
        temp = st.next[temp]!;
        S('ii_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ floating: [id], hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      st.next[id] = st.next[temp];
      S('ii_l1', `newNode->next = temp->next → ${valOf(st, st.next[temp])}.`, M({ floating: [id], hiLink: [id], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.next[temp] = id;
      const pos = st.order.indexOf(temp);
      st.order.splice(pos + 1, 0, id);
      st.floating = st.floating.filter(x => x !== id);
      S('ii_l2', `temp->next = newNode. Spliced in without touching the ring's wrap-around link.`, M({ hiNode: [id], hiLink: [temp], ptrs: [P('temp', temp, 'orange'), P('newNode', id, 'green')] }));
      st.size++;
      S('ii_size', `size++ → ${st.size}.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'deleteFromIndex': {
      const idx = a.index;
      S('di', `Called deleteFromIndex(${idx}).`);
      S('di_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('di_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      S('di_zero', `index == 0? → ${idx === 0 ? 'true — deleteFromStart() handles it' : 'false'}.`);
      if (idx === 0) return steps.concat(runCll(st, 'deleteFromStart', a));
      let temp: number = st.head!;
      S('di_temp', `Node* temp = head. Walk to index ${idx - 1}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx - 1; i++) {
        temp = st.next[temp]!;
        S('di_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      const target = st.next[temp]!;
      S('di_target', `Node* target = temp->next → ${valOf(st, target)}.`, M({ hiNode: [target], dying: [target], ptrs: [P('temp', temp, 'orange'), P('target', target, 'pink')] }));
      st.next[temp] = st.next[target];
      S('di_bypass', `temp->next = target->next.`, M({ hiLink: [temp], dying: [target] }));
      st.order = st.order.filter(x => x !== target);
      delete st.next[target]; delete st.vals[target];
      S('di_free', 'delete target.', M({ hiNode: [temp] }));
      st.size--;
      S('di_size', `size-- → ${st.size}.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}).`);
      S('se_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('se_empty', 'Nothing to search.', undefined, 'search returned -1'); break; }
      let temp: number = st.head, index = 0, found = -1;
      S('se_temp', 'Node* temp = head, index = 0.', M({ ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      let guard = 0;
      do {
        S('se_do', `Checking temp (${valOf(st, temp)}). A do-while runs the body first — required since temp == head is true before we've checked anything.`, M({ hiNode: [temp] }));
        S('se_check', `temp->data == ${v}? → ${st.vals[temp] === v ? 'YES' : 'no'}.`, M({ hiNode: [temp] }));
        if (st.vals[temp] === v) { found = index; break; }
        temp = st.next[temp]!; index++;
        S('se_walk', `temp = temp->next → ${valOf(st, temp)}, index ${index}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      } while (temp !== st.head && guard++ < 30);
      if (found >= 0) S('se_found', `Found at index ${found}.`, undefined, `search(${v}) returned ${found}`);
      else { S('se_while', 'temp == head — one full lap completed with no match.'); S('se_none', 'return -1.', undefined, `search(${v}) returned -1`); }
      break;
    }

    case 'updateAtStart': {
      S('ust', `Called updateAtStart(${a.value}).`);
      S('ust_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('ust_msg', 'Nothing to update.', undefined, 'List is Empty!'); break; }
      st.vals[st.head] = a.value;
      S('ust_set', `head->data = ${a.value}. O(1).`, M({ hiNode: [st.head], ptrs: [P('head', st.head)] }));
      break;
    }

    case 'updateAtIndex': {
      const idx = a.index, v = a.value;
      S('up', `Called updateAtIndex(${idx}, ${v}).`);
      S('up_check', `Guard: ${idx} < 0 || ${idx} >= ${st.size} → ${idx < 0 || idx >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (idx < 0 || idx >= st.size) { S('up_bad', 'Invalid index.', undefined, 'Invalid Index!'); break; }
      let temp: number = st.head!;
      S('up_temp', 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      for (let i = 0; i < idx; i++) {
        temp = st.next[temp]!;
        S('up_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      st.vals[temp] = v;
      S('up_set', `temp->data = ${v}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      break;
    }

    case 'updateAtEnd': {
      S('uen', `Called updateAtEnd(${a.value}).`);
      S('uen_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('uen_msg', 'Nothing to update.', undefined, 'List is Empty!'); break; }
      const last = walkToLast('uen_while', 'uen_walk', {});
      st.vals[last] = a.value;
      S('uen_set', `temp->data = ${a.value}. O(n) — this class keeps no tail pointer, so the wrap-around link has to be found by walking.`, M({ hiNode: [last], ptrs: [P('temp', last, 'orange')] }));
      break;
    }

    case 'traverse': {
      S('tv', 'Called traverse().');
      if (st.head === null) break;
      let temp: number = st.head;
      S('tv_temp', 'Node* temp = head.', M({ ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      let guard = 0;
      do {
        S('tv_do', `Visiting ${valOf(st, temp)}.`, M({ hiNode: [temp] }));
        S('tv_print', `cout << temp->data → printed ${st.vals[temp]}.`, M({ hiNode: [temp] }), `${st.vals[temp]}`);
        temp = st.next[temp]!;
        S('tv_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      } while (temp !== st.head && guard++ < 30);
      S('tv_while', 'temp == head — one full lap done.');
      S('tv_done', 'Traversal complete.');
      break;
    }

    case 'sortAscending':
    case 'sortDescending': {
      const asc = opId === 'sortAscending';
      const [mOuter, mInner, mTemp, mCmp, mSwap, mFlag, mFlagSet] = asc
        ? ['sasc_outer', 'sasc_inner', 'sasc_temp', 'sasc_cmp', 'sasc_swap', 'sasc_flag', 'sasc_flagset']
        : ['sdesc_outer', 'sdesc_inner', 'sdesc_temp', 'sdesc_cmp', 'sdesc_swap', 'sdesc_flag', 'sdesc_flagset'];
      S(asc ? 'sasc' : 'sdesc', `Called sort${asc ? 'Ascending' : 'Descending'}() — bubble sort by swapping DATA, one lap per pass (stops the instant temp->next would wrap back to head).`);
      if (st.head === null || st.next[st.head] === st.head) break;
      let swapped = true, pass = 0;
      while (swapped) {
        swapped = false;
        S(mFlag, `Pass ${++pass}: swapped = false.`);
        let temp: number = st.head;
        S(mTemp, 'Node* temp = head.', M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        while (st.next[temp] !== st.head) {
          const nx = st.next[temp]!;
          S(mInner, `temp->next != head → true. Comparing ${valOf(st, temp)} and ${valOf(st, nx)}.`, M({ hiNode: [temp, nx], ptrs: [P('temp', temp, 'orange')] }));
          const doSwap = asc ? st.vals[temp] > st.vals[nx] : st.vals[temp] < st.vals[nx];
          S(mCmp, `→ ${doSwap}.`);
          if (doSwap) {
            const t = st.vals[temp]; st.vals[temp] = st.vals[nx]; st.vals[nx] = t;
            swapped = true;
            S(mSwap, `Swapped DATA → ${st.vals[temp]}, ${st.vals[nx]}.`, M({ hiNode: [temp, nx] }));
            S(mFlagSet, 'swapped = true.');
          }
          temp = nx;
        }
        S(mOuter, `temp->next == head — this pass's lap is done. swapped = ${swapped}.`);
      }
      break;
    }

    case 'reverseByK': {
      const k = Math.max(1, a.k);
      S('revk', `Called reverseByK(${k}). Bounded by size (${st.size}) rather than nullptr, since a circular list never hits one.`);
      if (st.head === null) break;
      let temp: number = st.head;
      let visited = 0;
      S('revk_visited', 'visited = 0.');
      while (visited < st.size) {
        S('revk_outer', `New block starting at ${valOf(st, temp)}. visited so far: ${visited}/${st.size}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        const block: number[] = [];
        let walker: number = temp;
        while (block.length < k && visited < st.size) {
          block.push(walker);
          S('revk_store', `nodes[${block.length - 1}] = ${valOf(st, walker)}.`, M({ hiNode: block.slice() }));
          walker = st.next[walker]!;
          visited++;
        }
        let l = 0, r = block.length - 1;
        S('revk_lr', `l = 0, r = ${r}.`);
        while (l < r) {
          const a1 = block[l], a2 = block[r];
          const t = st.vals[a1]; st.vals[a1] = st.vals[a2]; st.vals[a2] = t;
          S('revk_swap', `Swapped nodes[${l}] and nodes[${r}].`, M({ hiNode: [a1, a2] }));
          l++; r--;
        }
        temp = walker;
      }
      S('revk_advance', 'Every node has been visited exactly once. Done.');
      break;
    }

    case 'rotateLeft':
    case 'rotateRight': {
      const isLeft = opId === 'rotateLeft';
      S(isLeft ? 'rotl' : 'rotr', `Called ${isLeft ? 'rotateLeft' : 'rotateRight'}(${a.k}).`);
      S(isLeft ? 'rotl_guard' : 'rotr_guard', `head == nullptr || head->next == head → ${st.head === null || st.next[st.head] === st.head ? 'true' : 'false'}.`);
      if (st.head === null || st.next[st.head] === st.head) break;
      const k0 = a.k;
      const k = ((k0 % st.size) + st.size) % st.size;
      S(isLeft ? 'rotl_k' : 'rotr_k', `k = ${k0} % ${st.size} = ${k}.`);
      if (!isLeft) { S('rotr_call', `rotateRight(${k0}) delegates to rotateLeft(size - k) = rotateLeft(${st.size - k}).`); }
      const effK = isLeft ? k : st.size - k;
      let temp: number = st.head;
      S('rotl_temp', `Node* temp = head. In a circular list this is the WHOLE operation — no cutting or relinking is needed, because every node already reaches every other node.`,
        M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      for (let i = 0; i < effK; i++) {
        temp = st.next[temp]!;
        S('rotl_walk', `temp = temp->next → ${valOf(st, temp)}.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
      }
      st.head = temp;
      st.order = (() => { const seen = new Set<number>(); const out: number[] = []; let cur: number | null = st.head; let g = 0; while (cur !== null && (!seen.has(cur) || g === 0) && g++ < st.size) { seen.add(cur); out.push(cur); cur = st.next[cur]; } return out; })();
      S('rotl_head', `head = temp. The exact same ring, just entered at a different point — redrawn left-to-right from the new head.`, M({ ptrs: [P('head', st.head)] }));
      break;
    }

    case 'removeDuplicates': {
      S('dedup', 'Called removeDuplicates(). The head node is protected even if a later node shares its value.');
      if (st.head === null || st.next[st.head] === st.head) break;
      let outer: number = st.head, i = 0;
      while (i < st.size) {
        S('dedup_outer', `outer on ${valOf(st, outer)} (${i + 1}/${st.size} standards checked so far).`, M({ hiNode: [outer], ptrs: [P('outer', outer, 'cyan')] }));
        let runner: number = outer;
        S('dedup_runner', 'Node* runner = outer.', M({ ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')] }));
        let guard = 0;
        while (st.next[runner] !== outer && guard++ < 30) {
          const nx = st.next[runner]!;
          S('dedup_rwhile', `runner->next != outer → true. Comparing ${valOf(st, nx)} against ${valOf(st, outer)}.`, M({ hiNode: [runner, nx] }));
          const isDup = st.vals[nx] === st.vals[outer];
          S('dedup_cmp', `→ ${isDup}.`);
          if (isDup) {
            S('dedup_target', `Node* dup = runner->next → ${valOf(st, nx)}.`, M({ hiNode: [nx], dying: [nx] }));
            S('dedup_headcheck', `dup == head? → ${nx === st.head ? 'true — protect it' : 'false'}.`);
            if (nx === st.head) { st.head = st.next[nx]; S('dedup_headfix', `head = dup->next → head moves to ${valOf(st, st.head)} before the delete.`, M({ ptrs: [P('head', st.head)] })); }
            st.next[runner] = st.next[nx];
            S('dedup_bypass', `runner->next = dup->next.`, M({ hiLink: [runner], dying: [nx] }));
            st.order = st.order.filter(x => x !== nx);
            delete st.next[nx]; delete st.vals[nx];
            st.size--;
            S('dedup_free', `delete dup. size → ${st.size}.`, M({ hiNode: [runner] }));
          } else {
            runner = nx;
            S('dedup_advance', `runner = runner->next → ${valOf(st, runner)}.`, M({ ptrs: [P('outer', outer, 'cyan'), P('runner', runner, 'orange')] }));
          }
        }
        outer = st.next[outer]!;
        i++;
        if (i < st.size) S('dedup_next', `outer = outer->next → ${valOf(st, outer)}.`, M({ ptrs: [P('outer', outer, 'cyan')] }));
      }
      break;
    }

    case 'frequencyCount': {
      S('freq', 'Called frequencyCount().');
      if (st.head === null) break;
      const counted = new Set<number>();
      let outer: number = st.head, i = 0;
      while (i < st.size) {
        S('freq_owhile', `outer on ${valOf(st, outer)}.`, M({ hiNode: [outer], ptrs: [P('outer', outer, 'cyan')] }));
        S('freq_check', `outer->counted → ${counted.has(outer)}.`);
        if (!counted.has(outer)) {
          let count = 1;
          S('freq_init', 'count = 1.');
          let inner: number = st.next[outer]!;
          S('freq_inner', 'Node* inner = outer->next.');
          let guard = 0;
          while (inner !== outer && guard++ < 30) {
            S('freq_iwhile', `inner != outer → true (on ${valOf(st, inner)}).`, M({ hiNode: [outer, inner] }));
            const eq = !counted.has(inner) && st.vals[inner] === st.vals[outer];
            S('freq_cmp', `→ ${eq}.`);
            if (eq) { count++; counted.add(inner); S('freq_bump', `count++ → ${count}.`); }
            inner = st.next[inner]!;
            S('freq_iwalk', `inner = inner->next → ${valOf(st, inner)}.`);
          }
          S('freq_print', `${valOf(st, outer)} occurs ${count} time(s).`, undefined, `${st.vals[outer]} -> ${count}`);
        }
        outer = st.next[outer]!;
        i++;
      }
      break;
    }

    case 'display': {
      S('dp', 'Called display().');
      S('dp_empty', `head == nullptr? → ${st.head === null ? 'true' : 'false'}.`);
      if (st.head === null) { S('dp_msg', 'Nothing to print.', undefined, 'List is Empty!'); break; }
      let temp: number = st.head;

      let line = '';
      S('dp_temp', 'Node* temp = head.', M({ ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      S('dp_do', 'A do-while is used, not a while. The body must run at least once, otherwise temp == head would be true immediately and nothing would ever print.', M({ ptrs: [P('temp', temp, 'orange')] }));
      let g = 0;
      do {
        line += `${st.vals[temp]} -> `;
        S('dp_print', `printed ${st.vals[temp]}, then temp = temp->next.`, M({ hiNode: [temp], ptrs: [P('temp', temp, 'orange')] }));
        temp = st.next[temp]!;
        S('dp_while', `temp != head? → ${temp !== st.head ? 'true, keep going' : 'false — one full lap done'}.`, M({ ptrs: [P('temp', temp, 'orange'), P('head', st.head)] }));
      } while (temp !== st.head && g++ < 40);
      S('dp_end', 'Exactly one lap, no infinite loop.', M({ ptrs: [P('head', st.head)] }), line + '(back to head)');
      break;
    }
  }
  return steps;
}

export const cllLab: Lab = {
  id: 'cll',
  title: 'Circular Linked List Class',
  icon: '🔄',
  className: 'CircularLinkedList',
  blurb: 'No nullptr anywhere — the last node points back at head. Every loop condition changes from "!= nullptr" to "!= head", and the visualiser draws the wrap-around link explicitly.',
  code: cll.code,
  marks: cll.marks,
  ops: [
    { id: 'insertAtStart', label: 'Insert at start', sig: 'void insertAtStart(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(n)' },
    { id: 'insertAtEnd', label: 'Insert at end', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(n)' },
    { id: 'insertAtIndex', label: 'Insert at index', sig: 'void insertAtIndex(int value, int index)', params: [{ name: 'value', label: 'value', def: 99 }, { name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'deleteFromStart', label: 'Delete from start', sig: 'void deleteFromStart()', params: [], big: 'O(n)' },
    { id: 'deleteFromEnd', label: 'Delete from end', sig: 'void deleteFromEnd()', params: [], big: 'O(n)' },
    { id: 'deleteFromIndex', label: 'Delete from index', sig: 'void deleteFromIndex(int index)', params: [{ name: 'index', label: 'index', def: 1 }], big: 'O(n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 30 }], big: 'O(n)' },
    { id: 'updateAtStart', label: 'Update at start', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 111 }], big: 'O(1)' },
    { id: 'updateAtIndex', label: 'Update at index', sig: 'void updateAtIndex(int index, int value)', params: [{ name: 'index', label: 'index', def: 1 }, { name: 'value', label: 'value', def: 77 }], big: 'O(n)' },
    { id: 'updateAtEnd', label: 'Update at end', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 222 }], big: 'O(n)' },
    { id: 'traverse', label: 'Traverse', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n²)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n²)' },
    { id: 'reverseByK', label: 'Reverse by k', sig: 'void reverseByK(int k)', params: [{ name: 'k', label: 'k', def: 2 }], big: 'O(n)' },
    { id: 'rotateLeft', label: 'Rotate left by k', sig: 'void rotateLeft(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(k)' },
    { id: 'rotateRight', label: 'Rotate right by k', sig: 'void rotateRight(int k)', params: [{ name: 'k', label: 'k', def: 1 }], big: 'O(n)' },
    { id: 'removeDuplicates', label: 'Remove duplicates', sig: 'void removeDuplicates()', params: [], big: 'O(n²)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'display', label: 'Display (one lap)', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: () => buildList([10, 20, 30], 'cll'),
  snapshot: (st: LState) => snapOf(st, 'cll'),
  run: (st, opId, a) => delayJoin(runCll(st, opId, a)),
};
