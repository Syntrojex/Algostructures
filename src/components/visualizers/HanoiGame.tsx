import { useEffect, useRef, useState } from 'react';
import HanoiBoard from './HanoiBoard';
import { canPlace, nextOptimalMove } from '../../utils/hanoiSolver';

const BEST_KEY = 'hanoi-game-best-v1';
const PEGS = ['A', 'B', 'C'];
const fresh = (n: number): number[][] => [Array.from({ length: n }, (_, i) => n - i), [], []];
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function loadBest(): Record<number, number> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { return {}; }
}

type Msg = { text: string; kind: 'info' | 'good' | 'bad' | 'win' };

export default function HanoiGame() {
  const [n, setN] = useState(3);
  const [pegs, setPegs] = useState<number[][]>(() => fresh(3));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<{ from: number; to: number }[]>([]);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const [auto, setAuto] = useState(false);
  const [usedAuto, setUsedAuto] = useState(false);
  const [best, setBest] = useState<Record<number, number>>(loadBest);
  const [msg, setMsg] = useState<Msg>({ text: 'Click a peg to pick up its top disk, then click another peg to drop it.', kind: 'info' });

  const pegsRef = useRef(pegs);
  pegsRef.current = pegs;
  const autoToken = useRef(0);
  useEffect(() => () => { autoToken.current++; }, []);

  const optimal = 2 ** n - 1;
  const solved = pegs[2].length === n;

  const reset = (size: number) => {
    autoToken.current++;
    setN(size);
    setPegs(fresh(size));
    setSelected(null);
    setMoves(0);
    setHistory([]);
    setHint(null);
    setAuto(false);
    setUsedAuto(false);
    setMsg({ text: `New game with ${size} disks. Move the whole tower to Peg C in ${2 ** size - 1} moves or fewer… well, exactly that is the minimum!`, kind: 'info' });
  };

  const applyMove = (from: number, to: number, viaAuto = false) => {
    const cur = pegsRef.current.map(p => [...p]);
    const disk = cur[from].pop() as number;
    cur[to].push(disk);
    pegsRef.current = cur;
    setPegs(cur);
    setMoves(m => m + 1);
    setHistory(h => [...h, { from, to }]);
    setHint(null);
    setSelected(null);
    if (cur[2].length === n) {
      setMsg({ text: '', kind: 'win' });
    } else {
      setMsg({ text: `Moved disk ${disk} from Peg ${PEGS[from]} to Peg ${PEGS[to]}.`, kind: viaAuto ? 'info' : 'good' });
    }
    return cur;
  };

  // record a best score when the player (not auto-solve) finishes
  useEffect(() => {
    if (solved && !usedAuto && moves > 0 && (best[n] === undefined || moves < best[n])) {
      const next = { ...best, [n]: moves };
      setBest(next);
      try { localStorage.setItem(BEST_KEY, JSON.stringify(next)); } catch { /* fine without persistence */ }
    }
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPegClick = (i: number) => {
    if (auto || solved) return;
    setHint(null);
    if (selected === null) {
      if (!pegs[i].length) { setMsg({ text: `Peg ${PEGS[i]} is empty — pick a peg that has a disk.`, kind: 'bad' }); setShake(i); setTimeout(() => setShake(null), 400); return; }
      setSelected(i);
      setMsg({ text: `Picked up disk ${pegs[i][pegs[i].length - 1]} from Peg ${PEGS[i]}. Now click where it should go.`, kind: 'info' });
      return;
    }
    if (selected === i) { setSelected(null); setMsg({ text: 'Put it back. Pick any peg to try again.', kind: 'info' }); return; }
    if (!canPlace(pegs, selected, i)) {
      const disk = pegs[selected][pegs[selected].length - 1];
      const top = pegs[i][pegs[i].length - 1];
      setMsg({ text: `Not allowed: disk ${disk} cannot go on top of smaller disk ${top}.`, kind: 'bad' });
      setShake(i);
      setTimeout(() => setShake(null), 400);
      setSelected(null);
      return;
    }
    applyMove(selected, i);
  };

  const undo = () => {
    if (auto || !history.length) return;
    const last = history[history.length - 1];
    const cur = pegsRef.current.map(p => [...p]);
    const disk = cur[last.to].pop() as number;
    cur[last.from].push(disk);
    pegsRef.current = cur;
    setPegs(cur);
    setHistory(h => h.slice(0, -1));
    setMoves(m => m - 1);
    setSelected(null);
    setHint(null);
    setMsg({ text: `Undid the move of disk ${disk}.`, kind: 'info' });
  };

  const showHint = () => {
    if (auto || solved) return;
    const m = nextOptimalMove(pegsRef.current);
    if (!m) return;
    setSelected(null);
    setHint({ from: m.from, to: m.to });
    setMsg({ text: `Hint: move disk ${m.disk} from Peg ${PEGS[m.from]} to Peg ${PEGS[m.to]} — that is the next step of the shortest solution from here.`, kind: 'info' });
  };

  const autoSolve = async () => {
    if (auto) { autoToken.current++; setAuto(false); setMsg({ text: 'Auto-solve stopped. You can carry on from here.', kind: 'info' }); return; }
    if (solved) return;
    const token = ++autoToken.current;
    setAuto(true);
    setUsedAuto(true);
    setSelected(null);
    setHint(null);
    const step = Math.max(140, Math.min(650, 6000 / optimal));
    for (;;) {
      if (autoToken.current !== token) return;
      const m = nextOptimalMove(pegsRef.current);
      if (!m) break;
      setHint({ from: m.from, to: m.to });
      await sleep(step * 0.55);
      if (autoToken.current !== token) return;
      applyMove(m.from, m.to, true);
      await sleep(step * 0.45);
    }
    if (autoToken.current === token) setAuto(false);
  };

  const rating = !solved ? '' : moves === optimal ? 'perfect' : moves <= optimal * 1.5 ? 'good' : 'ok';

  return (
    <div className="hg-game">
      <div className="viz-controls hg-controls">
        <label className="hg-label-inline">Disks</label>
        {[3, 4, 5, 6].map(v => (
          <button key={v} className={`viz-btn ${n === v ? 'primary' : ''}`} onClick={() => reset(v)}>{v}</button>
        ))}
        <span className="hg-sep" />
        <button className="viz-btn cyan" onClick={showHint} disabled={auto || solved}>💡 Hint</button>
        <button className="viz-btn" onClick={undo} disabled={auto || !history.length}>↶ Undo</button>
        <button className={`viz-btn ${auto ? 'danger' : 'green'}`} onClick={autoSolve} disabled={solved && !auto}>{auto ? '⏹ Stop' : '▶ Auto-solve'}</button>
        <button className="viz-btn" onClick={() => reset(n)}>🔄 Reset</button>
      </div>

      <div className="hg-stats">
        <span>Moves <b>{moves}</b></span>
        <span>Minimum <b>{optimal}</b></span>
        {best[n] !== undefined && <span>Your best <b>{best[n]}</b></span>}
        <span className="hg-goal">Goal: whole tower on <b>Peg C</b></span>
      </div>

      <HanoiBoard
        stacks={pegs}
        total={n}
        selected={selected}
        hintFrom={hint?.from ?? null}
        hintTo={hint?.to ?? null}
        shakePeg={shake}
        onPegClick={onPegClick}
        hiPeg={history.length ? history[history.length - 1].to : undefined}
        hiDisk={history.length ? pegs[history[history.length - 1].to][pegs[history[history.length - 1].to].length - 1] : undefined}
      />

      {solved ? (
        <div className={`hg-win hg-win-${rating}`}>
          <div className="hg-win-title">
            {usedAuto ? '🤖 Solved by auto-solve' : rating === 'perfect' ? '🏆 Perfect — the minimum possible!' : rating === 'good' ? '🎉 Solved — very close to perfect!' : '✅ Solved!'}
          </div>
          <div>
            {moves} move{moves === 1 ? '' : 's'} (minimum = 2<sup>{n}</sup> − 1 = {optimal}).
            {!usedAuto && rating !== 'perfect' && ' Try again and aim for the minimum — Hint shows the shortest path.'}
            {usedAuto && ' Reset and try it yourself!'}
          </div>
        </div>
      ) : (
        <div className={`hg-msg hg-msg-${msg.kind}`} role="status" aria-live="polite">{msg.text}</div>
      )}

      <div className="hg-rules">
        <b>Rules:</b> move one disk at a time · only the top disk of a peg can move · never put a bigger disk on a smaller one.
        <br /><b>Pattern:</b> to move n disks, move n−1 out of the way, move the biggest, then move the n−1 back on top — exactly the 3 lines of the recursive code below.
      </div>
    </div>
  );
}
