import { lazy, Suspense } from 'react';
import { useApp } from '../contexts/AppContext';
import { PAGE_BY_KEY, GROUP_BY_KEY, pagesOf, type Spec, type VizPage as VizPageData } from '../data/registry';
import VizBoundary from '../components/VizBoundary';

// Every visualizer is its own chunk — a page only downloads the code it actually shows.
const ClassLab = lazy(() => import('../components/visualizers/ClassLab'));
const SortVisualizer = lazy(() => import('../components/visualizers/SortVisualizer'));
const DijkstraVisualizer = lazy(() => import('../components/visualizers/DijkstraVisualizer'));
const StackQueueVisualizer = lazy(() => import('../components/visualizers/StackQueueVisualizer'));
const DPVisualizer = lazy(() => import('../components/visualizers/DPVisualizer'));
const NQueensVisualizer = lazy(() => import('../components/visualizers/NQueensVisualizer'));
const BitVisualizer = lazy(() => import('../components/visualizers/BitVisualizer'));
const ArrayVisualizer = lazy(() => import('../components/visualizers/ArrayVisualizer'));
const GraphTraversalVisualizer = lazy(() => import('../components/visualizers/GraphTraversalVisualizer'));
const BinarySearchVisualizer = lazy(() => import('../components/visualizers/BinarySearchVisualizer'));
const ComplexityChart = lazy(() => import('../components/visualizers/ComplexityChart'));
const HanoiGame = lazy(() => import('../components/visualizers/HanoiGame'));
const PracticeQuestions = lazy(() => import('../components/PracticeQuestions'));
const SortingRace = lazy(() => import('../components/visualizers/SortingRace'));
const LinearSearchVisualizer = lazy(() => import('../components/visualizers/LinearSearchVisualizer'));
const PathfindingVisualizer = lazy(() => import('../components/visualizers/PathfindingVisualizer'));
const StackApps = lazy(() => import('../components/visualizers/StackApps'));


function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="page-section">
      {title && <div className="page-section-title">{title}</div>}
      {children}
    </div>
  );
}

function Body({ page, goTo }: { page: VizPageData; goTo: (group: string, sub: string) => void }) {
  const s: Spec = page.spec;
  switch (s.t) {
    case 'lab': return <Section><ClassLab labId={s.lab} /></Section>;
    case 'sort': return <Section><SortVisualizer algorithm={s.algo} /></Section>;
    case 'linsearch': return <Section><LinearSearchVisualizer /></Section>;
    case 'stackqueue': return <Section><StackQueueVisualizer mode={s.mode} /></Section>;
    case 'race': return <Section><SortingRace /></Section>;
    case 'pathfind': return <Section><PathfindingVisualizer /></Section>;
    case 'stackapp': return <Section><StackApps key={s.mode} mode={s.mode} /></Section>;
    case 'bsearch': return <Section><BinarySearchVisualizer /></Section>;
    case 'array': return <Section><ArrayVisualizer key={s.mode} modes={[s.mode]} /></Section>;
    case 'bfsdfs': return <Section><GraphTraversalVisualizer /></Section>;
    case 'dijkstra': return <Section><DijkstraVisualizer /></Section>;
    case 'dp': return <Section><DPVisualizer key={s.mode} mode={s.mode} /></Section>;
    case 'nqueens': return <Section><div className="viz-panel"><NQueensVisualizer /></div></Section>;
    case 'bit': return <Section><BitVisualizer key={s.modes[0]} modes={s.modes} /></Section>;
    case 'complexity': return <Section><ComplexityChart /></Section>;
    case 'practice': return <Section><PracticeQuestions /></Section>;
    case 'hanoi':
      return (
        <>
          <Section title="🎮 Play the Game">
            <VizBoundary key="hanoi-game" what="game"><HanoiGame /></VizBoundary>
          </Section>
          <div className="viz-hint-row">
            Want to watch the C++ code solve it — line by line, with the call stack and recursion tree?{' '}
            <button className="viz-link" onClick={() => goTo('recursion', 'recursion-visualizer')}>
              Open the Recursion Visualizer → pick “Tower of Hanoi”
            </button>
          </div>
        </>
      );
    default: return null;
  }
}

export default function VizPage() {
  const { currentTopic, navigateTo, goHome } = useApp();
  if (!currentTopic) return null;

  const page = PAGE_BY_KEY[currentTopic.sub];
  if (!page) {
    return (
      <div className="topic-page show viz-missing">
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <div className="viz-missing-title">That page is no longer here</div>
        <p>The site is now all visualizers — pick one from the home page.</p>
        <button className="viz-btn cyan" onClick={goHome}>Browse visualizers</button>
      </div>
    );
  }

  const group = GROUP_BY_KEY[page.group];
  const siblings = pagesOf(page.group);

  return (
    <div className="topic-page show">
      <div className="topic-header-section">
        <div className="topic-breadcrumb">
          <span className="viz-crumb" onClick={goHome}>Home</span> / <span>{group.icon} {group.name}</span>
        </div>
        <div className="topic-title-row">
          <div className="topic-title">{page.title}</div>
          {page.badge && <span className="viz-badge">{page.badge}</span>}
        </div>
        <div className="topic-desc">{page.blurb}</div>
      </div>

      {siblings.length > 1 && (
        <div className="viz-tabs" role="tablist" aria-label={`${group.name} visualizers`}>
          {siblings.map(p => (
            <button
              key={p.key}
              role="tab"
              aria-selected={p.key === page.key}
              className={`viz-tab${p.key === page.key ? ' active' : ''}${p.badge === 'Class Lab' ? ' lab' : ''}`}
              onClick={() => navigateTo(group.key, p.key)}
            >
              {p.badge === 'Class Lab' && <span className="viz-tab-ico">⚙️</span>}
              {p.title}
            </button>
          ))}
        </div>
      )}

      <VizBoundary key={page.key} what="visualizer">
        <Suspense fallback={<div className="viz-loading">Loading visualizer…</div>}>
          <Body page={page} goTo={navigateTo} />
        </Suspense>
      </VizBoundary>
    </div>
  );
}
