import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiSummaryCards from './components/KpiSummaryCards';
import AnomalyBanner from './components/AnomalyBanner';
import AnalyticsCharts from './components/AnalyticsCharts';
import ExecutiveBriefCard from './components/ExecutiveBriefCard';
import IncidentsList from './components/IncidentsList';

export default function App() {
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
      
      // Update local state immediately
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
      {/* Top Navigation & Controls */}
      <Header 
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        totalOrders={kpiSummary?.total_orders}
      />

      {/* KPI Cards */}
      <KpiSummaryCards kpiData={kpiSummary} />

      {/* Planted Anomalies Ticker Banner */}
      {incidents.length > 0 && (
        <AnomalyBanner 
          incidents={incidents}
          activeIncidentId={activeIncidentId}
          setActiveIncidentId={setActiveIncidentId}
        />
      )}

      {/* Analytics Charts */}
      <AnalyticsCharts 
        dailyData={dailyTrends}
        activeIncident={activeIncident}
      />

      {/* Executive Decision Brief (The Core Pitch Component) */}
      <ExecutiveBriefCard 
        incident={activeIncident}
        onApproveRecommendation={handleApproveRecommendation}
      />

      {/* Incidents Audit List */}
      {incidents.length > 0 && (
        <IncidentsList 
          incidents={incidents}
          activeIncidentId={activeIncidentId}
          setActiveIncidentId={setActiveIncidentId}
        />
      )}

      {/* Footer */}
      <footer style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
        <p>3PL Control Tower & Decision Intelligence | Built with React, Recharts, Express & SQLite Warehouse Data</p>
        <p style={{ marginTop: '4px' }}>Targeting Dubai Supply Chain & Logistics HR Hiring Screeners</p>
      </footer>
    </div>
  );
}
