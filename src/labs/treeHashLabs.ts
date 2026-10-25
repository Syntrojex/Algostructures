import { parseCode, stepper, nextId, type ArraySnap, type HashSnap, type Lab, type LabStep, type TreeSnap } from './core';

/* ══════════════════════════════════════════════════════════════════════════
   BINARY SEARCH TREE
   ══════════════════════════════════════════════════════════════════════════ */
const bst = parseCode(`
class Node
{
public:
	int data;
	Node* left;
	Node* right;

	Node(int value)
	{
		data = value;
		left = nullptr;
		right = nullptr;
	}
};

class BST
{
private:
	Node* root;

	Node* insertHelper(Node* node, int value) /*@ih*/
	{
		if (node == nullptr) /*@ih_null*/
		{
			return new Node(value); /*@ih_new*/
		}

		if (value < node->data) /*@ih_less*/
		{
			node->left = insertHelper(node->left, value); /*@ih_left*/
		}
		else if (value > node->data) /*@ih_more*/
		{
			node->right = insertHelper(node->right, value); /*@ih_right*/
		}

		return node; /*@ih_ret*/
	}

	Node* findMinNode(Node* node) /*@fmn*/
	{
		while (node->left != nullptr) /*@fmn_while*/
		{
			node = node->left; /*@fmn_walk*/
		}

		return node; /*@fmn_ret*/
	}

	Node* removeHelper(Node* node, int value) /*@rh*/
	{
		if (node == nullptr) /*@rh_null*/
		{
			return nullptr;
		}

		if (value < node->data) /*@rh_less*/
		{
			node->left = removeHelper(node->left, value);
		}
		else if (value > node->data) /*@rh_more*/
		{
			node->right = removeHelper(node->right, value);
		}
		else /*@rh_found*/
		{
			if (node->left == nullptr) /*@rh_c1*/
			{
				Node* temp = node->right;
				delete node;
				return temp; /*@rh_c1_ret*/
			}

			if (node->right == nullptr) /*@rh_c2*/
			{
				Node* temp = node->left;
				delete node;
				return temp; /*@rh_c2_ret*/
			}

			Node* successor = findMinNode(node->right); /*@rh_succ*/
			node->data = successor->data; /*@rh_copy*/
			node->right = removeHelper(node->right, successor->data); /*@rh_rec*/
		}

		return node; /*@rh_ret*/
	}

	void inorderHelper(Node* node) /*@in*/
	{
		if (node == nullptr)
		{
			return;
		}

		inorderHelper(node->left); /*@in_left*/
		cout << node->data << " "; /*@in_visit*/
		inorderHelper(node->right); /*@in_right*/
	}

	void preorderHelper(Node* node) /*@pre*/
	{
		if (node == nullptr)
		{
			return;
		}

		cout << node->data << " "; /*@pre_visit*/
		preorderHelper(node->left); /*@pre_left*/
		preorderHelper(node->right); /*@pre_right*/
	}

	void postorderHelper(Node* node) /*@post*/
	{
		if (node == nullptr)
		{
			return;
		}

		postorderHelper(node->left); /*@post_left*/
		postorderHelper(node->right); /*@post_right*/
		cout << node->data << " "; /*@post_visit*/
	}

	void reverseInorderHelper(Node* node) /*@rin*/
	{
		if (node == nullptr)
		{
			return;
		}

		reverseInorderHelper(node->right); /*@rin_right*/
		cout << node->data << " "; /*@rin_visit*/
		reverseInorderHelper(node->left); /*@rin_left*/
	}

public:
	BST()
	{
		root = nullptr;
	}

	void insert(int value) /*@ins*/
	{
		root = insertHelper(root, value);
	}

	// Search (iterative — no stack frames needed)
	bool search(int value) /*@se*/
	{
		Node* curr = root; /*@se_init*/

		while (curr != nullptr) /*@se_while*/
		{
			if (value == curr->data) /*@se_eq*/
			{
				return true; /*@se_yes*/
			}

			if (value < curr->data) /*@se_less*/
			{
				curr = curr->left; /*@se_goleft*/
			}
			else
			{
				curr = curr->right; /*@se_goright*/
			}
		}

		return false; /*@se_no*/
	}

	void remove(int value) /*@rem*/
	{
		root = removeHelper(root, value);
	}

	int findMin() /*@fmin*/
	{
		Node* curr = root;

		while (curr->left != nullptr) /*@fmin_while*/
		{
			curr = curr->left; /*@fmin_walk*/
		}

		return curr->data; /*@fmin_ret*/
	}

	int findMax() /*@fmax*/
	{
		Node* curr = root;

		while (curr->right != nullptr) /*@fmax_while*/
		{
			curr = curr->right; /*@fmax_walk*/
		}

		return curr->data; /*@fmax_ret*/
	}

	void inorder() /*@inorder*/
	{
		inorderHelper(root);
		cout << endl;
	}

	void preorder() /*@preorder*/
	{
		preorderHelper(root);
		cout << endl;
	}

	void postorder() /*@postorder*/
	{
		postorderHelper(root);
		cout << endl;
	}

	// Display — the natural way to look at a BST is its sorted (inorder) form
	void display() /*@disp*/
	{
		inorder(); /*@disp_call*/
	}

	// Sort Ascending — inorder traversal on a BST always yields sorted order,
	// so no separate sorting algorithm is needed at all.
	void sortAscending() /*@sasc*/
	{
		inorderHelper(root); /*@sasc_call*/
		cout << endl;
	}

	// Sort Descending — the mirror image: right, node, left
	void sortDescending() /*@sdesc*/
	{
		reverseInorderHelper(root); /*@sdesc_call*/
		cout << endl;
	}

	// Traverse — level order (BFS), accumulating a running sum
	void traverse() /*@trav*/
	{
		if (root == nullptr) /*@trav_empty*/
		{
			return;
		}

		queue<Node*> q; /*@trav_q*/
		q.push(root);


		while (!q.empty()) /*@trav_while*/
		{
			Node* curr = q.front(); /*@trav_front*/
			q.pop();

			cout << curr->data << " "; /*@trav_print*/

			if (curr->left != nullptr) /*@trav_left*/
			{
				q.push(curr->left);
			}

			if (curr->right != nullptr) /*@trav_right*/
			{
				q.push(curr->right);
			}
		}

		cout << endl; /*@trav_done*/
	}
};
`);

interface BNode { v: number; l: number | null; r: number | null; }
interface BState { nodes: Record<number, BNode>; root: number | null; }

const bstSnap = (st: BState): TreeSnap => ({
  kind: 'tree',
  nodes: Object.keys(st.nodes).map(k => ({ id: +k, value: st.nodes[+k].v, l: st.nodes[+k].l, r: st.nodes[+k].r })),
  root: st.root,
  hi: [], path: [], ptrs: [],
});

function makeBst(values: number[]): BState {
  const st: BState = { nodes: {}, root: null };
  const ins = (node: number | null, v: number): number => {
    if (node === null) { const id = nextId(); st.nodes[id] = { v, l: null, r: null }; return id; }
    if (v < st.nodes[node].v) st.nodes[node].l = ins(st.nodes[node].l, v);
    else if (v > st.nodes[node].v) st.nodes[node].r = ins(st.nodes[node].r, v);
    return node;
  };
  for (const v of values) st.root = ins(st.root, v);
  return st;
}

function runBst(st: BState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(bst.marks, () => bstSnap(st));
  const M = (p: Partial<TreeSnap>) => p as Partial<TreeSnap>;
  const N = (id: number) => st.nodes[id].v;

  switch (opId) {
    case 'insert': {
      const v = a.value;
      S('ins', `Called insert(${v}) → root = insertHelper(root, ${v}). Each recursive call returns the (possibly new) subtree root, and the parent re-attaches it. That is why insertHelper returns Node*.`);
      const path: number[] = [];
      const rec = (node: number | null): number => {
        S('ih_null', `insertHelper(${node === null ? 'nullptr' : N(node)}, ${v}): node == nullptr? → ${node === null ? 'true' : 'false'}.`, M({ hi: node === null ? [] : [node], path: path.slice() }));
        if (node === null) {
          const id = nextId();
          st.nodes[id] = { v, l: null, r: null };
          S('ih_new', `Recursion bottomed out — return new Node(${v}). This empty slot is exactly where BST ordering says ${v} belongs.`, M({ hi: [id], path: path.slice() }));
          return id;
        }
        path.push(node);
        if (v < N(node)) {
          S('ih_less', `${v} < ${N(node)} → go LEFT.`, M({ hi: [node], path: path.slice() }));
          st.nodes[node].l = rec(st.nodes[node].l);
          S('ih_left', `node->left = insertHelper(...) — ${N(node)} re-attaches its left subtree.`, M({ hi: [node], path: path.slice() }));
        } else if (v > N(node)) {
          S('ih_more', `${v} > ${N(node)} → go RIGHT.`, M({ hi: [node], path: path.slice() }));
          st.nodes[node].r = rec(st.nodes[node].r);
          S('ih_right', `node->right = insertHelper(...) — ${N(node)} re-attaches its right subtree.`, M({ hi: [node], path: path.slice() }));
        } else {
          S('ih_ret', `${v} == ${N(node)} — neither branch is taken, so duplicates are silently ignored by this implementation.`, M({ hi: [node], path: path.slice() }));
        }
        path.pop();
        return node;
      };
      st.root = rec(st.root);
      S('ih_ret', `Done. Every call unwound and returned its node, so the whole tree is stitched back together. Cost O(h) — O(log n) if balanced, O(n) if the inserts arrived sorted.`, M({ path: [] }));
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}).`);
      let curr = st.root;
      const path: number[] = [];
      S('se_init', 'Node* curr = root. Iterative this time — no recursion, O(1) extra space.', M({ hi: curr !== null ? [curr] : [] }));
      while (curr !== null) {
        S('se_while', `curr != nullptr → true (curr is on ${N(curr)}).`, M({ hi: [curr], path: path.slice() }));
        S('se_eq', `${v} == ${N(curr)}? → ${v === N(curr) ? 'YES' : 'no'}.`, M({ hi: [curr], path: path.slice() }));
        if (v === N(curr)) {
          S('se_yes', `Found. Each comparison threw away an entire subtree — that is the BST payoff.`, M({ hi: [curr], path: path.slice() }), `search(${v}) returned true`);
          return steps;
        }
        path.push(curr);
        if (v < N(curr)) {
          S('se_less', `${v} < ${N(curr)} → everything in the right subtree is too big, discard it and go left.`, M({ hi: [curr], path: path.slice() }));
          curr = st.nodes[curr].l;
          S('se_goleft', `curr = curr->left → ${curr === null ? 'nullptr' : N(curr)}.`, M({ hi: curr !== null ? [curr] : [], path: path.slice() }));
        } else {
          S('se_less', `${v} < ${N(curr)}? → false, so go right.`, M({ hi: [curr], path: path.slice() }));
          curr = st.nodes[curr].r;
          S('se_goright', `curr = curr->right → ${curr === null ? 'nullptr' : N(curr)}.`, M({ hi: curr !== null ? [curr] : [], path: path.slice() }));
        }
      }
      S('se_while', 'curr == nullptr — we fell off the bottom of the tree.', M({ path: path.slice() }));
      S('se_no', `return false. ${v} is not in this tree.`, undefined, `search(${v}) returned false`);
      break;
    }

    case 'remove': {
      const v = a.value;
      S('rem', `Called remove(${v}) → root = removeHelper(root, ${v}).`);
      const path: number[] = [];
      const rec = (node: number | null, target: number): number | null => {
        if (node === null) { S('rh_null', 'node == nullptr — the value is not in this subtree, return nullptr.', M({ path: path.slice() })); return null; }
        if (target < st.nodes[node].v) {
          S('rh_less', `${target} < ${N(node)} → recurse left.`, M({ hi: [node], path: path.slice() }));
          path.push(node);
          st.nodes[node].l = rec(st.nodes[node].l, target);
          path.pop();
        } else if (target > st.nodes[node].v) {
          S('rh_more', `${target} > ${N(node)} → recurse right.`, M({ hi: [node], path: path.slice() }));
          path.push(node);
          st.nodes[node].r = rec(st.nodes[node].r, target);
          path.pop();
        } else {
          S('rh_found', `Found ${target}. Now the three cases decide what replaces it.`, M({ hi: [node], path: path.slice() }));
          S('rh_c1', `Case 1 — node->left == nullptr? → ${st.nodes[node].l === null ? 'true' : 'false'}.`, M({ hi: [node], path: path.slice() }));
          if (st.nodes[node].l === null) {
            const temp = st.nodes[node].r;
            delete st.nodes[node];
            S('rh_c1_ret', `No left child, so the right child (${temp === null ? 'nullptr' : N(temp)}) simply moves up into this slot. Covers both the leaf case and the one-child case.`, M({ hi: temp !== null ? [temp] : [], path: path.slice() }));
            return temp;
          }
          S('rh_c2', `Case 2 — node->right == nullptr? → ${st.nodes[node].r === null ? 'true' : 'false'}.`, M({ hi: [node], path: path.slice() }));
          if (st.nodes[node].r === null) {
            const temp = st.nodes[node].l;
            delete st.nodes[node];
            S('rh_c2_ret', `Only a left child, so it moves up.`, M({ hi: temp !== null ? [temp] : [], path: path.slice() }));
            return temp;
          }
          let s = st.nodes[node].r!;
          S('rh_succ', 'Case 3 — two children. Find the in-order successor: the smallest value in the RIGHT subtree.', M({ hi: [s], path: path.slice() }));
          while (st.nodes[s].l !== null) {
            s = st.nodes[s].l!;
            S('fmn_walk', `findMinNode: walk left → ${N(s)}.`, M({ hi: [s], path: path.slice() }));
          }
          S('fmn_ret', `Successor is ${N(s)}. It is the only value that can sit here and keep every BST ordering rule intact.`, M({ hi: [s], path: path.slice() }));
          st.nodes[node].v = st.nodes[s].v;
          S('rh_copy', `node->data = successor->data → this slot now holds ${N(s)}. Only the payload was copied; no pointers moved yet.`, M({ hi: [node], path: path.slice() }));
          path.push(node);
          st.nodes[node].r = rec(st.nodes[node].r, st.nodes[node].v);
          path.pop();
          S('rh_rec', 'The duplicate successor down in the right subtree is deleted by a recursive call — and it always falls into case 1 or 2, so this never recurses deeply.', M({ hi: [node], path: path.slice() }));
        }
        return node;
      };
      st.root = rec(st.root, v);
      S('rh_ret', 'Done. O(h).', M({ path: [] }));
      break;
    }

    case 'findMin': {
      S('fmin', 'Called findMin().');
      if (st.root === null) { S('fmin_ret', 'Empty tree.', undefined, 'findMin(): tree is empty'); break; }
      let curr = st.root;
      const path: number[] = [];
      while (st.nodes[curr].l !== null) {
        S('fmin_while', `curr->left != nullptr → true (curr on ${N(curr)}).`, M({ hi: [curr], path: path.slice() }));
        path.push(curr);
        curr = st.nodes[curr].l!;
        S('fmin_walk', `curr = curr->left → ${N(curr)}.`, M({ hi: [curr], path: path.slice() }));
      }
      S('fmin_ret', `No left child left, so ${N(curr)} is the minimum. In a BST the smallest value is always the leftmost node — no searching required.`, M({ hi: [curr], path: path.slice() }), `findMin() returned ${N(curr)}`);
      break;
    }

    case 'findMax': {
      S('fmax', 'Called findMax().');
      if (st.root === null) { S('fmax_ret', 'Empty tree.', undefined, 'findMax(): tree is empty'); break; }
      let curr = st.root;
      const path: number[] = [];
      while (st.nodes[curr].r !== null) {
        S('fmax_while', `curr->right != nullptr → true (curr on ${N(curr)}).`, M({ hi: [curr], path: path.slice() }));
        path.push(curr);
        curr = st.nodes[curr].r!;
        S('fmax_walk', `curr = curr->right → ${N(curr)}.`, M({ hi: [curr], path: path.slice() }));
      }
      S('fmax_ret', `${N(curr)} is the maximum — the rightmost node.`, M({ hi: [curr], path: path.slice() }), `findMax() returned ${N(curr)}`);
      break;
    }

    case 'display': {
      S('disp', 'Called display().');
      S('disp_call', 'display() just calls inorder() — for a BST, printing in sorted order IS the natural display.');
      const visited: number[] = [];
      const rec = (node: number | null) => {
        if (node === null) return;
        S('in_left', `At ${N(node)}: recurse left before doing anything else.`, M({ hi: [node], path: visited.slice() }));
        rec(st.nodes[node].l);
        visited.push(node);
        S('in_visit', `Visit ${N(node)}.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true);
        rec(st.nodes[node].r);
      };
      rec(st.root);
      S('in_visit', `Done. Output: ${visited.map(N).join(' ')}`, M({ path: visited.slice() }));
      break;
    }

    case 'sortAscending': {
      S('sasc', 'Called sortAscending().');
      S('sasc_call', 'sortAscending() calls inorderHelper(root) — the exact same lines inorder() uses. Inorder traversal (left, node, right) always visits BST nodes smallest-to-largest, so the tree sorts itself with no comparison-based algorithm at all.');
      const visited: number[] = []; const out: number[] = [];
      const rec = (node: number | null) => {
        if (node === null) return;
        S('in_left', `At ${N(node)}: recurse left first.`, M({ hi: [node], path: visited.slice() }));
        rec(st.nodes[node].l);
        out.push(N(node)); visited.push(node);
        S('in_visit', `Visit ${N(node)} — the next-smallest remaining value.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true);
        rec(st.nodes[node].r);
      };
      rec(st.root);
      S('sasc_call', `Done — sorted ascending, purely as a side effect of the tree shape. Output: ${out.join(' ')}`, M({ path: visited.slice() }));
      break;
    }

    case 'sortDescending': {
      S('sdesc', 'Called sortDescending().');
      S('sdesc_call', 'sortDescending() calls reverseInorderHelper(root) — the mirror image of inorder: right, node, left.');
      const visited: number[] = []; const out: number[] = [];
      const rec = (node: number | null) => {
        if (node === null) return;
        S('rin_right', `At ${N(node)}: recurse RIGHT first this time.`, M({ hi: [node], path: visited.slice() }));
        rec(st.nodes[node].r);
        out.push(N(node)); visited.push(node);
        S('rin_visit', `Visit ${N(node)} — the next-largest remaining value.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true);
        rec(st.nodes[node].l);
      };
      rec(st.root);
      S('sdesc_call', `Done — sorted descending. Output: ${out.join(' ')}`, M({ path: visited.slice() }));
      break;
    }

    case 'traverse': {
      S('trav', 'Called traverse() — level order (BFS), unlike inorder/preorder/postorder which are all depth-first.');
      S('trav_empty', `root == nullptr? → ${st.root === null ? 'true' : 'false'}.`);
      if (st.root === null) break;
      const q: number[] = [st.root];
      S('trav_q', 'queue<Node*> q; q.push(root) — a queue is what turns a depth-first-shaped recursion into a breadth-first one: siblings get visited before children.', M({ hi: [st.root] }));
      const visited: number[] = [];
      let guard = 0;
      while (q.length > 0 && guard++ < 30) {
        S('trav_while', `!q.empty() → true. Queue holds: [${q.map(N).join(', ')}].`, M({ path: visited.slice() }));
        const curr = q.shift()!;
        S('trav_front', `Node* curr = q.front(); q.pop() → curr is ${N(curr)}.`, M({ hi: [curr], path: visited.slice() }));
        visited.push(curr);
        S('trav_print', `cout << curr->data → printed ${N(curr)}.`, M({ hi: [curr], path: visited.slice() }), `${N(curr)}`, true);
        if (st.nodes[curr].l !== null) { q.push(st.nodes[curr].l!); S('trav_left', `Left child (${N(st.nodes[curr].l!)}) exists → enqueued.`, M({ hi: [st.nodes[curr].l!] })); }
        else S('trav_left', 'No left child.');
        if (st.nodes[curr].r !== null) { q.push(st.nodes[curr].r!); S('trav_right', `Right child (${N(st.nodes[curr].r!)}) exists → enqueued.`, M({ hi: [st.nodes[curr].r!] })); }
        else S('trav_right', 'No right child.');
      }
      S('trav_while', '!q.empty() → false. Every node visited exactly once, level by level.', M({ path: visited.slice() }));
      S('trav_done', 'Level-order traversal complete.');
      break;
    }

    case 'inorder':
    case 'preorder':
    case 'postorder': {
      const kind = opId as 'inorder' | 'preorder' | 'postorder';
      S(kind, `Called ${kind}().`);
      const visited: number[] = [];
      const out: number[] = [];
      const rec = (node: number | null) => {
        if (node === null) return;
        if (kind === 'preorder') {
          out.push(N(node)); visited.push(node);
          S('pre_visit', `Visit ${N(node)} FIRST, then descend. Preorder is root → left → right, which is why it reproduces the tree's shape when you rebuild from it.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true);
        }
        if (kind === 'inorder') S('in_left', `At ${N(node)}: recurse left before doing anything else.`, M({ hi: [node], path: visited.slice() }));
        if (kind === 'postorder') S('post_left', `At ${N(node)}: both children must finish before this node is visited.`, M({ hi: [node], path: visited.slice() }));
        rec(st.nodes[node].l);
        if (kind === 'inorder') {
          out.push(N(node)); visited.push(node);
          S('in_visit', `Visit ${N(node)} — left subtree is fully done. Inorder on a BST always comes out sorted, which is the single most useful property of the whole structure.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true);
        }
        rec(st.nodes[node].r);
        if (kind === 'postorder') {
          out.push(N(node)); visited.push(node);
          S('post_visit', `Visit ${N(node)} — both subtrees are finished. Postorder is what a destructor uses: free the children before the parent.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true);
        }
      };
      rec(st.root);
      S(kind, `Traversal complete — every node touched exactly once, O(n). Output: ${out.join(' ')}`, M({ path: visited.slice() }));
      break;
    }
  }
  return steps;
}

/* A new BST node first exists on its own: show it hovering above the tree, UNLINKED, in the step where it is created,
   so the next step (parent->left / parent->right = newNode) visibly connects it. */
export function holdNewNodes(steps: LabStep[]): LabStep[] {
  const out: LabStep[] = [];
  const known = new Set<number>();
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const sn = st.snap as TreeSnap;
    sn.pointers = true;
    const fresh = sn.nodes.filter(n => !known.has(n.id));
    sn.nodes.forEach(n => known.add(n.id));
    if (i === 0 || fresh.length === 0) { out.push(st); continue; }
    const ids = fresh.map(n => n.id);
    // detach: nobody points at the fresh node(s) yet, and a fresh root is not the root yet
    const detached: TreeSnap = {
      ...sn,
      floating: ids,
      root: ids.includes(sn.root as number) ? null : sn.root,
      nodes: sn.nodes.map(n => ({ ...n, l: ids.includes(n.l as number) ? null : n.l, r: ids.includes(n.r as number) ? null : n.r })),
    };
    out.push({ ...st, snap: detached });
    if (i === steps.length - 1) out.push({ ...st, note: 'Done — the new node is now linked into the tree.', out: undefined, snap: sn });
  }
  return out;
}

export const bstLab: Lab = {
  id: 'bst',
  title: 'Binary Search Tree Class',
  icon: '🌳',
  className: 'BST',
  blurb: 'Recursive insert and delete, iterative search, and all three traversals. Delete is the interesting one — try removing a node with two children and watch the in-order successor get promoted.',
  code: bst.code,
  marks: bst.marks,
  ops: [
    { id: 'insert', label: 'Insert', sig: 'void insert(int value)', params: [{ name: 'value', label: 'value', def: 45 }], big: 'O(h)' },
    { id: 'search', label: 'Search', sig: 'bool search(int value)', params: [{ name: 'value', label: 'value', def: 60 }], big: 'O(h)' },
    { id: 'remove', label: 'Delete', sig: 'void remove(int value)', params: [{ name: 'value', label: 'value', def: 30 }], big: 'O(h)' },
    { id: 'findMin', label: 'Find minimum', sig: 'int findMin()', params: [], big: 'O(h)' },
    { id: 'findMax', label: 'Find maximum', sig: 'int findMax()', params: [], big: 'O(h)' },
    { id: 'traverse', label: 'Traverse (level order)', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending', sig: 'void sortAscending()', params: [], big: 'O(n)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n)' },
    { id: 'inorder', label: 'Inorder traversal', sig: 'void inorder()', params: [], big: 'O(n)' },
    { id: 'preorder', label: 'Preorder traversal', sig: 'void preorder()', params: [], big: 'O(n)' },
    { id: 'postorder', label: 'Postorder traversal', sig: 'void postorder()', params: [], big: 'O(n)' },
    { id: 'display', label: 'Display', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: () => makeBst([50, 30, 70, 20, 40, 60, 80]),
  snapshot: bstSnap,
  run: (st, opId, a) => holdNewNodes(runBst(st, opId, a)),
};

/* ══════════════════════════════════════════════════════════════════════════
   MIN HEAP
   ══════════════════════════════════════════════════════════════════════════ */
const heap = parseCode(`
class MinHeap
{
private:
	int* arr;
	int size;
	int capacity;

	int parent(int i) /*@parent*/
	{
		return (i - 1) / 2;
	}

	int leftChild(int i)
	{
		return 2 * i + 1;
	}

	int rightChild(int i)
	{
		return 2 * i + 2;
	}

	void heapifyUp(int i) /*@up*/
	{
		while (i > 0 && arr[parent(i)] > arr[i]) /*@up_while*/
		{
			swap(arr[i], arr[parent(i)]); /*@up_swap*/
			i = parent(i); /*@up_move*/
		}
	}

	void heapifyDown(int i) /*@down*/
	{
		int smallest = i; /*@down_init*/
		int l = leftChild(i);
		int r = rightChild(i);

		if (l < size && arr[l] < arr[smallest]) /*@down_l*/
		{
			smallest = l;
		}

		if (r < size && arr[r] < arr[smallest]) /*@down_r*/
		{
			smallest = r;
		}

		if (smallest != i) /*@down_check*/
		{
			swap(arr[i], arr[smallest]); /*@down_swap*/
			heapifyDown(smallest); /*@down_rec*/
		}
	}

public:
	MinHeap(int capacity)
	{
		this->capacity = capacity;
		arr = new int[capacity];
		size = 0;
	}

	// Insert
	void insert(int value) /*@ins*/
	{
		if (size == capacity) /*@ins_full*/
		{
			cout << "Heap is Full!" << endl; /*@ins_over*/
			return;
		}

		arr[size] = value; /*@ins_place*/
		size++;

		heapifyUp(size - 1); /*@ins_up*/
	}

	// Extract Minimum
	int extractMin() /*@ext*/
	{
		if (size == 0) /*@ext_empty*/
		{
			cout << "Heap is Empty!" << endl; /*@ext_msg*/
			return -1;
		}

		int minValue = arr[0]; /*@ext_read*/

		arr[0] = arr[size - 1]; /*@ext_move*/
		size--;

		heapifyDown(0); /*@ext_down*/

		return minValue; /*@ext_ret*/
	}

	int getMin() /*@get*/
	{
		if (size == 0)
		{
			return -1;
		}

		return arr[0]; /*@get_ret*/
	}

	// Insert at End — identical to insert(); a heap's insertion point is never
	// chosen, it always starts at the next free array slot and bubbles up.
	void insertAtEnd(int value) /*@is*/
	{
		insert(value); /*@is_call*/
	}

	// Remove from Start — identical to extractMin(); index 0 (the "start" of
	// the array) is always the min in a MinHeap.
	int removeAtStart() /*@rs*/
	{
		return extractMin(); /*@rs_call*/
	}

	// Remove from End — removes the LAST array slot directly. No heapify is
	// needed at all, because removing a leaf can never violate the heap
	// property (unlike removing the root, which always might).
	int removeAtEnd() /*@re*/
	{
		if (size == 0) /*@re_check*/
		{
			cout << "Heap is Empty!" << endl; /*@re_msg*/
			return -1;
		}

		int value = arr[size - 1]; /*@re_read*/
		size--; /*@re_size*/

		return value; /*@re_ret*/
	}

	// Remove at Position — swap the target with the last element, shrink,
	// then heapify in whichever direction is actually needed.
	int removeAtPosition(int pos) /*@rp*/
	{
		if (pos < 0 || pos >= size) /*@rp_check*/
		{
			cout << "Invalid Position!" << endl; /*@rp_bad*/
			return -1;
		}

		int value = arr[pos]; /*@rp_read*/

		arr[pos] = arr[size - 1]; /*@rp_move*/
		size--; /*@rp_size*/

		if (pos < size) /*@rp_stillthere*/
		{
			heapifyDown(pos); /*@rp_down*/
			heapifyUp(pos); /*@rp_up*/
		}

		return value; /*@rp_ret*/
	}

	// Update at Start — replace the root; it can only need to SINK, since it
	// was already the minimum of everything below it.
	void updateAtStart(int value) /*@ust*/
	{
		if (size == 0) /*@ust_check*/
		{
			cout << "Heap is Empty!" << endl; /*@ust_msg*/
			return;
		}

		arr[0] = value; /*@ust_set*/
		heapifyDown(0); /*@ust_down*/
	}

	// Update at End — the last slot is an arbitrary leaf; the new value
	// could need to rise OR sink, so try both (only one ever actually moves it).
	void updateAtEnd(int value) /*@uen*/
	{
		if (size == 0) /*@uen_check*/
		{
			cout << "Heap is Empty!" << endl; /*@uen_msg*/
			return;
		}

		arr[size - 1] = value; /*@uen_set*/
		heapifyUp(size - 1); /*@uen_up*/
		heapifyDown(size - 1); /*@uen_down*/
	}

	// Update at Position — this IS the classic "decrease-key" / "change-key"
	// operation Dijkstra's algorithm depends on.
	void updateAtPosition(int pos, int value) /*@up*/
	{
		if (pos < 0 || pos >= size) /*@up_check*/
		{
			cout << "Invalid Position!" << endl; /*@up_bad*/
			return;
		}

		arr[pos] = value; /*@up_set*/
		heapifyUp(pos); /*@up_up*/
		heapifyDown(pos); /*@up_down*/
	}

	// Search — a heap gives NO better than linear search; only the root is
	// guaranteed to be the min, nothing else is ordered.
	int search(int value) /*@se*/
	{
		for (int i = 0; i < size; i++) /*@se_loop*/
		{
			if (arr[i] == value) /*@se_hit*/
			{
				return i; /*@se_found*/
			}
		}

		return -1; /*@se_miss*/
	}

	// Traverse (array order — which is also level order for a heap)
	void traverse() /*@tv*/
	{

		for (int i = 0; i < size; i++) /*@tv_loop*/
		{
			cout << arr[i] << " "; /*@tv_print*/
		}

		cout << endl; /*@tv_done*/
	}

	// Sort Ascending — this literally IS Heap Sort: repeatedly extract the
	// min until the heap is empty. NOTE: this consumes the heap.
	void sortAscending() /*@sasc*/
	{
		while (size > 0) /*@sasc_while*/
		{
			cout << extractMin() << " "; /*@sasc_call*/
		}

		cout << endl; /*@sasc_done*/
	}

	// Sort Descending — extract ascending (as above), then reverse the
	// result; a MinHeap has no O(log n) way to pull the MAXIMUM each time.
	void sortDescending() /*@sdesc*/
	{
		int result[64]; /*@sdesc_init*/
		int n = 0;

		while (size > 0) /*@sdesc_while*/
		{
			result[n] = extractMin(); /*@sdesc_call*/
			n++;
		}

		for (int i = n - 1; i >= 0; i--) /*@sdesc_print*/
		{
			cout << result[i] << " ";
		}

		cout << endl; /*@sdesc_done*/
	}

	// Frequency Count — a heap (unlike a BST) allows duplicate values
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

	void display() /*@disp*/
	{
		for (int i = 0; i < size; i++) /*@disp_loop*/
		{
			cout << arr[i] << " ";
		}

		cout << endl; /*@disp_end*/
	}

	~MinHeap()
	{
		delete[] arr;
		arr = nullptr;
	}
};
`);

interface HState { arr: (number | null)[]; size: number; capacity: number; }

const heapSnap = (st: HState): TreeSnap => {
  const nodes = [];
  for (let i = 0; i < st.size; i++) {
    const l = 2 * i + 1, r = 2 * i + 2;
    nodes.push({ id: i, value: st.arr[i] as number, l: l < st.size ? l : null, r: r < st.size ? r : null });
  }
  return {
    kind: 'tree',
    nodes,
    root: st.size > 0 ? 0 : null,
    hi: [], path: [], ptrs: [],
    arrayView: st.arr.slice(0, st.capacity),
    arrayHi: [],
  };
};

function runHeap(st: HState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(heap.marks, () => heapSnap(st));
  const M = (p: Partial<TreeSnap>) => p as Partial<TreeSnap>;
  const parent = (i: number) => Math.floor((i - 1) / 2);

  const doHeapifyUp = (start: number) => {
    S('up', `heapifyUp(${start}) — bubble it upwards until the parent is smaller.`, M({ hi: [start], arrayHi: [start] }));
    let i = start;
    while (i > 0 && (st.arr[parent(i)] as number) > (st.arr[i] as number)) {
      S('up_while', `i > 0 && arr[parent(${i})] (${st.arr[parent(i)]}) > arr[${i}] (${st.arr[i]}) → true.`, M({ hi: [i, parent(i)], arrayHi: [i, parent(i)] }));
      const t = st.arr[i]; st.arr[i] = st.arr[parent(i)]; st.arr[parent(i)] = t;
      S('up_swap', `Swapped arr[${i}] and arr[${parent(i)}].`, M({ hi: [i, parent(i)], arrayHi: [i, parent(i)] }));
      i = parent(i);
      S('up_move', `i = parent(i) = ${i}.`, M({ hi: [i], arrayHi: [i] }));
    }
    S('up_while', i === 0 ? 'i == 0 — reached the root.' : 'Heap property holds again. Stop.', M({ hi: [i], arrayHi: [i] }));
  };

  const doHeapifyDown = (start: number) => {
    S('down', `heapifyDown(${start}).`, M({ hi: [start], arrayHi: [start] }));
    const rec = (i: number) => {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      S('down_init', `smallest = ${i}, left = ${l}, right = ${r}.`, M({ hi: [i], arrayHi: [i] }));
      if (l < st.size && (st.arr[l] as number) < (st.arr[smallest] as number)) { smallest = l; S('down_l', `Left child ${st.arr[l]} is smaller → smallest = ${l}.`, M({ hi: [i, l], arrayHi: [i, l] })); }
      else S('down_l', `Left child ${l < st.size ? String(st.arr[l]) : 'does not exist'} — no change.`, M({ hi: [i], arrayHi: [i] }));
      if (r < st.size && (st.arr[r] as number) < (st.arr[smallest] as number)) { smallest = r; S('down_r', `Right child ${st.arr[r]} is smaller still → smallest = ${r}.`, M({ hi: [i, r], arrayHi: [i, r] })); }
      else S('down_r', `Right child ${r < st.size ? String(st.arr[r]) : 'does not exist'} — no change.`, M({ hi: [i], arrayHi: [i] }));
      S('down_check', `smallest (${smallest}) != i (${i})? → ${smallest !== i}.`, M({ hi: [i], arrayHi: [i] }));
      if (smallest !== i) {
        const t = st.arr[i]; st.arr[i] = st.arr[smallest]; st.arr[smallest] = t;
        S('down_swap', `Swapped arr[${i}] and arr[${smallest}].`, M({ hi: [i, smallest], arrayHi: [i, smallest] }));
        S('down_rec', `heapifyDown(${smallest}).`, M({ hi: [smallest], arrayHi: [smallest] }));
        rec(smallest);
      }
    };
    rec(start);
  };

  switch (opId) {
    case 'insert': {
      const v = a.value;
      S('ins', `Called insert(${v}).`);
      S('ins_full', `size (${st.size}) == capacity (${st.capacity})? → ${st.size === st.capacity ? 'true' : 'false'}.`);
      if (st.size === st.capacity) { S('ins_over', 'No room left.', undefined, 'Heap is Full!'); break; }
      st.arr[st.size] = v;
      st.size++;
      S('ins_place', `arr[${st.size - 1}] = ${v}, size++ → ${st.size}. The value goes in the first free array slot, which is the next position in level order. The heap property is probably broken right now — that is expected.`,
        M({ hi: [st.size - 1], arrayHi: [st.size - 1] }));
      let i = st.size - 1;
      S('ins_up', `heapifyUp(${i}) — bubble it upwards until the parent is smaller.`, M({ hi: [i], arrayHi: [i] }));
      while (i > 0 && (st.arr[parent(i)] as number) > (st.arr[i] as number)) {
        S('up_while', `i > 0 && arr[parent(${i})] (${st.arr[parent(i)]}) > arr[${i}] (${st.arr[i]}) → true. The child is smaller than its parent, so a min-heap cannot allow this.`,
          M({ hi: [i, parent(i)], arrayHi: [i, parent(i)] }));
        const t = st.arr[i]; st.arr[i] = st.arr[parent(i)]; st.arr[parent(i)] = t;
        S('up_swap', `Swapped arr[${i}] and arr[${parent(i)}].`, M({ hi: [i, parent(i)], arrayHi: [i, parent(i)] }));
        i = parent(i);
        S('up_move', `i = parent(i) = ${i}. Keep climbing.`, M({ hi: [i], arrayHi: [i] }));
      }
      S('up_while', i === 0 ? 'i == 0 — we reached the root, nothing above it.' : `arr[parent(${i})] (${st.arr[parent(i)]}) <= arr[${i}] (${st.arr[i]}) — the heap property holds again. Stop.`,
        M({ hi: [i], arrayHi: [i] }));
      S('ins_up', `Done. At most one swap per level → O(log n).`, M({}));
      break;
    }

    case 'extractMin': {
      S('ext', 'Called extractMin().');
      S('ext_empty', `size == 0? → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) { S('ext_msg', 'Nothing to extract.', undefined, 'Heap is Empty!'); break; }
      const min = st.arr[0];
      S('ext_read', `int minValue = arr[0] → ${min}. The root of a min-heap is always the smallest element, so this read is O(1).`, M({ hi: [0], arrayHi: [0] }));
      st.arr[0] = st.arr[st.size - 1];
      st.size--;
      S('ext_move', `arr[0] = arr[size - 1], size-- → ${st.size}. The LAST element is moved to the root. Why the last one? Because it is the only removal that keeps the tree complete (no gaps in the array).`,
        M({ hi: [0], arrayHi: [0] }));
      S('ext_down', 'heapifyDown(0) — now sink it back to where it belongs.', M({ hi: [0], arrayHi: [0] }));
      const down = (i: number) => {
        let smallest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        S('down_init', `heapifyDown(${i}): smallest = ${i}, left = ${l}, right = ${r}.`, M({ hi: [i], arrayHi: [i] }));
        if (l < st.size && (st.arr[l] as number) < (st.arr[smallest] as number)) {
          smallest = l;
          S('down_l', `Left child ${st.arr[l]} is smaller → smallest = ${l}.`, M({ hi: [i, l], arrayHi: [i, l] }));
        } else {
          S('down_l', `Left child ${l < st.size ? String(st.arr[l]) : 'does not exist'} — no change.`, M({ hi: [i], arrayHi: [i] }));
        }
        if (r < st.size && (st.arr[r] as number) < (st.arr[smallest] as number)) {
          smallest = r;
          S('down_r', `Right child ${st.arr[r]} is smaller still → smallest = ${r}.`, M({ hi: [i, r], arrayHi: [i, r] }));
        } else {
          S('down_r', `Right child ${r < st.size ? String(st.arr[r]) : 'does not exist'} — no change.`, M({ hi: [i], arrayHi: [i] }));
        }
        S('down_check', `smallest (${smallest}) != i (${i})? → ${smallest !== i ? 'true, swap needed' : 'false — this subtree is a valid heap, stop'}.`, M({ hi: [i], arrayHi: [i] }));
        if (smallest !== i) {
          const t = st.arr[i]; st.arr[i] = st.arr[smallest]; st.arr[smallest] = t;
          S('down_swap', `Swapped arr[${i}] and arr[${smallest}]. Always swap with the SMALLER child — swapping with the larger one would break the heap on the other side.`, M({ hi: [i, smallest], arrayHi: [i, smallest] }));
          S('down_rec', `heapifyDown(${smallest}) — keep sinking.`, M({ hi: [smallest], arrayHi: [smallest] }));
          down(smallest);
        }
      };
      down(0);
      S('ext_ret', `return ${min}. One sink per level → O(log n).`, M({}), `extractMin() returned ${min}`);
      break;
    }

    case 'getMin': {
      S('get', 'Called getMin().');
      if (st.size === 0) { S('get_ret', 'Empty heap.', undefined, 'getMin() returned -1'); break; }
      S('get_ret', `return arr[0] → ${st.arr[0]}. O(1) — no searching, the minimum is structurally guaranteed to sit at index 0.`, M({ hi: [0], arrayHi: [0] }), `getMin() returned ${st.arr[0]}`);
      break;
    }

    case 'insertAtEnd': {
      const v = a.value;
      S('is', `Called insertAtEnd(${v}).`);
      S('is_call', 'insertAtEnd delegates straight to insert() — a heap never lets you choose WHERE a value lands; it always starts at the next free slot and bubbles up to its correct place.');
      if (st.size === st.capacity) { S('ins_over', 'Full.', undefined, 'Heap is Full!'); break; }
      st.arr[st.size] = v; st.size++;
      S('ins_place', `arr[${st.size - 1}] = ${v}, size++ → ${st.size}.`, M({ hi: [st.size - 1], arrayHi: [st.size - 1] }));
      doHeapifyUp(st.size - 1);
      break;
    }

    case 'removeAtStart': {
      S('rs', 'Called removeAtStart().');
      S('rs_call', 'removeAtStart delegates straight to extractMin() — index 0 (the "start" of the array) is always the minimum.');
      if (st.size === 0) { S('ext_msg', 'Empty.', undefined, 'Heap is Empty!'); break; }
      const min = st.arr[0];
      st.arr[0] = st.arr[st.size - 1]; st.size--;
      S('ext_move', `arr[0] = arr[size-1], size-- → ${st.size}.`, M({ hi: [0], arrayHi: [0] }));
      doHeapifyDown(0);
      S('ext_ret', `return ${min}.`, undefined, `removeAtStart() returned ${min}`);
      break;
    }

    case 'removeAtEnd': {
      S('re', 'Called removeAtEnd().');
      S('re_check', `size == 0? → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) { S('re_msg', 'Empty.', undefined, 'Heap is Empty!'); break; }
      const v = st.arr[st.size - 1];
      S('re_read', `int value = arr[${st.size - 1}] → ${v}.`, M({ hi: [st.size - 1], arrayHi: [st.size - 1] }));
      st.size--;
      S('re_size', `size-- → ${st.size}. No heapify at all — removing the LAST leaf can never break the heap property, unlike removing the root.`);
      S('re_ret', `return ${v}.`, undefined, `removeAtEnd() returned ${v}`);
      break;
    }

    case 'removeAtPosition': {
      const pos = a.pos;
      S('rp', `Called removeAtPosition(${pos}).`);
      S('rp_check', `Guard: ${pos} < 0 || ${pos} >= ${st.size} → ${pos < 0 || pos >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos >= st.size) { S('rp_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      const v = st.arr[pos];
      S('rp_read', `int value = arr[${pos}] → ${v}.`, M({ hi: [pos], arrayHi: [pos] }));
      st.arr[pos] = st.arr[st.size - 1];
      S('rp_move', `arr[${pos}] = arr[size-1] — the last element plugs the hole, keeping the tree complete.`, M({ hi: [pos], arrayHi: [pos] }));
      st.size--;
      S('rp_size', `size-- → ${st.size}.`);
      S('rp_stillthere', `pos < size → ${pos < st.size ? 'true, the moved value needs re-checking' : 'false — we removed the very last slot, nothing to fix'}.`);
      if (pos < st.size) {
        S('rp_down', `heapifyDown(${pos}) — try sinking first.`);
        doHeapifyDown(pos);
        S('rp_up', `heapifyUp(${pos}) — then try rising. Only one of the two ever actually moves anything.`);
        doHeapifyUp(pos);
      }
      S('rp_ret', `return ${v}.`, undefined, `removeAtPosition(${pos}) returned ${v}`);
      break;
    }

    case 'updateAtStart': {
      S('ust', `Called updateAtStart(${a.value}).`);
      S('ust_check', `size == 0? → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) { S('ust_msg', 'Empty.', undefined, 'Heap is Empty!'); break; }
      st.arr[0] = a.value;
      S('ust_set', `arr[0] = ${a.value}. The root can only ever need to SINK — it was already ≤ everything below it.`, M({ hi: [0], arrayHi: [0] }));
      doHeapifyDown(0);
      break;
    }

    case 'updateAtEnd': {
      S('uen', `Called updateAtEnd(${a.value}).`);
      S('uen_check', `size == 0? → ${st.size === 0 ? 'true' : 'false'}.`);
      if (st.size === 0) { S('uen_msg', 'Empty.', undefined, 'Heap is Empty!'); break; }
      st.arr[st.size - 1] = a.value;
      S('uen_set', `arr[size-1] = ${a.value}. A leaf position has no structural guarantee either way, so both directions get tried.`, M({ hi: [st.size - 1], arrayHi: [st.size - 1] }));
      doHeapifyUp(st.size - 1);
      doHeapifyDown(st.size - 1);
      break;
    }

    case 'updateAtPosition': {
      const pos = a.pos, v = a.value;
      S('up', `Called updateAtPosition(${pos}, ${v}) — the classic "decrease-key" operation.`);
      S('up_check', `Guard: ${pos} < 0 || ${pos} >= ${st.size} → ${pos < 0 || pos >= st.size ? 'true (rejected)' : 'false (valid)'}.`);
      if (pos < 0 || pos >= st.size) { S('up_bad', 'Invalid position.', undefined, 'Invalid Position!'); break; }
      st.arr[pos] = v;
      S('up_set', `arr[${pos}] = ${v}.`, M({ hi: [pos], arrayHi: [pos] }));
      doHeapifyUp(pos);
      doHeapifyDown(pos);
      break;
    }

    case 'search': {
      const v = a.value;
      S('se', `Called search(${v}) — linear scan. Unlike a BST, a heap gives no ordering to exploit outside the parent/child rule.`);
      let found = -1;
      for (let i = 0; i < st.size; i++) {
        S('se_loop', `i = ${i}, arr[${i}] = ${st.arr[i]}.`, M({ hi: [i], arrayHi: [i] }));
        S('se_hit', `arr[${i}] == ${v} → ${st.arr[i] === v}.`);
        if (st.arr[i] === v) { found = i; S('se_found', `Found at index ${i}.`, M({ hi: [i], arrayHi: [i] }), `search(${v}) returned ${i}`); break; }
      }
      if (found === -1) S('se_miss', 'Not found.', undefined, `search(${v}) returned -1`);
      break;
    }

    case 'traverse': {
      S('tv', 'Called traverse() — array order, which is also level order for a heap.');
      for (let i = 0; i < st.size; i++) {
        S('tv_loop', `i = ${i}.`, M({ hi: [i], arrayHi: [i] }));
        S('tv_print', `cout << arr[${i}] → printed ${st.arr[i]}.`, M({ hi: [i], arrayHi: [i] }), `${st.arr[i]}`);
      }
      S('tv_done', 'Done.');
      break;
    }

    case 'sortAscending': {
      S('sasc', 'Called sortAscending() — this literally IS Heap Sort. NOTE: this consumes the heap, exactly like the real algorithm.');
      const out: number[] = [];
      let guard = 0;
      while (st.size > 0 && guard++ < 30) {
        S('sasc_while', `size (${st.size}) > 0 → true.`);
        const min = st.arr[0];
        st.arr[0] = st.arr[st.size - 1]; st.size--;
        doHeapifyDown(0);
        out.push(min as number);
        S('sasc_call', `extractMin() → ${min}. Extracting from a min-heap in order, one at a time, is exactly what "ascending sort" means.`, undefined, `${min}`);
      }
      S('sasc_while', 'size == 0 — heap is now empty.');
      S('sasc_done', 'Sorted ascending — every value was already printed as it was extracted. Like the real heap sort, this consumed the heap: press “Reset object” to get the starting heap back, or insert new values.');
      break;
    }

    case 'sortDescending': {
      S('sdesc', 'Called sortDescending().');
      S('sdesc_init', 'A MinHeap has no O(log n) way to pull the MAXIMUM each time, so: extract everything ascending into a buffer, then print it backwards.');
      const buf: number[] = [];
      let guard = 0;
      while (st.size > 0 && guard++ < 30) {
        S('sdesc_while', `size (${st.size}) > 0 → true.`);
        const min = st.arr[0];
        st.arr[0] = st.arr[st.size - 1]; st.size--;
        doHeapifyDown(0);
        buf.push(min as number);
        S('sdesc_call', `result[${buf.length - 1}] = extractMin() → ${min}.`);
      }
      S('sdesc_while', 'size == 0 — heap is now empty.');
      const rev = buf.slice().reverse();
      S('sdesc_print', 'for (i = n-1; i >= 0; i--) — walking the buffer backwards turns ascending into descending.', undefined, rev.join(' '));
      S('sdesc_done', 'Sorted descending. This consumed the heap (the real algorithm does too) — press “Reset object” for the starting heap, or insert new values.');
      break;
    }

    case 'frequencyCount': {
      S('freq', 'Called frequencyCount() — a heap, unlike this site\'s BST, allows duplicate values.');
      const counted = new Array(st.size).fill(false);
      for (let i = 0; i < st.size; i++) {
        S('freq_outer', `i = ${i}, arr[${i}] = ${st.arr[i]}.`, M({ hi: [i], arrayHi: [i] }));
        S('freq_skip', `counted[${i}] → ${counted[i]}.`);
        if (counted[i]) continue;
        let count = 1;
        S('freq_start', 'count = 1.');
        for (let j = i + 1; j < st.size; j++) {
          const eq = st.arr[j] === st.arr[i];
          S('freq_inner', `Comparing arr[${j}] = ${st.arr[j]}.`, M({ hi: [i], arrayHi: [j] }));
          S('freq_cmp', `→ ${eq}.`);
          if (eq) { count++; counted[j] = true; S('freq_bump', `count++ → ${count}.`); }
        }
        S('freq_print', `arr[${i}] occurs ${count} time(s).`, undefined, `${st.arr[i]} -> ${count}`);
      }
      break;
    }

    case 'display': {
      S('disp', 'Called display() — prints the raw array, which is level-order of the tree.');
      let line = '';

      for (let i = 0; i < st.size; i++) {
        line += `${st.arr[i]} `;
        S('disp_loop', `arr[${i}] = ${st.arr[i]} — index ${i} in the array is the same node as level-order position ${i} in the tree. parent = (i-1)/2, children = 2i+1 and 2i+2. No pointers exist anywhere in this data structure.`,
          M({ hi: [i], arrayHi: [i] }));
      }
      S('disp_end', 'Done.', M({}), line.trim());
      break;
    }
  }
  return steps;
}

export const heapLab: Lab = {
  id: 'heap',
  title: 'Min Heap Class',
  icon: '⛰️',
  className: 'MinHeap',
  blurb: 'A tree with no pointers. The array IS the tree, and the index arithmetic (2i+1, 2i+2) is the only link between them — shown side by side so you can see both views move together.',
  code: heap.code,
  marks: heap.marks,
  ops: [
    { id: 'insert', label: 'Insert (heapify up)', sig: 'void insert(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(log n)' },
    { id: 'extractMin', label: 'Extract min (heapify down)', sig: 'int extractMin()', params: [], big: 'O(log n)' },
    { id: 'getMin', label: 'Get min', sig: 'int getMin()', params: [], big: 'O(1)' },
    { id: 'insertAtEnd', label: 'Insert at end (= insert)', sig: 'void insertAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 12 }], big: 'O(log n)' },
    { id: 'removeAtStart', label: 'Remove from start (= extractMin)', sig: 'int removeAtStart()', params: [], big: 'O(log n)' },
    { id: 'removeAtEnd', label: 'Remove from end', sig: 'int removeAtEnd()', params: [], big: 'O(1)' },
    { id: 'removeAtPosition', label: 'Remove at position', sig: 'int removeAtPosition(int pos)', params: [{ name: 'pos', label: 'pos', def: 2 }], big: 'O(log n)' },
    { id: 'updateAtStart', label: 'Update at start (root)', sig: 'void updateAtStart(int value)', params: [{ name: 'value', label: 'value', def: 3 }], big: 'O(log n)' },
    { id: 'updateAtPosition', label: 'Update at position (decrease-key)', sig: 'void updateAtPosition(int pos, int value)', params: [{ name: 'pos', label: 'pos', def: 3 }, { name: 'value', label: 'value', def: 1 }], big: 'O(log n)' },
    { id: 'updateAtEnd', label: 'Update at end (last leaf)', sig: 'void updateAtEnd(int value)', params: [{ name: 'value', label: 'value', def: 50 }], big: 'O(log n)' },
    { id: 'search', label: 'Search', sig: 'int search(int value)', params: [{ name: 'value', label: 'value', def: 25 }], big: 'O(n)' },
    { id: 'traverse', label: 'Traverse (array order)', sig: 'void traverse()', params: [], big: 'O(n)' },
    { id: 'sortAscending', label: 'Sort ascending (Heap Sort)', sig: 'void sortAscending()', params: [], big: 'O(n log n)' },
    { id: 'sortDescending', label: 'Sort descending', sig: 'void sortDescending()', params: [], big: 'O(n log n)' },
    { id: 'frequencyCount', label: 'Frequency count', sig: 'void frequencyCount()', params: [], big: 'O(n²)' },
    { id: 'display', label: 'Display (level order)', sig: 'void display()', params: [], big: 'O(n)' },
  ],
  init: (): HState => ({ arr: [10, 20, 15, 40, 25, 18, null, null, null, null, null, null, null, null, null], size: 6, capacity: 15 }),
  snapshot: heapSnap,
  run: runHeap,
};

/* ══════════════════════════════════════════════════════════════════════════
   HASH TABLE — separate chaining
   ══════════════════════════════════════════════════════════════════════════ */
const hash = parseCode(`
class HashTable
{
private:
	static const int BUCKETS = 7;
	vector<int> table[BUCKETS];

	int hashFunction(int key) /*@hf*/
	{
		return key % BUCKETS;
	}

public:
	// Insert
	void insert(int key) /*@ins*/
	{
		int index = hashFunction(key); /*@ins_hash*/

		for (int i = 0; i < table[index].size(); i++) /*@ins_scan*/
		{
			if (table[index][i] == key) /*@ins_dup*/
			{
				cout << "Key already exists!" << endl; /*@ins_dupmsg*/
				return;
			}
		}

		table[index].push_back(key); /*@ins_push*/
	}

	// Search
	bool search(int key) /*@se*/
	{
		int index = hashFunction(key); /*@se_hash*/

		for (int i = 0; i < table[index].size(); i++) /*@se_scan*/
		{
			if (table[index][i] == key) /*@se_check*/
			{
				return true; /*@se_yes*/
			}
		}

		return false; /*@se_no*/
	}

	// Remove
	void remove(int key) /*@rm*/
	{
		int index = hashFunction(key); /*@rm_hash*/

		for (int i = 0; i < table[index].size(); i++) /*@rm_scan*/
		{
			if (table[index][i] == key) /*@rm_check*/
			{
				table[index].erase(table[index].begin() + i); /*@rm_erase*/
				return;
			}
		}

		cout << "Key not found!" << endl; /*@rm_none*/
	}

	// Traverse (every bucket, every chained entry)
	void traverse() /*@tv*/
	{

		for (int i = 0; i < BUCKETS; i++) /*@tv_outer*/
		{
			for (int j = 0; j < table[i].size(); j++) /*@tv_inner*/
			{
				cout << table[i][j] << " "; /*@tv_print*/
			}
		}

		cout << endl; /*@tv_done*/
	}

	// Display
	void display() /*@disp*/
	{
		for (int i = 0; i < BUCKETS; i++) /*@disp_loop*/
		{
			cout << i << ": ";

			for (int j = 0; j < table[i].size(); j++)
			{
				cout << table[i][j] << " -> ";
			}

			cout << "NULL" << endl;
		}
	}
};
`);

interface HashState { buckets: number[][]; }
const BUCKETS = 7;

const hashSnapshot = (st: HashState): HashSnap => ({
  kind: 'hash',
  buckets: st.buckets.map(b => b.slice()),
  hiBucket: [], hiEntry: [],
  formula: 'index = key % 7',
});

function runHash(st: HashState, opId: string, a: Record<string, number>): LabStep[] {
  const { steps, S } = stepper(hash.marks, () => hashSnapshot(st));
  const M = (p: Partial<HashSnap>) => p as Partial<HashSnap>;

  switch (opId) {
    case 'insert': {
      const k = a.key;
      const idx = ((k % BUCKETS) + BUCKETS) % BUCKETS;
      S('ins', `Called insert(${k}).`);
      S('ins_hash', `index = hashFunction(${k}) = ${k} % ${BUCKETS} = ${idx}. One arithmetic operation takes us straight to the right bucket — no searching. That is the whole idea behind hashing.`, M({ hiBucket: [idx] }));
      for (let i = 0; i < st.buckets[idx].length; i++) {
        S('ins_scan', `Bucket ${idx} already holds ${st.buckets[idx].length} key(s) — a COLLISION. Scanning the chain to rule out a duplicate.`, M({ hiBucket: [idx], hiEntry: [{ b: idx, i }] }));
        S('ins_dup', `table[${idx}][${i}] (${st.buckets[idx][i]}) == ${k}? → ${st.buckets[idx][i] === k ? 'YES' : 'no'}.`, M({ hiBucket: [idx], hiEntry: [{ b: idx, i }] }));
        if (st.buckets[idx][i] === k) { S('ins_dupmsg', 'Duplicate — nothing inserted.', M({ hiBucket: [idx] }), 'Key already exists!'); return steps; }
      }
      st.buckets[idx].push(k);
      S('ins_push', `push_back(${k}) → appended to the chain in bucket ${idx}. ${st.buckets[idx].length > 1 ? `This bucket now holds ${st.buckets[idx].length} keys — different keys, same hash. Separate chaining just lets them share.` : 'Bucket was empty, so no collision.'} Average O(1), worst case O(n) if every key lands in one bucket.`,
        M({ hiBucket: [idx], hiEntry: [{ b: idx, i: st.buckets[idx].length - 1 }] }));
      break;
    }
    case 'search': {
      const k = a.key;
      const idx = ((k % BUCKETS) + BUCKETS) % BUCKETS;
      S('se', `Called search(${k}).`);
      S('se_hash', `index = ${k} % ${BUCKETS} = ${idx}. We only ever look inside ONE bucket — the other ${BUCKETS - 1} are never touched.`, M({ hiBucket: [idx] }));
      for (let i = 0; i < st.buckets[idx].length; i++) {
        S('se_check', `table[${idx}][${i}] (${st.buckets[idx][i]}) == ${k}? → ${st.buckets[idx][i] === k ? 'YES' : 'no'}.`, M({ hiBucket: [idx], hiEntry: [{ b: idx, i }] }));
        if (st.buckets[idx][i] === k) { S('se_yes', `Found after ${i + 1} comparison(s).`, M({ hiBucket: [idx], hiEntry: [{ b: idx, i }] }), `search(${k}) returned true`); return steps; }
      }
      S('se_no', `Walked the whole chain in bucket ${idx} without a match → return false. A key that is not in its own bucket cannot be anywhere else.`, M({ hiBucket: [idx] }), `search(${k}) returned false`);
      break;
    }
    case 'remove': {
      const k = a.key;
      const idx = ((k % BUCKETS) + BUCKETS) % BUCKETS;
      S('rm', `Called remove(${k}).`);
      S('rm_hash', `index = ${k} % ${BUCKETS} = ${idx}.`, M({ hiBucket: [idx] }));
      for (let i = 0; i < st.buckets[idx].length; i++) {
        S('rm_check', `table[${idx}][${i}] (${st.buckets[idx][i]}) == ${k}? → ${st.buckets[idx][i] === k ? 'YES' : 'no'}.`, M({ hiBucket: [idx], hiEntry: [{ b: idx, i }] }));
        if (st.buckets[idx][i] === k) {
          st.buckets[idx].splice(i, 1);
          S('rm_erase', 'erase() removes it from the chain. Everything after it shifts down one slot inside that vector.', M({ hiBucket: [idx] }));
          return steps;
        }
      }
      S('rm_none', 'Not in this bucket, so not in the table.', M({ hiBucket: [idx] }), 'Key not found!');
      break;
    }
    case 'traverse': {
      S('tv', 'Called traverse().');
      for (let i = 0; i < BUCKETS; i++) {
        S('tv_outer', `Bucket ${i}: ${st.buckets[i].length} key(s).`, M({ hiBucket: [i] }));
        for (let j = 0; j < st.buckets[i].length; j++) {
          S('tv_inner', `Entry ${j} in bucket ${i}.`, M({ hiBucket: [i], hiEntry: [{ b: i, i: j }] }));
          S('tv_print', `cout << table[${i}][${j}] → printed ${st.buckets[i][j]}.`, M({ hiBucket: [i], hiEntry: [{ b: i, i: j }] }), `${st.buckets[i][j]}`);
        }
      }
      S('tv_done', 'Every bucket AND every chained entry inside it visited exactly once.');
      break;
    }
    case 'display': {
      S('disp', 'Called display().');
      for (let i = 0; i < BUCKETS; i++) {
        S('disp_loop', `Bucket ${i}: ${st.buckets[i].length === 0 ? 'empty' : `${st.buckets[i].length} key(s) chained`}.`, M({ hiBucket: [i] }),
          `${i}: ${st.buckets[i].map(x => `${x} -> `).join('')}NULL`);
      }
      break;
    }
  }
  return steps;
}

export const hashLab: Lab = {
  id: 'hash',
  title: 'Hash Table Class (chaining)',
  icon: '🔑',
  className: 'HashTable',
  blurb: 'Seven buckets and key % 7. Insert 10 and then 17 to force a collision into the same bucket, and watch separate chaining turn an O(1) lookup into a short linear scan.',
  code: hash.code,
  marks: hash.marks,
  ops: [
    { id: 'insert', label: 'Insert key', sig: 'void insert(int key)', params: [{ name: 'key', label: 'key', def: 17 }], big: 'O(1) average' },
    { id: 'search', label: 'Search key', sig: 'bool search(int key)', params: [{ name: 'key', label: 'key', def: 22 }], big: 'O(1) average' },
    { id: 'remove', label: 'Remove key', sig: 'void remove(int key)', params: [{ name: 'key', label: 'key', def: 15 }], big: 'O(1) average' },
    { id: 'traverse', label: 'Traverse (all buckets)', sig: 'void traverse()', params: [], big: 'O(n + b)' },
    { id: 'display', label: 'Display all buckets', sig: 'void display()', params: [], big: 'O(n + b)' },
  ],
  init: (): HashState => {
    const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
    for (const k of [10, 15, 22, 8]) buckets[k % BUCKETS].push(k);
    return { buckets };
  },
  snapshot: hashSnapshot,
  run: runHash,
};

export type { ArraySnap };
