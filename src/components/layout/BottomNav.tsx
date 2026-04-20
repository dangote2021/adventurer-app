'use client';

import { useStore, Page } from '@/lib/store';
import { t } from '@/lib/i18n';

interface Tab {
  id: Page;
  key: string;
  icon: string;
  activeIcon: string;
}

const tabs: Tab[] = [
  { id: 'home', key: 'nav.home', icon: '🏠', activeIcon: '🏡' },
  { id: 'map', key: 'nav.map', icon: '🗺️', activeIcon: '🗺️' },
  { id: 'explore', key: 'nav.explore', icon: '🔍', activeIcon: '🔎' },
  { id: 'messages', key: 'nav.messages', icon: '💬', activeIcon: '💬' },
  { id: 'profile', key: 'nav.profile', icon: '👤', activeIcon: '👤' },
];

export default function BottomNav() {
  const { currentPage, setPage, language } = useStore();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg)] border-t border-white/10 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-40"
      role="navigation"
      aria-label="Navigation principale"
    >
      {tabs.map((tab) => {
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={t(tab.key, language)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              isActive ? 'text-[var(--accent)]' : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setPage(tab.id)}
            tabIndex={isActive ? 0 : -1}
          >
            <span className="text-xl" aria-hidden="true">
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span className={`text-xs font-medium ${isActive ? 'text-[var(--accent)]' : 'text-gray-500'}`}>
              {t(tab.key, language)}
            </span>
            {isActive && <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full mt-0.5" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
