import React from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   VizBoundary
   --------------------------------------------------------------------------
   React unmounts the ENTIRE tree when a render throws and nothing catches it.
   That is how a single bad visualizer took the sidebar, header and page with
   it — the screen went blank and it looked like "the sidebar broke", when the
   sidebar was never the problem.

   Every visualizer and class lab renders inside one of these now. If one of
   them throws, only that panel is replaced with a readable message; the rest
   of the site keeps working.

   Give it a `key` that changes with the topic so a recovered boundary resets
   when the user navigates somewhere else.
   ────────────────────────────────────────────────────────────────────────── */

interface Props { children: React.ReactNode; what?: string }
interface State { error: Error | null }

export default class VizBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep the real stack in the console for debugging — the UI stays calm.
    console.error('[VizBoundary] ' + (this.props.what || 'component') + ' crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="viz-panel">
        <div style={{ padding: '26px', textAlign: 'center', fontFamily: 'Rajdhani', color: 'var(--ts)' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: 'var(--ao)', marginBottom: '8px' }}>
            This {this.props.what || 'component'} hit an error
          </div>
          <p style={{ color: 'var(--tm)' }}>
            The rest of the page still works — only this panel is affected.
          </p>
          <button
            className="viz-btn"
            style={{ marginTop: '12px' }}
            onClick={() => this.setState({ error: null })}
          >
            🔄 Try again
          </button>
          <pre
            style={{
              marginTop: '14px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--tm)',
              background: 'var(--bgc)', border: '1px solid var(--br)', borderRadius: '8px',
              padding: '10px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}
