import { useEffect, useMemo, useRef, useState } from 'react';
import { StepControls, useStepper } from './useStepper';
import { infixSteps, parenSteps, tokenize } from '../../utils/stackApps';

type Mode = 'parens' | 'infix';
const CONFIG: Record<Mode, { title: string; label: string; presets: string[]; fallback: string }> = {
  parens:  { title: '🧮 Balanced Parentheses', label: 'Text with ( ) [ ] { }', presets: ['{[(a+b)*c]-d}', '((a+b)', '{[(])}', 'a(b]c'], fallback: '{[(a+b)*c]-d}' },
  infix:   { title: '🔄 Infix → Postfix', label: 'Infix expression', presets: ['a+b*c', '(a+b)*c', '2^3^2', '7-(2+3)*2+1'], fallback: 'a+b*c' },
};

function StackColumn({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="sa-stack">
      <div className="sa-title">{label}</div>
      <div className="sa-stack-body">
        {items.length === 0 && <div className="sa-empty">empty</div>}
        {items.slice().reverse().map((x, i) => (
          <div key={items.length - i} className={`sa-item${i === 0 ? ' top' : ''}`}>{x}{i === 0 && <span className="sa-top-tag">top</span>}</div>
        ))}
      </div>
    </div>
  );
}

export default function StackApps({ mode }: { mode: Mode }) {
  const cfg = CONFIG[mode];
  const [text, setText] = useState(cfg.fallback);

  const run = useMemo(() => {
    if (mode === 'parens') {
      if (text.length > 60) return { steps: [] as unknown[], error: 'Keep the text to 60 characters or fewer so every step stays readable.' as string | undefined };
      return { steps: parenSteps(text) as unknown[], error: undefined as string | undefined };
    }
    return infixSteps(text) as { steps: unknown[]; error?: string };
  }, [mode, text]);
  const steps = run.steps as any[];
  const st = useStepper(Math.max(1, steps.length), steps);
  const cur = steps[Math.min(st.idx, steps.length - 1)];

  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [st.idx]);

  const tokens: string[] = mode === 'parens' ? text.split('') : tokenize(text) ?? [];
  const logRef = useRef<HTMLDivElement>(null);
  const finalNote = st.atEnd && steps.length > 0;
  const log: { text: string; step: number }[] = steps.slice(0, st.idx + 1).map((x, k) => ({ text: (x.log as string | undefined) ?? (x.note as string), step: k }));

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">{cfg.title}</div>
      <div className="custom-input-row">
        <label>{cfg.label}:</label>
        <input className="viz-input" value={text} onChange={e => setText(e.target.value)} style={{ minWidth: 220 }} spellCheck={false} />
      </div>
      <div className="viz-row">
        <label>Try</label>
        {cfg.presets.map(p => <button key={p} className="viz-chip-btn" onClick={() => setText(p)}>{p}</button>)}
      </div>
      {run.error && <div className="viz-note bad">⚠ {run.error}</div>}

      {steps.length > 0 && (
        <>
          <StepControls st={st} />
          <div className="sa-tokens">
            {tokens.length === 0 && <span className="sa-empty">(empty text)</span>}
            {tokens.map((t, i) => <span key={i} className={`sa-tok${i === cur.i ? ' cur' : i < cur.i ? ' past' : ''}`}>{t === ' ' ? '␣' : t}</span>)}
          </div>
          {mode === 'parens' && cur.checks && (
            <div className="sa-checks">
              {(cur.checks as { text: string; ok: boolean }[]).map((k, i) => <span key={i} className={`sa-check ${k.ok ? 'ok' : 'bad'}`}>{k.ok ? '✓' : '✗'} {k.text}</span>)}
            </div>
          )}
          <div className="sa-board">
            <StackColumn items={(cur.stack as (string | number)[]).map(String)} label="STACK" />
            <div className="sa-log">
              <div className="sa-title">STEP LOG</div>
              <div className="sa-log-body" ref={logRef}>
                {log.map(l => <div key={l.step} className={`sa-log-line${l.step === st.idx ? ' now' : ''}`}>{l.text}</div>)}
              </div>
            </div>
            {mode === 'infix' && (
              <div className="sa-out">
                <div className="sa-title">OUTPUT (postfix)</div>
                <div className="sa-out-row">{(cur.output as string[]).length ? (cur.output as string[]).map((x, i) => <span key={i} className="sa-out-tok">{x}</span>) : <span className="sa-empty">—</span>}</div>
              </div>
            )}
          </div>
          <div className={`viz-note${finalNote && (cur.ok === true || (mode === 'infix' && !run.error)) ? ' good' : ''}${cur.ok === false || cur.error ? ' bad' : ''}`}>
            {cur.note}
          </div>
        </>
      )}
    </div>
  );
}
