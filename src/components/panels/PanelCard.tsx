import React from 'react';

interface PanelCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'ready' | 'pending' | 'demo';
  description: string;
  badgeText?: string;
}

const statusStyles = {
  ready: 'badge-green',
  pending: 'badge-yellow',
  demo: 'badge-blue',
};

const statusLabels = {
  ready: 'ACTIVE',
  pending: 'PENDING',
  demo: 'DEMO',
};

export function PanelCard({ id, title, icon, status, description, badgeText }: PanelCardProps) {
  return (
    <section className="panel panel-hover p-4 transition-all duration-200 group" data-panel-id={id}>
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-rail-bg border border-rail-border flex-shrink-0 group-hover:border-rail-accent/50 transition-colors ${status === 'demo' && 'bg-rail-accent/10 border-rail-accent/30'}`}>
          <span className={`text-rail-textMuted group-hover:text-rail-accent transition-colors ${status === 'demo' && 'text-rail-accent'}`}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-medium text-rail-text truncate">{title}</h3>
            <span className={`badge ${statusStyles[status]} flex-shrink-0`}>{statusLabels[status]}</span>
          </div>
          {badgeText && (
            <span className="badge badge-blue text-xs mb-2 inline-block">{badgeText}</span>
          )}
          <p className="text-xs text-rail-textMuted line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-rail-border flex items-center justify-between text-xs">
        <span className="text-rail-textMuted/60 font-mono">Module: {id}</span>
        {status === 'pending' && (
          <span className="text-rail-textMuted/50">Awaiting API integration</span>
        )}
        {status === 'demo' && (
          <span className="text-rail-accent/70 font-mono">Local mock</span>
        )}
        {status === 'ready' && (
          <span className="text-green-500/70 font-mono">Connected</span>
        )}
      </div>
    </section>
  );
}