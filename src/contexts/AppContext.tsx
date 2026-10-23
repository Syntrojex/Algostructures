import React, { createContext, useContext, useState, useCallback } from 'react';

export interface TopicRef {
  group: string;
  sub: string;
}

// Every non-topic "special" page the footer/header can open. Adding a new
// info page (another legal/about-style page) only means adding one entry
// here plus one page component — no new booleans needed.
export type SpecialPage =
  | 'version-info'
  | 'about'
  | 'feedback'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'usage-terms'
  | null;

interface AppContextType {
  currentTopic: TopicRef | null;
  navigateTo: (group: string, sub: string) => void;
  goHome: () => void;
  showHome: boolean;
  homeClickVersion: number;
  specialPage: SpecialPage;
  openPage: (page: Exclude<SpecialPage, null>) => void;
  // Backward/convenience-compatible named openers + booleans for the two
  // pages that existed before the generic system (Header.tsx uses these).
  showVersionInfoPage: boolean;
  openVersionInfoPage: () => void;
}

const AppContext = createContext<AppContextType | null>(null);
// Bookmarks were removed. Clear the old key once so nothing stale is left in the browser.
try { localStorage.removeItem('algostructures_bookmarks'); } catch { /* storage unavailable — nothing to clear */ }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentTopic, setCurrentTopic] = useState<TopicRef | null>(null);
  const [showHome, setShowHome] = useState(true);
  const [homeClickVersion, setHomeClickVersion] = useState(0);
  const [specialPage, setSpecialPage] = useState<SpecialPage>(null);


  const navigateTo = useCallback((group: string, sub: string) => {
    setCurrentTopic({ group, sub });
    setShowHome(false);
    setSpecialPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => {
    setCurrentTopic(null);
    setShowHome(true);
    setSpecialPage(null);
    setHomeClickVersion(v => v + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openPage = useCallback((page: Exclude<SpecialPage, null>) => {
    setSpecialPage(page);
    setShowHome(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openVersionInfoPage = useCallback(() => openPage('version-info'), [openPage]);

  return (
    <AppContext.Provider value={{
      currentTopic, navigateTo, goHome, showHome, homeClickVersion,
      specialPage, openPage,
      showVersionInfoPage: specialPage === 'version-info', openVersionInfoPage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
