import sqlite3
import os
import pandas as pd

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "3pl_warehouse.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def query_otif_and_dwell(warehouse_id="ALL", start_date="2025-10-01", end_date="2026-06-30"):
    """Queries daily OTIF percentage and average dock dwell time for a warehouse and date range."""
    conn = get_connection()
    wh_filter_orders = "" if warehouse_id == "ALL" else f"AND warehouse_id = '{warehouse_id}'"
    wh_filter_dock = "" if warehouse_id == "ALL" else f"AND warehouse_id = '{warehouse_id}'"

    sql = f"""
    SELECT 
        o.order_date,
        COUNT(o.order_id) AS total_orders,
        SUM(o.otif_flag) AS otif_orders,
        ROUND(CAST(SUM(o.otif_flag) AS FLOAT) / COUNT(o.order_id) * 100.0, 2) AS otif_pct,
        (SELECT ROUND(AVG(d.dwell_time_minutes), 1) 
         FROM dock_appointments d 
         WHERE d.date = o.order_date {wh_filter_dock}) AS avg_dwell_mins
    FROM orders o
    WHERE o.order_date BETWEEN '{start_date}' AND '{end_date}' {wh_filter_orders}
    GROUP BY o.order_date
    ORDER BY o.order_date ASC
    """
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df

def query_labor_headcount_gap(warehouse_id="ALL", start_date="2025-10-01", end_date="2026-06-30"):
    """Queries scheduled vs actual labor headcount and overtime hours."""
    conn = get_connection()
    wh_filter = "" if warehouse_id == "ALL" else f"AND warehouse_id = '{warehouse_id}'"

    sql = f"""
    SELECT 
        date,
        warehouse_id,
        SUM(headcount_scheduled) AS scheduled_hc,
        SUM(headcount_actual) AS actual_hc,
        SUM(regular_hours) AS reg_hours,
        SUM(overtime_hours) AS ot_hours,
        ROUND(SUM(labor_cost), 2) AS total_labor_cost
    FROM labor
    WHERE date BETWEEN '{start_date}' AND '{end_date}' {wh_filter}
    GROUP BY date, warehouse_id
    HAVING actual_hc < scheduled_hc OR ot_hours > 10
    ORDER BY date ASC
    """
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df

def query_carrier_performance(start_date="2025-10-01", end_date="2026-06-30"):
    """Queries carrier punctuality and delay metrics."""
    conn = get_connection()
    sql = f"""
    SELECT 
        carrier_name,
        COUNT(appointment_id) AS total_appointments,
        SUM(CASE WHEN status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_appts,
        ROUND(AVG(dwell_time_minutes), 1) AS avg_dwell_mins,
        ROUND((1.0 - CAST(SUM(CASE WHEN status = 'Delayed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(appointment_id)) * 100.0, 1) AS on_time_rate
    FROM dock_appointments
    WHERE date BETWEEN '{start_date}' AND '{end_date}'
    GROUP BY carrier_name
    ORDER BY on_time_rate ASC
    """
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df

def query_inventory_drift(client_id=None):
    """Queries inventory items where system count drifts from physical count."""
    conn = get_connection()
    client_filter = f"WHERE s.client_id = '{client_id}'" if client_id else ""
    sql = f"""
    SELECT 
        i.inventory_id,
        i.sku_id,
        s.sku_name,
        s.client_id,
        c.client_name,
        i.warehouse_id,
        i.recorded_count,
        i.physical_count,
        (i.recorded_count - i.physical_count) AS variance
    FROM inventory i
    JOIN skus s ON i.sku_id = s.sku_id
    JOIN clients c ON s.client_id = c.client_id
    {client_filter}
    WHERE i.recorded_count != i.physical_count
    """
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df

def query_client_volume_surge(start_date="2025-10-01", end_date="2026-06-30"):
    """Queries client volume vs contracted monthly volume commitment."""
    conn = get_connection()
    sql = f"""
    SELECT 
        c.client_id,
        c.client_name,
        c.monthly_volume_commitment,
        COUNT(o.order_id) AS actual_volume,
        ROUND(CAST(COUNT(o.order_id) AS FLOAT) / (c.monthly_volume_commitment / 30.0 * 273) * 100.0, 1) AS commitment_utilization_pct
    FROM clients c
    JOIN orders o ON c.client_id = o.client_id
    WHERE o.order_date BETWEEN '{start_date}' AND '{end_date}'
    GROUP BY c.client_id
    ORDER BY actual_volume DESC
    """
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df
