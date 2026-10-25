import { useEffect, useMemo, useState } from 'react';
import { highlightCode } from '../utils/highlight';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  filename: string;
  code: string;
}

/** Side panel with the C++ source of a visualizer: Copy, Download (.cpp) and Close. */
export default function CodeDrawer({ open, onClose, title, filename, code }: Props) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => highlightCode(code).split('\n'), [code]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  useEffect(() => { setCopied(false); }, [code, open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');           // fallback for browsers without the clipboard API
      ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/x-c++src' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <>
      <div className={`cd-overlay${open ? ' show' : ''}`} onClick={onClose} />
      <aside className={`cd-drawer${open ? ' open' : ''}`} aria-hidden={!open} aria-label="C++ code">
        <div className="cd-head">
          <div className="cd-title">
            <span className="cd-ico">{'</>'}</span>
            <div>
              <div className="cd-name">C++ code — {title}</div>
              <div className="cd-file">{filename} · {lines.length} lines</div>
            </div>
          </div>
          <div className="cd-actions">
            <button className="viz-btn cyan" onClick={copy}>{copied ? '✓ Copied' : '📋 Copy'}</button>
            <button className="viz-btn green" onClick={download}>⬇ Download</button>
            <button className="cd-close" onClick={onClose} aria-label="Close code panel" title="Close">✕</button>
          </div>
        </div>
        <div className="cd-body">
          {lines.map((html, i) => (
            <div className="cd-line" key={i}>
              <span className="cd-ln">{i + 1}</span>
              <code dangerouslySetInnerHTML={{ __html: html || ' ' }} />
            </div>
          ))}
        </div>
        <div className="cd-foot">Compile &amp; run: <code>g++ -std=c++17 {filename} -o app &amp;&amp; ./app</code></div>
      </aside>
    </>
  );
}
