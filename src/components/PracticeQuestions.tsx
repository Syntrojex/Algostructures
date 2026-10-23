import { useMemo, useState } from 'react';
import { PRACTICE_QUESTIONS, CATEGORIES, TOTAL_QUESTIONS } from '../data/practiceQuestions';
import { GRADING, DEFAULT_PLACEHOLDER } from '../data/practiceGrading';
import { gradeAnswer, type GradeResult } from '../utils/gradeAnswer';
import { buildWalkthrough, type WalkCard } from '../utils/cppWalkthrough';
import CodeBlock from './CodeBlock';

const PROGRESS_KEY = 'practice-questions-completed-v1';

function loadCompleted(): Set<number> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

const DIFF_COLOR: Record<string, string> = {
  Easy: 'var(--ag)',
  Medium: 'var(--ao)',
  Hard: 'var(--ak)',
};

/** Escape HTML, then turn `code` into <code> so walkthrough text can show inline code safely. */
function richText(s: string): string {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/`([^`]+)`/g, '<code>$1</code>');
}

function WalkCardView({ card, runLabels }: { card: WalkCard; runLabels: string[] }) {
  return (
    <div className={`pq-wc pq-wc-${card.tagKind}`} style={{ marginLeft: Math.min(card.depth, 4) * 18 }}>
      <div className="pq-wc-head">
        <span className="pq-wc-line">Line {card.line}</span>
        <span className={`pq-wc-tag pq-wc-tag-${card.tagKind}`}>{card.tag}</span>
        <code className="pq-wc-code">{card.code}</code>
      </div>
      <div className="pq-wc-rows">
        {card.rows.map((r, i) => (
          <div key={i} className={`pq-wc-row${r.tone ? ' pq-wc-row-' + r.tone : ''}`}>
            <span className="pq-wc-label">{r.label}</span>
            <span className="pq-wc-text" dangerouslySetInnerHTML={{ __html: richText(r.text) }} />
          </div>
        ))}
      </div>
      {card.counts.length > 0 && (
        <table className="pq-wc-counts">
          <thead>
            <tr>
              <th />
              {runLabels.map(l => <th key={l}>{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {card.counts.map(c => (
              <tr key={c.label}>
                <td>{c.label}</td>
                {c.values.map((v, i) => <td key={i}><b>{typeof v === 'number' ? v.toLocaleString('en-US') : v}</b></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function PracticeQuestions() {
  const [category, setCategory] = useState<string>('All');
  const [qIndex, setQIndex] = useState(0);
  const [showSol, setShowSol] = useState(false);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  const [jumpVal, setJumpVal] = useState('');
  const [jumpErr, setJumpErr] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(loadCompleted);

  const filtered = category === 'All' ? PRACTICE_QUESTIONS : PRACTICE_QUESTIONS.filter(q => q.category === category);
  const q = filtered[Math.min(qIndex, filtered.length - 1)];
  const spec = GRADING[q.id];
  const isProof = q.category === 'Formal Big-O Proofs';

  const walk = useMemo(() => (isProof || !q.code ? null : buildWalkthrough(q.code, q.id)), [q.id, q.code, isProof]);

  const markComplete = (id: number) => {
    if (completed.has(id)) return;
    const next = new Set(completed);
    next.add(id);
    setCompleted(next);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next])); } catch { /* fine without persistence */ }
  };

  const resetForNewQuestion = () => { setShowSol(false); setGuess(''); setResult(null); };
  const selectCategory = (c: string) => { setCategory(c); setQIndex(0); resetForNewQuestion(); };
  const goTo = (idx: number) => {
    if (idx < 0 || idx >= filtered.length) return;
    setQIndex(idx);
    resetForNewQuestion();
  };

  const jumpTo = (n: number) => {
    const idx = PRACTICE_QUESTIONS.findIndex(x => x.id === n);
    if (idx === -1) { setJumpErr(true); return; }
    setJumpErr(false);
    setCategory('All');
    setQIndex(idx);
    resetForNewQuestion();
  };
  const handleJump = () => {
    const n = parseInt(jumpVal, 10);
    if (!n || n < 1 || n > TOTAL_QUESTIONS) { setJumpErr(true); return; }
    jumpTo(n);
    setJumpVal('');
  };
  const stepJump = (d: number) => {
    const cur = parseInt(jumpVal, 10);
    const base = Number.isNaN(cur) ? q.id : cur;
    const next = Math.min(TOTAL_QUESTIONS, Math.max(1, base + d));
    setJumpErr(false);
    setJumpVal(String(next));
  };

  const check = () => {
    const r = gradeAnswer(spec, guess);
    setResult(r);
    if (r.status === 'correct') markComplete(q.id);
  };

  const revealSolution = () => { setShowSol(true); markComplete(q.id); };

  return (
    <div className="pq-wrap">
      {/* ── Toolbar: category filter + progress + jump ── */}
      <div className="pq-toolbar">
        <select className="pq-select" value={category} onChange={e => selectCategory(e.target.value)}>
          <option value="All">All Categories ({TOTAL_QUESTIONS})</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c} ({PRACTICE_QUESTIONS.filter(x => x.category === c).length})
            </option>
          ))}
        </select>

        <div className="pq-progress-pill">✓ {completed.size} / {TOTAL_QUESTIONS} completed</div>

        <div className="pq-jump">
          <span className="pq-jump-label">Go to #</span>
          <div className={`pq-stepper${jumpErr ? ' pq-stepper-err' : ''}`}>
            <input
              className="pq-stepper-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Go to question number"
              placeholder={String(q.id)}
              value={jumpVal}
              onChange={e => { setJumpVal(e.target.value.replace(/[^0-9]/g, '').slice(0, 3)); setJumpErr(false); }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleJump();
                else if (e.key === 'ArrowUp') { e.preventDefault(); stepJump(1); }
                else if (e.key === 'ArrowDown') { e.preventDefault(); stepJump(-1); }
              }}
            />
            <div className="pq-stepper-btns">
              <button type="button" className="pq-stepper-btn" aria-label="Increase" onClick={() => stepJump(1)}>
                <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 5 L5 1 L9 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="pq-stepper-btn" aria-label="Decrease" onClick={() => stepJump(-1)}>
                <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          <button className="viz-btn cyan" onClick={handleJump}>Go</button>
        </div>
      </div>
      {jumpErr && <div className="pq-jump-err">Enter a question number between 1 and {TOTAL_QUESTIONS}.</div>}

      {/* ── Question card ── */}
      <div className="pq-card" key={q.id}>
        <div className="pq-card-head">
          <span className="pq-qnum">Question {String(q.id).padStart(2, '0')} <span className="pq-qtotal">/ {TOTAL_QUESTIONS}</span></span>
          <span className="pq-badge pq-badge-cat">{q.category}</span>
          <span className="pq-badge" style={{ color: DIFF_COLOR[q.difficulty], borderColor: DIFF_COLOR[q.difficulty] }}>
            {q.difficulty}
          </span>
          {completed.has(q.id) && <span className="pq-badge pq-badge-done">✓ Done</span>}
        </div>

        <p className="pq-prompt">{q.prompt}</p>

        {q.code && (
          <div className="pq-code">
            <CodeBlock codeCpp={q.code} filename={`practice-q${q.id}`} />
          </div>
        )}

        {/* ── Your answer + Check ── */}
        <div className="pq-attempt">
          <label className="pq-attempt-label" htmlFor={`pq-in-${q.id}`}>
            {isProof ? 'Your constants — enter c and n₀' : 'Your answer'}
          </label>
          <div className="pq-attempt-row">
            <input
              id={`pq-in-${q.id}`}
              className={`pq-attempt-input${result ? ' pq-in-' + result.status : ''}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={spec?.placeholder ?? DEFAULT_PLACEHOLDER}
              value={guess}
              onChange={e => { setGuess(e.target.value); if (result) setResult(null); }}
              onKeyDown={e => e.key === 'Enter' && check()}
            />
            <button className="viz-btn green pq-check-btn" onClick={check}>✔ Check</button>
          </div>

          {result && (
            <div className={`pq-result pq-result-${result.status}`} role="status">
              <div className="pq-result-head">
                <span className="pq-result-icon">
                  {result.status === 'correct' ? '✓' : result.status === 'partial' ? '◐' : result.status === 'wrong' ? '✗' : '!'}
                </span>
                <strong>{result.headline}</strong>
                {result.parts && (
                  <span className="pq-result-parts">
                    {result.parts.map(p => (
                      <span key={p.label} className={`pq-result-part ${p.ok ? 'ok' : 'bad'}`}>{p.ok ? '✓' : '✗'} {p.label}</span>
                    ))}
                  </span>
                )}
              </div>
              {result.lines.map((l, i) => (
                <div key={i} className="pq-result-line" dangerouslySetInnerHTML={{ __html: richText(l) }} />
              ))}
            </div>
          )}

          {!showSol && (
            <button className="viz-btn cyan pq-reveal-btn" onClick={revealSolution}>
              🔍 Show Full Solution
            </button>
          )}
        </div>

        {/* ── Full solution ── */}
        {showSol && (
          <div className="pq-solution">
            {walk && walk.cards.length > 0 && (
              <section className="pq-sec">
                <div className="pq-sec-title"><span className="pq-sec-num">A</span> Line-by-line walkthrough</div>
                <p className="pq-sec-sub">
                  Every instruction, every loop’s start / condition / update, and how often it really runs.
                  {walk.setupNote ? ' ' + walk.setupNote : ''}
                </p>
                <div className="pq-wc-list">
                  {walk.cards.map((c, i) => <WalkCardView key={i} card={c} runLabels={walk.runLabels} />)}
                </div>
                {walk.growth && (
                  <div className="pq-growth">
                    <div className="pq-growth-title">How the work grows</div>
                    <div className="pq-growth-body">
                      {walk.runLabels[0]}: <b>{walk.growth.values[0].toLocaleString('en-US')}</b> basic steps
                      <span className="pq-growth-arrow">→</span>
                      {walk.runLabels[1]}: <b>{walk.growth.values[1].toLocaleString('en-US')}</b> basic steps
                      <div className="pq-growth-note">
                        {walk.growth.inputFactor
                          ? <>Input grew ×{walk.growth.inputFactor}, work grew ×<b>{walk.growth.ratio.toFixed(2)}</b>. </>
                          : <>Work grew ×<b>{walk.growth.ratio.toFixed(2)}</b>. </>}
                        Compare this with the answer below — ×2 input giving ×2 work means linear, ×4 means quadratic, ×8 cubic, and barely moving means logarithmic or constant.
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="pq-sec">
              <div className="pq-sec-title">
                <span className="pq-sec-num">{walk && walk.cards.length > 0 ? 'B' : '1'}</span> Deriving the complexity
              </div>
              <ol className="pq-steps">
                {q.steps.map((step, i) => (
                  <li key={i} className="pq-step" dangerouslySetInnerHTML={{ __html: richText(step) }} />
                ))}
              </ol>
            </section>

            <div className="success-box pq-final">
              <strong>Final Answer:</strong> {q.answer}
              {q.note && <div className="pq-note">💡 {q.note}</div>}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="pq-nav">
        <button className="viz-btn" disabled={qIndex === 0} onClick={() => goTo(qIndex - 1)}>
          ← Previous
        </button>
        <span className="pq-nav-pos">{qIndex + 1} of {filtered.length}{category !== 'All' ? ` in ${category}` : ''}</span>
        <button className="viz-btn cyan" disabled={qIndex === filtered.length - 1} onClick={() => goTo(qIndex + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
