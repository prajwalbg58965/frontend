import { useEffect, useState } from 'react';
import { DemoControls, DemoTimelineIndicator } from '../../demo/DemoControls';
import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useETAPredictionStatus } from '../../hooks/useEta';
import { useLivePositions } from '../../hooks/useLivePositions';
import { useRiskScore } from '../../hooks/useRisk';
import { useDemo } from '../../demo/DemoContext';
import { TrainSearchBar } from '../search/TrainSearchBar';
import { useTrain } from '../../context/TrainContext';

interface HeaderProps {
  onOpenPitchModal?: () => void;
}

export function Header({ onOpenPitchModal }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const { selectedTrainId } = useTrain();
  const { incidents, isError: isErrorIncident } = useIncidentAlertsStatus();
  const { isError: isErrorEta } = useETAPredictionStatus(selectedTrainId);
  const { isError: isErrorPositions } = useLivePositions(selectedTrainId);
  const { isError: isErrorRisk } = useRiskScore('hwh-kgp');
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
    <header className="border-b border-rail-border bg-rail-panel/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0 h-16 flex flex-col justify-center shadow-md">
      {hasActiveIncident && (
        <div className="absolute top-0 left-0 right-0 bg-rail-danger/90 text-white px-4 py-0.5 flex items-center justify-between text-[10px] font-mono animate-pulse z-50">
          <div className="flex items-center gap-2 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>🚨 INCIDENT MODE ACTIVE: CRITICAL SAFETY ALERT DETECTED ON ROUTE {selectedTrainId}</span>
          </div>
          <span className="hidden sm:inline-block opacity-90">Emergency Protocols Initiated • Rescue & Reunification Active</span>
        </div>
      )}

      <div className={`w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 ${hasActiveIncident ? 'mt-3' : ''}`}>
        
        {/* Left: Title & Logo */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          <div className={`flex items-center justify-center w-8 h-8 rounded shadow-lg ${hasActiveIncident ? 'bg-rail-danger text-white' : 'bg-rail-accent/10 text-rail-accent border border-rail-accent/30'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-sm font-bold text-rail-text tracking-wide truncate">RailSentinel Control Center</h1>
            <p className="text-[10px] font-mono text-rail-textMuted uppercase tracking-wider truncate">Operations & Safety Command</p>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-xl mx-auto flex justify-center">
          <TrainSearchBar />
        </div>

        {/* Right: Status & Profile */}
        <div className="flex items-center justify-end gap-4 w-1/4 min-w-0 flex-shrink-0">
          
          <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded border text-[10px] font-mono font-bold ${
            hasActiveIncident 
              ? 'bg-rail-danger/10 text-rail-danger border-rail-danger/30'
              : (isErrorEta || isErrorPositions || isErrorRisk || isErrorIncident)
              ? 'bg-rail-warning/10 text-rail-warning border-rail-warning/30'
              : 'bg-green-500/10 text-green-400 border-green-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasActiveIncident ? 'bg-rail-danger animate-ping' : (isErrorEta || isErrorPositions || isErrorRisk || isErrorIncident) ? 'bg-rail-warning animate-pulse' : 'bg-green-500'}`} />
            <span>{hasActiveIncident ? 'INCIDENT MODE' : (isErrorEta || isErrorPositions || isErrorRisk || isErrorIncident) ? 'DEGRADED' : 'SYSTEM ONLINE'}</span>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-rail-textMuted bg-rail-bg px-2 py-1 rounded border border-rail-border">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(time)}</span>
          </div>

          <button className="relative p-1.5 text-rail-textMuted hover:text-rail-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasActiveIncident && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rail-danger ring-2 ring-rail-panel" />}
          </button>

          <div className="w-7 h-7 rounded bg-rail-border flex items-center justify-center text-xs font-bold text-rail-text shadow-sm border border-rail-borderHover">
            AD
          </div>

        </div>
      </div>
      <DemoTimelineIndicator />
    </header>
  );
}