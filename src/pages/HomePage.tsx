import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { searchTopics, highlightMatch } from '../data/searchIndex';
import { GROUPS, KIND_TITLES, PAGES, pagesOf, PLAYGROUND_HREF, type GroupKind } from '../data/registry';

/* ────────────────── Typing Title ────────────────── */
const ALGO_TEXT = 'ALGOSTRUCTURES';
const CHAR_DELAY = 65;   // ms per letter
const START_DELAY = 700; // ms pause before first letter

function TypingTitle() {
  const [count,   setCount]   = useState(0);
  const [started, setStarted] = useState(false);
  const [blink,   setBlink]   = useState(true);
  const done = count >= ALGO_TEXT.length;

  // Initial pause before typing begins
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), START_DELAY);
    return () => clearTimeout(t);
  }, []);

  // Type one letter at a time (only after start delay)
  useEffect(() => {
    if (!started || done) return;
    const t = setTimeout(() => setCount(c => c + 1), CHAR_DELAY);
    return () => clearTimeout(t);
  }, [count, done, started]);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), started && !done ? 180 : 530);
    return () => clearInterval(t);
  }, [done, started]);

  return (
    <span className="home-title-3d">
      <span className="grad-text">{ALGO_TEXT.slice(0, count)}</span>
      {!done && (
        <span className="title-cursor" style={{ opacity: blink ? 1 : 0 }}>|</span>
      )}
    </span>
  );
}

const CPP_SNIPPETS = [
  '#include<vector>', 'auto& it', 'template<T>', 'std::sort()',
  '*ptr', '::', 'nullptr', 'const&', 'pair<int,int>', 'cin >> n',
];

/* ── Floating C++ code snippets, only in the top empty zone above the cards ── */
function CodeSnippets() {
  const snippets = useMemo(() => {
    const leftItems  = CPP_SNIPPETS.filter((_, i) => i % 2 === 0);
    const rightItems = CPP_SNIPPETS.filter((_, i) => i % 2 !== 0);

    const makeSide = (items: string[], side: 'left' | 'right') =>
      items.map((text, idx) => ({
        text,
        /* distribute ONLY in top 5%–44% — cards start around 50% */
        top:   `${5 + idx * (39 / Math.max(items.length - 1, 1))}%`,
        left:  side === 'left'  ? `${1 + (idx % 2) * 2}%` : undefined,
        right: side === 'right' ? `${1 + (idx % 2) * 2}%` : undefined,
        dur:   `${18 + idx * 3}s`,
        delay: `${idx * 1.3}s`,
        opacity: 0.22 + (idx % 3) * 0.05,
        fontSize: `${0.62 + (idx % 2) * 0.06}rem`,
      }));

    return [...makeSide(leftItems, 'left'), ...makeSide(rightItems, 'right')];
  }, []);

  return (
    <>
      {snippets.map((s, i) => (
        <div
          key={i}
          className="home-snippet home-snippet-cpp"
          style={{
            top: s.top, left: s.left, right: s.right,
            animationDuration: `${s.dur}, 3.5s`, animationDelay: s.delay,
            opacity: s.opacity, fontSize: s.fontSize,
            zIndex: 1, pointerEvents: 'none',
          }}
        >
          {s.text}
        </div>
      ))}
    </>
  );
}

const HINT_CYCLES = [
  'Try "bubble sort"', 'Try "dijkstra"', 'Try "hanoi"', 'Try "linked list"',
  'Try "recursion"', 'Try "bst"', 'Try "knapsack"', 'Try "heap"', 'Try "binary search"',
];


/* ────────────────── C++ edition badge ────────────────── */
function CppLogo() {
  return (
    <svg viewBox="0 0 64 64" fill="none" width="80" height="80" className="home-lang-logo-svg">
      <polygon points="32,4 56,17 56,47 32,60 8,47 8,17" fill="url(#cppFill)" opacity="0.12" />
      <polygon points="32,4 56,17 56,47 32,60 8,47 8,17" fill="none" stroke="url(#cppStroke)" strokeWidth="2.5" />
      <text x="32" y="37" textAnchor="middle" dominantBaseline="middle"
        fontFamily="'JetBrains Mono', monospace" fontWeight="900" fontSize="15" fill="url(#cppStroke)">
        C++
      </text>
      <defs>
        <linearGradient id="cppFill" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f5ff"/>
          <stop offset="100%" stopColor="#0090cc"/>
        </linearGradient>
        <linearGradient id="cppStroke" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f5ff"/>
          <stop offset="100%" stopColor="#00c8ff"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function CppBadge() {
  return (
    <div className="home-lang-badge home-lang-badge-cpp">
      <div className="home-badge-ring home-badge-ring-1 home-badge-ring-cpp" />
      <div className="home-badge-ring home-badge-ring-2 home-badge-ring-cpp" />
      <div className="home-badge-logo-wrap">
        <CppLogo />
        <div className="home-badge-logo-glow home-badge-logo-glow-cpp" />
      </div>
      <div className="home-badge-tag home-badge-tag-cpp">
        <span className="home-badge-dot home-badge-dot-cpp" />
        C++ EDITION
        <span className="home-badge-dot home-badge-dot-cpp" />
      </div>
    </div>
  );
}

/* ────────────────── Main HomePage ────────────────── */
export default function HomePage() {
  const { navigateTo, homeClickVersion } = useApp();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<ReturnType<typeof searchTopics>>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [hint, setHint]         = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;
    const next = () => { setHint(HINT_CYCLES[idx % HINT_CYCLES.length]); idx++; };
    next();
    const t = setInterval(next, 2800);
    return () => clearInterval(t);
  }, []);

  const handleInput = useCallback((v: string) => {
    setQuery(v);
    const res = searchTopics(v);
    setResults(res);
    setShowDrop(v.length > 0 && res.length > 0);
    setActiveIdx(-1);
  }, []);

  const handleSelect = useCallback((group: string, sub: string) => {
    navigateTo(group, sub);
    setQuery('');
    setShowDrop(false);
  }, [navigateTo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDrop) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault(); handleSelect(results[activeIdx].group, results[activeIdx].sub);
    }
    else if (e.key === 'Escape') setShowDrop(false);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) && inputRef.current !== e.target)
        setShowDrop(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="home-page home-page-cpp">

      {/* CRT scan line */}
      <div className="home-scan-line" />

      {/* Floating C++ code words — only in top empty zone, above cards */}
      <CodeSnippets />

      {/* C++ edition badge */}
      <CppBadge />

      {/* Animated tag */}
      <div className="home-tag">⚡ INTERACTIVE DSA VISUALIZERS</div>

      {/* 3D Title with Typing Effect — remounts on every home click */}
      <h1 className="home-title">
        <TypingTitle key={homeClickVersion} />
        <br />
        <span className="home-subtitle">See DSA Run — One Step at a Time</span>
      </h1>

      <p className="home-sub">
        Run real C++ line by line · step forward and back · use your own input
        <br />Data structures, algorithms and games — all visual
      </p>

      {/* Hero Search */}
      <div className="hero-search-wrap">
        <span className="hero-search-icon">🔍</span>
        <input
          ref={inputRef}
          className="hero-search-input"
          type="text"
          placeholder="Search algorithms, data structures..."
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setShowDrop(true)}
          autoComplete="off"
        />
        <div ref={dropRef} className={`hero-search-dropdown ${showDrop ? 'show' : ''}`}>
          {results.length > 0 && (
            <>
              <div className="search-dropdown-header">{results.length} results</div>
              {results.map((r, i) => (
                <div
                  key={r.sub}
                  className={`search-item ${i === activeIdx ? 'active' : ''}`}
                  onMouseDown={() => handleSelect(r.group, r.sub)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className="search-item-icon">{r.icon}</span>
                  <span className="search-item-name" dangerouslySetInnerHTML={{ __html: highlightMatch(r.name, query) }} />
                  <span className="search-item-tag">{r.parent}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="hero-search-hint">
        <span style={{ opacity: 0.6 }}>{hint}</span>
        <span style={{ color: 'var(--ac)', marginLeft: '6px', fontSize: '0.65rem' }}>↑↓ navigate · Enter select</span>
      </div>

      {/* Categories */}
      {(['ds', 'algo', 'play', 'tool'] as GroupKind[]).map(kind => (
        <section key={kind} className="home-section">
          <div className="home-section-head">
            <h2>{KIND_TITLES[kind].title}</h2>
            <span>{KIND_TITLES[kind].sub}</span>
          </div>
          <div className="viz-grid">
            {GROUPS.filter(g => g.kind === kind).map((g, i) => {
              const pages = pagesOf(g.key);
              return (
                <div key={g.key} className="viz-card glow-border" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="viz-card-top" onClick={() => navigateTo(g.key, pages[0].key)}>
                    <span className="viz-card-icon">{g.icon}</span>
                    <div>
                      <div className="viz-card-name">{g.name}</div>
                      <div className="viz-card-blurb">{g.blurb}</div>
                    </div>
                  </div>
                  <div className="viz-card-chips">
                    {pages.map(p => (
                      <button key={p.key} className={`viz-chip${p.badge === 'Class Lab' ? ' lab' : ''}`} onClick={() => navigateTo(g.key, p.key)}>
                        {p.badge === 'Class Lab' ? '⚙️ ' : ''}{p.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {kind === 'tool' && (
              <a className="viz-card glow-border viz-card-playground" href={PLAYGROUND_HREF}>
                <div className="viz-card-top">
                  <span className="viz-card-icon">⌨️</span>
                  <div>
                    <div className="viz-card-name">Playground <span className="bd-soon">early preview</span></div>
                    <div className="viz-card-blurb">Paste your own C++ code. Running and visualizing it is coming soon.</div>
                  </div>
                </div>
              </a>
            )}
          </div>
        </section>
      ))}

      <div className="home-count">{PAGES.length} visualizers · C++ · free</div>
    </div>
  );
}
