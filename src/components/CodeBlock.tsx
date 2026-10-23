import { useState, useEffect } from 'react';
import { highlightCode } from '../utils/highlight';

interface CodeBlockProps {
  codeCpp: string;
  filename?: string;
  topicKey?: string;
}

export default function CodeBlock({ codeCpp, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState('');

  const fname = filename ? filename + '.cpp' : 'solution.cpp';

  useEffect(() => {
    setHighlighted(highlightCode(codeCpp));
  }, [codeCpp]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeCpp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([codeCpp], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <div className="code-dots">
          <div className="code-dot" />
          <div className="code-dot" />
          <div className="code-dot" />
        </div>
        <span className="code-filename">{fname}</span>
        <div className="code-btns">
          <button className="code-btn" onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button className="code-btn" onClick={handleDownload}>
            ⬇ .cpp
          </button>
        </div>
      </div>
      <pre>
        <code
          className="language-cpp"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
