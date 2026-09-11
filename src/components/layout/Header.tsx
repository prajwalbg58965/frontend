import { useEffect, useState } from 'react';
import { DemoControls, DemoTimelineIndicator } from '../../demo/DemoControls';

export function Header() {
  const [time, setTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="h-14 border-b border-rail-border bg-rail-panel/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
      <div className="max-w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-rail-accent flex-shrink-0">
            <svg className="w-5 h-5 text-rail-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-rail-text tracking-tight truncate">RailSentinel</h1>
            <p className="text-xs text-rail-textMuted truncate">Live ETA & Safety Prediction System</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rail-accent opacity-75" aria-hidden="true" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rail-accent" aria-hidden="true" />
            </span>
            <span className="text-rail-accent font-medium text-sm">LIVE MONITORING</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-border">
            <span className="w-4 h-4 flex items-center justify-center" aria-hidden="true">
              {connectionStatus === 'connected' && <span className="w-2 h-2 rounded-full bg-green-500" />}
              {connectionStatus === 'connecting' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
              {connectionStatus === 'disconnected' && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </span>
            <span className="font-mono text-xs text-rail-textMuted capitalize">{connectionStatus}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-border font-mono text-sm">
            <span className="w-4 text-center" aria-hidden="true">🕐</span>
            <span className="tabular-nums text-rail-text">{formatTime(time)} IST</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-border">
            <span className="text-xs text-rail-textMuted uppercase tracking-wider font-medium">SIH26028</span>
          </div>

          <DemoControls />
        </div>
      </div>
      <DemoTimelineIndicator />
    </header>
  );
}