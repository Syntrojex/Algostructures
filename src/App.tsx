import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import BackgroundCanvas from './components/BackgroundCanvas';
import Header from './components/Header';
import BrowseDrawer from './components/BrowseDrawer';
import HomePage from './pages/HomePage';
import VizPage from './pages/VizPage';
import VersionInfoPage from './pages/VersionInfoPage';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import UsageTermsPage from './pages/UsageTermsPage';
import CodeStructuresPage from './pages/CodeStructuresPage';
import './index.css';

function FloatingParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 18 + 12,
    delay: Math.random() * 12,
    hue: [185, 270, 320, 45][Math.floor(Math.random() * 4)],
  }));
  return (
    <>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size, left: `${p.left}%`,
          background: `hsl(${p.hue}, 100%, 65%)`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </>
  );
}

function AppInner() {
  const { showHome, homeClickVersion, specialPage, openPage, goHome } = useApp();
  const [browseOpen, setBrowseOpen] = useState(false);

  // Full footer (link columns + socials) only belongs on the home page.
  // Every topic page / info page (bookmarks, docs, feedback, etc.) gets the
  // compact credit-line-only footer instead.
  const isHomeScreen = showHome && !specialPage;

  // Close the Browse drawer on every goHome() call — even when already on home
  useEffect(() => {
    setBrowseOpen(false);
  }, [homeClickVersion]);

  return (
    <>
      <BackgroundCanvas calm={!isHomeScreen} />
      <div className="grid-bg" />
      <FloatingParticles />

      <Header onBrowse={() => setBrowseOpen(o => !o)} browseOpen={browseOpen} />
      <BrowseDrawer open={browseOpen} onClose={() => setBrowseOpen(false)} />

      <div className="layout">
        <main className="main">
          {specialPage === 'version-info' ? (
            <VersionInfoPage />
          ) : specialPage === 'about' ? (
            <AboutPage />
          ) : specialPage === 'feedback' ? (
            <FeedbackPage />
          ) : specialPage === 'privacy-policy' ? (
            <PrivacyPolicyPage />
          ) : specialPage === 'terms-of-service' ? (
            <TermsOfServicePage />
          ) : specialPage === 'usage-terms' ? (
            <UsageTermsPage />
          ) : (
            <>
              <div style={{ display: showHome ? 'block' : 'none' }}><HomePage /></div>
              <div style={{ display: !showHome ? 'block' : 'none' }}><VizPage /></div>
            </>
          )}
        </main>
      </div>

      <footer className={`footer${isHomeScreen ? '' : ' footer-minimal'}`}>
        {isHomeScreen && (
          <div className="footer-top footer-top-4col">
            <div className="footer-brand">
              <span className="footer-logo">ALGO<span style={{ color: 'var(--ap)' }}>STRUCTURES</span></span>
              <span className="footer-tagline">See DSA Run — One Step at a Time</span>
            </div>

            <div>
              <div className="footer-col-title">Explore</div>
              <ul className="footer-col-links">
                <li><button onClick={goHome}>Home</button></li>
                <li><a href="/CodeStructures">Playground (CodeStructures) ↗</a></li>
                <li><button onClick={() => openPage('version-info')}>Version Info</button></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Resources</div>
              <ul className="footer-col-links">
                <li><a href="https://github.com/Syntrojex/Algostructures" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><button onClick={() => openPage('usage-terms')}>Usage Terms</button></li>
                <li><button onClick={() => openPage('feedback')}>Feedback</button></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Legal &amp; Support</div>
              <ul className="footer-col-links">
                <li><button onClick={() => openPage('privacy-policy')}>Privacy Policy</button></li>
                <li><button onClick={() => openPage('terms-of-service')}>Terms of Service</button></li>
                <li><button onClick={() => openPage('about')}>About</button></li>
              </ul>
            </div>
          </div>
        )}

        <div className="footer-bottom-bar">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Made with <span className="footer-heart">♥</span> by{' '}
            <strong style={{ color: 'var(--ac)' }}>Muhammad Mustafa Amir</strong>
          </p>
          {isHomeScreen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="footer-links">
                <a href="https://www.linkedin.com/in/mustafa-amir-syntrojex" className="footer-social" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://github.com/Syntrojex/Algostructures" className="footer-social" target="_blank" rel="noopener noreferrer" title="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
              <button
                className="footer-back-to-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to Top
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </button>
            </div>
          )}
        </div>
      </footer>
    </>
  );
}

export default function App() {
  // CodeStructures is a genuinely separate page — its own route, its own
  // minimal chrome — not a state flag inside the DSA site's Header/Sidebar/
  // Footer. Checked once on load (and via popstate, so browser back/forward
  // work) rather than pulled in through a full router: this app has exactly
  // one route outside the SPA's own internal state, so a router dependency
  // would be more machinery than the problem needs.
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (path.toLowerCase() === '/codestructures') {
    return <CodeStructuresPage />;
  }

  return <AppProvider><AppInner /></AppProvider>;
}
