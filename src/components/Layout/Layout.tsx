import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { InfoPanel } from './InfoPanel';
import { Viewport } from '../Viewport/Viewport';
import { ShortcutsOverlay } from './ShortcutsOverlay';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden relative" style={{ background: '#070b14' }}>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:flex md:flex-col md:h-full md:flex-shrink-0" style={{ width: 280 }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)' }}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full z-50 md:hidden flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 280 }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main viewport */}
      <div className="flex-1 relative overflow-hidden" style={{ minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2 py-1 md:hidden"
          style={{ background: 'rgba(15,22,35,0.85)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-2 py-1 rounded text-xs text-slate-400 border border-slate-700 bg-slate-800/80"
          >
            ☰ Menu
          </button>
          <span className="text-xs text-slate-400 font-mono">Airflow 3D</span>
          <button
            onClick={() => setInfoPanelOpen((v) => !v)}
            className="px-2 py-1 rounded text-xs text-slate-400 border border-slate-700 bg-slate-800/80"
          >
            📊
          </button>
        </div>

        <Viewport />
      </div>

      {/* Desktop info panel */}
      <div className="hidden md:flex md:flex-col md:h-full md:flex-shrink-0" style={{ width: 260 }}>
        <InfoPanel />
      </div>

      {/* Mobile info panel drawer (from right) */}
      {infoPanelOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setInfoPanelOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)' }}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full z-50 md:hidden flex flex-col overflow-y-auto transition-transform duration-200 ${
          infoPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 260 }}
      >
        <InfoPanel />
      </div>

      <ShortcutsOverlay />
    </div>
  );
}
