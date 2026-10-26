import React from 'react';
import { Maximize2, Minimize2, Eye } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { TabId } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentAccent,
    isZenMode,
    setIsZenMode,
    isFullscreen,
    toggleFullscreen,
  } = useDashboard();

  if (isZenMode) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsZenMode(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider text-neutral-400 hover:text-white bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 rounded-full transition-all"
          title="Exit Minimal Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Exit Zen</span>
        </button>
      </div>
    );
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'clock', label: 'Clock' },
    { id: 'timer', label: 'Timer' },
    { id: 'wallpapers', label: 'Wallpapers' },
    { id: 'settings', label: 'Clock Settings' },
  ];

  return (
    <header className="relative z-40 w-full max-w-4xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between gap-4 select-none">
      {/* Centered navigation tabs */}
      <nav className="flex items-center gap-1 p-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                color: isActive ? '#FFFFFF' : undefined,
                boxShadow: isActive ? `0 0 14px ${currentAccent.glow}` : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Fullscreen button */}
      <div className="flex items-center">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full bg-black/40 text-neutral-400 border border-white/10 hover:text-white hover:bg-black/60 transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
