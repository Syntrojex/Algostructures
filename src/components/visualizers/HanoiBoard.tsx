// Shared Tower of Hanoi board — used by the Recursion lab (read-only) and the playable game.
// stacks[i] is bottom -> top; disk 1 is the smallest. The top disk is drawn at the top.
const DISK_COLORS = ['#00f5ff', '#00ff88', '#ffe600', '#ff6b35', '#ff2d78', '#bf5aff', '#00d4ff', '#7cff00'];

export interface HanoiBoardProps {
  stacks: number[][];
  names?: string[];
  total: number;                       // number of disks (sets disk widths and board height)
  hiDisk?: number;                     // disk that was just moved (glow)
  hiPeg?: number;                      // peg it landed on
  selected?: number | null;            // peg whose top disk is lifted (game)
  hintFrom?: number | null;
  hintTo?: number | null;
  shakePeg?: number | null;
  onPegClick?: (i: number) => void;    // makes the pegs clickable (game)
  compact?: boolean;
}

export default function HanoiBoard({
  stacks, names = ['A', 'B', 'C'], total, hiDisk, hiPeg, selected = null,
  hintFrom = null, hintTo = null, shakePeg = null, onPegClick, compact,
}: HanoiBoardProps) {
  const rodH = total * 24 + 36;
  return (
    <div className={`hg-board${compact ? ' hg-compact' : ''}`}>
      {stacks.map((peg, pi) => {
        const cls = [
          'hg-peg',
          onPegClick ? 'hg-clickable' : '',
          hiPeg === pi ? 'hg-landed' : '',
          selected === pi ? 'hg-selected' : '',
          hintFrom === pi ? 'hg-hint-from' : '',
          hintTo === pi ? 'hg-hint-to' : '',
          shakePeg === pi ? 'hg-shake' : '',
        ].filter(Boolean).join(' ');
        return (
          <div
            key={pi}
            className={cls}
            onClick={onPegClick ? () => onPegClick(pi) : undefined}
            role={onPegClick ? 'button' : undefined}
            aria-label={onPegClick ? `Peg ${names[pi]}, ${peg.length} disk${peg.length === 1 ? '' : 's'}` : undefined}
          >
            <div className="hg-stage" style={{ height: rodH }}>
              <div className="hg-rod" style={{ height: rodH - 4 }} />
              <div className="hg-disks">
                {peg.slice().reverse().map((disk, idx) => {
                  const isTop = idx === 0;
                  const lifted = selected === pi && isTop;
                  return (
                    <div
                      key={disk}
                      className={`hg-disk${lifted ? ' hg-lift' : ''}${hiDisk === disk && hiPeg === pi ? ' hg-hot' : ''}`}
                      style={{
                        width: `${28 + (disk / total) * 68}%`,
                        background: DISK_COLORS[(disk - 1) % DISK_COLORS.length],
                      }}
                    >
                      {disk}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hg-base" />
            <div className="hg-label">Peg {names[pi]}</div>
          </div>
        );
      })}
    </div>
  );
}
