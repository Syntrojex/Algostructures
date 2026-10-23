import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { searchTopics, highlightMatch } from '../data/searchIndex';

interface HeaderProps {
  onBrowse: () => void;
  browseOpen: boolean;
}

export default function Header({ onBrowse, browseOpen }: HeaderProps) {
  const { navigateTo, goHome } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof searchTopics>>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback((v: string) => {
    setQuery(v);
    const res = searchTopics(v);
    setResults(res);
    setShowDrop(res.length > 0 || v.length > 0);
    setActiveIdx(-1);
  }, []);

  const handleSelect = useCallback((group: string, sub: string) => {
    navigateTo(group, sub);
    setQuery('');
    setResults([]);
    setShowDrop(false);
    inputRef.current?.blur();
  }, [navigateTo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDrop) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) handleSelect(results[activeIdx].group, results[activeIdx].sub);
    }
    else if (e.key === 'Escape') { setShowDrop(false); inputRef.current?.blur(); }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) && inputRef.current !== e.target) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="header">
      {/* Browse every visualizer (replaces the old sidebar) */}
      <button
        className={`browse-btn${browseOpen ? ' open' : ''}`}
        onClick={onBrowse}
        title="Browse all visualizers"
        aria-label="Browse all visualizers"
        aria-expanded={browseOpen}
      >
        <span className="browse-lines">
          <span className="stb-line" />
          <span className="stb-line stb-line-mid" />
          <span className="stb-line stb-line-short" />
        </span>
        <span className="browse-label">Browse</span>
      </button>

      <div className="logo" onClick={goHome}>
        ALGO<span style={{ color: 'var(--ap)' }}>STRUCTURES</span>
      </div>

      <button className="home-btn" onClick={goHome} title="Home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="17" height="17">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
          <polyline points="9 21 9 12 15 12 15 21"/>
        </svg>
        <span>Home</span>
      </button>

      {/* CodeStructures is a separate product/page (its own route), not an
          in-app state change — a real <a> so right-click/open-in-new-tab
          work, and a direct visit to /CodeStructures loads it correctly
          too (see the pathname check in App.tsx). */}
      <a className="home-btn codestructures-header-btn" href="/CodeStructures" title="CodeStructures">
        <span style={{ fontSize: '15px' }}>💻</span>
        <span>CodeStructures</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="12" height="12">
          <path d="M7 17L17 7M7 7h10v10"/>
        </svg>
      </a>

      {/* Header Search */}
      <div className="h-search">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search visualizers…"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowDrop(true)}
          autoComplete="off"
        />
        <div ref={dropRef} className={`search-dropdown ${showDrop && results.length > 0 ? 'show' : ''}`}>
          {results.length > 0 && (
            <>
              <div className="search-dropdown-header">{results.length} result{results.length > 1 ? 's' : ''}</div>
              {results.map((r, i) => (
                <div
                  key={r.sub}
                  className={`search-item ${i === activeIdx ? 'active' : ''}`}
                  onMouseDown={() => handleSelect(r.group, r.sub)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className="search-item-icon">{r.icon}</span>
                  <span
                    className="search-item-name"
                    dangerouslySetInnerHTML={{ __html: highlightMatch(r.name, query) }}
                  />
                  <span className="search-item-tag">{r.parent}</span>
                </div>
              ))}
            </>
          )}
          {showDrop && query.length > 0 && results.length === 0 && (
            <div className="search-no-results">No results for "{query}"</div>
          )}
        </div>
      </div>

      <div className="h-right">
        <span className="cpp-only-badge" title="Algostructures is C++ only">🔵 C++</span>
      </div>
    </header>
  );
}
