import { ReactNode } from 'react';

interface InfoPageLayoutProps {
  icon: string;
  title: string;
  lastUpdated?: string;
  intro?: string;
  children: ReactNode;
}

/**
 * Shared layout for non-topic "info" pages: About, Documentation, Feedback,
 * Privacy Policy, Terms of Service, Usage Terms. Reuses the same
 * topic-page/topic-header-section/page-section shell every topic page
 * already uses, so these pages feel native to the site instead of bolted on.
 */
export default function InfoPageLayout({ icon, title, lastUpdated, intro, children }: InfoPageLayoutProps) {
  return (
    <div className="topic-page show">
      <div className="topic-header-section">
        <div className="topic-title">{icon} {title}</div>
        {intro && <div className="topic-desc">{intro}</div>}
        {lastUpdated && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: 'var(--tm)', marginTop: '6px' }}>
            Last updated: {lastUpdated}
          </div>
        )}
      </div>

      <div className="page-section info-page-body">
        {children}
      </div>
    </div>
  );
}
