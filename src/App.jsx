import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiSummaryCards from './components/KpiSummaryCards';
import AnomalyBanner from './components/AnomalyBanner';
import AnalyticsCharts from './components/AnalyticsCharts';
import ExecutiveBriefCard from './components/ExecutiveBriefCard';
import IncidentsList from './components/IncidentsList';
import ScenarioSimulator from './components/ScenarioSimulator';
import { LayoutDashboard, Sliders } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('DASHBOARD'); // 'DASHBOARD' or 'SIMULATOR'
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [activeIncidentId, setActiveIncidentId] = useState('INC-001');

  const [kpiSummary, setKpiSummary] = useState(null);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch KPI data from Express Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, trendsRes, incidentsRes] = await Promise.all([
        fetch(`/api/kpi-summary?warehouse_id=${selectedWarehouse}`).then(r => r.json()),
        fetch(`/api/daily-trends?warehouse_id=${selectedWarehouse}`).then(r => r.json()),
        fetch('/api/incidents').then(r => r.json())
      ]);

      setKpiSummary(kpiRes);
      setDailyTrends(trendsRes);
      setIncidents(incidentsRes);
    } catch (err) {
      console.warn("Backend API unavailable, using fallback operational dataset", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  const handleApproveRecommendation = async (incidentId, approvedBy, action) => {
    try {
      const res = await fetch('/api/approve-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: incidentId, approved_by: approvedBy, action })
      });
      const data = await res.json();
      
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          return { ...inc, approval: data.approval };
        }
        return inc;
      }));
    } catch (err) {
      console.error("Failed to approve recommendation:", err);
    }
  };

  const activeIncident = incidents.find(inc => inc.id === activeIncidentId) || incidents[0];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Top Header */}
      <Header 
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        totalOrders={kpiSummary?.total_orders}
      />

      {/* Main Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '10px',
            border: activeTab === 'DASHBOARD' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-glass)',
            background: activeTab === 'DASHBOARD' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(16, 185, 129, 0.25) 100%)' : 'rgba(17, 24, 39, 0.6)',
            color: '#F9FAFB',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'DASHBOARD' ? 'var(--glow-indigo)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <LayoutDashboard size={18} color="var(--accent-indigo)" />
          3PL Control Tower & Diagnostic Briefs
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '10px',
            border: activeTab === 'SIMULATOR' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
            background: activeTab === 'SIMULATOR' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)' : 'rgba(17, 24, 39, 0.6)',
            color: '#F9FAFB',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'SIMULATOR' ? 'var(--glow-emerald)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Sliders size={18} color="var(--accent-emerald)" />
          Growth Model Scenario Simulator
        </button>
      </div>

      {/* Tab 1: Dashboard View */}
      {activeTab === 'DASHBOARD' && (
        <>
          <KpiSummaryCards kpiData={kpiSummary} />

          {incidents.length > 0 && (
            <AnomalyBanner 
              incidents={incidents}
              activeIncidentId={activeIncidentId}
              setActiveIncidentId={setActiveIncidentId}
            />
          )}

          <AnalyticsCharts 
            dailyData={dailyTrends}
            activeIncident={activeIncident}
          />

          <ExecutiveBriefCard 
            incident={activeIncident}
            onApproveRecommendation={handleApproveRecommendation}
          />

          {incidents.length > 0 && (
            <IncidentsList 
              incidents={incidents}
              activeIncidentId={activeIncidentId}
              setActiveIncidentId={setActiveIncidentId}
            />
          )}
        </>
      )}

      {/* Tab 2: Growth Model Simulator View */}
      {activeTab === 'SIMULATOR' && (
        <ScenarioSimulator />
      )}

      {/* Footer */}
      <footer style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
        <p>3PL Control Tower & Decision Intelligence | Built with React, Recharts, Express & SQLite Warehouse Data</p>
        <p style={{ marginTop: '4px' }}>Targeting Dubai Supply Chain & Logistics HR Hiring Screeners</p>
      </footer>
    </div>
  );
}
