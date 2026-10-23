import { useState, useRef, useEffect } from 'react';

export default function NQueensVisualizer() {
  const [n, setN] = useState(4);
  const [board, setBoard] = useState<boolean[][]>(() => Array(4).fill(null).map(() => Array(4).fill(false)));
  const [attacked, setAttacked] = useState<boolean[][]>(() => Array(4).fill(null).map(() => Array(4).fill(false)));
  const [info, setInfo] = useState('Solve 4-Queens problem. Queens cannot attack each other.');
  const [solving, setSolving] = useState(false);
  // Same run-token pattern as HanoiViz: stops a stale in-flight solve() cleanly
  // when the user changes N or hits Reset mid-animation, instead of letting an
  // abandoned backtracking recursion keep mutating the board in the background.
  const runToken = useRef(0);

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const isSafe = (b: boolean[][], row: number, col: number, size: number): boolean => {
    for (let i = 0; i < row; i++) {
      if (b[i][col]) return false;
      if (col - (row - i) >= 0 && b[i][col - (row - i)]) return false;
      if (col + (row - i) < size && b[i][col + (row - i)]) return false;
    }
    return true;
  };

  const getAttacked = (b: boolean[][], size: number): boolean[][] => {
    const atk: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      if (!b[r][c]) continue;
      for (let i = 0; i < size; i++) {
        atk[r][i] = true; atk[i][c] = true;
        const dr = i - r;
        if (c + dr >= 0 && c + dr < size) atk[i][c + dr] = true;
        if (c - dr >= 0 && c - dr < size) atk[i][c - dr] = true;
      }
    }
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (b[r][c]) atk[r][c] = false;
    return atk;
  };

  useEffect(() => () => { runToken.current++; }, []);

  const solve = async () => {
    const myToken = ++runToken.current;
    const size = n;
    setSolving(true);
    const b: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    setBoard(b.map(r => [...r])); setAttacked(Array(size).fill(null).map(() => Array(size).fill(false)));
    setInfo('Starting backtracking...');
    await delay(400);
    if (runToken.current !== myToken) return;

    const bt = async (row: number): Promise<boolean> => {
      if (runToken.current !== myToken) return true; // abandoned — stop recursing, don't touch state further
      if (row === size) return true;
      for (let col = 0; col < size; col++) {
        if (runToken.current !== myToken) return true;
        setInfo(`Row ${row}: Trying column ${col}...`);
        if (isSafe(b, row, col, size)) {
          b[row][col] = true;
          setBoard(b.map(r => [...r]));
          setAttacked(getAttacked(b, size));
          await delay(450);
          if (runToken.current !== myToken) return true;
          if (await bt(row + 1)) return true;
          b[row][col] = false;
          if (runToken.current !== myToken) return true;
          setBoard(b.map(r => [...r]));
          setAttacked(getAttacked(b, size));
          setInfo(`Backtrack! Column ${col} in row ${row} causes conflict.`);
          await delay(300);
          if (runToken.current !== myToken) return true;
        }
      }
      return false;
    };

    const found = await bt(0);
    if (runToken.current === myToken) {
      setSolving(false);
      setInfo(found ? `✅ Solved ${size}-Queens! ${size} queens placed with no conflicts.` : `No solution for ${size} queens on ${size}×${size} board.`);
    }
  };

  const reset = () => {
    runToken.current++;
    setSolving(false);
    setBoard(Array(n).fill(null).map(() => Array(n).fill(false)));
    setAttacked(Array(n).fill(null).map(() => Array(n).fill(false)));
    setInfo(`Click Solve to find a solution for ${n}-Queens.`);
  };

  const changeN = (newN: number) => {
    runToken.current++; // invalidate any in-flight solve() for the old N
    setN(newN);
    setBoard(Array(newN).fill(null).map(() => Array(newN).fill(false)));
    setAttacked(Array(newN).fill(null).map(() => Array(newN).fill(false)));
    setSolving(false);
    setInfo(`Click Solve to find a solution for ${newN}-Queens.`);
  };

  return (
    <div>
      <div className="viz-panel-title" style={{ marginBottom: '12px' }}>♛ N-Queens Backtracking</div>
      <div className="viz-controls" style={{ marginBottom: '12px' }}>
        <label style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--tm)' }}>N =</label>
        {[4, 5, 6, 7, 8].map(v => (
          <button key={v} className={`viz-btn ${n === v ? 'primary' : ''}`} onClick={() => changeN(v)} style={{ padding: '4px 10px' }}>{v}</button>
        ))}
        <button className="viz-btn cyan" onClick={solve} disabled={solving}>▶ Solve</button>
        <button className="viz-btn" onClick={reset}>🔄 Reset</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div className="queens-grid" style={{ gridTemplateColumns: `repeat(${n}, ${Math.min(44, 280/n)}px)`, gridTemplateRows: `repeat(${n}, ${Math.min(44, 280/n)}px)` }}>
          {board.map((row, r) => row.map((hasQueen, c) => {
            const isLight = (r + c) % 2 === 0;
            const isAtk = attacked[r]?.[c];
            return (
              <div
                key={`${r}-${c}`}
                className={`queens-cell ${hasQueen ? 'queen' : isAtk ? 'attack' : isLight ? 'light' : 'dark'}`}
                style={{ width: Math.min(44, 280/n), height: Math.min(44, 280/n), fontSize: `${Math.min(22, 140/n)}px` }}
              >
                {hasQueen ? '♛' : ''}
              </div>
            );
          }))}
        </div>
      </div>
      <div className="viz-info" style={{ marginTop: 0 }}>{info}</div>
    </div>
  );
}
