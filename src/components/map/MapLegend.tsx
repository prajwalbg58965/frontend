export function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
      <div className="panel p-3 shadow-panel min-w-[160px]">
        <div className="font-mono text-xs font-medium text-rail-text mb-2 uppercase tracking-wider">MAP LEGEND</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-white/70 rounded" />
            <span className="text-rail-textMuted">Railway Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-5 relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="10" r="5" stroke="#00d4aa" strokeWidth="2" fill="none" />
                <circle cx="8" cy="10" r="2.5" fill="#00d4aa" />
              </svg>
            </div>
            <span className="text-rail-textMuted">Coach / Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-5 relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 14H2L8 2Z" stroke="#ff4d4f" strokeWidth="2" fill="none" />
                <circle cx="8" cy="9" r="1.5" fill="#ff4d4f" />
              </svg>
            </div>
            <span className="text-rail-textMuted">Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-5 relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="12" height="9" rx="1" stroke="#1890ff" strokeWidth="2" fill="none" />
                <path d="M6 9h4M8 7v4" stroke="#1890ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-rail-textMuted">Responder</span>
          </div>
          <div className="pt-2 border-t border-rail-border flex items-center gap-2">
            <span className="w-6 h-1 bg-green-500/50 rounded" />
            <span className="text-rail-textMuted">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-1 bg-yellow-500/50 rounded" />
            <span className="text-rail-textMuted">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-1 bg-red-500/50 rounded" />
            <span className="text-rail-textMuted">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}