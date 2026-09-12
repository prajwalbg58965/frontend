import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useRiskScore } from '../../hooks/useRisk';
import { useTrain, POPULAR_TRAINS } from '../../context/TrainContext';

export function KpiRow() {
  const { incidents } = useIncidentAlertsStatus();
  const { riskData } = useRiskScore('hwh-kgp');
  const { selectedTrainId } = useTrain();

  const activeAlerts = incidents?.length || 0;
  
  // Calculate At Risk from segments
  let atRiskCount = 0;
  if (riskData?.segments) {
    atRiskCount = riskData.segments.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
  }

  // The following are representative values since we don't have a global network API
  const activeTrains = 142; // Example global metric
  const onRoute = 138;
  const avgDelay = '12m';
  const activeConflicts = 0;

  const kpis = [
    {
      id: 'active',
      title: 'ACTIVE TRAINS',
      value: activeTrains.toString(),
      subtext: '+4 from last hour',
      status: 'info',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      id: 'onroute',
      title: 'ON ROUTE',
      value: onRoute.toString(),
      subtext: '97% adherence',
      status: 'success',
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
    },
    {
      id: 'delay',
      title: 'AVG DELAY',
      value: avgDelay,
      subtext: 'Network wide',
      status: 'warning',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'risk',
      title: 'AT RISK',
      value: atRiskCount.toString(),
      subtext: 'Segments elevated',
      status: atRiskCount > 0 ? 'warning' : 'success',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    {
      id: 'conflicts',
      title: 'ACTIVE CONFLICTS',
      value: activeConflicts.toString(),
      subtext: 'Requires resolution',
      status: activeConflicts > 0 ? 'danger' : 'success',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
    },
    {
      id: 'alerts',
      title: 'ACTIVE ALERTS',
      value: activeAlerts.toString(),
      subtext: 'Unresolved safety',
      status: activeAlerts > 0 ? 'danger' : 'success',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3 shrink-0">
      {kpis.map(kpi => {
        let colorClasses = 'text-rail-info bg-rail-info/10 border-rail-info/20';
        let valueClasses = 'text-rail-text';
        
        if (kpi.status === 'success') {
          colorClasses = 'text-green-400 bg-green-500/10 border-green-500/20';
        } else if (kpi.status === 'warning') {
          colorClasses = 'text-rail-warning bg-rail-warning/10 border-rail-warning/20';
          valueClasses = 'text-rail-warning';
        } else if (kpi.status === 'danger') {
          colorClasses = 'text-rail-danger bg-rail-danger/10 border-rail-danger/20';
          valueClasses = 'text-rail-danger';
        }

        return (
          <div key={kpi.id} className="bg-rail-panel border border-rail-border rounded-lg p-3 flex flex-col justify-between shadow-sm hover:border-rail-borderHover transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest">{kpi.title}</span>
              <div className={`p-1 rounded flex items-center justify-center border ${colorClasses}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-sans tabular-nums leading-none tracking-tight ${valueClasses}`}>{kpi.value}</span>
            </div>
            <div className="text-[10px] text-rail-textMuted/80 mt-1 truncate">
              {kpi.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
