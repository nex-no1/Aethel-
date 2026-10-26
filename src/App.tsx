/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { BackgroundLayer } from './components/BackgroundLayer';
import { Navbar } from './components/Navbar';
import { ClockTab } from './components/ClockTab';
import { TimerTab } from './components/TimerTab';
import { WallpapersTab } from './components/WallpapersTab';
import { ClockSettingsTab } from './components/ClockSettingsTab';

const DashboardContent: React.FC = () => {
  const { activeTab } = useDashboard();

  return (
    <div className="relative min-h-screen text-neutral-100 flex flex-col font-jakarta selection:bg-neutral-800 selection:text-white">
      {/* Looping Aesthetic Muted Video Background Layer */}
      <BackgroundLayer />

      {/* Minimal Top Bar Navigation: [Clock] [Timer] [Wallpapers] [Clock Settings] */}
      <Navbar />

      {/* Main View Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {activeTab === 'clock' && <ClockTab />}
        {activeTab === 'timer' && <TimerTab />}
        {activeTab === 'wallpapers' && <WallpapersTab />}
        {activeTab === 'settings' && <ClockSettingsTab />}
      </main>

      {/* Subtle gold creator mark */}
      <footer className="fixed bottom-3 right-4 z-40 select-none pointer-events-none">
        <span className="text-xs font-mono tracking-wider text-[#E5B869] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] opacity-90">
          created by Nex`
        </span>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
