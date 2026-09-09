import random
from datetime import datetime, timedelta

def generate_sql_seed():
    """Generates synthetic SQL inserts for police stations, complaints, and ATMs using GEOGRAPHY(POINT, 4326)."""
    
    cities = {
        "Delhi NCR": {"lat": 28.6139, "lon": 77.2090},
        "Mumbai": {"lat": 19.0760, "lon": 72.8777},
        "Bengaluru": {"lat": 12.9716, "lon": 77.5946}
    }
    
    banks = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Bank of Baroda", "Axis Bank"]
    fraud_types = ["Digital Arrest Scam", "OTP / Phishing Scam", "Stock Market Investment Fraud", "Work from Home Job Scam", "Part-Time Task Scam"]

    sql_statements = [
        "-- Seed Data for Cybercrime Analytics Framework\n",
        "-- 1. Initial Baseline Model Run Entry\n",
        "INSERT INTO model_runs (model_version, algorithm, accuracy, precision, recall, f1_score) "
        "VALUES ('v1.0.4-spatial', 'Spatial DBSCAN + XGBoost Engine', 0.9420, 0.9280, 0.9510, 0.9393);\n"
    ]

    # Generate Police Stations
    ps_counter = 1
    for city_name, coords in cities.items():
        for i in range(3):
            lat = coords["lat"] + random.uniform(-0.04, 0.04)
            lon = coords["lon"] + random.uniform(-0.04, 0.04)
            ps_name = f"{city_name} Sector {i+1} Cyber Police Station"
            j_code = f"PS-{city_name[:3].upper()}-{ps_counter:03d}"
            contact = f"+91112334{ps_counter:04d}"
            ps_counter += 1
            sql_statements.append(
                f"INSERT INTO police_stations (station_name, jurisdiction_code, contact_number, city, state, geom) "
                f"VALUES ('{ps_name}', '{j_code}', '{contact}', '{city_name}', 'State', "
                f"ST_GeographyFromText('POINT({lon:.6f} {lat:.6f})'));"
            )

    # Generate ATMs
    atm_id_counter = 1001
    for city_name, coords in cities.items():
        for i in range(12):
            lat = coords["lat"] + random.uniform(-0.08, 0.08)
            lon = coords["lon"] + random.uniform(-0.08, 0.08)
            bank = random.choice(banks)
            atm_id = f"ATM-{atm_id_counter}"
            atm_id_counter += 1
            risk = random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
            sql_statements.append(
                f"INSERT INTO atm_locations (atm_id, bank_name, address, city, state, geom, risk_tier) "
                f"VALUES ('{atm_id}', '{bank}', '{bank} ATM, Sector {i+1}, {city_name}', '{city_name}', 'State', "
                f"ST_GeographyFromText('POINT({lon:.6f} {lat:.6f})'), '{risk}');"
            )

    # Generate Cybercrime Complaints
    for i in range(1, 101):
        ack_no = f"2026MHA{i:06d}"
        victim = f"Victim_{i}"
        contact = f"+9198{random.randint(10000000, 99999999)}"
        fraud_type = random.choice(fraud_types)
        amount = round(random.uniform(15000, 450000), 2)
        mule_bank = random.choice(banks)
        mule_acc = f"{random.randint(10000000000, 99999999999)}"
        
        city_name = random.choice(list(cities.keys()))
        base_coords = cities[city_name]
        
        # Spatial Clustering around hotspots
        cluster_bias = random.choice([0.01, -0.01, 0.03, -0.03])
        lat = base_coords["lat"] + cluster_bias + random.uniform(-0.015, 0.015)
        lon = base_coords["lon"] + cluster_bias + random.uniform(-0.015, 0.015)
        
        incident_time = datetime.now() - timedelta(hours=random.randint(1, 72))
        
        sql_statements.append(
            f"INSERT INTO cybercrime_complaints (acknowledgement_no, victim_name, victim_contact, fraud_category, fraud_amount, incident_timestamp, mule_bank_name, mule_account_no, victim_address, geom, status) "
            f"VALUES ('{ack_no}', '{victim}', '{contact}', '{fraud_type}', {amount}, '{incident_time.isoformat()}', '{mule_bank}', '{mule_acc}', 'Address {i}, {city_name}', "
            f"ST_GeographyFromText('POINT({lon:.6f} {lat:.6f})'), 'UNDER_INVESTIGATION');"
        )

    with open("database/seed.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements))
    print("Updated seed SQL script generated successfully at database/seed.sql")

if __name__ == "__main__":
    generate_sql_seed()
