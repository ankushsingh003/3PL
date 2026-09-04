import React from 'react';
import { Target, Clock, Users, DollarSign, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

export default function KpiSummaryCards({ kpiData }) {
  const otif = kpiData ? kpiData.otif_percentage : 96.4;
  const targetOtif = 98.0;
  const isOtifBreached = otif < targetOtif;

  const dwellMins = kpiData ? kpiData.avg_dock_dwell_mins : 38;
  const targetDwell = 35;
  const isDwellHigh = dwellMins > targetDwell;

  const laborCost = kpiData ? kpiData.total_labor_cost : 345000;
  const overtimeHrs = kpiData ? kpiData.total_overtime_hours : 1420;
  const slaPenaltyAed = kpiData ? kpiData.sla_penalty_exposure_aed : 163450;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
      {/* Card 1: OTIF % */}
      <div className={`glass-panel ${isOtifBreached ? 'glass-panel-accent' : ''}`} style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              On-Time-In-Full (OTIF)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isOtifBreached ? '#FDE047' : '#6EE7B7', marginTop: '4px' }}>
              {otif}%
            </div>
          </div>
          <div style={{ background: isOtifBreached ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Target size={22} color={isOtifBreached ? 'var(--accent-amber)' : 'var(--accent-emerald)'} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ color: 'var(--text-muted)' }}>SLA Target: <strong>{targetOtif}%</strong></span>
          <span style={{ color: isOtifBreached ? '#F87171' : '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            {isOtifBreached ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {isOtifBreached ? '1.6% SLA Gap' : 'On Track'}
          </span>
        </div>
      </div>

      {/* Card 2: Dock Dwell Time */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Avg Dock Dwell Time
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isDwellHigh ? '#F87171' : '#F9FAFB', marginTop: '4px' }}>
              {dwellMins} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>mins</span>
            </div>
          </div>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Clock size={22} color="var(--accent-cyan)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Target Ceiling: <strong>&lt;{targetDwell}m</strong></span>
          <span style={{ color: isDwellHigh ? '#FDE047' : '#6EE7B7', fontWeight: 600 }}>
            {isDwellHigh ? `+${dwellMins - targetDwell}m Congestion` : 'Optimal Flow'}
          </span>
        </div>
      </div>

      {/* Card 3: Labor & Overtime */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Labor Cost & Overtime
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F9FAFB', marginTop: '4px' }}>
              ${laborCost.toLocaleString()}
            </div>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Users size={22} color="var(--accent-indigo)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Overtime Logged:</span>
          <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
            {overtimeHrs.toLocaleString()} hrs
          </span>
        </div>
      </div>

      {/* Card 4: SLA Penalty Exposure */}
      <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Est. SLA Penalty Exposure
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FCA5A5', marginTop: '4px' }}>
              AED {slaPenaltyAed.toLocaleString()}
            </div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <AlertTriangle size={22} color="var(--accent-rose)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Late Orders Risk:</span>
          <span style={{ color: '#FCA5A5', fontWeight: 700 }}>Contract Clause Penalty</span>
        </div>
      </div>
    </div>
  );
}
