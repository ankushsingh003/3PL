import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', '3pl_warehouse.db');

const getDbConnection = () => {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
    }
  });
};

// In-memory store for approval status of decision briefs
const incidentApprovals = {
  "INC-001": { status: "Approved", approvedBy: "Tariq Al-Mansoor (Ops Director)", approvedAt: "2025-11-15 09:30 GST" },
  "INC-002": { status: "Pending Approval", approvedBy: null, approvedAt: null },
  "INC-003": { status: "Pending Approval", approvedBy: null, approvedAt: null },
  "INC-004": { status: "Pending Approval", approvedBy: null, approvedAt: null },
  "INC-005": { status: "Pending Approval", approvedBy: null, approvedAt: null },
};

// 1. KPI Summary Endpoint
app.get('/api/kpi-summary', (req, res) => {
  const db = getDbConnection();
  const warehouse_id = req.query.warehouse_id || 'ALL';

  let sqlOrders = `SELECT COUNT(*) as total_orders, SUM(otif_flag) as otif_orders FROM orders`;
  let sqlDock = `SELECT AVG(dwell_time_minutes) as avg_dwell FROM dock_appointments`;
  let sqlLabor = `SELECT SUM(labor_cost) as total_labor, SUM(overtime_hours) as total_ot FROM labor`;
  
  if (warehouse_id !== 'ALL') {
    sqlOrders += ` WHERE warehouse_id = '${warehouse_id}'`;
    sqlDock += ` WHERE warehouse_id = '${warehouse_id}'`;
    sqlLabor += ` WHERE warehouse_id = '${warehouse_id}'`;
  }

  db.get(sqlOrders, [], (err, orderRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get(sqlDock, [], (err, dockRow) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get(sqlLabor, [], (err, laborRow) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = orderRow.total_orders || 1;
        const otifCount = orderRow.otif_orders || 0;
        const otifPct = ((otifCount / total) * 100).toFixed(2);
        const lateCount = total - otifCount;
        const estimatedSlaPenalty = (lateCount * 35.0).toFixed(2);

        db.close();
        res.json({
          total_orders: total,
          otif_percentage: parseFloat(otifPct),
          target_otif: 98.0,
          avg_dock_dwell_mins: Math.round(dockRow.avg_dwell || 35),
          target_dwell_mins: 35,
          total_labor_cost: Math.round(laborRow.total_labor || 0),
          total_overtime_hours: Math.round(laborRow.total_ot || 0),
          sla_penalty_exposure_aed: parseFloat(estimatedSlaPenalty),
        });
      });
    });
  });
});

// 2. Daily KPI Trends Endpoint
app.get('/api/daily-trends', (req, res) => {
  const db = getDbConnection();
  const warehouse_id = req.query.warehouse_id || 'ALL';

  let sql = `
    SELECT 
      order_date as date,
      COUNT(order_id) as total_orders,
      SUM(otif_flag) as otif_orders,
      ROUND(CAST(SUM(otif_flag) AS FLOAT) / COUNT(order_id) * 100.0, 1) as otif_pct
    FROM orders
  `;

  if (warehouse_id !== 'ALL') {
    sql += ` WHERE warehouse_id = '${warehouse_id}'`;
  }

  sql += ` GROUP BY order_date ORDER BY order_date ASC`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Join with dock dwell time per date
    let sqlDock = `
      SELECT date, ROUND(AVG(dwell_time_minutes), 1) as avg_dwell 
      FROM dock_appointments 
    `;
    if (warehouse_id !== 'ALL') {
      sqlDock += ` WHERE warehouse_id = '${warehouse_id}'`;
    }
    sqlDock += ` GROUP BY date`;

    db.all(sqlDock, [], (err, dockRows) => {
      db.close();
      const dockMap = {};
      (dockRows || []).forEach(r => dockMap[r.date] = r.avg_dwell);

      const combined = (rows || []).map(r => ({
        date: r.date,
        total_orders: r.total_orders,
        otif_pct: r.otif_pct,
        dwell_mins: dockMap[r.date] || 35.0
      }));

      res.json(combined);
    });
  });
});

// 3. Planted Incidents & Decision Briefs Endpoint
app.get('/api/incidents', (req, res) => {
  const incidents = [
    {
      id: "INC-001",
      title: "Dock Congestion & Carrier Arrival Bottleneck",
      warehouse_id: "WH-DXB-01",
      warehouse_name: "Dubai South Mega Hub",
      date_range: "Nov 10 – Nov 24, 2025",
      severity: "CRITICAL",
      metric_affected: "OTIF dropped from 99.2% to 68.2%",
      root_cause: "Carrier appointment bunching on inbound docks #3 & #4 caused truck dwell time to surge from 35m to 175m, stalling outbound order staging.",
      what_happened: "Carrier arrivals uncoordinated during peak White Friday inventory staging, causing a 400% dwell time spike and 32% order shipping delay.",
      why_analysis: "Root cause isolated via SQL cross-join between dock_appointments and orders. Two key carriers (Gulf Overland & Falcon) arrived 90+ mins off-schedule without dock gate throttling.",
      what_next_recommendation: "Deploy dynamic dock scheduling windows (+2 extra staging bays during peak hours), mandate strict 30-min carrier appointment tolerance, and reallocate 4 night-shift pickers to morning dock staging.",
      assigned_owner: "Youssef El-Sherif (Regional Ops Manager)",
      target_kpi: "Recover WH-DXB-01 OTIF to >98.0% within 48 hours; cap carrier dwell time <38 mins.",
      growth_financial_impact: {
        sla_penalty_avoided_aed: 48500,
        carrier_demurrage_saved_aed: 22000,
        client_retention_ltv_protected_aed: 350000,
        roi_multiplier: "12.4x"
      },
      approval: incidentApprovals["INC-001"]
    },
    {
      id: "INC-002",
      title: "Unscheduled Labor Shortfall & Pick Cycle Delay",
      warehouse_id: "WH-SHJ-01",
      warehouse_name: "Sharjah Express Fulfillment",
      date_range: "Jan 12 – Jan 22, 2026",
      severity: "HIGH",
      metric_affected: "Pick/Pack time +120%, Labor cost/order +45%",
      root_cause: "Seasonal flu outbreak reduced actual shift headcount to 61% of scheduled levels, triggering mandatory high-cost overtime and order shipping backlog.",
      what_happened: "Sharjah facility actual headcount dropped to 4 workers per shift vs 6.5 scheduled, causing pick cycle times to surge from 45s to 99s.",
      why_analysis: "Absence logs cross-referenced with labor table. Shift lead failed to trigger flex-agency temp labor pool within 4 hours of attendance gap.",
      what_next_recommendation: "Activate 3PL flex-staffing contract with FastTrack Personnel to supply 6 temp pickers on demand; adjust pick routing algorithms to batch single-item orders.",
      assigned_owner: "Amina Al-Hassan (Fulfillment Supervisor)",
      target_kpi: "Reduce average pick cycle time to <45 seconds; eliminate emergency overtime hours.",
      growth_financial_impact: {
        sla_penalty_avoided_aed: 31200,
        overtime_cost_reduced_aed: 18400,
        client_retention_ltv_protected_aed: 180000,
        roi_multiplier: "8.6x"
      },
      approval: incidentApprovals["INC-002"]
    },
    {
      id: "INC-003",
      title: "SKU System Inventory Discrepancy Streak",
      warehouse_id: "WH-AUH-01",
      warehouse_name: "Abu Dhabi Gateway Logistics",
      date_range: "Feb 01 – Feb 28, 2026",
      severity: "MEDIUM",
      metric_affected: "Gulf Pharma Direct Mispick/Shortage Rate 14.8%",
      root_cause: "System quantity_on_hand drifted 18% above physical stock count across 8 fast-moving SKUs for Client CLT-104 due to delayed return processing.",
      what_happened: "Order fulfillment nodes attempted picking unallocated physical inventory, resulting in stock-out cancellations and SLA failure penalty fees.",
      why_analysis: "SQL audit revealed last_cycle_count_date was overdue by 42 days for High-Value Secured category items.",
      what_next_recommendation: "Execute immediate wall-to-wall cycle count for Client CLT-104 SKUs, update ERP inventory flags, and enforce mandatory 24-hr return-to-stock reconciliation rules.",
      assigned_owner: "Rashid Mahmood (Inventory Audit Lead)",
      target_kpi: "Restore inventory count accuracy to 99.8%; reduce order shortage rate to <0.5%.",
      growth_financial_impact: {
        sla_penalty_avoided_aed: 24000,
        stockout_sales_recovered_aed: 62000,
        client_retention_ltv_protected_aed: 220000,
        roi_multiplier: "9.1x"
      },
      approval: incidentApprovals["INC-003"]
    },
    {
      id: "INC-004",
      title: "Carrier On-Time SLA Degradation",
      warehouse_id: "WH-DWC-01",
      warehouse_name: "Al Maktoum Freezone Hub",
      date_range: "Mar 01 – Mar 31, 2026",
      severity: "HIGH",
      metric_affected: "ExpressAir Logistics On-Time Arrival 61.2%",
      root_cause: "ExpressAir Logistics experienced vehicle fleet downtime, missing promised pickup windows and degrading overall outbound dispatch OTIF.",
      what_happened: "ExpressAir on-time arrival rate degraded from 92% to 61.2%, leaving staged pallets occupying shipping lane space.",
      why_analysis: "Carrier dwell time & arrival timestamp analysis showed 48 delayed dispatches out of 115 scheduled runs.",
      what_next_recommendation: "Reallocate 35% of ExpressAir freight volume to Emirates Freight under fallback SLA terms; issue formal carrier performance warning with SLA penalty invoice.",
      assigned_owner: "KHALID AL-ZAROONI (Carrier Management Lead)",
      target_kpi: "Restore outbound carrier arrival punctuality to >95.0%; free up 4 shipping staging lanes.",
      growth_financial_impact: {
        sla_penalty_avoided_aed: 39000,
        carrier_penalty_recovered_aed: 15500,
        client_retention_ltv_protected_aed: 290000,
        roi_multiplier: "11.2x"
      },
      approval: incidentApprovals["INC-004"]
    },
    {
      id: "INC-005",
      title: "Client Order Volume Overrun & Storage Bottleneck",
      warehouse_id: "WH-SHJ-01",
      warehouse_name: "Sharjah Express Fulfillment",
      date_range: "Apr 01 – Apr 30, 2026",
      severity: "CRITICAL",
      metric_affected: "Warehouse Utilization 98.4%, Storage Bottleneck",
      root_cause: "Apex Electronics (CLT-101) launched unannounced promotional campaign, flooding facility volume 65% above contracted monthly allocation limit.",
      what_happened: "Sharjah warehouse pallet position capacity reached 98.4%, creating severe staging congestion and slowing down all secondary client dispatches.",
      why_analysis: "Contract vs actual volume query flagged CLT-101 ordering 7,425 units vs 4,500 monthly contracted ceiling without prior 14-day forecast notification.",
      what_next_recommendation: "Transfer 2,200 pallet positions of CLT-101 overstock to WH-DWC-01 Freezone Hub; renegotiate contract storage tier to introduce 1.5x over-allocation rate fee.",
      assigned_owner: "Faris Al-Sabah (Supply Chain Business Development)",
      target_kpi: "Reduce WH-SHJ-01 storage utilization to 82%; capture $42,000 AED monthly incremental storage revenue.",
      growth_financial_impact: {
        new_storage_revenue_aed: 42000,
        sla_penalties_prevented_aed: 54000,
        client_retention_ltv_protected_aed: 450000,
        roi_multiplier: "15.8x"
      },
      approval: incidentApprovals["INC-005"]
    }
  ];

  res.json(incidents);
});

// 4. Human Approval Gate Endpoint
app.post('/api/approve-recommendation', (req, res) => {
  const { incident_id, approved_by, action } = req.body;
  if (!incident_id) {
    return res.status(400).json({ error: "incident_id is required" });
  }

  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16) + ' GST';

  if (action === 'REJECT') {
    incidentApprovals[incident_id] = {
      status: "Rejected / Requires Revision",
      approvedBy: approved_by || "Executive Approver",
      approvedAt: timestampStr
    };
  } else {
    incidentApprovals[incident_id] = {
      status: "Approved",
      approvedBy: approved_by || "Executive Approver (Ops VP)",
      approvedAt: timestampStr
    };
  }

  res.json({
    success: true,
    incident_id,
    approval: incidentApprovals[incident_id]
  });
});

// 5. Run Live LangGraph Agent Diagnosis Endpoint
app.post('/api/run-agent-diagnosis', (req, res) => {
  const { warehouse_id, start_date, end_date, anomaly_id } = req.body;
  
  const wh = warehouse_id || 'ALL';
  const sDate = start_date || '2025-11-10';
  const eDate = end_date || '2025-11-24';
  const incId = anomaly_id || 'INC-001';

  const pythonScript = path.join(__dirname, 'agents', 'langgraph_3pl_engine.py');
  const command = `python "${pythonScript}" --warehouse ${wh} --start_date ${sDate} --end_date ${eDate} --anomaly_id ${incId}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing LangGraph agent engine:', stderr);
      return res.status(500).json({ error: "Failed to run agent engine" });
    }
    try {
      const brief = JSON.parse(stdout);
      res.json(brief);
    } catch (parseErr) {
      res.status(500).json({ error: "Invalid JSON from agent engine", raw: stdout });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`3PL Control Tower API Server running on http://localhost:${PORT}`);
});
