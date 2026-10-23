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

  add(-1, '', 'start', 'Start with an empty stack and scan the text from left to right.', 'stack = [ ]');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([{'.includes(ch)) {
      add(i, ch, 'scan', `'${ch}' is an OPENING bracket.`, `read '${ch}'  → opening bracket`);
      stack.push(ch);
      add(i, ch, 'push', `Every opening bracket is pushed — it now waits for its partner. push('${ch}').`, `push('${ch}')   ${st()}`);
    } else if (ch in OPEN) {
      add(i, ch, 'scan', `'${ch}' is a CLOSING bracket. It must match the most recent unclosed opener — the one on TOP of the stack.`, `read '${ch}'  → closing bracket`);
      const empty = stack.length === 0;
      add(i, ch, 'check', empty
        ? `Check 1 — is the stack empty? YES. There is no opener to match '${ch}', so the text is NOT balanced.`
        : `Check 1 — is the stack empty? NO, so there is an opener available to match.`,
        `stack.empty()  → ${empty}`, [{ text: `stack.empty() = ${empty}`, ok: !empty }]);
      if (empty) { add(i, ch, 'error', `Closing '${ch}' with nothing open → NOT balanced.`, `✗ not balanced`, undefined, false); return steps; }
      const top = stack[stack.length - 1];
      const match = top === OPEN[ch];
      add(i, ch, 'check', match
        ? `Check 2 — does the top '${top}' match '${ch}'? YES ('${OPEN[ch]}' is the partner of '${ch}').`
        : `Check 2 — does the top '${top}' match '${ch}'? NO — '${ch}' needs '${OPEN[ch]}'. NOT balanced.`,
        `stack.top() = '${top}'  matches '${ch}'? → ${match}`,
        [{ text: 'stack.empty() = false', ok: true }, { text: `top '${top}' matches '${ch}' = ${match}`, ok: match }]);
      if (!match) { add(i, ch, 'error', `Mismatched pair '${top}' … '${ch}' → NOT balanced.`, `✗ not balanced`, undefined, false); return steps; }
      stack.pop();
      add(i, ch, 'pop', `Both checks passed → the pair is closed, so pop '${top}' off the stack.`, `pop()   ${st()}`);
    } else {
      add(i, ch, 'skip', `'${show(ch)}' is not a bracket → ignore it and move on.`, `read '${show(ch)}'  → not a bracket, skip`);
    }
  }
  const empty = stack.length === 0;
  add(text.length, '', 'check', `End of text. Final check — is the stack empty? ${empty ? 'YES — every opener found its partner.' : `NO — ${stack.length} opener${stack.length > 1 ? 's are' : ' is'} never closed.`}`, `stack.empty()  → ${empty}`, [{ text: `stack.empty() = ${empty}`, ok: empty }]);
  if (empty) add(text.length, '', 'ok', 'End of text and the stack is empty → balanced!', '✓ balanced', undefined, true);
  else add(text.length, '', 'error', `${stack.length} bracket${stack.length > 1 ? 's are' : ' is'} still open → NOT balanced.`, '✗ not balanced', undefined, false);
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
  const snap = (i: number, tok: string, note: string) => steps.push({ i, tok, stack: [...stack], output: [...output], note });
  snap(-1, '', 'Scan left to right. Operands go straight to the output; operators wait on the stack until it is their turn.');
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/^[A-Za-z0-9.]+$/.test(t)) { output.push(t); snap(i, t, `'${t}' is an operand → send it to the output.`); }
    else if (t === '(') { stack.push(t); snap(i, t, `'(' → push it; it marks the start of a sub-expression.`); }
    else if (t === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') { const o = stack.pop()!; output.push(o); snap(i, t, `')' → pop '${o}' to the output until we reach '('.`); }
      if (!stack.length) return { steps, error: 'Mismatched parentheses: a ")" has no matching "(".' };
      stack.pop(); snap(i, t, `Discard the matching '(' — parentheses never appear in postfix.`);
    } else {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top === '(') break;
        const higher = PREC[top] > PREC[t] || (PREC[top] === PREC[t] && !RIGHT.has(t));
        if (!higher) break;
        stack.pop(); output.push(top);
        snap(i, t, `'${top}' on the stack binds ${PREC[top] > PREC[t] ? 'tighter than' : 'as tightly as (left-to-right)'} '${t}' → pop it to the output first.`);
      }
      stack.push(t); snap(i, t, `Push '${t}' onto the stack.`);
    }
  }
  while (stack.length) {
    const o = stack.pop()!;
    if (o === '(') return { steps, error: 'Mismatched parentheses: a "(" is never closed.' };
    output.push(o); snap(toks.length, '', `End of input → pop the remaining operator '${o}' to the output.`);
  }
  snap(toks.length, '', `Done. Postfix: ${output.join(' ')}`);
  return { steps };
}
