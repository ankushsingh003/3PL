import React, { useState } from 'react';
import { Sliders, TrendingUp, ShieldAlert, DollarSign, Building2, Layers, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function ScenarioSimulator() {
  const [warehouse, setWarehouse] = useState('WH-DXB-01');
  const [newPalletVolume, setNewPalletVolume] = useState(2500);
  const [additionalDocks, setAdditionalDocks] = useState(2);
  const [headcountDelta, setHeadcountDelta] = useState(4);
  const [carrierTier, setCarrierTier] = useState('PREMIUM');

  // Baseline metrics by warehouse
  const whBaselines = {
    'WH-DXB-01': { name: 'Dubai South Mega Hub', capacity: 15000, currentPallets: 11200, baseMargin: 24.5, baseRev: 480000 },
    'WH-AUH-01': { name: 'Abu Dhabi Gateway Logistics', capacity: 8500, currentPallets: 6100, baseMargin: 22.0, baseRev: 290000 },
    'WH-SHJ-01': { name: 'Sharjah Express Fulfillment', capacity: 5200, currentPallets: 4600, baseMargin: 18.5, baseRev: 185000 },
    'WH-DWC-01': { name: 'Al Maktoum Freezone Hub', capacity: 11000, currentPallets: 7800, baseMargin: 26.0, baseRev: 370000 },
  };

  const selectedWh = whBaselines[warehouse];

  // Mathematical Growth & Unit Economics Model Calculations
  const totalPallets = selectedWh.currentPallets + newPalletVolume;
  const utilizationPct = ((totalPallets / selectedWh.capacity) * 100).toFixed(1);
  const isOverCapacity = utilizationPct > 90.0;

  // Revenue calculation: $45 AED per pallet storage fee + $18 per order handling
  const addedRevenue = newPalletVolume * 52.0;
  const projectedRevenue = selectedWh.baseRev + addedRevenue;

  // Cost calculation: Labor cost per head = $4,200 AED/mo, dock cost = $3,500 AED/mo per bay
  const addedLaborCost = headcountDelta * 4200.0;
  const addedDockCost = additionalDocks * 3500.0;
  const congestionPenalty = isOverCapacity ? (totalPallets - selectedWh.capacity * 0.9) * 22.0 : 0;

  const netAddedMargin = addedRevenue - addedLaborCost - addedDockCost - congestionPenalty;
  const projectedMarginPct = (((selectedWh.baseRev * (selectedWh.baseMargin / 100)) + netAddedMargin) / projectedRevenue * 100).toFixed(1);

  // Projected OTIF calculation
  const dockRelief = additionalDocks * 2.5;
  const laborRelief = headcountDelta * 1.8;
  const capacityStress = isOverCapacity ? (utilizationPct - 90) * 1.5 : 0;

  const baseOtif = 96.5;
  const projectedOtif = Math.min(99.5, Math.max(70.0, baseOtif + dockRelief + laborRelief - capacityStress)).toFixed(1);
  const slaPenaltyExposure = projectedOtif < 98.0 ? Math.round((98.0 - projectedOtif) * 14500) : 0;

  // Chart Data: 4-Quarter Trajectory Projection
  const trajectoryData = [
    { quarter: 'Q1 (Current)', BaselineRev: selectedWh.baseRev, SimulatedRev: selectedWh.baseRev, BaselineMargin: selectedWh.baseMargin, SimulatedMargin: parseFloat(projectedMarginPct) },
    { quarter: 'Q2 (+30 Days)', BaselineRev: selectedWh.baseRev * 1.03, SimulatedRev: projectedRevenue * 0.95, BaselineMargin: selectedWh.baseMargin, SimulatedMargin: parseFloat(projectedMarginPct) + 0.8 },
    { quarter: 'Q3 (+60 Days)', BaselineRev: selectedWh.baseRev * 1.05, SimulatedRev: projectedRevenue, BaselineMargin: selectedWh.baseMargin + 0.4, SimulatedMargin: parseFloat(projectedMarginPct) + 1.6 },
    { quarter: 'Q4 (+90 Days)', BaselineRev: selectedWh.baseRev * 1.08, SimulatedRev: projectedRevenue * 1.06, BaselineMargin: selectedWh.baseMargin + 0.6, SimulatedMargin: parseFloat(projectedMarginPct) + 2.4 },
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Sliders size={24} color="var(--accent-indigo)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>GROWTH MODEL & OPERATIONAL SCENARIO SIMULATOR</h2>
          <span className="badge badge-pending" style={{ marginLeft: 'auto' }}>Unit Economics Engine</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Simulate multi-quarter revenue trajectory, facility utilization curves, and SLA risk before executing operational decisions.
        </p>
      </div>

      {/* Grid Layout: Sliders (Left) & Real-Time Projections (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Left Column: Interactive Scenario Controls */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-cyan)" /> SCENARIO INPUT PARAMETERS
          </h3>

          {/* Facility Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Target Facility
            </label>
            <select 
              value={warehouse} 
              onChange={(e) => setWarehouse(e.target.value)}
              style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-glass)', padding: '10px 14px', borderRadius: '8px', color: '#F9FAFB', fontWeight: 600, fontSize: '0.85rem' }}
            >
              {Object.keys(whBaselines).map(key => (
                <option key={key} value={key} style={{ background: '#111827' }}>
                  {key} — {whBaselines[key].name} ({whBaselines[key].capacity.toLocaleString()} Pallet Cap)
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: New Pallet Volume */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>New Client Pallet Volume</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>+{newPalletVolume.toLocaleString()} Pallets/Mo</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="250"
              value={newPalletVolume}
              onChange={(e) => setNewPalletVolume(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 2: Additional Dock Bays */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Dock Staging Expansion</span>
              <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>+{additionalDocks} Bays</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="6" 
              step="1"
              value={additionalDocks}
              onChange={(e) => setAdditionalDocks(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#6366F1', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 3: Headcount Allocation */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shift Pick/Pack Headcount</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>+{headcountDelta} Pickers</span>
            </div>
            <input 
              type="range" 
              min="-2" 
              max="12" 
              step="1"
              value={headcountDelta}
              onChange={(e) => setHeadcountDelta(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#06B6D4', cursor: 'pointer' }}
            />
          </div>

          {/* Carrier Tier Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Carrier SLA Tier
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setCarrierTier('STANDARD')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: carrierTier === 'STANDARD' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-glass)', background: carrierTier === 'STANDARD' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)', color: '#FFF', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Standard (94% SLA)
              </button>
              <button 
                onClick={() => setCarrierTier('PREMIUM')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: carrierTier === 'PREMIUM' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)', background: carrierTier === 'PREMIUM' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)', color: '#FFF', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Premium (99% SLA)
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Projected Unit Economics Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Card 1: Revenue & Margin Projections */}
          <div className="glass-panel-accent" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                60-DAY REVENUE & MARGIN IMPACT
              </span>
              <TrendingUp size={20} color="var(--accent-emerald)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Monthly Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6EE7B7', marginTop: '2px' }}>
                  AED {projectedRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                  +AED {addedRevenue.toLocaleString()} Net Gain
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operating Margin %</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A5B4FC', marginTop: '2px' }}>
                  {projectedMarginPct}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Base: {selectedWh.baseMargin}%
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Storage Utilization & OTIF Risk */}
          <div className="glass-panel" style={{ padding: '20px', borderLeft: isOverCapacity ? '4px solid var(--accent-rose)' : '4px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                CAPACITY & OTIF SLA STRESS
              </span>
              {isOverCapacity ? <AlertTriangle size={20} color="var(--accent-rose)" /> : <ShieldAlert size={20} color="var(--accent-emerald)" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Storage Utilization</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isOverCapacity ? '#F87171' : '#F9FAFB', marginTop: '2px' }}>
                  {utilizationPct}%
                </div>
                <div style={{ fontSize: '0.72rem', color: isOverCapacity ? '#FCA5A5' : 'var(--text-muted)' }}>
                  {isOverCapacity ? '⚠️ Storage Bottleneck Risk' : 'Optimal Capacity'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected OTIF %</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: projectedOtif >= 98.0 ? '#6EE7B7' : '#FDE047', marginTop: '2px' }}>
                  {projectedOtif}%
                </div>
                <div style={{ fontSize: '0.72rem', color: slaPenaltyExposure > 0 ? '#F87171' : '#6EE7B7' }}>
                  {slaPenaltyExposure > 0 ? `AED ${slaPenaltyExposure.toLocaleString()} Penalty Risk` : 'SLA Target Met'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Trajectory Projection Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-indigo)" /> MULTI-QUARTER REVENUE TRAJECTORY (BASELINE VS SIMULATION)
        </h3>

        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trajectoryData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="quarter" stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => `AED ${val.toLocaleString()}`} contentStyle={{ background: '#111827', border: '1px solid var(--border-glass-accent)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="BaselineRev" fill="#4B5563" name="Baseline Revenue (AED)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="SimulatedRev" fill="#10B981" name="Simulated Strategy Revenue (AED)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
