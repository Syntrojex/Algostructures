// Pure step generators for the stack applications.
export interface ParenCheck { text: string; ok: boolean }
export interface ParenStep {
  i: number; ch: string; stack: string[]; note: string;
  state: 'start' | 'scan' | 'check' | 'push' | 'pop' | 'skip' | 'error' | 'ok';
  log: string;                 // one short, code-like line shown in the running trace
  checks?: ParenCheck[];       // the conditions evaluated in this step, shown as chips
  ok?: boolean;                // set on the very last step
}
const OPEN: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const show = (c: string) => (c === ' ' ? '␣' : c);

export function parenSteps(text: string): ParenStep[] {
  const steps: ParenStep[] = [];
  const stack: string[] = [];
  const add = (i: number, ch: string, state: ParenStep['state'], note: string, log: string, checks?: ParenCheck[], ok?: boolean) =>
    steps.push({ i, ch, stack: [...stack], note, state, log, checks, ok });
  const st = () => `stack = [ ${stack.join(' ')}${stack.length ? ' ' : ''}]`;

  add(-1, '', 'start', 'Empty stack. Scan left to right.', 'stack = [ ]');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([{'.includes(ch)) {
      add(i, ch, 'scan', `'${ch}' is an opening bracket.`, `read '${ch}'  → opening`);
      stack.push(ch);
      add(i, ch, 'push', `Push '${ch}' — it waits for its partner.`, `push('${ch}')   ${st()}`);
    } else if (ch in OPEN) {
      add(i, ch, 'scan', `'${ch}' is a closing bracket → look at the top.`, `read '${ch}'  → closing`);
      const empty = stack.length === 0;
      add(i, ch, 'check', empty ? 'Stack empty? YES → nothing to match.' : 'Stack empty? NO → there is an opener.', `stack.empty()  → ${empty}`, [{ text: `stack.empty() = ${empty}`, ok: !empty }]);
      if (empty) { add(i, ch, 'error', `'${ch}' has no opener → NOT balanced.`, `✗ not balanced`, undefined, false); return steps; }
      const top = stack[stack.length - 1];
      const match = top === OPEN[ch];
      add(i, ch, 'check', match ? `Top '${top}' matches '${ch}'? YES.` : `Top '${top}' matches '${ch}'? NO → '${ch}' needs '${OPEN[ch]}'.`,
        `stack.top() = '${top}'  matches '${ch}'? → ${match}`,
        [{ text: 'stack.empty() = false', ok: true }, { text: `top '${top}' matches '${ch}' = ${match}`, ok: match }]);
      if (!match) { add(i, ch, 'error', `'${top}' … '${ch}' do not match → NOT balanced.`, `✗ not balanced`, undefined, false); return steps; }
      stack.pop();
      add(i, ch, 'pop', `Matched → pop '${top}'.`, `pop()   ${st()}`);
    } else {
      add(i, ch, 'skip', `'${show(ch)}' is not a bracket → skip.`, `read '${show(ch)}'  → skip`);
    }
  }
  const empty = stack.length === 0;
  add(text.length, '', 'check', empty ? 'End. Stack empty? YES.' : `End. Stack empty? NO — ${stack.length} left open.`, `stack.empty()  → ${empty}`, [{ text: `stack.empty() = ${empty}`, ok: empty }]);
  if (empty) add(text.length, '', 'ok', 'Stack is empty → balanced ✓', '✓ balanced', undefined, true);
  else add(text.length, '', 'error', `${stack.length} unclosed → NOT balanced.`, '✗ not balanced', undefined, false);
  return steps;
}

// ── infix → postfix (shunting-yard) ──
const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
const RIGHT = new Set(['^']);
export interface PostStep { i: number; tok: string; stack: string[]; output: string[]; note: string; log?: string }

export function tokenize(expr: string): string[] | null {
  const out = expr.match(/[A-Za-z0-9.]+|[-+*/^()]/g);
  if (!out || out.join('').length !== expr.replace(/\s+/g, '').length) return null;
  return out;
}

export function infixSteps(expr: string): { steps: PostStep[]; error?: string } {
  const toks = tokenize(expr);
  if (!toks) return { steps: [], error: 'Use letters/numbers, + - * / ^ and parentheses only.' };
  const steps: PostStep[] = [];
  const stack: string[] = [];
  const output: string[] = [];
  const snap = (i: number, tok: string, note: string) => steps.push({ i, tok, stack: [...stack], output: [...output], note, log: note });
  snap(-1, '', 'Operands → output. Operators wait on the stack.');
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/^[A-Za-z0-9.]+$/.test(t)) { output.push(t); snap(i, t, `'${t}' operand → output`); }
    else if (t === '(') { stack.push(t); snap(i, t, `'(' → push`); }
    else if (t === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') { const o = stack.pop()!; output.push(o); snap(i, t, `')' → pop '${o}' to output`); }
      if (!stack.length) return { steps, error: 'Mismatched parentheses: a ")" has no matching "(".' };
      stack.pop(); snap(i, t, `discard the matching '('`);
    } else {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top === '(') break;
        const higher = PREC[top] > PREC[t] || (PREC[top] === PREC[t] && !RIGHT.has(t));
        if (!higher) break;
        stack.pop(); output.push(top);
        snap(i, t, `'${top}' ${PREC[top] > PREC[t] ? 'beats' : 'ties with'} '${t}' → pop '${top}' to output`);
      }
      stack.push(t); snap(i, t, `push '${t}'`);
    }
  }
  while (stack.length) {
    const o = stack.pop()!;
    if (o === '(') return { steps, error: 'Mismatched parentheses: a "(" is never closed.' };
    output.push(o); snap(toks.length, '', `end → pop '${o}' to output`);
  }
  snap(toks.length, '', `Done. Postfix: ${output.join(' ')}`);
  return { steps };
}
