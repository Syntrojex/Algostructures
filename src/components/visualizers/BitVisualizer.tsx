import NumberStepper from '../NumberStepper';
import { useState, useMemo, useRef, useEffect } from 'react';

type BitOp = 'and' | 'or' | 'xor' | 'not' | 'lshift' | 'rshift' | 'setbit' | 'countbits';

interface BitVisualizerProps {
  // Which operation buttons to show — lets the same component serve different topic pages.
  modes: BitOp[];
}

const OP_LABELS: Record<BitOp, string> = {
  and: 'AND (&)', or: 'OR (|)', xor: 'XOR (^)', not: 'NOT (~)',
  lshift: 'Left Shift (<<)', rshift: 'Right Shift (>>)',
  setbit: 'Set Bit', countbits: 'Count Set Bits',
};

const BITS = 8;

function toBinary(n: number): string {
  return (n & 0xFF).toString(2).padStart(BITS, '0');
}

export default function BitVisualizer({ modes }: BitVisualizerProps) {
  const [op, setOp] = useState<BitOp>(modes[0]);
  const [aText, setAText] = useState(String(op === 'countbits' ? 173 : 45));
  const [bText, setBText] = useState('22');
  const [shiftText, setShiftText] = useState('2');
  const [bitPosText, setBitPosText] = useState('3');

  // Parsed numeric values used for computation — fall back to 0 while the
  // field is empty (mid-typing), without forcing the displayed text back to "0".
  const a = clamp(aText === '' ? 0 : parseInt(aText, 10) || 0, 0, 255);
  const b = clamp(bText === '' ? 0 : parseInt(bText, 10) || 0, 0, 255);
  const shiftAmt = clamp(shiftText === '' ? 0 : parseInt(shiftText, 10) || 0, 0, 7);
  const bitPos = clamp(bitPosText === '' ? 0 : parseInt(bitPosText, 10) || 0, 0, 7);

  function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

  // Only digits are allowed while typing; empty string is allowed so backspace can fully clear the field.
  // ── Step-by-step animation state ──
  const [revealed, setRevealed] = useState(BITS); // how many result bits are revealed, left to right
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const binA = toBinary(a);
  const binB = toBinary(b);

  const { resultBits, resultValue, highlightIdx } = useMemo(() => {
    const bitsA = binA.split('').map(Number);
    const bitsB = binB.split('').map(Number);
    let out: number[] = [];
    let value = 0;

    if (op === 'and') { out = bitsA.map((x, i) => x & bitsB[i]); value = a & b; }
    else if (op === 'or') { out = bitsA.map((x, i) => x | bitsB[i]); value = a | b; }
    else if (op === 'xor') { out = bitsA.map((x, i) => x ^ bitsB[i]); value = a ^ b; }
    else if (op === 'not') { out = bitsA.map(x => x ^ 1); value = (~a) & 0xFF; }
    else if (op === 'lshift') { value = (a << shiftAmt) & 0xFF; out = toBinary(value).split('').map(Number); }
    else if (op === 'rshift') { value = a >> shiftAmt; out = toBinary(value).split('').map(Number); }
    else if (op === 'setbit') { value = a | (1 << bitPos); out = toBinary(value).split('').map(Number); }
    else if (op === 'countbits') { out = bitsA; value = bitsA.reduce((s, x) => s + x, 0); }

    return { resultBits: out, resultValue: value, highlightIdx: op === 'setbit' ? BITS - 1 - bitPos : -1 };
  }, [op, a, b, shiftAmt, bitPos, binA, binB]);

  // Reset the animation whenever the operation or inputs change
  useEffect(() => {
    stop();
    setRevealed(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op, a, b, shiftAmt, bitPos]);

  function stop() {
    setRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function stepOnce(from: number) {
    if (from >= BITS) { setRunning(false); return; }
    timerRef.current = setTimeout(() => {
      setRevealed(from + 1);
      if (from + 1 < BITS) stepOnce(from + 1);
      else setRunning(false);
    }, speed);
  }

  function play() {
    if (revealed >= BITS) setRevealed(0);
    setRunning(true);
    stepOnce(revealed >= BITS ? 0 : revealed);
  }

  function pause() {
    stop();
  }

  function stepForward() {
    stop();
    setRevealed(r => Math.min(BITS, r + 1));
  }

  function stepBack() {
    stop();
    setRevealed(r => Math.max(0, r - 1));
  }

  function reset() {
    stop();
    setRevealed(0);
  }

  const needsB = op === 'and' || op === 'or' || op === 'xor';
  const needsShift = op === 'lshift' || op === 'rshift';
  const needsBitPos = op === 'setbit';

  // Running count of set bits among the currently-revealed positions (for Count Set Bits mode)
  const runningCount = op === 'countbits' ? resultBits.slice(0, revealed).reduce((s, x) => s + x, 0) : 0;

  const currentBitLabel = revealed < BITS ? `bit ${BITS - 1 - revealed} (position ${revealed} from the left)` : 'done';

  return (
    <div className="viz-panel bit-viz">
      <div className="viz-panel-title">🎬 Bit Manipulation Visualizer</div>

      <div className="bit-mode-tabs">
        {modes.map(m => (
          <button key={m} className={`bit-mode-tab ${op === m ? 'active' : ''}`} onClick={() => setOp(m)}>
            {OP_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="bit-controls">
        <label>
          A = <NumberStepper value={aText} onChange={setAText} min={0} max={255} width={92} placeholder="0-255" ariaLabel="A" />
        </label>
        {needsB && (
          <label>
            B = <NumberStepper value={bText} onChange={setBText} min={0} max={255} width={92} placeholder="0-255" ariaLabel="B" />
          </label>
        )}
        {needsShift && (
          <label>
            Shift by <NumberStepper value={shiftText} onChange={setShiftText} min={0} max={7} width={78} placeholder="0-7" ariaLabel="Shift" />
          </label>
        )}
        {needsBitPos && (
          <label>
            Bit position <NumberStepper value={bitPosText} onChange={setBitPosText} min={0} max={7} width={78} placeholder="0-7" ariaLabel="Bit position" />
          </label>
        )}
      </div>

      <div className="bit-play-controls">
        {!running ? (
          <button className="viz-btn" onClick={play}>▶ Play</button>
        ) : (
          <button className="viz-btn" onClick={pause}>⏸ Pause</button>
        )}
        <button className="viz-btn" onClick={stepBack} disabled={revealed === 0}>⏮ Prev</button>
        <button className="viz-btn" onClick={stepForward} disabled={revealed >= BITS}>Next ⏭</button>
        <button className="viz-btn" onClick={reset}>↺ Reset</button>
        <label className="bit-speed-label">
          Speed
          <input type="range" min={150} max={1000} step={50} value={1150 - speed} onChange={e => setSpeed(1150 - Number(e.target.value))} />
        </label>
      </div>

      <div className="bit-rows">
        <div className="bit-row">
          <span className="bit-row-label">A = {a}</span>
          <div className="bit-cells">
            {binA.split('').map((b2, i) => (
              <div key={i} className={`bit-cell ${i === revealed && revealed < BITS ? 'scanning' : ''}`}>{b2}</div>
            ))}
          </div>
        </div>
        {needsB && (
          <div className="bit-row">
            <span className="bit-row-label">B = {b}</span>
            <div className="bit-cells">
              {binB.split('').map((b2, i) => (
                <div key={i} className={`bit-cell ${i === revealed && revealed < BITS ? 'scanning' : ''}`}>{b2}</div>
              ))}
            </div>
          </div>
        )}
        <div className="bit-row bit-row-result">
          <span className="bit-row-label">
            {op === 'countbits' ? `Set bits = ${revealed >= BITS ? resultValue : runningCount}` : `Result = ${revealed >= BITS ? resultValue : '...'}`}
          </span>
          <div className="bit-cells">
            {resultBits.map((bit, i) => {
              const isRevealed = i < revealed;
              const isScanning = i === revealed && revealed < BITS;
              return (
                <div
                  key={i}
                  className={`bit-cell result ${isRevealed && bit === 1 ? 'on' : ''} ${i === highlightIdx ? 'highlight' : ''} ${op === 'countbits' && isRevealed && bit === 1 ? 'counted' : ''} ${isScanning ? 'scanning' : ''} ${!isRevealed ? 'pending' : ''}`}
                >
                  {isRevealed ? bit : '?'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bit-info">
        {revealed < BITS && `Computing ${currentBitLabel}... `}
        {op === 'and' && 'AND: a bit is 1 only when BOTH A and B have a 1 in that position.'}
        {op === 'or' && 'OR: a bit is 1 when EITHER A or B has a 1 in that position.'}
        {op === 'xor' && 'XOR: a bit is 1 when A and B DIFFER at that position (exactly one is 1).'}
        {op === 'not' && 'NOT: every bit is flipped — 0 becomes 1, and 1 becomes 0.'}
        {op === 'lshift' && `Left Shift: every bit moves left by ${shiftAmt}, zeros fill in from the right. Equivalent to multiplying by 2^${shiftAmt}.`}
        {op === 'rshift' && `Right Shift: every bit moves right by ${shiftAmt}, the value shrinks. Equivalent to dividing by 2^${shiftAmt} (integer division).`}
        {op === 'setbit' && `Set Bit: bit position ${bitPos} is forced to 1 using A | (1 << ${bitPos}), leaving every other bit unchanged.`}
        {op === 'countbits' && `Count Set Bits: counts how many bits are 1 — watch the running count increase as each bit is revealed.`}
      </div>
    </div>
  );
}
