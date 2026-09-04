import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, UserCheck, DollarSign, Sparkles, Clock } from 'lucide-react';

export default function ExecutiveBriefCard({ incident, onApproveRecommendation }) {
  const [approving, setApproving] = useState(false);
  const [approverName, setApproverName] = useState('Tariq Al-Mansoor (Ops VP)');

  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Select an incident above to generate the Executive Decision Brief.</p>
      </div>
    );
  }

  const isApproved = incident.approval && incident.approval.status === 'Approved';

  const handleApprove = async () => {
    setApproving(true);
    await onApproveRecommendation(incident.id, approverName, 'APPROVE');
    setApproving(false);
  };

  const handleReject = async () => {
    setApproving(true);
    await onApproveRecommendation(incident.id, approverName, 'REJECT');
    setApproving(false);
  };

  return (
    <div className="glass-panel-accent" style={{ borderRadius: '18px', padding: '28px', marginBottom: '28px', border: '1px solid rgba(99, 102, 241, 0.4)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Accent Glow */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-glass)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, color: '#FFF' }}>
              LANGGRAPH AGENT BRIEF
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ID: {incident.id} • {incident.warehouse_name}
            </span>
            <span className={`badge ${incident.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
              {incident.severity}
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F9FAFB' }}>
            {incident.title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginTop: '4px', fontWeight: 600 }}>
            ⚠️ {incident.metric_affected}
          </p>
        </div>

        {/* Approval Badge */}
        <div style={{ textAlign: 'right' }}>
          {isApproved ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6EE7B7' }}>EXECUTIVE APPROVED</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{incident.approval.approvedBy}</div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} color="var(--accent-indigo)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#A5B4FC' }}>PENDING HUMAN APPROVAL</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Augmentation Gate Active</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4-Block Executive Brief Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Block 1: WHAT HAPPENED */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px', borderRadius: '8px', color: 'var(--accent-indigo)', fontSize: '0.8rem', fontWeight: 700 }}>01</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F9FAFB' }}>WHAT HAPPENED</h4>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {incident.what_happened}
          </p>
        </div>

        {/* Block 2: WHY (ROOT CAUSE) */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '6px', borderRadius: '8px', color: 'var(--accent-amber)', fontSize: '0.8rem', fontWeight: 700 }}>02</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F9FAFB' }}>WHY (SQL ROOT CAUSE)</h4>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {incident.why_analysis}
          </p>
        </div>

        {/* Block 3: WHAT NEXT (RECOMMENDATION) */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-glass-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '6px', borderRadius: '8px', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700 }}>03</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F9FAFB' }}>WHAT NEXT (ACTION PLAN)</h4>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.5' }}>
            {incident.what_next_recommendation}
          </p>
        </div>

        {/* Block 4: OWNER & TARGET KPI */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '6px', borderRadius: '8px', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>04</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F9FAFB' }}>OWNER & TARGET KPI</h4>
          </div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '6px' }}><strong>Assigned Lead:</strong> {incident.assigned_owner}</p>
            <p style={{ color: '#6EE7B7', fontWeight: 600 }}><strong>Target Recovery:</strong> {incident.target_kpi}</p>
          </div>
        </div>

      </div>

      {/* Growth Model Engine Unit Economics Box */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Sparkles size={20} color="var(--accent-emerald)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6EE7B7', letterSpacing: '0.3px' }}>
            GROWTH MODEL ENGINE — FINANCIAL UNIT ECONOMICS
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', marginLeft: 'auto', fontWeight: 700 }}>
            ROI Multiplier: {incident.growth_financial_impact.roi_multiplier}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {incident.growth_financial_impact.sla_penalty_avoided_aed && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SLA Penalties Avoided</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6EE7B7', marginTop: '2px' }}>
                AED {incident.growth_financial_impact.sla_penalty_avoided_aed.toLocaleString()}
              </div>
            </div>
          )}

          {incident.growth_financial_impact.carrier_demurrage_saved_aed && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Demurrage Saved</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6EE7B7', marginTop: '2px' }}>
                AED {incident.growth_financial_impact.carrier_demurrage_saved_aed.toLocaleString()}
              </div>
            </div>
          )}

          {incident.growth_financial_impact.overtime_cost_reduced_aed && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overtime Cost Savings</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6EE7B7', marginTop: '2px' }}>
                AED {incident.growth_financial_impact.overtime_cost_reduced_aed.toLocaleString()}
              </div>
            </div>
          )}

          {incident.growth_financial_impact.new_storage_revenue_aed && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Incremental Storage Revenue</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6EE7B7', marginTop: '2px' }}>
                AED {incident.growth_financial_impact.new_storage_revenue_aed.toLocaleString()}
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-indigo)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Client Retention LTV Protected</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#A5B4FC', marginTop: '2px' }}>
              AED {incident.growth_financial_impact.client_retention_ltv_protected_aed.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Approval Action Gate */}
      <div style={{ background: 'rgba(17, 24, 39, 0.9)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-glass-accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="var(--accent-indigo)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F9FAFB' }}>
              HUMAN APPROVAL GATE — AUGMENTATION WORKFLOW
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Decisions are augmented by AI, not automated. Executive signature required before operational execution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isApproved ? (
            <>
              <button 
                className="btn-reject"
                onClick={handleReject}
                disabled={approving}
              >
                <XCircle size={16} /> Reject / Modify
              </button>
              
              <button 
                className="btn-approve"
                onClick={handleApprove}
                disabled={approving}
              >
                <CheckCircle2 size={18} /> {approving ? 'Signing...' : 'Approve Recommendation'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle2 size={20} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6EE7B7' }}>
                Signed & Dispatched to Operations ({incident.approval.approvedAt})
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
