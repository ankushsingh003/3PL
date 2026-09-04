import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceArea, Legend } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export default function AnalyticsCharts({ dailyData, activeIncident }) {
  // Format dates for display
  const chartData = (dailyData || []).map(item => ({
    ...item,
    formattedDate: item.date.substring(5)
  }));

  // Determine reference area highlighting if active incident exists
  let refStart = null;
  let refEnd = null;

  if (activeIncident) {
    if (activeIncident.id === 'INC-001') { refStart = '2025-11-10'; refEnd = '2025-11-24'; }
    else if (activeIncident.id === 'INC-002') { refStart = '2026-01-12'; refEnd = '2026-01-22'; }
    else if (activeIncident.id === 'INC-003') { refStart = '2026-02-01'; refEnd = '2026-02-28'; }
    else if (activeIncident.id === 'INC-004') { refStart = '2026-03-01'; refEnd = '2026-03-31'; }
    else if (activeIncident.id === 'INC-005') { refStart = '2026-04-01'; refEnd = '2026-04-30'; }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#111827', border: '1px solid var(--border-glass-accent)', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Date: {label}</p>
          <p style={{ fontSize: '0.85rem', color: '#6EE7B7', fontWeight: 700 }}>
            OTIF: {payload[0]?.value}%
          </p>
          {payload[1] && (
            <p style={{ fontSize: '0.85rem', color: '#F87171', fontWeight: 700, marginTop: '2px' }}>
              Dock Dwell Time: {payload[1]?.value} mins
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>ON-TIME-IN-FULL (OTIF %) & DOCK DWELL TIME TREND</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Cross-correlated daily SQL metrics highlighting active operational anomalies
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981' }}></span> OTIF % (Target: 98%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#EF4444' }}></span> Dock Dwell Time (Mins)
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOtif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDwell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} interval={30} />
              <YAxis yAxisId="left" domain={[50, 100]} stroke="#10B981" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 200]} stroke="#EF4444" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              
              {refStart && refEnd && (
                <ReferenceArea yAxisId="left" x1={refStart} x2={refEnd} stroke="rgba(239, 68, 68, 0.5)" fill="rgba(239, 68, 68, 0.15)" label={{ value: `ANOMALY WINDOW (${activeIncident.id})`, fill: '#FCA5A5', fontSize: 11, fontWeight: 700, position: 'top' }} />
              )}

              <Area yAxisId="left" type="monotone" dataKey="otif_pct" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOtif)" name="OTIF %" />
              <Area yAxisId="right" type="monotone" dataKey="dwell_mins" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDwell)" name="Dock Dwell (Mins)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
