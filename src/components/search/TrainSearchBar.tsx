import { useState, useRef, useEffect } from 'react';
import { useTrain, POPULAR_TRAINS, TrainInfo } from '../../context/TrainContext';

export function TrainSearchBar() {
  const { selectedTrainId, setSelectedTrainId, getTrainInfo } = useTrain();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTrain = getTrainInfo(selectedTrainId);

  // Filter matching trains
  const matches = POPULAR_TRAINS.filter((t) => {
    const q = query.toLowerCase().trim();
    return (
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.route.toLowerCase().includes(q) ||
      t.origin.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q)
    );
  });

  const isCustomNumber =
    query.trim().length >= 3 &&
    !POPULAR_TRAINS.some((t) => t.id.toLowerCase() === query.trim().toLowerCase());

  const handleSelectTrain = (id: string) => {
    setSelectedTrainId(id);
    setQuery('');
    setIsOpen(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    if (matches.length > 0 && selectedIndex < matches.length) {
      handleSelectTrain(matches[selectedIndex].id);
    } else {
      handleSelectTrain(clean);
    }
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Ctrl+K or / to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3 pointer-events-none text-rail-accent/80 flex items-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          placeholder="Search train # or name (e.g. 12841, Coromandel)..."
          className="w-full pl-9 pr-24 py-1.5 bg-rail-bg/90 border border-rail-border hover:border-rail-accent/50 focus:border-rail-accent rounded-lg text-xs text-rail-text font-mono placeholder:text-rail-textMuted/60 focus:outline-none transition-all shadow-inner"
        />

        {/* Right Action / Shortcut / Clear Badge */}
        <div className="absolute right-2 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 text-rail-textMuted hover:text-rail-text rounded-full hover:bg-rail-panel"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-rail-panel border border-rail-border text-rail-textMuted">
              Ctrl+K
            </span>
          )}

          <button
            type="submit"
            className="btn btn-primary py-0.5 px-2 text-[11px] font-mono flex items-center gap-1 h-6"
          >
            <span>Track</span>
          </button>
        </div>
      </form>

      {/* Currently Active Train Pill (when query is empty) */}
      {!isOpen && activeTrain && (
        <div className="hidden lg:flex items-center gap-2 mt-1 text-[11px] font-mono text-rail-textMuted px-1">
          <span className="text-rail-accent font-bold">Tracking Train:</span>
          <span className="badge badge-blue text-[10px] px-1.5 py-0 font-bold">{activeTrain.id}</span>
          <span className="truncate text-rail-text/90 font-medium">{activeTrain.name}</span>
        </div>
      )}

      {/* Autocomplete Dropdown Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-rail-panel/95 border border-rail-border rounded-xl shadow-2xl backdrop-blur-md z-50 overflow-hidden max-h-80 overflow-y-auto font-mono text-xs divide-y divide-rail-border/40">
          <div className="px-3 py-1.5 bg-rail-bg/80 text-[10px] text-rail-textMuted flex items-center justify-between uppercase tracking-wider">
            <span>Select Train to Live Predict</span>
            <span>{matches.length} Results</span>
          </div>

          {/* Matches List */}
          {matches.map((train: TrainInfo, index: number) => {
            const isSelected = selectedTrainId === train.id;
            return (
              <button
                key={train.id}
                type="button"
                onClick={() => handleSelectTrain(train.id)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                  index === selectedIndex ? 'bg-rail-accent/15 border-l-2 border-rail-accent' : 'hover:bg-rail-bg/60'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rail-accent">{train.id}</span>
                    <span className="font-semibold text-rail-text truncate">{train.name}</span>
                    {isSelected && <span className="badge badge-green text-[9px] py-0 px-1">ACTIVE</span>}
                  </div>
                  <div className="text-[10px] text-rail-textMuted truncate mt-0.5">{train.route}</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="badge badge-blue text-[9px]">{train.speed}</span>
                  <div className="text-[9px] text-rail-textMuted mt-0.5">{train.zone}</div>
                </div>
              </button>
            );
          })}

          {/* Custom Train Number Option */}
          {isCustomNumber && (
            <button
              type="button"
              onClick={() => handleSelectTrain(query.trim())}
              className="w-full text-left px-3 py-2.5 bg-rail-accent/10 hover:bg-rail-accent/20 transition-colors flex items-center justify-between text-rail-accent"
            >
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>⚡ Track Custom Train #{query.trim()}</span>
                  <span className="badge badge-yellow text-[9px]">LIVE QUERY</span>
                </div>
                <div className="text-[10px] text-rail-textMuted mt-0.5">
                  Fetch live ML ETA & Risk predictions for custom Train #{query.trim()}
                </div>
              </div>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}

          {/* Empty State */}
          {matches.length === 0 && !isCustomNumber && (
            <div className="p-4 text-center text-rail-textMuted text-xs">
              No train found. Type a 5-digit train number (e.g. <span className="text-rail-accent">12841</span>) to search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
