import os
import sqlite3
import datetime
import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)

OUTPUT_DIR = "data"
os.makedirs(OUTPUT_DIR, exist_ok=True)
DB_PATH = os.path.join(OUTPUT_DIR, "3pl_warehouse.db")

print("Initializing 3PL Synthetic Data Generation...", flush=True)

# ==========================================
# 1. DIMENSION TABLES
# ==========================================

# A. Warehouses (4 sites)
warehouses_data = [
    {
        "warehouse_id": "WH-DXB-01",
        "warehouse_name": "Dubai South Mega Hub",
        "region": "Dubai South",
        "pallet_capacity": 15000,
        "dock_count": 12,
        "sqft": 250000,
        "base_operating_cost_per_month": 320000.0,
    },
    {
        "warehouse_id": "WH-AUH-01",
        "warehouse_name": "Abu Dhabi Gateway Logistics",
        "region": "Abu Dhabi ICAD",
        "pallet_capacity": 8500,
        "dock_count": 8,
        "sqft": 140000,
        "base_operating_cost_per_month": 190000.0,
    },
    {
        "warehouse_id": "WH-SHJ-01",
        "warehouse_name": "Sharjah Express Fulfillment",
        "region": "Sharjah Industrial",
        "pallet_capacity": 5200,
        "dock_count": 4,
        "sqft": 85000,
        "base_operating_cost_per_month": 115000.0,
    },
    {
        "warehouse_id": "WH-DWC-01",
        "warehouse_name": "Al Maktoum Freezone Hub",
        "region": "DWC Air Cargo",
        "pallet_capacity": 11000,
        "dock_count": 10,
        "sqft": 180000,
        "base_operating_cost_per_month": 240000.0,
    },
]
df_warehouses = pd.DataFrame(warehouses_data)

# B. Clients (10 clients)
clients_data = [
    {"client_id": "CLT-101", "client_name": "Apex Electronics Middle East", "industry": "Consumer Tech", "contract_type": "Enterprise SLA", "monthly_volume_commitment": 4500, "target_otif_pct": 98.5, "sla_penalty_per_late_order": 45.0, "onboarding_date": "2024-01-15"},
    {"client_id": "CLT-102", "client_name": "Velvet & Silk Luxury Fashion", "industry": "Apparel", "contract_type": "Enterprise SLA", "monthly_volume_commitment": 3800, "target_otif_pct": 98.0, "sla_penalty_per_late_order": 50.0, "onboarding_date": "2024-03-01"},
    {"client_id": "CLT-103", "client_name": "Oasis Home & Decor", "industry": "Home Goods", "contract_type": "Standard 3PL", "monthly_volume_commitment": 2500, "target_otif_pct": 95.0, "sla_penalty_per_late_order": 25.0, "onboarding_date": "2024-05-10"},
    {"client_id": "CLT-104", "client_name": "Gulf Pharma Direct", "industry": "Healthcare", "contract_type": "Enterprise SLA", "monthly_volume_commitment": 3200, "target_otif_pct": 99.0, "sla_penalty_per_late_order": 65.0, "onboarding_date": "2024-02-20"},
    {"client_id": "CLT-105", "client_name": "Desert Auto Spares", "industry": "Automotive", "contract_type": "Standard 3PL", "monthly_volume_commitment": 1800, "target_otif_pct": 94.0, "sla_penalty_per_late_order": 20.0, "onboarding_date": "2024-06-15"},
    {"client_id": "CLT-106", "client_name": "Pearl Cosmetics Arabia", "industry": "Beauty & Care", "contract_type": "Standard 3PL", "monthly_volume_commitment": 2200, "target_otif_pct": 96.0, "sla_penalty_per_late_order": 30.0, "onboarding_date": "2024-07-01"},
    {"client_id": "CLT-107", "client_name": "Noon Mart Retail", "industry": "E-Commerce Grocery", "contract_type": "Enterprise SLA", "monthly_volume_commitment": 5000, "target_otif_pct": 98.0, "sla_penalty_per_late_order": 40.0, "onboarding_date": "2024-04-12"},
    {"client_id": "CLT-108", "client_name": "Falcon Sports & Fitness", "industry": "Sporting Goods", "contract_type": "Flex Volume", "monthly_volume_commitment": 1200, "target_otif_pct": 93.0, "sla_penalty_per_late_order": 18.0, "onboarding_date": "2024-08-01"},
    {"client_id": "CLT-109", "client_name": "Nomad Camping & Outdoor", "industry": "Outdoor Retail", "contract_type": "Flex Volume", "monthly_volume_commitment": 900, "target_otif_pct": 92.0, "sla_penalty_per_late_order": 15.0, "onboarding_date": "2024-09-10"},
    {"client_id": "CLT-110", "client_name": "Zenith Gaming & Gadgets", "industry": "Electronics", "contract_type": "Flex Volume (Ramping)", "monthly_volume_commitment": 600, "target_otif_pct": 95.0, "sla_penalty_per_late_order": 35.0, "onboarding_date": "2025-11-01"},
]
df_clients = pd.DataFrame(clients_data)

# C. SKUs (220 SKUs total across clients)
sku_categories = {
    "CLT-101": ("Electronics", ["Smart Watch Pro", "Wireless Earbuds G2", "4K Action Cam", "Fast Charger 65W", "OLED Tablet 10inch"], 40),
    "CLT-102": ("Apparel", ["Silk Scarf Premium", "Designer Denim Jacket", "Leather Handbag", "Cotton Linen Shirt", "Cashmere Sweater"], 35),
    "CLT-103": ("Home Goods", ["Ergonomic Desk Chair", "Bamboo Bed Sheet Set", "LED Floor Lamp", "Ceramic Dinnerware Set", "Memory Foam Pillow"], 25),
    "CLT-104": ("Healthcare", ["Glucose Monitor Kit", "Digital Thermometer", "Vitamin C Complex 1000mg", "First Aid Professional Box", "N95 Respirator Pack"], 30),
    "CLT-105": ("Automotive", ["Synthetic Motor Oil 5L", "Brake Pad Set Front", "Heavy Duty Car Battery", "LED Headlight Bulb H7", "Microfiber Detailing Towel"], 20),
    "CLT-106": ("Beauty & Care", ["Argan Oil Hair Serum", "Hyaluronic Face Cream", "Matte Lipstick Coral", "Organic Sunscreen SPF50", "Exfoliating Scrub"], 22),
    "CLT-107": ("E-Commerce Grocery", ["Organic Olive Oil 1L", "Premium Dates Box 1kg", "Arabica Coffee Beans 500g", "Basmati Rice Reserve 5kg", "Raw Honey Jar"], 25),
    "CLT-108": ("Sporting Goods", ["Adjustable Dumbbell 20kg", "Yoga Mat Non-Slip", "Hydration Backpack 2L", "Resistance Bands Set", "Jump Rope Speed Pro"], 12),
    "CLT-109": ("Outdoor Retail", ["4-Person Dome Tent", "Thermal Sleeping Bag", "Portable Gas Stove", "Camping Lantern 1000lm", "Trekking Poles Pair"], 8),
    "CLT-110": ("Electronics", ["RGB Mechanical Keyboard", "Gaming Mouse 16000DPI", "Surround Sound Headset", "Streamer Condenser Mic", "Dual Controller Charger"], 8),
}

skus_list = []
client_sku_map = {}
sku_counter = 1001

for client_id, (industry, base_items, count) in sku_categories.items():
    client_sku_map[client_id] = []
    for i in range(count):
        base_name = base_items[i % len(base_items)]
        variant = f"Variant {chr(65 + (i // len(base_items)))}"
        storage = "Temperature-Controlled" if industry in ["Healthcare", "Beauty & Care", "E-Commerce Grocery"] and i % 2 == 0 else ("High-Value Secured" if industry in ["Electronics", "Apparel"] and i % 3 == 0 else "Ambient")
        sku_id = f"SKU-{sku_counter}"
        skus_list.append({
            "sku_id": sku_id,
            "client_id": client_id,
            "sku_name": f"{base_name} ({variant})",
            "category": industry,
            "unit_weight_kg": round(float(np.random.uniform(0.2, 12.5)), 2),
            "storage_type": storage,
            "unit_cost": round(float(np.random.uniform(15.0, 450.0)), 2),
        })
        client_sku_map[client_id].append(sku_id)
        sku_counter += 1

df_skus = pd.DataFrame(skus_list)

# D. Inventory Setup
inventory_list = []
wh_ids = df_warehouses["warehouse_id"].tolist()

inv_counter = 5001
for _, sku in df_skus.iterrows():
    primary_wh = wh_ids[hash(sku["client_id"]) % len(wh_ids)]
    secondary_wh = wh_ids[(hash(sku["client_id"]) + 1) % len(wh_ids)]
    
    for wh_id in [primary_wh, secondary_wh]:
        q_on_hand = int(np.random.randint(150, 2500))
        q_reserved = int(q_on_hand * np.random.uniform(0.05, 0.25))
        reorder_pt = int(q_on_hand * 0.2)
        
        recorded = q_on_hand
        physical = q_on_hand
        if sku["client_id"] == "CLT-104" and sku["sku_id"] in client_sku_map["CLT-104"][:8]:
            physical = int(recorded * 0.82)
            
        inventory_list.append({
            "inventory_id": f"INV-{inv_counter}",
            "sku_id": sku["sku_id"],
            "warehouse_id": wh_id,
            "quantity_on_hand": recorded,
            "quantity_reserved": q_reserved,
            "reorder_point": reorder_pt,
            "last_cycle_count_date": "2026-01-15",
            "recorded_count": recorded,
            "physical_count": physical
        })
        inv_counter += 1

df_inventory = pd.DataFrame(inventory_list)

print(f"Dimension Tables Generated: {len(df_warehouses)} Warehouses, {len(df_clients)} Clients, {len(df_skus)} SKUs, {len(df_inventory)} Inventory records.", flush=True)

# ==========================================
# 2. DAILY EVENT LOOP
# ==========================================

start_date = datetime.date(2025, 10, 1)
end_date = datetime.date(2026, 6, 30)
date_range = [start_date + datetime.timedelta(days=x) for x in range((end_date - start_date).days + 1)]

carriers = ["ExpressAir Logistics", "Gulf Overland Express", "Emirates Freight", "RedSea Transit", "Falcon Courier"]
clients_list = df_clients.to_dict("records")

orders_list = []
order_lines_list = []
labor_list = []
dock_list = []

order_counter = 100001
line_counter = 500001
dock_counter = 200001
labor_counter = 800001

print(f"Simulating daily operations across {len(date_range)} days...", flush=True)

for dt in date_range:
    date_str = dt.strftime("%Y-%m-%d")
    day_of_week = dt.weekday()
    is_weekend = day_of_week in [4, 5]
    dow_multiplier = 0.55 if is_weekend else 1.15
    
    is_white_friday = (datetime.date(2025, 11, 20) <= dt <= datetime.date(2025, 11, 30))
    promo_multiplier = 2.1 if is_white_friday else 1.0
    
    # Labor
    for _, wh in df_warehouses.iterrows():
        wh_id = wh["warehouse_id"]
        for shift in ["Morning", "Evening", "Night"]:
            base_hc = 18 if wh_id == "WH-DXB-01" else (12 if wh_id == "WH-DWC-01" else (8 if wh_id == "WH-AUH-01" else 6))
            if is_weekend:
                base_hc = int(base_hc * 0.6)
            if is_white_friday:
                base_hc = int(base_hc * 1.5)
                
            hc_scheduled = base_hc
            
            if wh_id == "WH-SHJ-01" and (datetime.date(2026, 1, 12) <= dt <= datetime.date(2026, 1, 22)):
                hc_actual = int(hc_scheduled * np.random.uniform(0.58, 0.65))
            else:
                hc_actual = max(1, hc_scheduled + int(np.random.choice([0, 0, -1, 1])))
                
            reg_hours = float(hc_actual * 8.0)
            ot_hours = float(hc_actual * np.random.uniform(2.5, 4.0)) if (wh_id == "WH-SHJ-01" and (datetime.date(2026, 1, 12) <= dt <= datetime.date(2026, 1, 22))) or is_white_friday else float(np.random.choice([0.0, 0.0, 1.5, 2.0]))
            
            hourly_rate = 14.5
            labor_cost = round((reg_hours * hourly_rate) + (ot_hours * hourly_rate * 1.5), 2)
            
            labor_list.append({
                "labor_id": f"LBR-{labor_counter}",
                "warehouse_id": wh_id,
                "date": date_str,
                "shift": shift,
                "headcount_scheduled": hc_scheduled,
                "headcount_actual": hc_actual,
                "regular_hours": reg_hours,
                "overtime_hours": ot_hours,
                "hourly_rate": hourly_rate,
                "labor_cost": labor_cost
            })
            labor_counter += 1

    # Dock Appointments
    for _, wh in df_warehouses.iterrows():
        wh_id = wh["warehouse_id"]
        dock_count = wh["dock_count"]
        daily_appts = int(dock_count * np.random.uniform(1.2, 2.0) * dow_multiplier)
        
        for appt_idx in range(daily_appts):
            carrier = np.random.choice(carriers)
            client_id = np.random.choice(df_clients["client_id"])
            
            scheduled_hour = 7 + (appt_idx % 12)
            sched_time = f"{date_str} {scheduled_hour:02d}:00:00"
            
            dwell_mins = int(np.random.normal(35, 8))
            status = "Completed"
            arr_delay_mins = 0
            
            if wh_id == "WH-DXB-01" and (datetime.date(2025, 11, 10) <= dt <= datetime.date(2025, 11, 24)):
                dwell_mins = int(np.random.uniform(135, 195))
                arr_delay_mins = int(np.random.uniform(45, 120))
                status = "Delayed" if arr_delay_mins > 60 else "Completed"
            elif carrier == "ExpressAir Logistics" and (datetime.date(2026, 3, 1) <= dt <= datetime.date(2026, 3, 31)):
                arr_delay_mins = int(np.random.uniform(50, 150))
                dwell_mins += int(np.random.uniform(25, 60))
                status = "Delayed" if arr_delay_mins > 45 else "Completed"
            else:
                arr_delay_mins = int(max(0, np.random.normal(5, 15)))
                if arr_delay_mins > 45:
                    status = "Delayed"
                    
            arr_datetime = datetime.datetime.strptime(sched_time, "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=arr_delay_mins)
            
            dock_list.append({
                "appointment_id": f"DCK-{dock_counter}",
                "warehouse_id": wh_id,
                "carrier_name": carrier,
                "client_id": client_id,
                "date": date_str,
                "scheduled_time": sched_time,
                "actual_arrival_time": arr_datetime.strftime("%Y-%m-%d %H:%M:%S"),
                "dwell_time_minutes": dwell_mins,
                "status": status,
                "dock_number": (appt_idx % dock_count) + 1
            })
            dock_counter += 1

    # Client Orders
    for client in clients_list:
        c_id = client["client_id"]
        monthly_commit = client["monthly_volume_commitment"]
        base_daily_orders = (monthly_commit / 30.0) * dow_multiplier * promo_multiplier
        
        if c_id == "CLT-110":
            if dt < datetime.date(2025, 11, 1):
                continue
            days_since_onboard = (dt - datetime.date(2025, 11, 1)).days
            ramp_factor = min(1.0, 0.15 + (days_since_onboard / 120.0))
            base_daily_orders *= ramp_factor
            
        if c_id == "CLT-101" and (datetime.date(2026, 4, 1) <= dt <= datetime.date(2026, 4, 30)):
            base_daily_orders *= 1.65
            
        num_orders = int(np.random.poisson(base_daily_orders))
        available_skus = client_sku_map.get(c_id, [])
        if not available_skus:
            continue
            
        for _ in range(num_orders):
            if c_id == "CLT-101" and (datetime.date(2026, 4, 1) <= dt <= datetime.date(2026, 4, 30)):
                wh_id = "WH-SHJ-01"
            else:
                wh_id = wh_ids[order_counter % len(wh_ids)]
                
            carrier = np.random.choice(carriers)
            promised_days = 2 if client["contract_type"] == "Enterprise SLA" else 3
            promised_date = dt + datetime.timedelta(days=promised_days)
            
            ship_delay_days = 0
            is_otif = 1
            order_status = "Shipped"
            
            if wh_id == "WH-DXB-01" and (datetime.date(2025, 11, 10) <= dt <= datetime.date(2025, 11, 24)):
                if np.random.rand() < 0.28:
                    ship_delay_days = int(np.random.choice([1, 2, 3]))
                    is_otif = 0
            elif wh_id == "WH-SHJ-01" and (datetime.date(2026, 1, 12) <= dt <= datetime.date(2026, 1, 22)):
                if np.random.rand() < 0.35:
                    ship_delay_days = int(np.random.choice([1, 2]))
                    is_otif = 0
            elif carrier == "ExpressAir Logistics" and (datetime.date(2026, 3, 1) <= dt <= datetime.date(2026, 3, 31)):
                if np.random.rand() < 0.32:
                    ship_delay_days = int(np.random.choice([1, 2]))
                    is_otif = 0
            elif c_id == "CLT-101" and wh_id == "WH-SHJ-01" and (datetime.date(2026, 4, 1) <= dt <= datetime.date(2026, 4, 30)):
                if np.random.rand() < 0.30:
                    ship_delay_days = int(np.random.choice([1, 2, 3]))
                    is_otif = 0
                    
            actual_ship_date = dt + datetime.timedelta(days=promised_days + ship_delay_days)
            order_id = f"ORD-{order_counter}"
            
            orders_list.append({
                "order_id": order_id,
                "client_id": c_id,
                "warehouse_id": wh_id,
                "carrier_name": carrier,
                "order_date": date_str,
                "promised_ship_date": promised_date.strftime("%Y-%m-%d"),
                "actual_ship_date": actual_ship_date.strftime("%Y-%m-%d"),
                "status": order_status,
                "otif_flag": is_otif,
                "order_priority": "Express" if client["contract_type"] == "Enterprise SLA" else "Standard"
            })
            
            num_lines = int(np.random.choice([1, 2, 3, 4], p=[0.5, 0.3, 0.15, 0.05]))
            selected_sku_ids = np.random.choice(available_skus, size=min(num_lines, len(available_skus)), replace=False)
            
            for sku_id in selected_sku_ids:
                qty_ordered = int(np.random.choice([1, 2, 3, 5, 10], p=[0.4, 0.3, 0.15, 0.1, 0.05]))
                qty_picked = qty_ordered
                line_status = "Fulfilled"
                
                base_pick_time = int(np.random.normal(45, 10))
                base_pack_time = int(np.random.normal(30, 8))
                
                if wh_id == "WH-SHJ-01" and (datetime.date(2026, 1, 12) <= dt <= datetime.date(2026, 1, 22)):
                    base_pick_time = int(base_pick_time * 2.2)
                    base_pack_time = int(base_pack_time * 2.0)
                    
                if c_id == "CLT-104" and (datetime.date(2026, 2, 1) <= dt <= datetime.date(2026, 2, 28)):
                    drift_skus = available_skus[:8]
                    if sku_id in drift_skus and np.random.rand() < 0.25:
                        qty_picked = max(0, qty_ordered - int(np.random.choice([1, 2])))
                        line_status = "Shortage" if qty_picked < qty_ordered else "Fulfilled"
                        if qty_picked < qty_ordered:
                            orders_list[-1]["otif_flag"] = 0
                            
                order_lines_list.append({
                    "line_id": f"LNE-{line_counter}",
                    "order_id": order_id,
                    "sku_id": sku_id,
                    "quantity_ordered": qty_ordered,
                    "quantity_picked": qty_picked,
                    "pick_time_seconds": base_pick_time,
                    "pack_time_seconds": base_pack_time,
                    "line_status": line_status
                })
                line_counter += 1
                
            order_counter += 1

df_orders = pd.DataFrame(orders_list)
df_order_lines = pd.DataFrame(order_lines_list)
df_labor = pd.DataFrame(labor_list)
df_dock = pd.DataFrame(dock_list)

print(f"Daily Operations Generated: {len(df_orders):,} Orders, {len(df_order_lines):,} Order Lines, {len(df_labor):,} Labor Records, {len(df_dock):,} Dock Appointments.", flush=True)

# Monthly Costs
months = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]
costs_list = []
cost_counter = 9001

for m in months:
    for _, wh in df_warehouses.iterrows():
        wh_id = wh["warehouse_id"]
        base_overhead = wh["base_operating_cost_per_month"]
        
        wh_labor_m = df_labor[(df_labor["warehouse_id"] == wh_id) & (df_labor["date"].str.startswith(m))]
        m_labor_cost = float(wh_labor_m["labor_cost"].sum()) if len(wh_labor_m) > 0 else base_overhead * 0.4
        
        wh_orders_m = df_orders[(df_orders["warehouse_id"] == wh_id) & (df_orders["order_date"].str.startswith(m))]
        m_order_count = len(wh_orders_m)
        late_orders_count = len(wh_orders_m[wh_orders_m["otif_flag"] == 0])
        
        m_transport_cost = round(m_order_count * 18.5, 2)
        m_penalty_cost = round(late_orders_count * 35.0, 2)
        
        total_m_cost = round(base_overhead + m_labor_cost + m_transport_cost + m_penalty_cost, 2)
        
        costs_list.append({
            "cost_id": f"CST-{cost_counter}",
            "warehouse_id": wh_id,
            "month": m,
            "labor_cost": m_labor_cost,
            "storage_overhead_cost": base_overhead,
            "transportation_cost": m_transport_cost,
            "penalty_cost": m_penalty_cost,
            "total_cost": total_m_cost
        })
        cost_counter += 1

df_costs = pd.DataFrame(costs_list)

# Save Files
print("Writing tables to CSV files in 'data/' directory...", flush=True)

df_warehouses.to_csv(os.path.join(OUTPUT_DIR, "warehouses.csv"), index=False)
df_clients.to_csv(os.path.join(OUTPUT_DIR, "clients.csv"), index=False)
df_skus.to_csv(os.path.join(OUTPUT_DIR, "skus.csv"), index=False)
df_inventory.to_csv(os.path.join(OUTPUT_DIR, "inventory.csv"), index=False)
df_labor.to_csv(os.path.join(OUTPUT_DIR, "labor.csv"), index=False)
df_dock.to_csv(os.path.join(OUTPUT_DIR, "dock_appointments.csv"), index=False)
df_orders.to_csv(os.path.join(OUTPUT_DIR, "orders.csv"), index=False)
df_order_lines.to_csv(os.path.join(OUTPUT_DIR, "order_lines.csv"), index=False)
df_costs.to_csv(os.path.join(OUTPUT_DIR, "costs.csv"), index=False)

print(f"Building SQLite database at '{DB_PATH}'...", flush=True)

conn = sqlite3.connect(DB_PATH)
df_warehouses.to_sql("warehouses", conn, if_exists="replace", index=False)
df_clients.to_sql("clients", conn, if_exists="replace", index=False)
df_skus.to_sql("skus", conn, if_exists="replace", index=False)
df_inventory.to_sql("inventory", conn, if_exists="replace", index=False)
df_labor.to_sql("labor", conn, if_exists="replace", index=False)
df_dock.to_sql("dock_appointments", conn, if_exists="replace", index=False)
df_orders.to_sql("orders", conn, if_exists="replace", index=False)
df_order_lines.to_sql("order_lines", conn, if_exists="replace", index=False)
df_costs.to_sql("costs", conn, if_exists="replace", index=False)

# Create KPI summary view directly in SQL!
conn.execute("""
CREATE VIEW IF NOT EXISTS v_daily_kpis AS
SELECT 
    o.order_date,
    o.warehouse_id,
    w.warehouse_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.otif_flag) AS otif_orders,
    ROUND(CAST(SUM(o.otif_flag) AS FLOAT) / COUNT(o.order_id) * 100.0, 2) AS otif_percentage,
    AVG(d.dwell_time_minutes) AS avg_dock_dwell_time_mins
FROM orders o
JOIN warehouses w ON o.warehouse_id = w.warehouse_id
LEFT JOIN dock_appointments d ON o.warehouse_id = d.warehouse_id AND o.order_date = d.date
GROUP BY o.order_date, o.warehouse_id;
""")

conn.commit()
conn.close()

print("Successfully generated 3PL synthetic dataset & SQLite warehouse database!", flush=True)
