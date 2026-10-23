import { useCallback, useEffect, useRef, useState } from 'react';

/** Play / pause / step-back / step-forward over a list of precomputed frames. */
export function useStepper(total: number, resetKey: unknown, opts?: { strideFor?: (speed: number) => number }) {
  const [rawIdx, setIdxRaw] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(6);          // 1 (slow) .. 10 (fast)
  const last = Math.max(0, total - 1);
  // The frame list can shrink (new input / other algorithm) before the reset effect runs — never point past the end.
  const idx = Math.min(rawIdx, last);
  const idxRef = useRef(0);
  idxRef.current = idx;

  const setIdx = useCallback((v: number) => setIdxRaw(Math.min(last, Math.max(0, v))), [last]);

  // a new input / new frames → back to the start
  useEffect(() => { setIdxRaw(0); setPlaying(false); }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    if (idxRef.current >= last) { setPlaying(false); return; }
    const stride = opts?.strideFor ? opts.strideFor(speed) : 1;
    const t = setTimeout(() => setIdxRaw(i => Math.min(last, i + stride)), 1150 - speed * 100);
    return () => clearTimeout(t);
  }, [playing, idx, speed, last]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => { if (idxRef.current >= last) setIdxRaw(0); setPlaying(true); };
  return {
    idx, total, speed, setSpeed, playing, setIdx,
    play, pause: () => setPlaying(false),
    toggle: () => (playing ? setPlaying(false) : play()),
    next: () => { setPlaying(false); setIdx(idxRef.current + 1); },
    prev: () => { setPlaying(false); setIdx(idxRef.current - 1); },
    first: () => { setPlaying(false); setIdxRaw(0); },
    end: () => { setPlaying(false); setIdxRaw(last); },
    atEnd: idx >= last,
  };
}

export type Stepper = ReturnType<typeof useStepper>;

export function StepControls({ st, showCounter = true }: { st: Stepper; showCounter?: boolean }) {
  return (
    <div className="viz-controls step-controls">
      <button className="viz-btn" onClick={st.first} disabled={st.idx === 0} title="Back to start">⏮</button>
      <button className="viz-btn" onClick={st.prev} disabled={st.idx === 0} title="Previous step">◀ Prev</button>
      <button className={`viz-btn ${st.playing ? 'red' : 'primary'}`} onClick={st.toggle}>
        {st.playing ? '⏸ Pause' : st.atEnd ? '↺ Replay' : '▶ Play'}
      </button>
      <button className="viz-btn" onClick={st.next} disabled={st.atEnd} title="Next step">Next ▶</button>
      <button className="viz-btn" onClick={st.end} disabled={st.atEnd} title="Jump to the end">⏭</button>
      <div className="speed-control">
        <span>Speed:</span>
        <input type="range" min="1" max="10" value={st.speed} onChange={e => st.setSpeed(Number(e.target.value))} />
        <span>{st.speed > 7 ? 'Fast' : st.speed > 3 ? 'Med' : 'Slow'}</span>
      </div>
      {showCounter && <span className="step-counter">step {st.idx + 1} / {st.total}</span>}
    </div>
  );
}
