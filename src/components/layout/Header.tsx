import { useEffect, useState } from 'react';
import { DemoControls, DemoTimelineIndicator } from '../../demo/DemoControls';
import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useDemo } from '../../demo/DemoContext';

interface HeaderProps {
  onOpenPitchModal?: () => void;
}

export function Header({ onOpenPitchModal }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const { incidents } = useIncidentAlertsStatus();
  const { state } = useDemo();

  const isDemoIncident = ['INCIDENT_TRIGGERED', 'INCIDENT_RESPONSE', 'REUNIFICATION'].includes(state.currentPhase);
  const hasActiveIncident = (incidents && incidents.length > 0) || isDemoIncident;

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="border-b border-rail-border bg-rail-panel/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
      {/* Active Incident Alert Banner */}
      {hasActiveIncident && (
        <div className="bg-red-600/90 text-white px-4 py-1 flex items-center justify-between text-xs font-mono animate-pulse">
          <div className="flex items-center gap-2 font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>🚨 INCIDENT MODE ACTIVE: CRITICAL SAFETY ALERT DETECTED ON ROUTE 12841</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] opacity-90">
            Emergency Protocols Initiated • Rescue & Reunification Active
          </span>
        </div>
      )}

      <div className="max-w-full h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Logo and Title */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 shadow-lg ${hasActiveIncident ? 'bg-red-500 text-white' : 'bg-rail-accent text-rail-bg'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-rail-text tracking-tight truncate">RailSentinel</h1>
              <span className="badge badge-blue text-[10px] uppercase font-mono">SIH26028</span>
            </div>
            <p className="text-[11px] text-rail-textMuted truncate">Live ETA & Safety Prediction System</p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium ${
            hasActiveIncident 
              ? 'bg-red-500/20 text-red-400 border-red-500/40'
              : 'bg-green-500/10 text-green-400 border-green-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasActiveIncident ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
            <span>{hasActiveIncident ? 'INCIDENT MODE' : 'SYSTEM OPERATIONAL'}</span>
          </div>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-border font-mono text-xs text-rail-text">
            <span>🕐</span>
            <span className="tabular-nums">{formatTime(time)} IST</span>
          </div>

          {/* Pitch & Case Study Button */}
          {onOpenPitchModal && (
            <button
              onClick={onOpenPitchModal}
              className="btn bg-rail-accent/10 hover:bg-rail-accent/20 text-rail-accent border border-rail-accent/30 text-xs px-3 py-1 flex items-center gap-1.5 font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Balasore Case & Pitch</span>
            </button>
          )}

          {/* Demo Controls Bar */}
          <DemoControls />
        </div>
      </div>
      <DemoTimelineIndicator />
    </header>
  );
}