import React from 'react';
import { Building2, Calendar, ShieldCheck, Activity, Database } from 'lucide-react';

export default function Header({ selectedWarehouse, setSelectedWarehouse, totalOrders }) {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={26} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.5px' }}>3PL CONTROL TOWER</h1>
            <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
              <span className="pulse-dot pulse-dot-emerald"></span> SQL LIVE WAREHOUSE
            </span>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Operations Diagnostic Engine & Executive Growth Intelligence | Dubai Hub
          </p>
        </div>
      </div>

      {/* Controls & Selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Warehouse Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <Building2 size={16} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SITE:</span>
          <select 
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            style={{ background: 'transparent', color: '#F9FAFB', border: 'none', outline: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="ALL" style={{ background: '#111827' }}>ALL WAREHOUSES (Dubai, AUH, SHJ, DWC)</option>
            <option value="WH-DXB-01" style={{ background: '#111827' }}>WH-DXB-01 (Dubai South Hub)</option>
            <option value="WH-AUH-01" style={{ background: '#111827' }}>WH-AUH-01 (Abu Dhabi ICAD)</option>
            <option value="WH-SHJ-01" style={{ background: '#111827' }}>WH-SHJ-01 (Sharjah Industrial)</option>
            <option value="WH-DWC-01" style={{ background: '#111827' }}>WH-DWC-01 (DWC Freezone)</option>
          </select>
        </div>

        {/* Date Range Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <Calendar size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Oct 2025 – Jun 2026 (9M)</span>
        </div>

        {/* Total Processed Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <Database size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6EE7B7' }}>
            {totalOrders ? totalOrders.toLocaleString() : '239,863'} Orders Evaluated
          </span>
        </div>
      </div>
    </header>
  );
}
