import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { GROUPS, KIND_TITLES, pagesOf, PLAYGROUND_HREF, type GroupKind } from '../data/registry';

const ORDER: GroupKind[] = ['ds', 'algo', 'play', 'tool'];

/** Slide-in list of every visualizer. Opened from the ☰ Browse button; closes on pick, overlay click or Esc. */
export default function BrowseDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentTopic, navigateTo, goHome } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const pick = (group: string, sub: string) => { navigateTo(group, sub); onClose(); };

  return (
    <>
      <div className={`bd-overlay${open ? ' show' : ''}`} onClick={onClose} />
      <aside className={`bd-drawer${open ? ' open' : ''}`} aria-hidden={!open} aria-label="Browse visualizers">
        <div className="bd-head">
          <span>Browse visualizers</span>
          <button className="bd-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <button className="bd-home" onClick={() => { goHome(); onClose(); }}>🏠 Home — all categories</button>

        <div className="bd-scroll">
          {ORDER.map(kind => (
            <div key={kind} className="bd-kind">
              <div className="bd-kind-title">{KIND_TITLES[kind].title}</div>
              {GROUPS.filter(g => g.kind === kind).map(g => (
                <div key={g.key} className="bd-group">
                  <div className="bd-group-name">{g.icon} {g.name}</div>
                  <div className="bd-items">
                    {pagesOf(g.key).map(p => (
                      <button
                        key={p.key}
                        className={`bd-item${currentTopic?.sub === p.key ? ' active' : ''}${p.badge === 'Class Lab' ? ' lab' : ''}`}
                        onClick={() => pick(g.key, p.key)}
                      >
                        {p.badge === 'Class Lab' ? '⚙️ ' : ''}{p.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="bd-kind">
            <div className="bd-kind-title">Your own code</div>
            <a className="bd-item bd-playground" href={PLAYGROUND_HREF}>⌨️ Playground — paste your C++ <span className="bd-soon">early preview</span></a>
          </div>
        </div>
      </aside>
    </>
  );
}
