// ══════════════════════════════════════════════════════════════════════════
// cppWalkthrough — turns a small C++ snippet into a line-by-line explanation.
//
//  1. Tokenize + parse the snippet (a deliberately small C++ subset: for / while /
//     if / return / break, declarations, assignments, calls, arrays).
//  2. Actually RUN it (a tiny interpreter) for two input sizes, counting how many
//     times every line / loop condition really executes.
//  3. Emit one "card" per source line: what the instruction does, how each loop's
//     init / condition / update behaves, and the measured counts.
//
// If the snippet uses something the interpreter does not know, the counts are
// simply left out — the plain-English explanation of every line still shows.
// ══════════════════════════════════════════════════════════════════════════

// ─────────────────────────── Tokenizer ───────────────────────────────────
interface Tok { t: 'num' | 'id' | 'op' | 'str'; v: string; line: number; s: number; e: number }

const OPS2 = ['<=', '>=', '==', '!=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '<<', '>>', '::', '->'];

function tokenize(src: string): { toks: Tok[]; comments: Map<number, string> } {
  const toks: Tok[] = [];
  const comments = new Map<number, string>();
  let i = 0;
  let line = 1;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      comments.set(line, src.slice(i + 2, j).trim());
      i = j;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let j = i + 2;
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) { if (src[j] === '\n') line++; j++; }
      i = j + 2;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < n && /[0-9.]/.test(src[j])) j++;
      toks.push({ t: 'num', v: src.slice(i, j), line, s: i, e: j });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: 'id', v: src.slice(i, j), line, s: i, e: j });
      i = j;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < n && src[j] !== '"') j++;
      toks.push({ t: 'str', v: src.slice(i + 1, j), line, s: i, e: j + 1 });
      i = j + 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (OPS2.includes(two)) { toks.push({ t: 'op', v: two, line, s: i, e: i + 2 }); i += 2; continue; }
    toks.push({ t: 'op', v: c, line, s: i, e: i + 1 });
    i++;
  }
  return { toks, comments };
}

// ─────────────────────────── AST ─────────────────────────────────────────
type Expr =
  | { t: 'num'; v: number }
  | { t: 'id'; name: string }
  | { t: 'bin'; op: string; l: Expr; r: Expr }
  | { t: 'un'; op: string; e: Expr }
  | { t: 'assign'; op: string; target: Expr; e: Expr }
  | { t: 'incdec'; op: '++' | '--'; prefix: boolean; target: Expr }
  | { t: 'call'; name: string; args: Expr[] }
  | { t: 'index'; arr: Expr; idx: Expr }
  | { t: 'member'; obj: Expr; name: string; args: Expr[] }
  | { t: 'comma'; list: Expr[] };

interface DeclItem { name: string; init?: Expr; initSrc?: string }

type Stmt =
  | { k: 'block'; id: number; line: number; endLine: number; body: Stmt[] }
  | { k: 'for'; id: number; line: number; head: string; init: Stmt | null; initSrc: string; cond: Expr | null; condSrc: string; update: Expr | null; updateSrc: string; body: Stmt; loopVar: string }
  | { k: 'while'; id: number; line: number; head: string; cond: Expr; condSrc: string; body: Stmt; loopVar: string }
  | { k: 'if'; id: number; line: number; head: string; cond: Expr; condSrc: string; then: Stmt; els?: Stmt }
  | { k: 'return'; id: number; line: number; e?: Expr; src: string }
  | { k: 'break'; id: number; line: number }
  | { k: 'continue'; id: number; line: number }
  | { k: 'decl'; id: number; line: number; type: string; items: DeclItem[]; src: string }
  | { k: 'expr'; id: number; line: number; e: Expr; src: string }
  | { k: 'io'; id: number; line: number; kind: 'cin' | 'cout'; names: string[]; src: string }
  | { k: 'func'; id: number; line: number; name: string; params: string[]; sig: string; body: Stmt & { k: 'block' } }
  | { k: 'empty'; id: number; line: number };

const TYPE_WORDS = new Set(['int', 'long', 'bool', 'double', 'float', 'char', 'auto', 'short', 'unsigned', 'size_t', 'void', 'string', 'vector']);
let UID = 0;
const uid = () => ++UID;

class Parser {
  p = 0;
  constructor(private toks: Tok[], private src: string) {}

  private peek(o = 0): Tok | undefined { return this.toks[this.p + o]; }
  private isOp(v: string, o = 0) { const t = this.peek(o); return !!t && t.t === 'op' && t.v === v; }
  private next(): Tok { return this.toks[this.p++]; }
  private last(): Tok { return this.toks[this.p - 1]; }
  private expectOp(v: string): Tok {
    if (!this.isOp(v)) throw new Error(`parse: expected '${v}' near line ${this.peek()?.line ?? '?'}`);
    return this.next();
  }
  private slice(a: Tok, b: Tok) { return this.src.slice(a.s, b.e); }

  parseProgram(): Stmt[] {
    const out: Stmt[] = [];
    while (this.p < this.toks.length) out.push(this.parseStmt());
    return out;
  }

  private parseBlock(): Stmt & { k: 'block' } {
    const open = this.expectOp('{');
    const body: Stmt[] = [];
    while (!this.isOp('}')) {
      if (this.p >= this.toks.length) throw new Error('parse: unterminated block');
      body.push(this.parseStmt());
    }
    const close = this.expectOp('}');
    return { k: 'block', id: uid(), line: open.line, endLine: close.line, body };
  }

  private parseStmt(): Stmt {
    const t = this.peek();
    if (!t) throw new Error('parse: unexpected end');
    if (this.isOp('{')) return this.parseBlock();
    if (this.isOp(';')) { this.next(); return { k: 'empty', id: uid(), line: t.line }; }
    if (t.t === 'id') {
      switch (t.v) {
        case 'for': return this.parseFor();
        case 'while': return this.parseWhile();
        case 'if': return this.parseIf();
        case 'return': return this.parseReturn();
        case 'break': { this.next(); this.expectOp(';'); return { k: 'break', id: uid(), line: t.line }; }
        case 'continue': { this.next(); this.expectOp(';'); return { k: 'continue', id: uid(), line: t.line }; }
        case 'cout': case 'cin': return this.parseIO();
        default: break;
      }
      if (TYPE_WORDS.has(t.v)) return this.parseDeclOrFunc();
    }
    const first = this.peek()!;
    const e = this.parseComma();
    const last = this.last();
    this.expectOp(';');
    return { k: 'expr', id: uid(), line: first.line, e, src: this.slice(first, last) };
  }

  private skipTemplate() {
    if (this.isOp('<')) {
      let depth = 0;
      do {
        if (this.isOp('<')) depth++;
        else if (this.isOp('>')) depth--;
        this.next();
      } while (depth > 0 && this.p < this.toks.length);
    }
  }

  private parseDeclOrFunc(): Stmt {
    const start = this.peek()!;
    const typeParts: string[] = [];
    while (this.peek() && this.peek()!.t === 'id' && TYPE_WORDS.has(this.peek()!.v)) {
      typeParts.push(this.next().v);
      this.skipTemplate();
    }
    while (this.isOp('&') || this.isOp('*')) this.next();
    const nameTok = this.next();
    if (!nameTok || nameTok.t !== 'id') throw new Error('parse: expected a name after the type');
    if (this.isOp('(')) {
      // function definition
      this.next();
      const params: string[] = [];
      let depth = 1;
      let lastId = '';
      while (depth > 0) {
        const t = this.next();
        if (!t) throw new Error('parse: bad parameter list');
        if (t.t === 'op' && t.v === '(') depth++;
        else if (t.t === 'op' && t.v === ')') {
          depth--;
          if (depth === 0) { if (lastId) params.push(lastId); break; }
        } else if (t.t === 'op' && t.v === ',' && depth === 1) { if (lastId) params.push(lastId); lastId = ''; }
        else if (t.t === 'id' && !TYPE_WORDS.has(t.v)) lastId = t.v;
      }
      const closeParen = this.last();
      const sig = this.slice(start, closeParen);
      const body = this.parseBlock();
      return { k: 'func', id: uid(), line: start.line, name: nameTok.v, params, sig, body };
    }
    this.p--; // un-consume the name; declarators re-read it
    const items = this.parseDeclarators();
    const last = this.last();
    this.expectOp(';');
    return { k: 'decl', id: uid(), line: start.line, type: typeParts.join(' '), items, src: this.slice(start, last) };
  }

  private parseDeclarators(): DeclItem[] {
    const items: DeclItem[] = [];
    do {
      if (this.isOp(',')) this.next();
      while (this.isOp('&') || this.isOp('*')) this.next();
      const nameTok = this.next();
      if (!nameTok || nameTok.t !== 'id') throw new Error('parse: expected a variable name');
      while (this.isOp('[')) { while (!this.isOp(']')) this.next(); this.next(); }
      const item: DeclItem = { name: nameTok.v };
      if (this.isOp('=')) {
        this.next();
        const a = this.peek()!;
        item.init = this.parseAssign();
        item.initSrc = this.slice(a, this.last());
      }
      items.push(item);
    } while (this.isOp(','));
    return items;
  }

  private firstIdIn(e: Expr | null): string {
    if (!e) return '';
    switch (e.t) {
      case 'id': return e.name;
      case 'bin': return this.firstIdIn(e.l) || this.firstIdIn(e.r);
      case 'un': return this.firstIdIn(e.e);
      case 'assign': return this.firstIdIn(e.target);
      case 'incdec': return this.firstIdIn(e.target);
      default: return '';
    }
  }

  private parseFor(): Stmt {
    const kw = this.next();
    this.expectOp('(');
    let init: Stmt | null = null;
    let initSrc = '';
    if (!this.isOp(';')) {
      const a = this.peek()!;
      if (a.t === 'id' && TYPE_WORDS.has(a.v)) {
        const typeParts: string[] = [];
        while (this.peek()!.t === 'id' && TYPE_WORDS.has(this.peek()!.v)) typeParts.push(this.next().v);
        const items = this.parseDeclarators();
        initSrc = this.slice(a, this.last());
        init = { k: 'decl', id: uid(), line: a.line, type: typeParts.join(' '), items, src: initSrc };
      } else {
        const e = this.parseComma();
        initSrc = this.slice(a, this.last());
        init = { k: 'expr', id: uid(), line: a.line, e, src: initSrc };
      }
    }
    this.expectOp(';');
    let cond: Expr | null = null;
    let condSrc = '';
    if (!this.isOp(';')) {
      const a = this.peek()!;
      cond = this.parseComma();
      condSrc = this.slice(a, this.last());
    }
    this.expectOp(';');
    let update: Expr | null = null;
    let updateSrc = '';
    if (!this.isOp(')')) {
      const a = this.peek()!;
      update = this.parseComma();
      updateSrc = this.slice(a, this.last());
    }
    const close = this.expectOp(')');
    const head = this.slice(kw, close);
    const body = this.parseStmt();
    let loopVar = '';
    if (init && init.k === 'decl') loopVar = init.items[0]?.name ?? '';
    else if (init && init.k === 'expr') loopVar = this.firstIdIn(init.e);
    if (!loopVar) loopVar = this.firstIdIn(cond);
    return { k: 'for', id: uid(), line: kw.line, head, init, initSrc, cond, condSrc, update, updateSrc, body, loopVar };
  }

  private parseWhile(): Stmt {
    const kw = this.next();
    this.expectOp('(');
    const a = this.peek()!;
    const cond = this.parseComma();
    const condSrc = this.slice(a, this.last());
    const close = this.expectOp(')');
    const body = this.parseStmt();
    return { k: 'while', id: uid(), line: kw.line, head: this.slice(kw, close), cond, condSrc, body, loopVar: this.firstIdIn(cond) };
  }

  private parseIf(): Stmt {
    const kw = this.next();
    this.expectOp('(');
    const a = this.peek()!;
    const cond = this.parseComma();
    const condSrc = this.slice(a, this.last());
    const close = this.expectOp(')');
    const then = this.parseStmt();
    let els: Stmt | undefined;
    if (this.peek() && this.peek()!.t === 'id' && this.peek()!.v === 'else') {
      this.next();
      els = this.parseStmt();
    }
    return { k: 'if', id: uid(), line: kw.line, head: this.slice(kw, close), cond, condSrc, then, els };
  }

  private parseReturn(): Stmt {
    const kw = this.next();
    let e: Expr | undefined;
    let src = 'return';
    if (!this.isOp(';')) {
      const a = this.peek()!;
      e = this.parseComma();
      src = this.slice(kw, this.last());
      void a;
    }
    this.expectOp(';');
    return { k: 'return', id: uid(), line: kw.line, e, src };
  }

  private parseIO(): Stmt {
    const kw = this.next();
    const names: string[] = [];
    while (!this.isOp(';')) {
      const t = this.next();
      if (!t) throw new Error('parse: bad cin/cout');
      if (kw.v === 'cin' && t.t === 'id') names.push(t.v);
    }
    const last = this.last();
    this.expectOp(';');
    return { k: 'io', id: uid(), line: kw.line, kind: kw.v as 'cin' | 'cout', names, src: this.slice(kw, last) };
  }

  // ── expressions ──
  private parseComma(): Expr {
    const e = this.parseAssign();
    if (this.isOp(',')) {
      const list = [e];
      while (this.isOp(',')) { this.next(); list.push(this.parseAssign()); }
      return { t: 'comma', list };
    }
    return e;
  }
  private parseAssign(): Expr {
    const l = this.parseOr();
    const t = this.peek();
    if (t && t.t === 'op' && ['=', '+=', '-=', '*=', '/=', '%='].includes(t.v)) {
      this.next();
      const r = this.parseAssign();
      return { t: 'assign', op: t.v, target: l, e: r };
    }
    return l;
  }
  private bin(next: () => Expr, ops: string[]): Expr {
    let l = next();
    for (;;) {
      const t = this.peek();
      if (t && t.t === 'op' && ops.includes(t.v)) { this.next(); const r = next(); l = { t: 'bin', op: t.v, l, r }; }
      else return l;
    }
  }
  private parseOr(): Expr { return this.bin(() => this.parseAnd(), ['||']); }
  private parseAnd(): Expr { return this.bin(() => this.parseEq(), ['&&']); }
  private parseEq(): Expr { return this.bin(() => this.parseRel(), ['==', '!=']); }
  private parseRel(): Expr { return this.bin(() => this.parseAdd(), ['<', '<=', '>', '>=']); }
  private parseAdd(): Expr { return this.bin(() => this.parseMul(), ['+', '-']); }
  private parseMul(): Expr { return this.bin(() => this.parseUnary(), ['*', '/', '%']); }
  private parseUnary(): Expr {
    const t = this.peek();
    if (t && t.t === 'op') {
      if (t.v === '!' || t.v === '-' || t.v === '+') { this.next(); return { t: 'un', op: t.v, e: this.parseUnary() }; }
      if (t.v === '++' || t.v === '--') { this.next(); return { t: 'incdec', op: t.v, prefix: true, target: this.parseUnary() }; }
    }
    return this.parsePostfix();
  }
  private parsePostfix(): Expr {
    let e = this.parsePrimary();
    for (;;) {
      if (this.isOp('[')) { this.next(); const idx = this.parseComma(); this.expectOp(']'); e = { t: 'index', arr: e, idx }; }
      else if (this.isOp('(') && e.t === 'id') {
        this.next();
        const args: Expr[] = [];
        if (!this.isOp(')')) { do { if (this.isOp(',')) this.next(); args.push(this.parseAssign()); } while (this.isOp(',')); }
        this.expectOp(')');
        e = { t: 'call', name: e.name, args };
      } else if (this.isOp('.')) {
        this.next();
        const name = this.next().v;
        const args: Expr[] = [];
        if (this.isOp('(')) {
          this.next();
          if (!this.isOp(')')) { do { if (this.isOp(',')) this.next(); args.push(this.parseAssign()); } while (this.isOp(',')); }
          this.expectOp(')');
        }
        e = { t: 'member', obj: e, name, args };
      } else if (this.isOp('++') || this.isOp('--')) {
        const op = this.next().v as '++' | '--';
        e = { t: 'incdec', op, prefix: false, target: e };
      } else return e;
    }
  }
  private parsePrimary(): Expr {
    const t = this.next();
    if (!t) throw new Error('parse: unexpected end of expression');
    if (t.t === 'num') return { t: 'num', v: parseFloat(t.v) };
    if (t.t === 'id') return { t: 'id', name: t.v };
    if (t.t === 'str') return { t: 'num', v: 0 };
    if (t.t === 'op' && t.v === '(') { const e = this.parseComma(); this.expectOp(')'); return e; }
    throw new Error(`parse: unexpected '${t.v}' near line ${t.line}`);
  }
}

// ─────────────────────────── Interpreter ─────────────────────────────────
export interface Stat {
  exec: number; runs: number; checks: number; iters: number; updates: number;
  trueCount: number; calls: number; runIters: number[]; firstVals: number[];
}
const newStat = (): Stat => ({ exec: 0, runs: 0, checks: 0, iters: 0, updates: 0, trueCount: 0, calls: 0, runIters: [], firstVals: [] });

type Sig = undefined | { r: 'break' } | { r: 'continue' } | { r: 'return'; v: unknown };
type Val = number | boolean | unknown[] | undefined;

class SimError extends Error {}

class Sim {
  stats = new Map<number, Stat>();
  steps = 0;
  funcs = new Map<string, Stmt & { k: 'func' }>();
  globals = new Map<string, Val>();
  scopes: Map<string, Val>[] = [];
  depth = 0;

  constructor(private maxSteps = 1_500_000) {}

  st(id: number): Stat {
    let s = this.stats.get(id);
    if (!s) { s = newStat(); this.stats.set(id, s); }
    return s;
  }
  private tick() { if (++this.steps > this.maxSteps) throw new SimError('too many steps'); }

  private lookup(name: string): { scope: Map<string, Val> } {
    for (let i = this.scopes.length - 1; i >= 0; i--) if (this.scopes[i].has(name)) return { scope: this.scopes[i] };
    if (this.globals.has(name)) return { scope: this.globals };
    throw new SimError(`unknown variable ${name}`);
  }
  private get(name: string): Val {
    if (name === 'true') return true;
    if (name === 'false') return false;
    const { scope } = this.lookup(name);
    return scope.get(name);
  }
  private num(v: Val): number {
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v !== 'number') throw new SimError('not a number');
    return v;
  }

  private ev(e: Expr): Val {
    switch (e.t) {
      case 'num': return e.v;
      case 'id': return this.get(e.name);
      case 'comma': { let v: Val; for (const x of e.list) v = this.ev(x); return v; }
      case 'un': {
        const v = this.ev(e.e);
        if (e.op === '!') return !this.truthy(v);
        if (e.op === '-') return -this.num(v);
        return this.num(v);
      }
      case 'bin': {
        if (e.op === '&&') return this.truthy(this.ev(e.l)) && this.truthy(this.ev(e.r));
        if (e.op === '||') return this.truthy(this.ev(e.l)) || this.truthy(this.ev(e.r));
        const a = this.num(this.ev(e.l));
        const b = this.num(this.ev(e.r));
        switch (e.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': {
            if (b === 0) throw new SimError('divide by zero');
            return Number.isInteger(a) && Number.isInteger(b) ? Math.trunc(a / b) : a / b;
          }
          case '%': { if (b === 0) throw new SimError('mod by zero'); return a % b; }
          case '<': return a < b;
          case '<=': return a <= b;
          case '>': return a > b;
          case '>=': return a >= b;
          case '==': return a === b;
          case '!=': return a !== b;
          default: throw new SimError('bad operator ' + e.op);
        }
      }
      case 'index': {
        const arr = this.ev(e.arr);
        const i = this.num(this.ev(e.idx));
        if (!Array.isArray(arr) || i < 0 || i >= arr.length) throw new SimError('index out of range');
        return arr[i] as Val;
      }
      case 'member': {
        const o = this.ev(e.obj);
        if (!Array.isArray(o)) throw new SimError('member on non-array');
        switch (e.name) {
          case 'size': case 'length': return o.length;
          case 'empty': return o.length === 0;
          case 'back': return o[o.length - 1] as Val;
          case 'push_back': o.push(this.ev(e.args[0])); return undefined;
          case 'pop_back': o.pop(); return undefined;
          default: throw new SimError('unknown member ' + e.name);
        }
      }
      case 'assign': {
        const cur = e.op === '=' ? undefined : this.readLv(e.target);
        const rhs = this.ev(e.e);
        let v: Val;
        switch (e.op) {
          case '=': v = rhs; break;
          case '+=': v = this.num(cur) + this.num(rhs); break;
          case '-=': v = this.num(cur) - this.num(rhs); break;
          case '*=': v = this.num(cur) * this.num(rhs); break;
          case '/=': {
            const a = this.num(cur); const b = this.num(rhs);
            if (b === 0) throw new SimError('divide by zero');
            v = Number.isInteger(a) && Number.isInteger(b) ? Math.trunc(a / b) : a / b; break;
          }
          case '%=': v = this.num(cur) % this.num(rhs); break;
          default: throw new SimError('bad assignment');
        }
        this.writeLv(e.target, v);
        return v;
      }
      case 'incdec': {
        const old = this.num(this.readLv(e.target));
        const nv = e.op === '++' ? old + 1 : old - 1;
        this.writeLv(e.target, nv);
        return e.prefix ? nv : old;
      }
      case 'call': return this.call(e);
      default: throw new SimError('bad expression');
    }
  }

  private readLv(t: Expr): Val { return this.ev(t); }
  private writeLv(t: Expr, v: Val) {
    if (t.t === 'id') { this.lookup(t.name).scope.set(t.name, v); return; }
    if (t.t === 'index') {
      const arr = this.ev(t.arr);
      const i = this.num(this.ev(t.idx));
      if (!Array.isArray(arr) || i < 0 || i >= arr.length) throw new SimError('index out of range');
      arr[i] = v;
      return;
    }
    throw new SimError('cannot assign');
  }
  private truthy(v: Val): boolean { return typeof v === 'boolean' ? v : this.num(v) !== 0; }

  private call(e: Expr & { t: 'call' }): Val {
    const fn = this.funcs.get(e.name);
    if (fn) {
      const args = e.args.map(a => this.ev(a));
      return this.callFunc(fn, args);
    }
    switch (e.name) {
      case 'sqrt': return Math.sqrt(this.num(this.ev(e.args[0])));
      case 'abs': return Math.abs(this.num(this.ev(e.args[0])));
      case 'pow': return Math.pow(this.num(this.ev(e.args[0])), this.num(this.ev(e.args[1])));
      case 'min': return Math.min(this.num(this.ev(e.args[0])), this.num(this.ev(e.args[1])));
      case 'max': return Math.max(this.num(this.ev(e.args[0])), this.num(this.ev(e.args[1])));
      case 'printVector': e.args.forEach(a => this.ev(a)); return undefined;
      case 'swap': {
        const [a, b] = e.args;
        const va = this.ev(a); const vb = this.ev(b);
        this.writeLv(a, vb); this.writeLv(b, va);
        return undefined;
      }
      default: throw new SimError('unknown function ' + e.name);
    }
  }

  callFunc(fn: Stmt & { k: 'func' }, args: Val[]): Val {
    if (++this.depth > 2500) throw new SimError('recursion too deep');
    this.st(fn.id).calls++;
    const saved = this.scopes;
    const local = new Map<string, Val>();
    fn.params.forEach((p, i) => local.set(p, args[i]));
    this.scopes = [local];
    let result: Val;
    try {
      const sig = this.exec(fn.body);
      if (sig && sig.r === 'return') result = sig.v as Val;
    } finally {
      this.scopes = saved;
      this.depth--;
    }
    return result;
  }

  exec(s: Stmt): Sig {
    switch (s.k) {
      case 'empty': case 'func': return undefined;
      case 'block': {
        this.scopes.push(new Map());
        try {
          for (const x of s.body) { const sig = this.exec(x); if (sig) return sig; }
        } finally { this.scopes.pop(); }
        return undefined;
      }
      case 'decl': {
        this.tick();
        this.st(s.id).exec++;
        const scope = this.scopes.length ? this.scopes[this.scopes.length - 1] : this.globals;
        const intLike = /\b(int|long|short|size_t)\b/.test(s.type);
        for (const it of s.items) {
          let v: Val;
          if (it.init) { v = this.ev(it.init); if (intLike && typeof v === 'number') v = Math.trunc(v); }
          scope.set(it.name, v);
        }
        return undefined;
      }
      case 'expr': this.tick(); this.st(s.id).exec++; this.ev(s.e); return undefined;
      case 'io': {
        this.tick(); this.st(s.id).exec++;
        for (const nm of s.names) {
          const preset = this.globals.get('__in_' + nm) ?? this.globals.get('N');
          this.lookup(nm).scope.set(nm, preset);
        }
        return undefined;
      }
      case 'return': {
        this.tick(); this.st(s.id).exec++;
        return { r: 'return', v: s.e ? this.ev(s.e) : undefined };
      }
      case 'break': this.tick(); this.st(s.id).exec++; return { r: 'break' };
      case 'continue': this.tick(); this.st(s.id).exec++; return { r: 'continue' };
      case 'if': {
        this.tick();
        const st = this.st(s.id);
        st.exec++;
        if (this.truthy(this.ev(s.cond))) { st.trueCount++; return this.exec(s.then); }
        return s.els ? this.exec(s.els) : undefined;
      }
      case 'while': return this.loop(s, null, s.cond, null);
      case 'for': {
        this.scopes.push(new Map());
        try {
          if (s.init) this.exec(s.init);
          return this.loop(s, s.init, s.cond, s.update);
        } finally { this.scopes.pop(); }
      }
      default: return undefined;
    }
  }

  private loop(s: Stmt & { k: 'for' | 'while' }, _init: Stmt | null, cond: Expr | null, update: Expr | null): Sig {
    const st = this.st(s.id);
    st.runs++;
    const first = st.runs === 1;
    let iters = 0;
    let out: Sig;
    for (;;) {
      this.tick();
      st.checks++;
      if (cond && !this.truthy(this.ev(cond))) break;
      iters++; st.iters++;
      if (first && st.firstVals.length < 14 && s.loopVar) {
        try { const v = this.get(s.loopVar); if (typeof v === 'number') st.firstVals.push(v); } catch { /* ignore */ }
      }
      const sig = this.exec(s.body);
      if (sig) {
        if (sig.r === 'break') break;
        if (sig.r === 'return') { out = sig; break; }
      }
      if (update) { this.tick(); st.updates++; this.ev(update); }
    }
    if (st.runIters.length < 24) st.runIters.push(iters);
    return out;
  }
}

// ─────────────────────────── Simulation setup ────────────────────────────
interface RunSpec { label: string; globals?: Record<string, Val>; entry?: string; args?: Val[] }

const zeros = (n: number) => Array.from({ length: n }, () => 0);
const ones = (n: number) => Array.from({ length: n }, () => 1);
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const SIZES = [8, 16];
// Accumulator variables like `sum++` are usually declared outside the snippet — give them a starting 0.
const ACC = { sum: 0, Sum: 0, work: 0, pairs: 0, count: 0, Count: 0, total: 0 };
const defaultRuns = (sizes = SIZES): RunSpec[] => sizes.map(n => ({ label: `N = ${n}`, globals: { N: n, n, k: 3, ...ACC } }));

// Questions whose behaviour depends on the INPUT DATA (not just N) get a hand-picked,
// clearly-labelled input so the measured counts match what the question is asking about.
const RUN_OVERRIDES: Record<number, () => RunSpec[]> = {
  // perfect squares, so floor(sqrt(n)) is exact and "K*K ≈ n" holds cleanly
  44: () => defaultRuns([16, 64]),
  45: () => defaultRuns([16, 64]),
  6: () => SIZES.map(n => ({ label: `N = ${n}`, globals: { arr: zeros(n), target: -1, found: false } })),
  7: () => [4, 8].map(r => ({ label: `rows = cols = ${r}`, globals: { flatArray: ones(r * r), rows: r, cols: r } })),
  11: () => [27, 81].map(v => ({ label: `n = ${v}`, entry: 'Func', args: [v] })),
  21: () => SIZES.map(n => ({ label: `n = ${n} (increasing array)`, globals: { a: range(n), n } })),
  22: () => SIZES.map(n => ({ label: `asize = ${n}`, entry: 'Mystery', args: [ones(n), n] })),
  38: () => SIZES.map(n => ({ label: `n = ${n} (target absent)`, entry: 'linearSearch', args: [zeros(n), n, -1] })),
  39: () => [97, 389].map(v => ({ label: `n = ${v} (prime)`, entry: 'isPrime', args: [v] })),
  40: () => [97, 389].map(v => ({ label: `n = ${v} (prime)`, entry: 'isPrime', args: [v] })),
  41: () => SIZES.map(n => ({ label: `n = ${n} (reversed array)`, entry: 'bubbleSort', args: [range(n).reverse(), n] })),
  51: () => SIZES.map(n => ({ label: `n = ${n}`, entry: 'sumOfSquares', args: [n], globals: { arr: ones(n) } })),
  53: () => SIZES.map(n => ({ label: `n = ${n} (target absent)`, entry: 'binarySearch', args: [range(n), 0, n - 1, -1] })),
  56: () => SIZES.map(n => ({ label: `n = ${n}`, entry: 'fastPower', args: [2, n] })),
  57: () => [3, 4].map(n => ({ label: `n = ${n}`, entry: 'printSubsets', args: [zeros(n), n, []] })),
};

interface RunResult { label: string; stats: Map<number, Stat>; steps: number }

function runOnce(prog: Stmt[], spec: RunSpec): RunResult | null {
  const sim = new Sim();
  try {
    const topFuncs = prog.filter((x): x is Stmt & { k: 'func' } => x.k === 'func');
    topFuncs.forEach(f => sim.funcs.set(f.name, f));
    const g = spec.globals ?? {};
    Object.keys(g).forEach(key => {
      const v = g[key];
      sim.globals.set(key, Array.isArray(v) ? [...v] : v);
    });
    const topStmts = prog.filter(x => x.k !== 'func');
    sim.scopes = [];
    for (const s of topStmts) sim.exec(s);
    const onlyDecls = topStmts.every(x => x.k === 'decl');
    if (spec.entry) {
      const fn = sim.funcs.get(spec.entry);
      if (!fn) return null;
      sim.callFunc(fn, (spec.args ?? []).map(a => (Array.isArray(a) ? [...a] : a)));
    } else if (sim.funcs.has('main')) {
      sim.callFunc(sim.funcs.get('main')!, []);
    } else if (topFuncs.length && onlyDecls) {
      const fn = topFuncs[topFuncs.length - 1];
      if (fn.params.length !== 1) return null;
      sim.callFunc(fn, [spec.globals?.N]);
    }
    return { label: spec.label, stats: sim.stats, steps: sim.steps };
  } catch {
    return null;
  }
}

// ─────────────────────────── Walkthrough output ──────────────────────────
export interface WalkRow { label: string; text: string; tone?: 'warn' | 'good' }
export interface CountRow { label: string; values: (number | string)[] }
export interface WalkCard {
  line: number;
  depth: number;
  code: string;
  tag: string;
  tagKind: 'loop' | 'cond' | 'stmt' | 'func' | 'exit' | 'info';
  rows: WalkRow[];
  counts: CountRow[];
}
export interface Walkthrough {
  cards: WalkCard[];
  runLabels: string[];
  setupNote: string;
  growth?: { label: string; values: number[]; ratio: number; inputFactor?: number };
}

const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString('en-US') : String(Math.round(n * 100) / 100));

// How much bigger the second input is than the first (for the "growth" line). Default is 2×.
const INPUT_FACTOR: Record<number, number> = { 7: 4, 11: 3, 39: 4, 40: 4, 44: 4, 45: 4, 57: 0 };

const SUB: Record<string, string> = { '2': '₂', '3': '₃', '4': '₄', '5': '₅', '10': '₁₀' };
const logOf = (base: string, arg: string) => `log${SUB[base] ?? '_' + base}(${arg})`;

function inWords(src: string): string {
  return src
    .replace(/<=/g, ' ≤ ').replace(/>=/g, ' ≥ ').replace(/!=/g, ' ≠ ').replace(/==/g, ' = ')
    .replace(/&&/g, ' AND ').replace(/\|\|/g, ' OR ')
    .replace(/\s%\s/g, ' mod ').replace(/(?<![<>=!])\s?<\s?(?!=)/g, ' < ').replace(/(?<![<>=!])\s?>\s?(?!=)/g, ' > ')
    .replace(/\s+/g, ' ').trim();
}

function collectUserCalls(e: Expr | null | undefined, funcs: Set<string>, out: string[] = []): string[] {
  if (!e) return out;
  switch (e.t) {
    case 'call': if (funcs.has(e.name)) out.push(e.name); e.args.forEach(a => collectUserCalls(a, funcs, out)); break;
    case 'bin': collectUserCalls(e.l, funcs, out); collectUserCalls(e.r, funcs, out); break;
    case 'un': collectUserCalls(e.e, funcs, out); break;
    case 'assign': collectUserCalls(e.target, funcs, out); collectUserCalls(e.e, funcs, out); break;
    case 'incdec': collectUserCalls(e.target, funcs, out); break;
    case 'index': collectUserCalls(e.arr, funcs, out); collectUserCalls(e.idx, funcs, out); break;
    case 'member': collectUserCalls(e.obj, funcs, out); e.args.forEach(a => collectUserCalls(a, funcs, out)); break;
    case 'comma': e.list.forEach(a => collectUserCalls(a, funcs, out)); break;
    default: break;
  }
  return out;
}

function srcOfExpr(e: Expr): string {
  switch (e.t) {
    case 'num': return String(e.v);
    case 'id': return e.name;
    case 'bin': return `${srcOfExpr(e.l)} ${e.op} ${srcOfExpr(e.r)}`;
    case 'un': return e.op + srcOfExpr(e.e);
    case 'call': return `${e.name}(${e.args.map(srcOfExpr).join(', ')})`;
    case 'index': return `${srcOfExpr(e.arr)}[${srcOfExpr(e.idx)}]`;
    case 'member': return `${srcOfExpr(e.obj)}.${e.name}(${e.args.map(srcOfExpr).join(', ')})`;
    case 'assign': return `${srcOfExpr(e.target)} ${e.op} ${srcOfExpr(e.e)}`;
    case 'incdec': return e.prefix ? e.op + srcOfExpr(e.target) : srcOfExpr(e.target) + e.op;
    case 'comma': return e.list.map(srcOfExpr).join(', ');
    default: return '?';
  }
}

const isNum = (e: Expr, v?: number): e is Expr & { t: 'num' } => e.t === 'num' && (v === undefined || e.v === v);

const upCount = (op: string, start: string, bound: string): string => {
  const st = start.trim();
  if (op === '<=') return st === '1' ? bound : st === '0' ? `${bound} + 1` : `${bound} − ${st} + 1`;
  if (op === '<') return st === '0' ? bound : st === '1' ? `${bound} − 1` : `${bound} − ${st}`;
  return `${bound} − ${st}`;
};
const downCount = (op: string, start: string, bound: string): string => {
  const b = bound.trim();
  if (op === '>') return b === '0' ? start : b === '1' ? `${start} − 1` : `${start} − ${b}`;
  if (op === '>=') return b === '1' ? start : b === '0' ? `${start} + 1` : `${start} − ${b} + 1`;
  return `${start} − ${b}`;
};

/** Plain-English description of how a `for` loop's update step moves the variable, plus the standard iteration count. */
function describeForPattern(s: Stmt & { k: 'for' }): { update: string; pattern: string; startText: string } {
  const v = s.loopVar;
  const u = s.update;
  const startSrc = s.init && s.init.k === 'decl' ? (s.init.items[0]?.initSrc ?? '') : (s.init && s.init.k === 'expr' && s.init.e.t === 'assign' ? srcOfExpr(s.init.e.e) : '');
  const isV = (e: Expr) => e.t === 'id' && e.name === v;
  const isSq = (e: Expr) => e.t === 'bin' && e.op === '*' && isV(e.l) && isV(e.r);
  let bound = '';
  let op = '';
  if (s.cond && s.cond.t === 'bin' && ['<', '<=', '>', '>='].includes(s.cond.op)) {
    const { l, r } = s.cond;
    op = s.cond.op;
    if (isV(l)) bound = srcOfExpr(r);
    else if (isV(r)) { bound = srcOfExpr(l); op = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }[op] as string; }
    else if (isSq(l)) bound = `√(${srcOfExpr(r)})`;
    else if (isSq(r)) { bound = `√(${srcOfExpr(l)})`; op = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }[op] as string; }
  }
  const first = u && u.t === 'comma' ? u.list[0] : u;
  const extra = u && u.t === 'comma' ? ` (the other part${u.list.length > 2 ? 's' : ''} of the update — ${u.list.slice(1).map(srcOfExpr).join(', ')} — also run${u.list.length > 2 ? '' : 's'} every time)` : '';
  const startText = startSrc;
  if (!first) return { update: 'There is no update part — the loop must end some other way.', pattern: '', startText };

  const noBound = `The condition is not a plain “${v} compared with a bound”, so read the trace below to see how many times it really runs.`;

  if (first.t === 'incdec' && first.target.t === 'id' && first.target.name === v) {
    if (first.op === '++') {
      let pattern = `Additive step of 1 → \`${v}\` moves one integer at a time. ${noBound}`;
      if (bound && startSrc && (op === '<' || op === '<=')) {
        const cnt = upCount(op, startSrc, bound);
        pattern = `Additive step of 1 → \`${v}\` visits every integer from ${startSrc} ${op === '<=' ? 'up to and including' : 'up to (but not including)'} ${bound} → exactly ${/[ −+]/.test(cnt) ? `(${cnt})` : cnt} iterations. Total cost = iterations × cost of the body.`;
      }
      return { update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` goes up by exactly 1${extra}.`, pattern, startText };
    }
    let pattern = `Counting down by 1 → \`${v}\` moves one integer at a time. ${noBound}`;
    if (bound && startSrc && (op === '>' || op === '>=')) {
      const cnt = downCount(op, startSrc, bound);
      pattern = `Counting down by 1 → \`${v}\` visits every integer from ${startSrc} down ${op === '>=' ? 'to and including' : 'to (but not including)'} ${bound} → exactly ${/[ −+]/.test(cnt) ? `(${cnt})` : cnt} iterations. Direction (up or down) never changes the count.`;
    }
    return { update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` goes down by exactly 1${extra}.`, pattern, startText };
  }
  if (first.t === 'assign' && first.target.t === 'id' && first.target.name === v) {
    const stepSrc = srcOfExpr(first.e);
    const b = bound || 'the bound';
    const st = startSrc || 'its start';
    if (first.op === '+=' || first.op === '-=') {
      const dir = first.op === '+=' ? 'up' : 'down';
      if (isNum(first.e)) return {
        update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` moves ${dir} by a fixed ${stepSrc}${extra}.`,
        pattern: `Additive step of a constant (${stepSrc}) → about ${bound && startSrc ? `(${first.op === '+=' ? upCount(op || '<', startSrc, bound) : downCount(op || '>', startSrc, bound)})` : `(${b} − ${st})`} / ${stepSrc} iterations. A constant step only changes the constant factor, never the growth class.`,
        startText,
      };
      if (/[nN]/.test(stepSrc)) return {
        update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` moves ${dir} by ${stepSrc}, a step that itself depends on N${extra}.`,
        pattern: `The step grows WITH the input (${stepSrc}), so the loop always makes about the same small number of jumps no matter how big N gets — the iteration count does NOT grow.`,
        startText,
      };
      return {
        update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` moves ${dir} by ${stepSrc}${extra}.`,
        pattern: `Additive step of ${stepSrc} (a fixed constant) → about (${b} − ${st}) / ${stepSrc} iterations.`,
        startText,
      };
    }
    if (first.op === '*=') {
      const base = isNum(first.e) ? String(first.e.v) : stepSrc;
      const s0 = startSrc || '1';
      return {
        update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` is MULTIPLIED by ${base} each time${extra}.`,
        pattern: `Multiplicative step → \`${v}\` takes the values ${s0}, ${s0}·${base}, ${s0}·${base}², … → it needs about ${logOf(base, b)} iterations. A logarithm, not a straight count.`,
        startText,
      };
    }
    if (first.op === '/=') {
      const base = isNum(first.e) ? String(first.e.v) : stepSrc;
      const s0 = startSrc || 'N';
      return {
        update: `\`${s.updateSrc}\` runs AFTER every iteration → \`${v}\` is DIVIDED by ${base} each time${extra}.`,
        pattern: `Repeated division → \`${v}\` takes the values ${s0}, ${s0}/${base}, ${s0}/${base}², … → about ${logOf(base, s0)} iterations until it reaches the bound.`,
        startText,
      };
    }
  }
  return { update: `\`${s.updateSrc}\` runs AFTER every iteration.${extra}`, pattern: '', startText };
}

function listVals(vals: number[], total: number): string {
  const shown = vals.map(fmt).join(', ');
  return total > vals.length ? `${shown}, …` : shown;
}

export function buildWalkthrough(code: string, qid: number): Walkthrough | null {
  let prog: Stmt[];
  let comments: Map<number, string>;
  try {
    const tk = tokenize(code);
    comments = tk.comments;
    prog = new Parser(tk.toks, code).parseProgram();
  } catch {
    return null;
  }
  const lines = code.split('\n');
  const funcNames = new Set<string>();
  const collectFuncs = (list: Stmt[]) => list.forEach(x => { if (x.k === 'func') funcNames.add(x.name); });
  collectFuncs(prog);

  const specs = (RUN_OVERRIDES[qid] ?? defaultRuns)();
  const results = specs.map(sp => runOnce(prog, sp));
  const allOk = results.every(r => r !== null);
  const runs = allOk ? (results as RunResult[]) : [];
  const runLabels = runs.map(r => r.label);

  const statOf = (id: number, pick: (s: Stat) => number): (number | string)[] =>
    runs.map(r => { const s = r.stats.get(id); return s ? pick(s) : 0; });
  const firstStat = (id: number): Stat | undefined => runs[0]?.stats.get(id);

  const cards: WalkCard[] = [];
  const codeAt = (line: number) => (lines[line - 1] ?? '').trim();

  const bodyIsEmpty = (b: Stmt): boolean => b.k === 'empty' || (b.k === 'block' && b.body.length === 0);
  const commentInside = (b: Stmt): string | undefined => {
    if (b.k !== 'block') return undefined;
    for (let l = b.line; l <= b.endLine; l++) { const c = comments.get(l); if (c && l !== b.line) return c; if (c && l === b.line && b.body.length === 0) return c; }
    return undefined;
  };

  const sameLineBody = (hdrLine: number, b: Stmt): Stmt | null =>
    b.k !== 'block' && b.k !== 'empty' && b.line === hdrLine ? b : null;

  const simpleText = (s: Stmt, depthInLoop: number): { tag: string; kind: WalkCard['tagKind']; text: string; cost: string } => {
    switch (s.k) {
      case 'decl': {
        const parts = s.items.map(it => it.init ? `\`${it.name}\` is created and set to \`${it.initSrc}\`` : `\`${it.name}\` is created (no starting value yet)`);
        const calls = s.items.flatMap(it => collectUserCalls(it.init, funcNames));
        return {
          tag: 'DECLARE', kind: 'stmt',
          text: `${parts.join('; ')}. Runs once each time execution reaches this line.`,
          cost: calls.length ? `O(1) + the cost of calling ${[...new Set(calls)].map(c => `\`${c}\``).join(', ')}` : 'O(1)',
        };
      }
      case 'expr': {
        const e = s.e;
        const calls = collectUserCalls(e, funcNames);
        let text = `Evaluates \`${s.src}\`.`;
        if (e.t === 'incdec') text = `Changes \`${srcOfExpr(e.target)}\` by ${e.op === '++' ? '+1' : '−1'} (\`${s.src}\`).`;
        else if (e.t === 'assign') {
          const t = srcOfExpr(e.target);
          const map: Record<string, string> = { '=': `Stores the value of \`${srcOfExpr(e.e)}\` into \`${t}\`.`, '+=': `Adds \`${srcOfExpr(e.e)}\` to \`${t}\`.`, '-=': `Subtracts \`${srcOfExpr(e.e)}\` from \`${t}\`.`, '*=': `Multiplies \`${t}\` by \`${srcOfExpr(e.e)}\`.`, '/=': `Divides \`${t}\` by \`${srcOfExpr(e.e)}\`.`, '%=': `Replaces \`${t}\` with the remainder after dividing by \`${srcOfExpr(e.e)}\`.` };
          text = map[e.op] ?? text;
        } else if (e.t === 'call') {
          if (e.name === 'swap') text = `Swaps the two values \`${srcOfExpr(e.args[0])}\` and \`${srcOfExpr(e.args[1])}\`.`;
          else text = `Calls \`${e.name}(${e.args.map(srcOfExpr).join(', ')})\`.`;
        } else if (e.t === 'member' && e.name === 'push_back') text = `Appends \`${srcOfExpr(e.args[0])}\` to the end of \`${srcOfExpr(e.obj)}\`.`;
        else if (e.t === 'member' && e.name === 'pop_back') text = `Removes the last element of \`${srcOfExpr(e.obj)}\`.`;
        void depthInLoop;
        return {
          tag: calls.length ? 'FUNCTION CALL' : 'STATEMENT', kind: 'stmt', text,
          cost: calls.length ? `O(1) + the cost of \`${[...new Set(calls)].join('`, `')}\` on every execution` : 'O(1) — one basic operation',
        };
      }
      case 'io':
        return s.kind === 'cin'
          ? { tag: 'INPUT', kind: 'stmt', text: `Reads the input value${s.names.length > 1 ? 's' : ''} \`${s.names.join('`, `')}\` — this is the input size the analysis is about.`, cost: 'O(1)' }
          : { tag: 'OUTPUT', kind: 'stmt', text: `Prints a value to the screen (\`${s.src}\`).`, cost: 'O(1)' };
      case 'break':
        return { tag: 'BREAK', kind: 'exit', text: 'Leaves the nearest enclosing loop IMMEDIATELY — the remaining iterations never happen. This is one way a loop can finish early.', cost: 'O(1)' };
      case 'continue':
        return { tag: 'CONTINUE', kind: 'exit', text: 'Skips the rest of this iteration and jumps to the loop’s update step.', cost: 'O(1)' };
      case 'return':
        return {
          tag: 'RETURN', kind: 'exit',
          text: `${s.e ? `Hands back \`${srcOfExpr(s.e)}\` to the caller and` : ''} ends this function call right here${depthInLoop > 0 ? ' — even if it is in the middle of a loop. That is an EARLY EXIT: the loop may stop before its bound, so best case and worst case can differ' : ''}.`.replace(/^ /, ''),
          cost: 'O(1)',
        };
      default: return { tag: 'STATEMENT', kind: 'stmt', text: '', cost: 'O(1)' };
    }
  };

  const callWarn = (e: Expr | null, what: string, checksCount: (number | string)[]): WalkRow | null => {
    const calls = [...new Set(collectUserCalls(e, funcNames))];
    if (!calls.length) return null;
    const times = checksCount.length ? ` In this run that is ${checksCount.map(v => (typeof v === 'number' ? fmt(v) : v)).join(' and ')} evaluations — not 1.` : '';
    return {
      label: 'HIDDEN COST', tone: 'warn',
      text: `${calls.map(c => `\`${c}\``).join(', ')} is called inside the ${what}, so it runs again EVERY time this ${what} is evaluated — not just once.${times} Multiply that by the cost of one call.`,
    };
  };

  const visit = (s: Stmt, depth: number, loopDepth: number) => {
    switch (s.k) {
      case 'block': s.body.forEach(x => visit(x, depth, loopDepth)); return;
      case 'empty': case 'break': case 'continue': case 'return': case 'decl': case 'expr': case 'io': {
        if (s.k === 'empty') return;
        const d = simpleText(s, loopDepth);
        const rows: WalkRow[] = [{ label: 'WHAT IT DOES', text: d.text }, { label: 'COST', text: d.cost }];
        const c = comments.get(s.line);
        if (c) rows.push({ label: 'NOTE IN CODE', text: c });
        cards.push({
          line: s.line, depth, code: codeAt(s.line), tag: d.tag, tagKind: d.kind, rows,
          counts: runs.length ? [{ label: 'Times this line runs', values: statOf(s.id, x => x.exec) }] : [],
        });
        return;
      }
      case 'func': {
        const rows: WalkRow[] = [
          { label: 'WHAT IT IS', text: `A function DEFINITION named \`${s.name}\`${s.params.length ? ` taking ${s.params.map(p => `\`${p}\``).join(', ')}` : ''}. Nothing inside runs until some other line calls it.` },
        ];
        const c = comments.get(s.line);
        if (c) rows.push({ label: 'NOTE IN CODE', text: c });
        cards.push({
          line: s.line, depth, code: s.sig + ' {', tag: 'FUNCTION', tagKind: 'func', rows,
          counts: runs.length ? [{ label: 'Times it is called', values: statOf(s.id, x => x.calls) }] : [],
        });
        visit(s.body, depth + 1, 0);
        return;
      }
      case 'if': {
        const st1 = firstStat(s.id);
        const rows: WalkRow[] = [
          { label: 'CONDITION', text: `\`${s.condSrc}\` — in words: ${inWords(s.condSrc)}. It is evaluated every time execution reaches this line.` },
          { label: 'IF TRUE', text: `The ${s.then.k === 'block' ? 'block below' : 'statement on this line'} runs.` },
          { label: 'IF FALSE', text: s.els ? 'The else-branch runs instead.' : 'The block is skipped and execution continues after it.' },
        ];
        if (/&&/.test(s.condSrc)) rows.splice(1, 0, { label: 'NOTE', text: 'Two tests joined by AND — BOTH must be true. If the first is false the second is not even checked (short-circuit).' });
        const w = callWarn(s.cond, 'condition', runs.length ? statOf(s.id, x => x.exec) : []);
        if (w) rows.push(w);
        const same = sameLineBody(s.line, s.then);
        if (same) {
          const d = simpleText(same, loopDepth);
          rows.push({ label: 'THEN-PART', text: `\`${same.k === 'return' ? same.src : same.k === 'break' ? 'break' : codeAt(s.line).replace(/^.*\)\s*/, '')}\` — ${d.text}` });
        } else if (s.then.k === 'block' && (s.then.body.some(x => x.k === 'return' || x.k === 'break'))) {
          rows.push({ label: 'EARLY EXIT', text: 'The block contains a `return`/`break`, so when the condition is true the loop or function can stop before doing all its work.', tone: 'good' });
        }
        void st1;
        cards.push({
          line: s.line, depth, code: codeAt(s.line), tag: 'IF', tagKind: 'cond', rows,
          counts: runs.length ? [
            { label: 'Condition evaluated', values: statOf(s.id, x => x.exec) },
            { label: 'Was TRUE', values: statOf(s.id, x => x.trueCount) },
          ] : [],
        });
        if (!same) visit(s.then, depth + 1, loopDepth);
        if (s.els) visit(s.els, depth + 1, loopDepth);
        return;
      }
      case 'while': {
        const rows: WalkRow[] = [
          { label: 'CONDITION', text: `\`${s.condSrc}\` — in words: ${inWords(s.condSrc)}. It is tested BEFORE every iteration; the loop ends the first time it is false.` },
        ];
        if (/&&/.test(s.condSrc)) rows.push({ label: 'NOTE', text: 'Two tests joined by AND — the loop continues only while BOTH hold.' });
        const w = callWarn(s.cond, 'loop condition', runs.length ? statOf(s.id, x => x.checks) : []);
        if (w) rows.push(w);
        describeBody(rows, s, s.body);
        loopTrace(rows, s);
        cards.push({
          line: s.line, depth, code: codeAt(s.line), tag: 'WHILE LOOP', tagKind: 'loop', rows,
          counts: runs.length ? [
            { label: 'Condition checked', values: statOf(s.id, x => x.checks) },
            { label: 'Body runs (iterations)', values: statOf(s.id, x => x.iters) },
          ] : [],
        });
        visit(s.body, depth + 1, loopDepth + 1);
        return;
      }
      case 'for': {
        const pat = describeForPattern(s);
        const rows: WalkRow[] = [];
        if (s.init) rows.push({ label: 'INIT', text: `\`${s.initSrc}\` runs ONCE, when the loop starts → ${s.loopVar ? `\`${s.loopVar}\` starts at ${pat.startText ? `\`${pat.startText}\`` : 'its first value'}` : 'sets up the loop variable'}.` });
        if (s.cond) {
          rows.push({ label: 'CONDITION', text: `\`${s.condSrc}\` — in words: ${inWords(s.condSrc)}. It is tested BEFORE every iteration; the loop ends the first time it is false.` });
          if (/&&/.test(s.condSrc)) rows.push({ label: 'NOTE', text: 'Two tests joined by AND — the loop continues only while BOTH hold, so either one can end it.' });
          const w = callWarn(s.cond, 'loop condition', runs.length ? statOf(s.id, x => x.checks) : []);
          if (w) rows.push(w);
        }
        if (s.update) rows.push({ label: 'UPDATE', text: pat.update });
        if (pat.pattern) rows.push({ label: 'PATTERN', text: pat.pattern });
        describeBody(rows, s, s.body);
        loopTrace(rows, s);
        const same = sameLineBody(s.line, s.body);
        if (same) {
          const d = simpleText(same, loopDepth + 1);
          rows.push({ label: 'BODY (same line)', text: `\`${same.k === 'expr' ? same.src : codeAt(s.line).replace(/^.*\)\s*/, '')}\` — ${d.text} Cost: ${d.cost}.` });
        }
        cards.push({
          line: s.line, depth, code: codeAt(s.line), tag: 'FOR LOOP', tagKind: 'loop', rows,
          counts: runs.length ? [
            { label: 'Condition checked', values: statOf(s.id, x => x.checks) },
            { label: 'Body runs (iterations)', values: statOf(s.id, x => x.iters) },
            ...(same ? [{ label: 'Body statement runs', values: statOf(same.id, x => x.exec) }] : []),
          ] : [],
        });
        if (!same) visit(s.body, depth + 1, loopDepth + 1);
        return;
      }
      default: return;
    }
  };

  function describeBody(rows: WalkRow[], s: Stmt & { k: 'for' | 'while' }, body: Stmt) {
    if (bodyIsEmpty(body)) {
      const cm = commentInside(body);
      rows.push({
        label: 'BODY',
        text: cm
          ? `Only a comment (“${cm}”) — i.e. a placeholder for a constant amount of work per iteration.`
          : 'Empty — the loop does all its work in the header itself (it just counts).',
      });
    }
    void s;
  }

  function loopTrace(rows: WalkRow[], s: Stmt & { k: 'for' | 'while' }) {
    const st = firstStat(s.id);
    if (!st || !runs.length) return;
    const label = runLabels[0];
    if (st.runs > 1) {
      rows.push({
        label: `TRACE (${label})`,
        text: `This loop is started ${fmt(st.runs)} times (once for every pass of the loop around it). Iterations in each start: ${listVals(st.runIters, st.runs)} → ${fmt(st.iters)} in total.`,
      });
    } else if (st.firstVals.length && s.loopVar) {
      rows.push({
        label: `TRACE (${label})`,
        text: `\`${s.loopVar}\` is ${listVals(st.firstVals, st.iters)} at the start of each iteration → ${fmt(st.iters)} iteration${st.iters === 1 ? '' : 's'}; the condition is checked ${fmt(st.checks)} times (one extra check fails and ends the loop).`,
      });
    } else {
      rows.push({
        label: `TRACE (${label})`,
        text: st.iters === 0
          ? 'The condition is false on the very first check, so the body never runs.'
          : `${fmt(st.iters)} iteration${st.iters === 1 ? '' : 's'}; the condition is checked ${fmt(st.checks)} times.`,
      });
    }
  }

  prog.forEach(s => visit(s, 0, 0));

  const wt: Walkthrough = {
    cards,
    runLabels,
    setupNote: runs.length
      ? `Every count below was measured by really running this code (${runLabels.join('  vs  ')}).`
      : '',
  };
  if (runs.length === 2 && runs[0].steps > 0) {
    const f = INPUT_FACTOR[qid] ?? 2;
    wt.growth = { label: 'Total basic steps executed', values: runs.map(r => r.steps), ratio: runs[1].steps / runs[0].steps, inputFactor: f || undefined };
  }
  return wt;
}
