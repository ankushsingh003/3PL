import React from 'react';
import { AlertCircle, Flame, ShieldAlert, Cpu } from 'lucide-react';

export default function AnomalyBanner({ incidents, activeIncidentId, setActiveIncidentId }) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <ShieldAlert size={20} color="var(--accent-rose)" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F9FAFB', letterSpacing: '0.3px' }}>
          PLANTED OPERATIONAL ANOMALIES & DIAGNOSTIC BREACHES
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Click an incident to load LangGraph Decision Brief
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {incidents.map((inc) => {
          const isActive = activeIncidentId === inc.id;
          const isCritical = inc.severity === 'CRITICAL';

          return (
            <button
              key={inc.id}
              onClick={() => setActiveIncidentId(inc.id)}
              style={{
                flex: '0 0 auto',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)' 
                  : 'rgba(15, 23, 42, 0.7)',
                border: isActive ? '1px solid var(--accent-indigo)' : '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#F9FAFB',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--glow-indigo)' : 'none',
                minWidth: '220px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                  {inc.id} • {inc.warehouse_id}
                </span>
                <span className={`badge ${isCritical ? 'badge-critical' : 'badge-high'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                  {inc.severity}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {inc.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {inc.date_range}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
