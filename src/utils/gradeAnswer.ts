// ══════════════════════════════════════════════════════════════════════════
// gradeAnswer — checks what the learner typed against a question's expected answer.
//
// Rather than comparing strings, a typed answer is PARSED into a growth class
// (a "monomial": variable powers × log power × exponential base). So all of these
// count as the same answer:
//     O(n^2)   Θ(N²)   n**2   n squared   quadratic   n(n+1)/2   n^2 + n   2n^2
// Constants and lower-order terms are accepted but pointed out, since dropping
// them is exactly the lesson of Big-O.
// ══════════════════════════════════════════════════════════════════════════
import type { GradeSpec } from '../data/practiceGrading';

export interface GradePart { label: string; ok: boolean }
export interface GradeResult {
  status: 'correct' | 'partial' | 'wrong' | 'invalid';
  headline: string;
  lines: string[];
  parts?: GradePart[];
}

// ───────────────────────── growth classes ─────────────────────────
interface Mono {
  coef: number;
  vars: Record<string, number>;
  logp: number;
  expoBase: number | null;
  sym: string;
}
const constMono = (c = 1): Mono => ({ coef: c, vars: {}, logp: 0, expoBase: null, sym: '' });

type Tk = { k: 'num'; v: number } | { k: 'id'; v: string } | { k: 'log' } | { k: 'sqrt' } | { k: 'op'; v: string };

function lex(s: string): Tk[] | null {
  const out: Tk[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\d/.test(c) || (c === '.' && /\d/.test(s[i + 1] ?? ''))) {
      let j = i;
      while (j < s.length && /[\d.]/.test(s[j])) j++;
      const v = parseFloat(s.slice(i, j));
      if (Number.isNaN(v)) return null;
      out.push({ k: 'num', v });
      i = j;
      continue;
    }
    if (s.startsWith('log', i)) { out.push({ k: 'log' }); i += 3; continue; }
    if (s.startsWith('sqrt', i)) { out.push({ k: 'sqrt' }); i += 4; continue; }
    if (/[a-z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z_]/.test(s[j]) && !s.startsWith('log', j) && !s.startsWith('sqrt', j)) j++;
      out.push({ k: 'id', v: s.slice(i, j) });
      i = j;
      continue;
    }
    if ('+-*/^()'.includes(c)) { out.push({ k: 'op', v: c }); i++; continue; }
    return null;
  }
  return out;
}

const CONST_IDS = new Set(['c', 'k', 'a', 'e']);
// Only these names are accepted as "the input size" — anything else (random words) is rejected.
const VAR_IDS = new Set(['n', 'm', 'asize', 'size', 'rows', 'cols', 'len', 'length']);

class GrowthParser {
  p = 0;
  droppedCoef = false;
  droppedTerms = false;
  constructor(private t: Tk[]) {}

  private isOp(v: string) { const x = this.t[this.p]; return !!x && x.k === 'op' && x.v === v; }
  private startsFactor() {
    const x = this.t[this.p];
    if (!x) return false;
    return x.k === 'num' || x.k === 'id' || x.k === 'log' || x.k === 'sqrt' || (x.k === 'op' && x.v === '(');
  }

  parseAll(): Mono {
    const terms = this.parseSum();
    if (this.p < this.t.length) throw new Error('trailing input');
    return this.dominant(terms);
  }

  private dominant(terms: Mono[]): Mono {
    if (terms.length > 1) this.droppedTerms = true;
    return terms.reduce((a, b) => (cmpMono(b, a) > 0 ? b : a));
  }

  private parseSum(): Mono[] {
    const terms = [this.parseTerm()];
    while (this.isOp('+') || this.isOp('-')) { this.p++; terms.push(this.parseTerm()); }
    return terms;
  }

  private parseTerm(): Mono {
    let m = this.parseFactor();
    for (;;) {
      if (this.isOp('*')) { this.p++; m = mul(m, this.parseFactor()); }
      else if (this.isOp('/')) { this.p++; m = div(m, this.parseFactor()); }
      else if (this.startsFactor()) m = mul(m, this.parseFactor());
      else break;
    }
    if (m.coef !== 1) this.droppedCoef = true;
    return { ...m, coef: 1 };
  }

  private parseFactor(): Mono {
    const base = this.parseAtom();
    if (this.isOp('^')) {
      this.p++;
      const e = this.parseExponent();
      return power(base, e);
    }
    return base;
  }

  private parseExponent(): { num?: number; sym?: string } {
    const x = this.t[this.p];
    if (!x) throw new Error('missing exponent');
    if (x.k === 'op' && x.v === '-') { this.p++; const e = this.parseExponent(); if (e.num === undefined) throw new Error('bad exponent'); return { num: -e.num }; }
    if (x.k === 'num') { this.p++; return { num: x.v }; }
    if (x.k === 'id') { this.p++; return { sym: x.v }; }
    if (x.k === 'op' && x.v === '(') {
      let depth = 0;
      const inner: Tk[] = [];
      do {
        const y = this.t[this.p++];
        if (!y) throw new Error('unbalanced');
        if (y.k === 'op' && y.v === '(') { depth++; if (depth === 1) continue; }
        if (y.k === 'op' && y.v === ')') { depth--; if (depth === 0) break; }
        inner.push(y);
      } while (depth > 0);
      if (inner.every(y => y.k === 'num' || (y.k === 'op' && (y.v === '/' || y.v === '*')))) {
        let v = (inner[0] as { v: number }).v;
        for (let i = 1; i + 1 < inner.length; i += 2) {
          const op = (inner[i] as { v: string }).v;
          const n = (inner[i + 1] as { v: number }).v;
          v = op === '/' ? v / n : v * n;
        }
        return { num: v };
      }
      const terms = inner.filter(y => y.k === 'id').map(y => (y as { v: string }).v).sort();
      if (!terms.length) throw new Error('bad exponent');
      return { sym: terms.join('+') };
    }
    throw new Error('bad exponent');
  }

  private parseAtom(): Mono {
    const x = this.t[this.p];
    if (!x) throw new Error('unexpected end');
    if (x.k === 'num') { this.p++; return constMono(x.v); }
    if (x.k === 'id') {
      this.p++;
      if (CONST_IDS.has(x.v)) return constMono(1);
      if (!VAR_IDS.has(x.v)) throw new Error('unknown name ' + x.v);
      return { coef: 1, vars: { [x.v]: 1 }, logp: 0, expoBase: null, sym: '' };
    }
    if (x.k === 'op' && x.v === '(') {
      this.p++;
      const terms = this.parseSum();
      if (!this.isOp(')')) throw new Error('missing )');
      this.p++;
      return this.dominant(terms);
    }
    if (x.k === 'log') {
      this.p++;
      let pw = 1;
      if (this.isOp('^')) { this.p++; const e = this.parseExponent(); if (e.num === undefined) throw new Error('bad log power'); pw = e.num; }
      const arg = this.parseAtom();
      const growing = Object.keys(arg.vars).length > 0 || arg.logp > 0 || arg.expoBase !== null;
      return growing ? { coef: 1, vars: {}, logp: pw, expoBase: null, sym: '' } : constMono(1);
    }
    if (x.k === 'sqrt') {
      this.p++;
      const arg = this.parseAtom();
      return power(arg, { num: 0.5 });
    }
    throw new Error('unexpected token');
  }
}

function mul(a: Mono, b: Mono): Mono {
  const vars: Record<string, number> = { ...a.vars };
  Object.keys(b.vars).forEach(k => { vars[k] = (vars[k] ?? 0) + b.vars[k]; });
  return { coef: a.coef * b.coef, vars, logp: a.logp + b.logp, expoBase: a.expoBase ?? b.expoBase, sym: a.sym + b.sym };
}
function div(a: Mono, b: Mono): Mono {
  if (b.expoBase !== null || b.sym) throw new Error('unsupported division');
  const vars: Record<string, number> = { ...a.vars };
  Object.keys(b.vars).forEach(k => { vars[k] = (vars[k] ?? 0) - b.vars[k]; });
  return { coef: a.coef / (b.coef || 1), vars, logp: a.logp - b.logp, expoBase: a.expoBase, sym: a.sym };
}
function power(base: Mono, e: { num?: number; sym?: string }): Mono {
  if (e.num !== undefined) {
    const vars: Record<string, number> = {};
    Object.keys(base.vars).forEach(k => { vars[k] = base.vars[k] * e.num!; });
    return { coef: Math.pow(base.coef, e.num), vars, logp: base.logp * e.num, expoBase: base.expoBase, sym: base.sym };
  }
  const isPureNumber = Object.keys(base.vars).length === 0 && base.logp === 0 && base.expoBase === null && !base.sym;
  if (isPureNumber && e.sym && !e.sym.includes('+')) {
    if (base.coef <= 1) return constMono(1);
    return { coef: 1, vars: {}, logp: 0, expoBase: base.coef, sym: '' };
  }
  if (Object.keys(base.vars).length > 0 && e.sym) return { ...base, sym: e.sym };
  throw new Error('unsupported power');
}

function degree(m: Mono): number {
  return Object.values(m.vars).reduce((s, x) => s + x, 0) + (m.sym ? 1000 : 0);
}
function cmpMono(a: Mono, b: Mono): number {
  const ea = a.expoBase ?? 0, eb = b.expoBase ?? 0;
  if (ea !== eb) return ea > eb ? 1 : -1;
  const da = degree(a), db = degree(b);
  if (da !== db) return da > db ? 1 : -1;
  if (a.logp !== b.logp) return a.logp > b.logp ? 1 : -1;
  return 0;
}
function normVars(m: Mono): Record<string, number> {
  const names = Object.keys(m.vars).filter(k => Math.abs(m.vars[k]) > 1e-9);
  if (names.length === 1) return { n: m.vars[names[0]] };
  const out: Record<string, number> = {};
  names.sort().forEach(k => { out[k] = m.vars[k]; });
  return out;
}
const keyOf = (m: Mono) => JSON.stringify([normVars(m), Math.round(m.logp * 1e6) / 1e6, m.expoBase, m.sym]);
const sameMono = (a: Mono, b: Mono) => keyOf(a) === keyOf(b);

// ───────────────────────── text → growth class ─────────────────────────
const SUPER: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', 'ⁿ': 'n' };

function prep(raw: string): string {
  let s = raw.toLowerCase().trim();
  s = s.replace(/[“”"'`]/g, '');
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+/g, m => '^' + [...m].map(ch => SUPER[ch]).join(''));
  s = s.replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080));
  s = s.replace(/θ/g, 'theta').replace(/ω/g, 'omega').replace(/√/g, ' sqrt ');
  s = s.replace(/[×·⋅∙•]/g, '*').replace(/\*\*/g, '^').replace(/[−–—]/g, '-');
  s = s.replace(/square\s*root\s*(of)?|root\s*of/g, ' sqrt ');
  s = s.replace(/\bn\s*(squared|square)\b/g, 'n^2').replace(/\bn\s*cubed\b/g, 'n^3');
  s = s.replace(/\bquadratic\b/g, 'n^2').replace(/\bcubic\b/g, 'n^3').replace(/\blinearithmic\b/g, 'n log n');
  s = s.replace(/\blinear\b/g, 'n').replace(/\blogarithmic\b/g, 'log n').replace(/\bconstant(\s*time)?\b/g, '1').replace(/\bexponential\b/g, '2^n');
  s = s.replace(/\bbig\s*-?\s*o(h)?\b/g, 'o');
  s = s.replace(/log\s*(base|b)\s*\d+\s*(of)?/g, 'log ');
  s = s.replace(/\b(time|space)\s+complexity\b|\bcomplexity\b/g, ' ');
  s = s.replace(/\b(the|answer|ans|is|it|its|would|be|approximately|approx|about|around|case|of|order)\b/g, ' ');
  s = s.replace(/\b(lg|ln)\b/g, 'log');
  s = s.replace(/log\s*_?\s*\{?\s*\d+\s*\}?/g, 'log');
  s = s.replace(/\bn(\d)\b/g, 'n^$1');
  s = s.replace(/^\s*[a-z]\s*\(\s*n\s*\)\s*[=~≈]\s*/, '').replace(/^[\s=~≈:]+/, '');
  return s;
}

/** If the text contains O(...)/Θ(...)/Ω(...), return the contents of the first one (balanced). */
function unwrap(s: string): { inner: string; wrapper: string | null } {
  const m = /\b(theta|omega|big\s*o|o)\s*\(/.exec(s);
  if (!m) return { inner: s, wrapper: null };
  const start = m.index + m[0].length;
  let depth = 1;
  let i = start;
  while (i < s.length && depth > 0) { if (s[i] === '(') depth++; else if (s[i] === ')') depth--; i++; }
  const inner = s.slice(start, depth === 0 ? i - 1 : i);
  const w = m[1].startsWith('big') ? 'o' : m[1];
  return { inner, wrapper: w };
}

interface Parsed { mono: Mono; droppedCoef: boolean; droppedTerms: boolean; omega: boolean }

function parseComplexity(raw: string): Parsed | null {
  const s0 = prep(raw);
  const un = unwrap(s0);
  let wrapper = un.wrapper;
  let inner = un.inner;
  if (!wrapper) {
    const m = /^\s*(theta|omega|o)\s+(?=\S)/.exec(inner);
    if (m) { wrapper = m[1]; inner = inner.slice(m[0].length); }
  }
  const s = inner.replace(/(?<=[a-z)])\.(?=[a-z(])/g, '*').replace(/\s+/g, '');
  if (!s) return null;
  const toks = lex(s);
  if (!toks || !toks.length) return null;
  try {
    const gp = new GrowthParser(toks);
    const mono = gp.parseAll();
    return { mono, droppedCoef: gp.droppedCoef, droppedTerms: gp.droppedTerms, omega: wrapper === 'omega' };
  } catch {
    return null;
  }
}

const parseExpected = (list: string[]): Mono[] =>
  list.map(x => parseComplexity(x)).filter((x): x is Parsed => !!x).map(x => x.mono);

const FORMAT_HELP = 'I could not read that as a complexity. Try forms like `O(n)`, `n^2`, `n log n`, `O(log n)`, `sqrt(n)` or `2^n`.';

function wrongHint(user: Mono, exp: Mono): string {
  const c = cmpMono(user, exp);
  if (c > 0) {
    if (degree(user) === degree(exp) && user.logp > exp.logp) return 'The power of the variable is right, but you have an extra log factor — check whether an inner loop really multiplies by log N.';
    return 'That grows FASTER than the real cost. Check whether some loops are back-to-back (their costs ADD) instead of nested (their costs multiply), or whether an inner loop is cheaper than you assumed.';
  }
  if (c < 0) {
    if (degree(user) === degree(exp) && user.logp < exp.logp) return 'The power of the variable is right, but you are missing a log factor — check for a loop that multiplies or divides its counter.';
    return 'That grows SLOWER than the real cost. You may be missing a loop, a function that gets called again and again, or a factor like log N.';
  }
  return 'Same speed class in the powers, but something else differs — look closely at the exponent or log factor.';
}

function notesFor(p: Parsed): string[] {
  const n: string[] = [];
  if (p.droppedCoef) n.push('Big-O drops constant factors (like the 2 in `2n²` or the /2 in `n²/2`) — only the growth class counts, so write just `n²`.');
  if (p.droppedTerms) n.push('In a sum, only the fastest-growing term matters, so lower-order terms like `+ n` or `+ 1` are dropped in the final form.');
  return n;
}

function gradeSingle(input: string, accept: string[], label: string | null): GradeResult {
  const user = parseComplexity(input);
  if (!user) return { status: 'invalid', headline: 'Could not read your answer', lines: [FORMAT_HELP] };
  const exp = parseExpected(accept);
  if (user.omega) {
    return { status: 'wrong', headline: label ? `${label}: not quite` : 'Not quite', lines: ['Ω (omega) is only a LOWER bound. The question asks for the growth rate of the running time — answer with `O(…)` or `Θ(…)`.'] };
  }
  if (exp.some(e => sameMono(user.mono, e))) {
    return { status: 'correct', headline: label ? `${label}: correct` : 'Correct!', lines: notesFor(user) };
  }
  return { status: 'wrong', headline: label ? `${label}: not quite` : 'Not quite', lines: [wrongHint(user.mono, exp[0] ?? constMono())] };
}

// ───────────────────────── best / worst input ─────────────────────────
function cleanPart(s: string): string {
  return s.replace(/^[\s:=\-–—,;|]+/, '').replace(/[\s,;|&]+$/, '').replace(/\b(and|then)\s*$/, '').replace(/^\s*(case)\b[\s:=\-]*/, '').trim();
}

function splitBestWorst(raw: string): { best?: string; worst?: string; single?: string } {
  const t = raw.toLowerCase();
  const ib = t.search(/best/);
  const iw = t.search(/worst/);
  if (ib >= 0 && iw >= 0) {
    if (ib < iw) return { best: cleanPart(t.slice(ib + 4, iw)), worst: cleanPart(t.slice(iw + 5)) };
    return { worst: cleanPart(t.slice(iw + 5, ib)), best: cleanPart(t.slice(ib + 4)) };
  }
  if (iw >= 0) return { worst: cleanPart(t.slice(iw + 5)) };
  if (ib >= 0) return { best: cleanPart(t.slice(ib + 4)) };
  const parts = t.split(/[\/;|·•&]|,(?![^(]*\))|\band\b|\bthen\b/).map(x => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { best: parts[0], worst: parts[1] };
  return { single: t.trim() };
}

function gradeBestWorst(input: string, best: string[], worst: string[]): GradeResult {
  const eb = parseExpected(best);
  const ew = parseExpected(worst);
  const sameBoth = eb.length > 0 && ew.length > 0 && sameMono(eb[0], ew[0]);
  const parts = splitBestWorst(input);

  const one = (label: string, text: string, exp: string[]): GradePart & { res: GradeResult } => {
    const res = gradeSingle(text.replace(/ω|omega/g, 'o'), exp, label);
    return { label, ok: res.status === 'correct', res };
  };

  if (parts.single !== undefined) {
    if (!parts.single) return { status: 'invalid', headline: 'Type your answer first', lines: [] };
    if (sameBoth) {
      const r = gradeSingle(parts.single, worst, null);
      if (r.status === 'correct') return { status: 'correct', headline: 'Correct!', lines: ['Best case and worst case are the same here, so one answer covers both.', ...r.lines] };
      return r;
    }
    const probe = parseComplexity(parts.single);
    if (!probe) return { status: 'invalid', headline: 'Could not read your answer', lines: [FORMAT_HELP] };
    return {
      status: 'partial',
      headline: 'This question has TWO parts',
      lines: ['Give both cases, for example: `Best: O(1), Worst: O(n)`. The best case and the worst case behave differently here, so a single answer cannot be complete.'],
    };
  }

  const results: (GradePart & { res: GradeResult })[] = [];
  if (parts.best !== undefined) results.push(one('Best case', parts.best || '?', best));
  if (parts.worst !== undefined) results.push(one('Worst case', parts.worst || '?', worst));
  const invalid = results.find(r => r.res.status === 'invalid');
  if (invalid) return { status: 'invalid', headline: `Could not read your ${invalid.label.toLowerCase()}`, lines: [FORMAT_HELP] };

  const lines: string[] = [];
  results.forEach(r => { if (!r.ok) lines.push(`${r.label}: ${r.res.lines[0] ?? 'not quite.'}`); });
  const parts2: GradePart[] = results.map(r => ({ label: r.label, ok: r.ok }));
  const gaveBoth = parts.best !== undefined && parts.worst !== undefined;
  if (results.every(r => r.ok) && gaveBoth) return { status: 'correct', headline: 'Correct — both cases!', lines: results.flatMap(r => r.res.lines), parts: parts2 };
  if (results.every(r => r.ok) && !gaveBoth) {
    return { status: 'partial', headline: `${results[0].label} is right — now the other one`, lines: ['This question needs BOTH the best case and the worst case.'], parts: parts2 };
  }
  if (results.some(r => r.ok)) return { status: 'partial', headline: 'One part is right', lines, parts: parts2 };
  return { status: 'wrong', headline: 'Not quite', lines, parts: parts2 };
}

// ───────────────────────── Big-O proofs (c and n₀) ─────────────────────────
function gradeProof(input: string, spec: Extract<GradeSpec, { kind: 'proof' }>): GradeResult {
  // light normalisation only — the full complexity prep would turn "n0" into "n^0"
  const s = input.toLowerCase().replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080)).replace(/\s+/g, ' ').trim();
  let c: number | undefined;
  let n0: number | undefined;
  const cm = /(?:^|[^a-z0-9])c\s*[=:]\s*(\d+(?:\.\d+)?)/.exec(s);
  const nm = /n\s*_?0\s*[=:]\s*(\d+)/.exec(s);
  if (cm) c = parseFloat(cm[1]);
  if (nm) n0 = parseInt(nm[1], 10);
  if (c === undefined || n0 === undefined) {
    const nums = s.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (c === undefined && n0 === undefined && nums.length >= 2) { c = nums[0]; n0 = Math.round(nums[1]); }
    else if (c === undefined && n0 !== undefined && nums.length) { c = nums.find(x => x !== n0) ?? nums[0]; }
    else if (n0 === undefined && c !== undefined && nums.length >= 2) { n0 = Math.round(nums.find(x => x !== c) ?? nums[1]); }
  }
  if (c === undefined || n0 === undefined || !(c > 0)) {
    return { status: 'invalid', headline: 'Give both constants', lines: ['Write them like `c = 209, n0 = 2` — the proof needs a constant c > 0 and a starting point n₀.'] };
  }
  if (n0 < spec.minN) {
    return { status: 'wrong', headline: 'n₀ is too small', lines: [`log n and the other terms here are only meaningful from n = ${spec.minN} onward, so pick n₀ ≥ ${spec.minN}.`] };
  }
  const LIMIT = 300;
  for (let n = n0; n <= LIMIT; n++) {
    const f = spec.f(n);
    const bound = c * spec.g(n);
    if (!(f <= bound * (1 + 1e-12))) {
      return {
        status: 'wrong',
        headline: 'Those constants do not work',
        lines: [`At n = ${n}: f(n) = ${fmtNum(f)} but c·g(n) = ${fmtNum(bound)}, so f(n) ≤ c·g(n) fails. Try a larger c (or a larger n₀).`],
      };
    }
  }
  return {
    status: 'correct',
    headline: 'Those constants work!',
    lines: [`I checked f(n) ≤ ${fmtNum(c)}·g(n) for every n from ${n0} to ${LIMIT}. In a written proof you would show this inequality algebraically, as in the steps.`],
  };
}

const fmtNum = (x: number) => (Math.abs(x) >= 1e9 || (x !== 0 && Math.abs(x) < 1e-3) ? x.toExponential(3) : String(Math.round(x * 1000) / 1000));

// ───────────────────────── public API ─────────────────────────
export function gradeAnswer(spec: GradeSpec, input: string): GradeResult {
  if (!input.trim()) return { status: 'invalid', headline: 'Type your answer first', lines: [] };
  switch (spec.kind) {
    case 'single': return gradeSingle(input, spec.accept, null);
    case 'bw': return gradeBestWorst(input, spec.best, spec.worst);
    case 'worst': {
      const p = splitBestWorst(input);
      const text = p.worst ?? p.single ?? p.best ?? input;
      return gradeSingle(text, spec.worst, null);
    }
    case 'proof': return gradeProof(input, spec);
    default: return { status: 'invalid', headline: 'Cannot check this one', lines: [] };
  }
}
