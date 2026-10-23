import { useRef, useState } from 'react';

interface Item { id: number; value: string; }
type Kind = 'info' | 'ok' | 'error';
const CAPACITY = 10;
let itemId = 0;

export default function StackQueueVisualizer({ mode }: { mode: 'stack' | 'queue' }) {
  const isStack = mode === 'stack';
  const [items, setItems] = useState<Item[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [msg, setMsg] = useState<{ text: string; kind: Kind }>({
    text: isStack ? 'Stack (LIFO — last in, first out): type a value and press Push.' : 'Queue (FIFO — first in, first out): type a value and press Enqueue.',
    kind: 'info',
  });
  const [lastOp, setLastOp] = useState('');
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const say = (text: string, kind: Kind) => { setMsg({ text, kind }); if (kind === 'error') setShake(n => n + 1); };
  const edge = (arr: Item[]) => (isStack ? arr[arr.length - 1] : arr[0]);
  const name = isStack ? 'stack' : 'queue';

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) { say(`Type a value first (any number or word), or press 🎲 Random. Nothing was ${isStack ? 'pushed' : 'enqueued'}.`, 'error'); inputRef.current?.focus(); return; }
    if (v.length > 6) { say('Keep the value to 6 characters or fewer so it fits in the box.', 'error'); return; }
    if (items.length >= CAPACITY) { say(`The ${name} is FULL (capacity ${CAPACITY}) — ${isStack ? 'push' : 'enqueue'} fails. This is called overflow. ${isStack ? 'Pop' : 'Dequeue'} something first.`, 'error'); return; }
    setItems(prev => [...prev, { id: itemId++, value: v }]);
    say(isStack
      ? `push(${v}): the new element goes on TOP. Top is now ${v}.`
      : `enqueue(${v}): the new element joins the BACK. ${items.length ? `Front is still ${items[0].value}.` : `It is also the front, since the queue was empty.`}`, 'ok');
    setLastOp('add');
    setInputVal('');
  };

  const random = () => add(String(Math.floor(Math.random() * 99) + 1));

  const remove = () => {
    if (items.length === 0) {
      say(isStack
        ? 'Stack is EMPTY — nothing to pop. Popping an empty stack is called underflow (isEmpty() is true).'
        : 'Queue is EMPTY — nothing to dequeue. Dequeuing from an empty queue is called underflow (isEmpty() is true).', 'error');
      return;
    }
    const gone = edge(items);
    const rest = isStack ? items.slice(0, -1) : items.slice(1);
    setItems(rest);
    say(isStack
      ? `pop(): removed ${gone.value} from the TOP. ${rest.length ? `New top = ${rest[rest.length - 1].value}.` : 'The stack is empty now.'}`
      : `dequeue(): removed ${gone.value} from the FRONT. ${rest.length ? `New front = ${rest[0].value}.` : 'The queue is empty now.'}`, 'ok');
    setLastOp('remove');
  };

  const peek = () => {
    if (items.length === 0) { say(`The ${name} is EMPTY — there is nothing to peek at.`, 'error'); return; }
    say(isStack ? `peek(): the top element is ${edge(items).value} (it stays in the stack).` : `peek(): the front element is ${edge(items).value} (it stays in the queue).`, 'info');
  };

  const reset = () => { setItems([]); say(`The ${name} was cleared.`, 'info'); setLastOp(''); };

  return (
    <div className="viz-panel">
      <div className="viz-panel-title">{isStack ? '🥞 Stack (LIFO)' : '🚦 Queue (FIFO)'} Playground</div>

      <div className="viz-controls">
        <input
          ref={inputRef}
          className="viz-input"
          placeholder={isStack ? 'value to push' : 'value to enqueue'}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add(inputVal)}
          maxLength={8}
          style={{ width: '130px' }}
        />
        <button className="viz-btn cyan" onClick={() => add(inputVal)}>{isStack ? '⬆ Push' : '⬅ Enqueue'}</button>
        <button className="viz-btn" onClick={random} title="Add a random number">🎲 Random</button>
        <button className="viz-btn red" onClick={remove}>{isStack ? '⬇ Pop' : '➡ Dequeue'}</button>
        <button className="viz-btn green" onClick={peek}>👀 Peek</button>
        <button className="viz-btn" onClick={reset}>🔄 Reset</button>
      </div>

      <div className="viz-stats">
        <span>Size: <b>{items.length}</b> / {CAPACITY}</span>
        <span>{isStack ? 'Top' : 'Front'}: <b style={{ color: 'var(--ap)' }}>{items.length ? edge(items).value : 'N/A'}</b></span>
        <span>isEmpty(): <b style={{ color: items.length === 0 ? 'var(--ag)' : 'var(--ak)' }}>{items.length === 0 ? 'true' : 'false'}</b></span>
        <span>isFull(): <b style={{ color: items.length >= CAPACITY ? 'var(--ak)' : 'var(--ag)' }}>{items.length >= CAPACITY ? 'true' : 'false'}</b></span>
      </div>

      <div className="viz-stage" style={{ minHeight: '200px' }}>
        {isStack ? (
          <div className="stack-viz">
            <div style={{ width: '140px', height: '6px', background: 'rgba(0,245,255,0.3)', borderRadius: '3px', marginTop: '6px' }} />
            {items.map((item, i) => (
              <div key={item.id} className={`stack-item ${i === items.length - 1 ? 'top' : ''}`} style={{ animation: lastOp === 'add' && i === items.length - 1 ? 'stackIn 0.35s ease' : undefined, position: 'relative' }}>
                {item.value}
                {i === items.length - 1 && <span className="sq-tag right">← top</span>}
              </div>
            ))}
            {items.length === 0 && <span className="sq-empty">Stack is empty</span>}
          </div>
        ) : (
          <div className="queue-viz">
            {items.map((item, i) => (
              <div key={item.id} className={`queue-item ${i === 0 ? 'front' : ''} ${i === items.length - 1 ? 'back' : ''}`} style={{ position: 'relative' }}>
                {item.value}
                {i === 0 && <span className="sq-tag below">front</span>}
                {i === items.length - 1 && i !== 0 && <span className="sq-tag below">back</span>}
                {i === 0 && items.length === 1 && <span className="sq-tag below" style={{ top: 'calc(100% + 18px)' }}>back</span>}
              </div>
            ))}
            {items.length === 0 && <span className="sq-empty">Queue is empty</span>}
          </div>
        )}
      </div>

      <div key={shake} className={`viz-info sq-msg ${msg.kind}${msg.kind === 'error' ? ' shake' : ''}`} role="status" aria-live="polite">
        {msg.kind === 'error' ? '⚠ ' : ''}{msg.text}
      </div>

      <div className="viz-legend">
        {(isStack
          ? [{ c: 'var(--ap)', l: 'top (next to pop)' }, { c: 'var(--ac)', l: 'below top' }]
          : [{ c: 'var(--ag)', l: 'front (next out)' }, { c: 'var(--ao)', l: 'back (last in)' }]
        ).map(x => (
          <div key={x.l} className="legend-item"><div className="legend-dot" style={{ background: x.c }} /><span>{x.l}</span></div>
        ))}
      </div>
    </div>
  );
}
