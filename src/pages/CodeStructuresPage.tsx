import { useState } from 'react';
import BackgroundCanvas from '../components/BackgroundCanvas';

const STORAGE_KEY = 'codestructures-draft-v1';

const PLACEHOLDER = `#include <iostream>
using namespace std;

int main() {
    // Paste your own C++ code here.
    cout << "Hello, CodeStructures!" << endl;
    return 0;
}`;

export default function CodeStructuresPage() {
  // Purely local, so a refresh doesn't throw away what someone pasted —
  // this is just holding text, not the "working system" (parsing, running,
  // visualizing), which is explicitly not built yet.
  const [code, setCode] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? ''; }
    catch { return ''; }
  });

  const updateCode = (v: string) => {
    setCode(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* storage unavailable — fine, just no persistence */ }
  };

  return (
    <div className="cs-page">
      <BackgroundCanvas />

      <div className="cs-top-banner">
        Code Structures <span className="cs-top-banner-sep">—</span> A project of Algostructures
      </div>

      <header className="cs-header">
        <a href="/" className="cs-back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="15" height="15">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Algostructures
        </a>
        <div className="cs-logo">
          CODE<span style={{ color: 'var(--ap)' }}>STRUCTURES</span>
        </div>
        <span className="cs-beta-badge">EARLY PREVIEW</span>
      </header>

      <main className="cs-main">
        <section className="cs-hero">
          <h1>Paste your code. <span className="cs-accent">Watch it run.</span></h1>
          <p>
            CodeStructures takes the same line-by-line execution engine behind Algostructures'
            Class Labs — and points it at <strong>your own C++ code</strong>, not just the
            built-in examples.
          </p>
        </section>

        <section className="cs-workspace">
          <div className="cs-workspace-toolbar">
            <select disabled className="cs-fn-select" title="Function detection is coming soon">
              <option>Detected functions will appear here</option>
            </select>
            <button disabled className="cs-run-btn" title="Running code is coming soon">
              ▶ Run
            </button>
          </div>

          <div className="cs-workspace-grid">
            <div className="cs-editor-col">
              <div className="cs-col-label">Your Code</div>
              <textarea
                className="cs-editor"
                value={code}
                onChange={e => updateCode(e.target.value)}
                placeholder={PLACEHOLDER}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>

            <div className="cs-visualize-col">
              <div className="cs-col-label">Visualization</div>
              <div className="cs-visualize-placeholder">
                <div className="cs-visualize-icon">🛠️</div>
                <div className="cs-visualize-soon">Coming Soon</div>
              </div>
            </div>
          </div>
        </section>

        <div className="warn-box cs-coming-soon">
          <strong>Not released yet.</strong> CodeStructures has not launched — running and
          visualizing your own pasted code is under active development under the leadership of{' '}
          <strong>Syntrojex (Muhammad Mustafa Amir)</strong>. Automatic function detection,
          step-by-step execution, and the same animated diagrams you've seen in Class Lab are all
          on the way. For now, this page just holds your code — paste away, and it'll be waiting
          right here when the full experience goes live.
        </div>
      </main>

      <footer className="cs-footer">
        Part of the <a href="/">Algostructures</a> family — built with the same visualizer engine.
      </footer>
    </div>
  );
}
