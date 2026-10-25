import { useEffect, useRef } from 'react';

interface Props {
  value: string;                        // kept as text so the field can be empty / half-typed
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  width?: number;
  placeholder?: string;
  ariaLabel?: string;
  onEnter?: () => void;
  invalid?: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Themed number field with ▲ ▼ buttons (same look as the Practice Questions “Go to #” box).
    Click for one step, hold to repeat, or use the ↑ ↓ keys. Replaces the browser's white spinner arrows. */
export default function NumberStepper({ value, onChange, min = -999999, max = 999999, step = 1, width = 78, placeholder, ariaLabel, onEnter, invalid }: Props) {
  const valRef = useRef(value);
  valRef.current = value;
  const timers = useRef<{ t?: ReturnType<typeof setTimeout>; i?: ReturnType<typeof setInterval> }>({});

  const bump = (dir: 1 | -1) => {
    const cur = parseInt(valRef.current, 10);
    const base = Number.isNaN(cur) ? (min > 0 ? min - dir * step : 0) : cur;
    const next = clamp(base + dir * step, min, max);
    valRef.current = String(next);
    onChange(String(next));
  };
  const stop = () => { clearTimeout(timers.current.t); clearInterval(timers.current.i); timers.current = {}; };
  const press = (dir: 1 | -1) => {
    stop();
    bump(dir);
    timers.current.t = setTimeout(() => { timers.current.i = setInterval(() => bump(dir), 70); }, 380);
  };
  useEffect(() => stop, []);

  const allowNeg = min < 0;
  const maxLen = String(Math.max(Math.abs(min), Math.abs(max))).length + (allowNeg ? 1 : 0);

  return (
    <div className={`ns${invalid ? ' ns-err' : ''}`} style={{ width }}>
      <input
        className="ns-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={e => {
          let v = e.target.value.replace(allowNeg ? /[^0-9-]/g : /[^0-9]/g, '');
          if (allowNeg) v = v.replace(/(?!^)-/g, '');
          onChange(v.slice(0, maxLen));
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowUp') { e.preventDefault(); bump(1); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); bump(-1); }
          else if (e.key === 'Enter' && onEnter) onEnter();
        }}
      />
      <div className="ns-btns">
        <button type="button" className="ns-btn" aria-label="Increase" tabIndex={-1}
          onMouseDown={e => { e.preventDefault(); press(1); }} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={e => { e.preventDefault(); press(1); }} onTouchEnd={stop} onClick={e => e.preventDefault()}>
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 5 L5 1 L9 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className="ns-btn" aria-label="Decrease" tabIndex={-1}
          onMouseDown={e => { e.preventDefault(); press(-1); }} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={e => { e.preventDefault(); press(-1); }} onTouchEnd={stop} onClick={e => e.preventDefault()}>
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
