import React from 'react';
import { AlertTriangle, ChevronRight, CheckCircle, Clock } from 'lucide-react';

export default function IncidentsList({ incidents, activeIncidentId, setActiveIncidentId }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>OPERATIONAL INCIDENTS AUDIT TRAIL</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            5 Traceable incidents planted in warehouse data for Diagnostic Agent reasoning
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {incidents.map((inc) => {
          const isActive = activeIncidentId === inc.id;
          const isApproved = inc.approval && inc.approval.status === 'Approved';

          return (
            <div
              key={inc.id}
              onClick={() => setActiveIncidentId(inc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '16px 20px',
                borderRadius: '12px',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                border: isActive ? '1px solid var(--accent-indigo)' : '1px solid var(--border-glass)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <span className={`badge ${inc.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                  {inc.severity}
                </span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F9FAFB' }}>
                    {inc.title} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>({inc.id})</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {inc.warehouse_name} • {inc.date_range} • <span style={{ color: 'var(--accent-amber)' }}>{inc.metric_affected}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isApproved ? '#6EE7B7' : '#A5B4FC' }}>
                    {isApproved ? 'Approved' : 'Pending Approval'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ROI: {inc.growth_financial_impact.roi_multiplier}
                  </div>
                </div>
                <ChevronRight size={18} color={isActive ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
