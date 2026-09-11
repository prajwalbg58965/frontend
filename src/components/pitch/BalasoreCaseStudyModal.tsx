import { useState } from 'react';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BalasoreCaseStudyModal({ isOpen, onClose }: PitchModalProps) {
  const [activeTab, setActiveTab] = useState<'pitch' | 'balasore' | 'honesty' | 'limitations'>('pitch');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-rail-panel border border-rail-accent/40 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rail-bg border-b border-rail-border p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rail-accent/10 border border-rail-accent/30 flex items-center justify-center text-rail-accent font-bold">
              SIH
            </div>
            <div>
              <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
                RailSentinel Pitch & Balasore Case Study
                <span className="badge badge-blue text-xs font-mono">SIH26028</span>
              </h2>
              <p className="text-xs text-rail-textMuted font-mono">
                Person 4 Pitch Deck & Transparency Narrative
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rail-textMuted hover:text-rail-text hover:bg-rail-panelHover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-rail-border bg-rail-bg/50 px-4 pt-2 gap-2 flex-shrink-0 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-4 py-2 rounded-t-lg font-semibold border-t border-x transition-colors ${
              activeTab === 'pitch'
                ? 'bg-rail-panel border-rail-accent/50 text-rail-accent'
                : 'border-transparent text-rail-textMuted hover:text-rail-text'
            }`}
          >
            🎯 11-Step Pitch Deck
          </button>

          <button
            onClick={() => setActiveTab('balasore')}
            className={`px-4 py-2 rounded-t-lg font-semibold border-t border-x transition-colors ${
              activeTab === 'balasore'
                ? 'bg-rail-panel border-rail-accent/50 text-rail-accent'
                : 'border-transparent text-rail-textMuted hover:text-rail-text'
            }`}
          >
            📜 Balasore Case Study
          </button>

          <button
            onClick={() => setActiveTab('honesty')}
            className={`px-4 py-2 rounded-t-lg font-semibold border-t border-x transition-colors ${
              activeTab === 'honesty'
                ? 'bg-rail-panel border-rail-accent/50 text-rail-accent'
                : 'border-transparent text-rail-textMuted hover:text-rail-text'
            }`}
          >
            ⚖️ Real vs. Simulated Matrix
          </button>

          <button
            onClick={() => setActiveTab('limitations')}
            className={`px-4 py-2 rounded-t-lg font-semibold border-t border-x transition-colors ${
              activeTab === 'limitations'
                ? 'bg-rail-panel border-rail-accent/50 text-rail-accent'
                : 'border-transparent text-rail-textMuted hover:text-rail-text'
            }`}
          >
            🛡️ Technical Limitations & Kavach
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-rail-text leading-relaxed">
          {/* TAB 1: PITCH DECK */}
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-rail-accent font-mono">Pitch Presentation Blueprint (11 Steps)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">1. Problem Statement</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Railway delay unpredictability and delayed emergency awareness during disaster events create high risks.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">2. SIH26028 Requirement</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Real-time ETA prediction extended with environmental & disaster management intelligence.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">3. RailSentinel Solution</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Continuous monitoring command center linking live GPS, ML ETA ranges, weather risks, and incident rescue loops.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">4. Architecture</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Decoupled Person 1 (ETA ML), Person 2 (Positions & Risk), Person 3 (Confirmation & Incidents), and Person 4 (Command Dashboard).
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">5. Honesty Matrix</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Transparent declaration of connected ML/weather APIs vs. simulated GPS & passenger reunification mockups.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">6. Live Dashboard Demo</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Live train positions on MapLibre GL, junction confirmation feed, and dynamic confidence range ETA display.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">7. Incident Mode Demo</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Automated command center state switch, affected coach highlighting, and Haversine nearest responder lookup.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">8. Balasore Case Study</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Analyzing situational awareness gaps and how RailSentinel accelerates post-incident rescue coordination.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">9. Limitations</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Explicit acknowledgment: RailSentinel is an intelligence/response layer, NOT a replacement for Kavach signaling hardware.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <span className="text-xs font-mono text-rail-accent font-bold">10. Model Accuracy (Person 1)</span>
                  <p className="text-xs text-rail-textMuted mt-1">
                    Comparing Person 1's ML prediction baseline vs standard static timetables.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BALASORE CASE STUDY */}
          {activeTab === 'balasore' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-red-400 font-mono">Case Study: Balasore Disaster Analysis</h3>

              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg space-y-2">
                <h4 className="font-bold text-red-400">1. Context & Information Gaps</h4>
                <p className="text-xs text-rail-textMuted">
                  The June 2023 Balasore triple-train crash highlighted severe post-impact situational gaps: zero real-time headcount awareness per coach, delayed dispatching of local hospital/NDRF rescue units, and family reunification chaos.
                </p>
              </div>

              <div className="bg-rail-bg border border-rail-border p-4 rounded-lg space-y-2">
                <h4 className="font-bold text-rail-accent">2. How RailSentinel Enhances Safety Response</h4>
                <ul className="text-xs text-rail-textMuted space-y-1 list-disc list-inside">
                  <li>Instantaneous Incident Mode activation Pinpointing exact derailment/impact coordinates.</li>
                  <li>Automated Nearest Responder spatial lookup (Haversine formula identifying nearest hospital & NDRF battalion within seconds).</li>
                  <li>Coach-level "I'm Safe" passenger check-in mockup to provide rapid headcount verification for emergency responders.</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg space-y-2">
                <h4 className="font-bold text-yellow-400">3. What RailSentinel Would NOT Have Prevented</h4>
                <p className="text-xs text-rail-textMuted">
                  RailSentinel is a software intelligence dashboard. It would <strong>NOT</strong> have prevented the physical signaling/interlocking relay failure or replaced cab-signaling anti-collision systems like Kavach.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REAL VS SIMULATED */}
          {activeTab === 'honesty' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-rail-accent font-mono">Real vs. Simulated Honesty Matrix</h3>
              <p className="text-xs text-rail-textMuted">
                Strict adherence to SIH judging standards: explicit distinction between production backend services and hackathon demonstration mockups.
              </p>

              <div className="overflow-x-auto border border-rail-border rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-rail-bg border-b border-rail-border text-rail-accent">
                    <tr>
                      <th className="p-3">Component / System</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Implementation Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rail-border/60 text-rail-text">
                    <tr>
                      <td className="p-3 font-semibold">ML ETA Prediction</td>
                      <td className="p-3"><span className="badge badge-green">REAL API</span></td>
                      <td className="p-3 text-rail-textMuted">Person 1 backend model (`GET /predict-eta`)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Weather & Flood Risk</td>
                      <td className="p-3"><span className="badge badge-green">REAL API</span></td>
                      <td className="p-3 text-rail-textMuted">Person 2 flood depth & weather service (`GET /risk-score`)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Signal & Incident Logs</td>
                      <td className="p-3"><span className="badge badge-green">REAL API</span></td>
                      <td className="p-3 text-rail-textMuted">Person 3 alert monitoring (`GET /confirmation-log`)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Coach GPS Positions</td>
                      <td className="p-3"><span className="badge badge-blue">SIMULATED</span></td>
                      <td className="p-3 text-rail-textMuted">Demo timeline coordinates / simulated phone GPS</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">"I'm Safe" Passenger UI</td>
                      <td className="p-3"><span className="badge badge-blue">MOCKUP</span></td>
                      <td className="p-3 text-rail-textMuted">Frontend check-in UI mockup for demo presentation</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Nearest Responder Lookup</td>
                      <td className="p-3"><span className="badge badge-blue">STATIC DATA</span></td>
                      <td className="p-3 text-rail-textMuted">Static 4-location reference dataset near demo route</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LIMITATIONS */}
          {activeTab === 'limitations' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-yellow-400 font-mono">Technical Limitations & Railway Safeguards</h3>

              <div className="space-y-3 text-xs text-rail-textMuted">
                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <h4 className="font-bold text-rail-text mb-1">1. Distinction from Kavach</h4>
                  <p>
                    Kavach is an Automatic Train Protection (ATP) system controlling brakes at the hardware level. RailSentinel operates strictly as a situational awareness and disaster intelligence software layer above physical signaling.
                  </p>
                </div>

                <div className="p-3 bg-rail-bg border border-rail-border rounded-lg">
                  <h4 className="font-bold text-rail-text mb-1">2. Cellular & GPS Coverage Gaps</h4>
                  <p>
                    In remote railway cuts or tunnels, live GPS packets may experience telemetry dropouts. RailSentinel utilizes Kalman filter estimations and last-known junction confirmations to bridge telemetry blackouts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-rail-bg border-t border-rail-border p-4 flex items-center justify-between flex-shrink-0 text-xs font-mono">
          <span className="text-rail-textMuted">RailSentinel • Smart India Hackathon Demo</span>
          <button onClick={onClose} className="btn btn-primary px-4 py-1.5">
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
}
