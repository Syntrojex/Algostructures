import { parseCode, stepper, nextId, type Lab, type LabStep, type TreeSnap } from './core';
import { holdNewNodes } from './treeHashLabs';

/* ══════════════════════════════════════════════════════════════════════════
   AVL TREE — a binary search tree that rebalances itself with rotations.
   Every node stores its height; after each insert / delete, every node on the path back up checks its
   balance factor (left height − right height). |bf| > 1 → one or two rotations restore the balance.
   ══════════════════════════════════════════════════════════════════════════ */
const avl = parseCode(`
#include <iostream>
#include <algorithm>
#include <queue>
using namespace std;

class Node
{
public:
	int data;
	int height;
	Node* left;
	Node* right;

	Node(int value)
	{
		data = value;
		height = 1;
		left = nullptr;
		right = nullptr;
	}
};

class AVL
{
private:
	Node* root;

	int height(Node* n)
	{
		return n == nullptr ? 0 : n->height;
	}

	int balanceFactor(Node* n)
	{
		return n == nullptr ? 0 : height(n->left) - height(n->right);
	}

	void updateHeight(Node* n)
	{
		n->height = 1 + max(height(n->left), height(n->right));
	}

	Node* rotateRight(Node* y) /*@rr*/
	{
		Node* x = y->left; /*@rr_x*/
		Node* moved = x->right; /*@rr_moved*/
		x->right = y; /*@rr_up*/
		y->left = moved; /*@rr_fix*/
		updateHeight(y); /*@rr_hy*/
		updateHeight(x); /*@rr_hx*/
		return x; /*@rr_ret*/
	}

	Node* rotateLeft(Node* x) /*@rl*/
	{
		Node* y = x->right; /*@rl_y*/
		Node* moved = y->left; /*@rl_moved*/
		y->left = x; /*@rl_up*/
		x->right = moved; /*@rl_fix*/
		updateHeight(x); /*@rl_hx*/
		updateHeight(y); /*@rl_hy*/
		return y; /*@rl_ret*/
	}

	Node* rebalance(Node* n) /*@rb*/
	{
		updateHeight(n); /*@rb_h*/
		int bf = balanceFactor(n); /*@rb_bf*/

		if (bf > 1 && balanceFactor(n->left) >= 0) /*@rb_ll*/
			return rotateRight(n);

		if (bf > 1) /*@rb_lr*/
		{
			n->left = rotateLeft(n->left);
			return rotateRight(n);
		}

		if (bf < -1 && balanceFactor(n->right) <= 0) /*@rb_rr*/
			return rotateLeft(n);

		if (bf < -1) /*@rb_rl*/
		{
			n->right = rotateRight(n->right);
			return rotateLeft(n);
		}

		return n; /*@rb_ok*/
	}

	Node* insertHelper(Node* node, int value) /*@ih*/
	{
		if (node == nullptr) return new Node(value); /*@ih_new*/

		if (value < node->data) node->left = insertHelper(node->left, value); /*@ih_l*/
		else if (value > node->data) node->right = insertHelper(node->right, value); /*@ih_r*/
		else return node; /*@ih_dup*/

		return rebalance(node); /*@ih_rb*/
	}

	Node* removeHelper(Node* node, int value) /*@rm*/
	{
		if (node == nullptr) return nullptr; /*@rm_null*/

		if (value < node->data) node->left = removeHelper(node->left, value); /*@rm_l*/
		else if (value > node->data) node->right = removeHelper(node->right, value); /*@rm_r*/
		else
		{
			if (node->left == nullptr || node->right == nullptr) /*@rm_one*/
			{
				Node* child = node->left ? node->left : node->right;
				delete node;
				return child; /*@rm_ret*/
			}

			Node* succ = node->right; /*@rm_succ*/
			while (succ->left != nullptr) succ = succ->left; /*@rm_walk*/
			node->data = succ->data; /*@rm_copy*/
			node->right = removeHelper(node->right, succ->data); /*@rm_del*/
		}

		return rebalance(node); /*@rm_rb*/
	}

	void inorderHelper(Node* node) /*@in*/
	{
		if (node == nullptr) return; /*@in_null*/
		inorderHelper(node->left); /*@in_left*/
		cout << node->data << " "; /*@in_visit*/
		inorderHelper(node->right); /*@in_right*/
	}

	void preorderHelper(Node* node) /*@pre*/
	{
		if (node == nullptr) return; /*@pre_null*/
		cout << node->data << " "; /*@pre_visit*/
		preorderHelper(node->left); /*@pre_left*/
		preorderHelper(node->right); /*@pre_right*/
	}

	void postorderHelper(Node* node) /*@post*/
	{
		if (node == nullptr) return; /*@post_null*/
		postorderHelper(node->left); /*@post_left*/
		postorderHelper(node->right); /*@post_right*/
		cout << node->data << " "; /*@post_visit*/
	}

public:
	AVL()
	{
		root = nullptr;
	}

	void insert(int value)
	{
		root = insertHelper(root, value); /*@ins*/
	}

	void remove(int value)
	{
		root = removeHelper(root, value); /*@rem*/
	}

	bool search(int value) /*@se*/
	{
		Node* curr = root; /*@se_init*/
		while (curr != nullptr) /*@se_while*/
		{
			if (value == curr->data) return true; /*@se_found*/
			curr = value < curr->data ? curr->left : curr->right; /*@se_step*/
		}
		return false; /*@se_no*/
	}

	void findMin() /*@mn*/
	{
		Node* curr = root; /*@mn_init*/
		while (curr->left != nullptr) curr = curr->left; /*@mn_walk*/
		cout << curr->data << endl; /*@mn_print*/
	}

	void findMax() /*@mx*/
	{
		Node* curr = root; /*@mx_init*/
		while (curr->right != nullptr) curr = curr->right; /*@mx_walk*/
		cout << curr->data << endl; /*@mx_print*/
	}

	void inorder()
	{
		inorderHelper(root); /*@io*/
		cout << endl;
	}

	void preorder()
	{
		preorderHelper(root); /*@po*/
		cout << endl;
	}

	void postorder()
	{
		postorderHelper(root); /*@pt*/
		cout << endl;
	}

	void levelOrder() /*@lo*/
	{
		queue<Node*> q; /*@lo_init*/
		q.push(root);
		while (!q.empty()) /*@lo_while*/
		{
			Node* curr = q.front(); /*@lo_front*/
			q.pop();
			cout << curr->data << " "; /*@lo_print*/
			if (curr->left != nullptr) q.push(curr->left); /*@lo_left*/
			if (curr->right != nullptr) q.push(curr->right); /*@lo_right*/
		}
		cout << endl;
	}

	int getHeight()
	{
		return height(root); /*@gh*/
	}
};
`);

/* ───────────────────────────── state ───────────────────────────── */
interface ANode { v: number; h: number; l: number | null; r: number | null }
interface AState { nodes: Record<number, ANode>; root: number | null }
type Attach = (id: number | null) => void;

const mk = (st: AState, v: number, l: number | null, r: number | null): number => {
  const id = nextId();
  const hl = l === null ? 0 : st.nodes[l].h, hr = r === null ? 0 : st.nodes[r].h;
  st.nodes[id] = { v, h: 1 + Math.max(hl, hr), l, r };
  return id;
};

/** real structural height/balance (used only for the labels drawn under the nodes) */
function structure(st: AState) {
  const h: Record<number, number> = {};
  const seen = new Set<number>();
  const go = (id: number | null): number => {
    if (id === null || seen.has(id) || !st.nodes[id]) return 0;
    seen.add(id);
    const hh = 1 + Math.max(go(st.nodes[id].l), go(st.nodes[id].r));
    h[id] = hh;
    return hh;
  };
  go(st.root);
  return h;
}

function avlSnap(st: AState): TreeSnap {
  const h = structure(st);
  const badges: Record<number, string> = {};
  const bad: number[] = [];
  const nodes = Object.keys(st.nodes).map(Number).filter(id => h[id] !== undefined).map(id => {
    const n = st.nodes[id];
    const hl = n.l === null ? 0 : h[n.l] ?? 0, hr = n.r === null ? 0 : h[n.r] ?? 0;
    const bf = hl - hr;
    badges[id] = `h${h[id]} · ${bf > 0 ? '+' : ''}${bf}`;
    if (Math.abs(bf) > 1) bad.push(id);
    return { id, value: n.v, l: n.l, r: n.r };
  });
  return { kind: 'tree', nodes, root: st.root, hi: [], path: [], ptrs: [], badges, badBadges: bad, pointers: true };
}

function init(): AState {
  const st: AState = { nodes: {}, root: null };
  const n10 = mk(st, 10, null, null), n25 = mk(st, 25, null, null), n40 = mk(st, 40, null, null);
  const n20 = mk(st, 20, n10, n25);
  st.root = mk(st, 30, n20, n40);
  return st;
}

/* ───────────────────────────── operations ───────────────────────────── */
function runAvl(st: AState, opId: string, a: Record<string, number>): LabStep[] {
  const { S, steps } = stepper(avl.marks, () => avlSnap(st));
  const N = (id: number | null) => (id === null ? 'nullptr' : String(st.nodes[id].v));
  const H = (id: number | null) => (id === null ? 0 : st.nodes[id].h);
  const BF = (id: number | null) => (id === null ? 0 : H(st.nodes[id].l) - H(st.nodes[id].r));
  const M = (patch: Partial<TreeSnap>) => patch;
  const attachTo = (parent: number | null, side: 'l' | 'r'): Attach => id => { if (parent === null) st.root = id; else st.nodes[parent][side] = id; };
  const setH = (id: number) => { st.nodes[id].h = 1 + Math.max(H(st.nodes[id].l), H(st.nodes[id].r)); return st.nodes[id].h; };

  /* ── rotations (each pointer pair is changed at once, so the picture never shows a half-finished loop) ── */
  const rotateRight = (y: number, attach: Attach): number => {
    S('rr', `rotateRight(${N(y)}): ${N(y)} is too heavy on the LEFT, so its left child will take its place.`, M({ hi: [y] }));
    const x = st.nodes[y].l as number;
    S('rr_x', `x = y->left → x is ${N(x)}; it becomes the new root of this subtree.`, M({ hi: [y, x] }));
    const moved = st.nodes[x].r;
    S('rr_moved', `moved = x->right = ${N(moved)}${moved === null ? '' : ' — it sits between x and y in sorted order, so it will hang off y'}.`, M({ hi: moved === null ? [x] : [x, moved] }));
    st.nodes[x].r = y; st.nodes[y].l = moved; attach(x);
    S('rr_up', `x->right = y → ${N(y)} drops down to become the RIGHT child of ${N(x)}.`, M({ hi: [x, y] }));
    S('rr_fix', `y->left = moved → the in-between subtree is re-attached under ${N(y)}.`, M({ hi: [y] }));
    S('rr_hy', `updateHeight(y): ${N(y)} is lower now → its height is ${setH(y)}.`, M({ hi: [y] }));
    S('rr_hx', `updateHeight(x): ${N(x)} is on top now → its height is ${setH(x)}.`, M({ hi: [x] }));
    S('rr_ret', `return x → ${N(x)} is the new root of this subtree; the caller stores it in the parent's pointer.`, M({ hi: [x] }));
    return x;
  };
  const rotateLeft = (x: number, attach: Attach): number => {
    S('rl', `rotateLeft(${N(x)}): ${N(x)} is too heavy on the RIGHT, so its right child will take its place.`, M({ hi: [x] }));
    const y = st.nodes[x].r as number;
    S('rl_y', `y = x->right → y is ${N(y)}; it becomes the new root of this subtree.`, M({ hi: [x, y] }));
    const moved = st.nodes[y].l;
    S('rl_moved', `moved = y->left = ${N(moved)}${moved === null ? '' : ' — it sits between x and y in sorted order, so it will hang off x'}.`, M({ hi: moved === null ? [y] : [y, moved] }));
    st.nodes[y].l = x; st.nodes[x].r = moved; attach(y);
    S('rl_up', `y->left = x → ${N(x)} drops down to become the LEFT child of ${N(y)}.`, M({ hi: [y, x] }));
    S('rl_fix', `x->right = moved → the in-between subtree is re-attached under ${N(x)}.`, M({ hi: [x] }));
    S('rl_hx', `updateHeight(x): ${N(x)} is lower now → its height is ${setH(x)}.`, M({ hi: [x] }));
    S('rl_hy', `updateHeight(y): ${N(y)} is on top now → its height is ${setH(y)}.`, M({ hi: [y] }));
    S('rl_ret', `return y → ${N(y)} is the new root of this subtree; the caller stores it in the parent's pointer.`, M({ hi: [y] }));
    return y;
  };

  const rebalance = (n: number, attach: Attach): number => {
    S('rb', `rebalance(${N(n)}): recompute its height, then check its balance factor.`, M({ hi: [n] }));
    S('rb_h', `updateHeight → the height of ${N(n)} is ${setH(n)}.`, M({ hi: [n] }));
    const hl = H(st.nodes[n].l), hr = H(st.nodes[n].r), bf = hl - hr;
    S('rb_bf', `balanceFactor = height(left) − height(right) = ${hl} − ${hr} = ${bf > 0 ? '+' : ''}${bf}. ${Math.abs(bf) <= 1 ? 'Within −1…+1 → this node is balanced.' : '|bf| > 1 → UNBALANCED, a rotation is needed.'}`, M({ hi: [n] }));
    if (bf > 1) {
      const left = st.nodes[n].l as number;
      const lbf = BF(left);
      if (lbf >= 0) {
        S('rb_ll', `Left-heavy, and the left child is not right-heavy (its bf = ${lbf > 0 ? '+' : ''}${lbf}) → the “LL” case: ONE right rotation.`, M({ hi: [n, left] }));
        return rotateRight(n, attach);
      }
      S('rb_lr', `Left-heavy, but the left child leans RIGHT (its bf = ${lbf}) → the “LR” case: rotate the left child LEFT first, then rotate ${N(n)} RIGHT.`, M({ hi: [n, left] }));
      st.nodes[n].l = rotateLeft(left, attachTo(n, 'l'));
      return rotateRight(n, attach);
    }
    if (bf < -1) {
      const right = st.nodes[n].r as number;
      const rbf = BF(right);
      if (rbf <= 0) {
        S('rb_rr', `Right-heavy, and the right child is not left-heavy (its bf = ${rbf > 0 ? '+' : ''}${rbf}) → the “RR” case: ONE left rotation.`, M({ hi: [n, right] }));
        return rotateLeft(n, attach);
      }
      S('rb_rl', `Right-heavy, but the right child leans LEFT (its bf = +${rbf}) → the “RL” case: rotate the right child RIGHT first, then rotate ${N(n)} LEFT.`, M({ hi: [n, right] }));
      st.nodes[n].r = rotateRight(right, attachTo(n, 'r'));
      return rotateLeft(n, attach);
    }
    S('rb_ok', `Balanced → return ${N(n)} unchanged.`, M({ hi: [n] }));
    return n;
  };

  /* ── insert ── */
  const insert = (v: number) => {
    S('ins', `Called insert(${v}) → root = insertHelper(root, ${v}).`);
    const path: number[] = [];
    const rec = (node: number | null, attach: Attach): number => {
      if (node === null) {
        const id = mk(st, v, null, null);
        S('ih_new', `nullptr → return new Node(${v}) (height 1). It will be linked in by the pointer assignment on the way back up.`, M({ hi: [id], path: path.slice() }));
        return id;
      }
      path.push(node);
      if (v < st.nodes[node].v) {
        S('ih_l', `${v} < ${N(node)} → go LEFT.`, M({ hi: [node], path: path.slice() }));
        st.nodes[node].l = rec(st.nodes[node].l, attachTo(node, 'l'));
      } else if (v > st.nodes[node].v) {
        S('ih_r', `${v} > ${N(node)} → go RIGHT.`, M({ hi: [node], path: path.slice() }));
        st.nodes[node].r = rec(st.nodes[node].r, attachTo(node, 'r'));
      } else {
        S('ih_dup', `${v} == ${N(node)} → already in the tree, ignore it and return the node.`, M({ hi: [node], path: path.slice() }));
        path.pop();
        return node;
      }
      S('ih_rb', `Unwinding at ${N(node)}: return rebalance(node) — check this node on the way back up.`, M({ hi: [node], path: path.slice() }));
      const res = rebalance(node, attach);
      path.pop();
      return res;
    };
    st.root = rec(st.root, attachTo(null, 'l'));
    S('ins', `insert(${v}) finished. Every node on the path was re-checked, so the tree is balanced again.`);
  };

  /* ── remove ── */
  const remove = (v: number) => {
    S('rem', `Called remove(${v}) → root = removeHelper(root, ${v}).`);
    const rec = (node: number | null, target: number, attach: Attach): number | null => {
      if (node === null) { S('rm_null', `nullptr → ${target} is not in the tree, return nullptr.`); return null; }
      if (target < st.nodes[node].v) {
        S('rm_l', `${target} < ${N(node)} → go LEFT.`, M({ hi: [node] }));
        st.nodes[node].l = rec(st.nodes[node].l, target, attachTo(node, 'l'));
      } else if (target > st.nodes[node].v) {
        S('rm_r', `${target} > ${N(node)} → go RIGHT.`, M({ hi: [node] }));
        st.nodes[node].r = rec(st.nodes[node].r, target, attachTo(node, 'r'));
      } else {
        const { l, r } = st.nodes[node];
        if (l === null || r === null) {
          const child = l ?? r;
          S('rm_one', `Found ${N(node)}: it has ${child === null ? 'no children' : 'one child'}, so just splice it out — the parent will point to ${N(child)}.`, M({ hi: [node] }));
          attach(child);
          delete st.nodes[node];
          S('rm_ret', `delete the node and return its child (${N(child)}).`, M({ hi: child === null ? [] : [child] }));
          return child;
        }
        S('rm_succ', `Found ${N(node)} with TWO children. Its replacement is the SUCCESSOR: the smallest value in the right subtree.`, M({ hi: [node] }));
        let succ = r;
        S('rm_walk', `succ = ${N(succ)} — go left as far as possible…`, M({ hi: [node, succ] }));
        while (st.nodes[succ].l !== null) { succ = st.nodes[succ].l as number; S('rm_walk', `… ${N(succ)}`, M({ hi: [node, succ] })); }
        const sv = st.nodes[succ].v;
        st.nodes[node].v = sv;
        S('rm_copy', `node->data = succ->data → this node now holds ${sv}. (The old ${sv} is still in the right subtree.)`, M({ hi: [node, succ] }));
        S('rm_del', `Delete that duplicate ${sv} from the right subtree: node->right = removeHelper(node->right, ${sv}).`, M({ hi: [node] }));
        st.nodes[node].r = rec(st.nodes[node].r, sv, attachTo(node, 'r'));
      }
      S('rm_rb', `Unwinding at ${N(node)}: return rebalance(node) — a delete can also unbalance a node.`, M({ hi: [node] }));
      return rebalance(node, attach);
    };
    st.root = rec(st.root, v, attachTo(null, 'l'));
    S('rem', `remove(${v}) finished.`);
  };

  /* ── traversals: every visited value is printed as it is visited ── */
  const traverse = (kind: 'in' | 'pre' | 'post') => {
    const visited: number[] = [];
    const name = { in: 'inorder', pre: 'preorder', post: 'postorder' }[kind];
    S(kind === 'in' ? 'io' : kind === 'pre' ? 'po' : 'pt', `Called ${name}() → ${name}Helper(root).`);
    const rec = (node: number | null) => {
      if (node === null) { S(`${kind}_null`, 'node == nullptr → nothing here, return.'); return; }
      const visit = () => { visited.push(node); S(`${kind}_visit`, `Visit ${N(node)} → print it.`, M({ hi: [node], path: visited.slice() }), String(N(node)), true); };
      if (kind === 'pre') visit();
      S(`${kind}_left`, `At ${N(node)}: go left.`, M({ hi: [node], path: visited.slice() }));
      rec(st.nodes[node].l);
      if (kind === 'in') visit();
      S(`${kind}_right`, `At ${N(node)}: go right.`, M({ hi: [node], path: visited.slice() }));
      rec(st.nodes[node].r);
      if (kind === 'post') visit();
    };
    rec(st.root);
    S(kind === 'in' ? 'io' : kind === 'pre' ? 'po' : 'pt', `${name} done — output: ${visited.map(id => st.nodes[id].v).join(' ')}.`, M({ path: visited.slice() }));
  };

  const levelOrder = () => {
    S('lo', 'Called levelOrder(): visit the tree level by level using a QUEUE.');
    if (st.root === null) { S('lo_init', 'The tree is empty — nothing to print.'); return; }
    const q = [st.root]; const seen: number[] = [];
    S('lo_init', `queue = [${N(st.root)}]`, M({ hi: [st.root] }));
    while (q.length) {
      S('lo_while', `queue is not empty → [${q.map(N).join(', ')}]`);
      const cur = q.shift() as number; seen.push(cur);
      S('lo_front', `Take ${N(cur)} from the FRONT of the queue.`, M({ hi: [cur], path: seen.slice() }));
      S('lo_print', `Print ${N(cur)}.`, M({ hi: [cur], path: seen.slice() }), String(N(cur)), true);
      const { l, r } = st.nodes[cur];
      if (l !== null) { q.push(l); S('lo_left', `Left child ${N(l)} joins the back of the queue.`, M({ hi: [cur, l], path: seen.slice() })); }
      if (r !== null) { q.push(r); S('lo_right', `Right child ${N(r)} joins the back of the queue.`, M({ hi: [cur, r], path: seen.slice() })); }
    }
    S('lo_while', 'queue is empty → done.', M({ path: seen.slice() }));
  };

  switch (opId) {
    case 'insert': insert(a.value); break;
    case 'remove': remove(a.value); break;
    case 'search': {
      S('se', `Called search(${a.value}).`);
      let cur = st.root; const path: number[] = [];
      S('se_init', 'curr = root.', M({ hi: cur === null ? [] : [cur] }));
      while (cur !== null) {
        S('se_while', `curr = ${N(cur)} (not nullptr) → keep going.`, M({ hi: [cur], path: path.slice() }));
        path.push(cur);
        if (a.value === st.nodes[cur].v) { S('se_found', `${a.value} == ${N(cur)} → FOUND. return true.`, M({ hi: [cur], path: path.slice() }), 'true'); return steps; }
        cur = a.value < st.nodes[cur].v ? st.nodes[cur].l : st.nodes[cur].r;
        S('se_step', `${a.value} is ${cur === null ? '' : ''}${a.value < st.nodes[path[path.length - 1]].v ? 'smaller' : 'bigger'} than ${N(path[path.length - 1])} → move ${a.value < st.nodes[path[path.length - 1]].v ? 'left' : 'right'} to ${N(cur)}.`, M({ hi: cur === null ? [] : [cur], path: path.slice() }));
      }
      S('se_no', `curr is nullptr → ${a.value} is not in the tree. return false.`, M({ path: path.slice() }), 'false');
      break;
    }
    case 'findMin': case 'findMax': {
      const mn = opId === 'findMin';
      const k = mn ? 'mn' : 'mx';
      S(k, `Called ${opId}(): ${mn ? 'the smallest' : 'the biggest'} value is at the far ${mn ? 'left' : 'right'}.`);
      if (st.root === null) { S(`${k}_init`, 'The tree is empty.'); break; }
      let cur = st.root;
      S(`${k}_init`, 'curr = root.', M({ hi: [cur] }));
      for (;;) {
        const nx: number | null = mn ? st.nodes[cur].l : st.nodes[cur].r;
        if (nx === null) break;
        cur = nx;
        S(`${k}_walk`, `go ${mn ? 'left' : 'right'} → ${N(cur)}`, M({ hi: [cur] }));
      }
      S(`${k}_print`, `No ${mn ? 'left' : 'right'} child → ${N(cur)} is the ${mn ? 'minimum' : 'maximum'}.`, M({ hi: [cur] }), String(N(cur)));
      break;
    }
    case 'inorder': traverse('in'); break;
    case 'preorder': traverse('pre'); break;
    case 'postorder': traverse('post'); break;
    case 'levelOrder': levelOrder(); break;
    case 'getHeight': {
      const h = H(st.root);
      S('gh', `getHeight() → return height(root) = ${h}. A tree this balanced never gets taller than about 1.44·log₂(n).`, M({ hi: st.root === null ? [] : [st.root] }), String(h));
      break;
    }
    default: break;
  }
  return steps;
}

export const avlLab: Lab = {
  id: 'avl',
  title: 'AVL Tree',
  icon: '⚖️',
  className: 'AVL',
  blurb: 'A BST that keeps itself balanced: every node tracks its height, and any node with a balance factor outside −1…+1 is fixed with one or two rotations (LL, RR, LR, RL).',
  code: avl.code,
  marks: avl.marks,
  ops: [
    { id: 'insert', label: 'Insert (rebalances with rotations)', sig: 'void insert(int value)', params: [{ name: 'value', label: 'value', def: 5 }], big: 'O(log n)' },
    { id: 'remove', label: 'Remove (rebalances with rotations)', sig: 'void remove(int value)', params: [{ name: 'value', label: 'value', def: 40 }], big: 'O(log n)' },
    { id: 'search', label: 'Search', sig: 'bool search(int value)', params: [{ name: 'value', label: 'value', def: 25 }], big: 'O(log n)' },
    { id: 'findMin', label: 'Find minimum', sig: 'void findMin()', params: [], big: 'O(log n)' },
    { id: 'findMax', label: 'Find maximum', sig: 'void findMax()', params: [], big: 'O(log n)' },
    { id: 'inorder', label: 'Inorder traversal (sorted order)', sig: 'void inorder()', params: [], big: 'O(n)' },
    { id: 'preorder', label: 'Preorder traversal', sig: 'void preorder()', params: [], big: 'O(n)' },
    { id: 'postorder', label: 'Postorder traversal', sig: 'void postorder()', params: [], big: 'O(n)' },
    { id: 'levelOrder', label: 'Level-order traversal (BFS)', sig: 'void levelOrder()', params: [], big: 'O(n)' },
    { id: 'getHeight', label: 'Height of the tree', sig: 'int getHeight()', params: [], big: 'O(1)' },
  ],
  init: init as () => unknown,
  snapshot: (st: unknown) => avlSnap(st as AState),
  run: (st: unknown, opId: string, a: Record<string, number>) => holdNewNodes(runAvl(st as AState, opId, a)),
};
