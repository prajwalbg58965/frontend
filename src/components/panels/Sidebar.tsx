import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'trains', label: 'Live Trains', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'map', label: 'Track Map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { id: 'safety', label: 'Safety & Conflicts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'incidents', label: 'Incidents', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'analytics', label: 'ETA Analytics', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
  { id: 'confirmations', label: 'Confirmations', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

interface SidebarProps {
  activeId: string;
  onNavChange: (id: string) => void;
}

export function Sidebar({ activeId, onNavChange }: SidebarProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="w-56 lg:w-60 flex-shrink-0 flex flex-col bg-rail-panel border-r border-rail-border h-full z-10 font-sans shadow-lg">
      <div className="p-4 border-b border-rail-border/50 flex items-center gap-3 bg-rail-panelHover">
        <div className="w-8 h-8 rounded bg-rail-accent/20 border border-rail-accent/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-rail-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-rail-text tracking-wide leading-tight">RailSentinel</h1>
          <p className="text-[9px] font-mono text-rail-accent uppercase tracking-widest">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto scrollbar-hide">
        <div className="text-[10px] font-mono text-rail-textMuted uppercase tracking-wider mb-2 px-3">Main Navigation</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-rail-accent/15 text-rail-accent shadow-[inset_2px_0_0_0_#00f2fe]' 
                  : 'text-rail-textMuted hover:text-rail-text hover:bg-rail-bg/50'
              }`}
            >
              <svg className={`w-4 h-4 ${isActive ? 'text-rail-accent' : 'text-rail-textMuted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-rail-border/50 bg-rail-bg/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-rail-text">System Online</span>
        </div>
        <p className="text-[10px] font-mono text-rail-textMuted">Last synchronized:</p>
        <p className="text-xs font-mono text-rail-accent">{time}</p>
      </div>
    </aside>
  );
}