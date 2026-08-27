-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. Police Stations Table (LEA Jurisdiction)
CREATE TABLE IF NOT EXISTS police_stations (
    id SERIAL PRIMARY KEY,
    station_name VARCHAR(120) NOT NULL,
    jurisdiction_code VARCHAR(50) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cybercrime Complaints Table (NCRB 1930 / MHA Schema aligned)
CREATE TABLE IF NOT EXISTS cybercrime_complaints (
    id SERIAL PRIMARY KEY,
    acknowledgement_no VARCHAR(50) UNIQUE NOT NULL,
    victim_name VARCHAR(100),
    victim_contact VARCHAR(20),
    fraud_category VARCHAR(50) NOT NULL,
    fraud_amount NUMERIC(12, 2) NOT NULL,
    incident_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    mule_bank_name VARCHAR(100),
    mule_account_no VARCHAR(50),
    victim_address TEXT,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    status VARCHAR(30) DEFAULT 'UNDER_INVESTIGATION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ATM & Cash Withdrawal Points Table
CREATE TABLE IF NOT EXISTS atm_locations (
    id SERIAL PRIMARY KEY,
    atm_id VARCHAR(50) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    risk_tier VARCHAR(20) DEFAULT 'LOW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Model Runs Tracking Table (MLOps Provenance)
CREATE TABLE IF NOT EXISTS model_runs (
    id SERIAL PRIMARY KEY,
    model_version VARCHAR(50) NOT NULL,
    algorithm VARCHAR(50) DEFAULT 'Spatial DBSCAN + XGBoost',
    training_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accuracy NUMERIC(5, 4) DEFAULT 0.9420,
    precision NUMERIC(5, 4) DEFAULT 0.9280,
    recall NUMERIC(5, 4) DEFAULT 0.9510,
    f1_score NUMERIC(5, 4) DEFAULT 0.9393,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ML Predicted Withdrawal Hotspots & Risk Scores
CREATE TABLE IF NOT EXISTS predicted_hotspots (
    id SERIAL PRIMARY KEY,
    model_run_id INT REFERENCES model_runs(id) ON DELETE SET NULL,
    cluster_id INT NOT NULL,
    center_geom GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters DOUBLE PRECISION DEFAULT 1000.0,
    risk_score NUMERIC(5, 4) NOT NULL,
    total_complaints_in_cluster INT DEFAULT 1,
    total_fraud_volume NUMERIC(12, 2) DEFAULT 0.00,
    predicted_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    atm_location_id INT REFERENCES atm_locations(id) ON DELETE SET NULL,
    assigned_police_station_id INT REFERENCES police_stations(id) ON DELETE SET NULL,
    actionable_intelligence TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Indexes for Spatial Query Acceleration
CREATE INDEX IF NOT EXISTS idx_police_stations_geom ON police_stations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_complaints_geom ON cybercrime_complaints USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_atms_geom ON atm_locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_hotspots_geom ON predicted_hotspots USING GIST(center_geom);

-- B-Tree Performance & Operational Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_timestamp ON cybercrime_complaints(incident_timestamp);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON cybercrime_complaints(fraud_category);
CREATE INDEX IF NOT EXISTS idx_hotspots_status ON predicted_hotspots(status);
