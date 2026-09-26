-- =============================================================
-- SIH 2026 — Cybercrime Predictive Analytics
-- Run this ENTIRE file in Supabase SQL Editor (one shot)
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. POLICE STATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS police_stations (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  station_code    TEXT UNIQUE,
  city            TEXT,
  district        TEXT,
  state           TEXT,
  jurisdiction    TEXT,
  contact_number  TEXT,
  geom            GEOGRAPHY(POINT, 4326),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ps_geom ON police_stations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_ps_state ON police_stations(state);

-- =============================================================
-- 2. ATM LOCATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS atm_locations (
  id           BIGSERIAL PRIMARY KEY,
  atm_id       TEXT UNIQUE,
  bank_name    TEXT NOT NULL,
  address      TEXT,
  city         TEXT,
  district     TEXT,
  state        TEXT,
  pincode      TEXT,
  risk_tier    TEXT DEFAULT 'LOW' CHECK (risk_tier IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  geom         GEOGRAPHY(POINT, 4326),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atm_geom  ON atm_locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_atm_state ON atm_locations(state);
CREATE INDEX IF NOT EXISTS idx_atm_risk  ON atm_locations(risk_tier);

-- =============================================================
-- 3. CYBERCRIME COMPLAINTS
-- =============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id                   BIGSERIAL PRIMARY KEY,
  acknowledgement_no   TEXT UNIQUE NOT NULL,
  fraud_category       TEXT NOT NULL,
  -- Matches your fraud_type_enc.pkl categories:
  -- UPI_FRAUD, KYC_SCAM, INVESTMENT_FRAUD, OTP_FRAUD,
  -- JOB_SCAM, LOAN_SCAM, SEXTORTION, COURIER_FRAUD, OTHER
  fraud_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
  victim_name          TEXT,
  victim_phone         TEXT,
  victim_email         TEXT,
  victim_bank          TEXT,
  victim_account_no    TEXT,
  mule_bank_name       TEXT,
  mule_account_no      TEXT,
  incident_timestamp   TIMESTAMPTZ NOT NULL,
  filing_timestamp     TIMESTAMPTZ DEFAULT NOW(),
  state                TEXT,
  district             TEXT,
  city                 TEXT,
  pincode              TEXT,
  geom                 GEOGRAPHY(POINT, 4326),
  status               TEXT DEFAULT 'UNDER_INVESTIGATION'
                       CHECK (status IN ('UNDER_INVESTIGATION','PROCESSED','CLOSED')),
  ncrp_portal_source   BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cc_geom       ON complaints USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_cc_status     ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_cc_created    ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cc_category   ON complaints(fraud_category);

-- =============================================================
-- 4. MODEL RUNS  (tracks which ML ensemble run produced predictions)
-- =============================================================
CREATE TABLE IF NOT EXISTS model_runs (
  id              BIGSERIAL PRIMARY KEY,
  model_version   TEXT DEFAULT 'v1.0',
  training_date   TIMESTAMPTZ DEFAULT NOW(),
  xgb_accuracy    NUMERIC(5,4),
  xgb_precision   NUMERIC(5,4),
  xgb_recall      NUMERIC(5,4),
  xgb_f1          NUMERIC(5,4),
  dbscan_clusters INT,
  gnn_enabled     BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a default model run so FK works immediately
INSERT INTO model_runs (model_version, notes, gnn_enabled)
VALUES ('v1.0', 'Initial deployment — XGBoost + DBSCAN ensemble', true)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 5. PREDICTED HOTSPOTS  (engine writes here → Realtime fires)
-- =============================================================
CREATE TABLE IF NOT EXISTS predicted_hotspots (
  id                          BIGSERIAL PRIMARY KEY,
  model_run_id                BIGINT REFERENCES model_runs(id) ON DELETE SET NULL,
  complaint_id                BIGINT REFERENCES complaints(id) ON DELETE SET NULL,
  cluster_id                  INT,
  -- PostGIS geography point
  center_geom                 GEOGRAPHY(POINT, 4326),
  -- Flat lat/lng for easy frontend consumption (no PostGIS parsing needed)
  lat                         NUMERIC(10,6) NOT NULL,
  lng                         NUMERIC(10,6) NOT NULL,
  radius_meters               NUMERIC DEFAULT 2000,
  risk_score                  NUMERIC(5,4) NOT NULL,  -- 0.0000 to 1.0000
  alert_level                 TEXT NOT NULL CHECK (alert_level IN ('P1','P2','P3')),
  top_fraud_category          TEXT,
  total_complaints_in_cluster INT DEFAULT 1,
  total_fraud_volume          NUMERIC(14,2) DEFAULT 0,
  predicted_window_start      TIMESTAMPTZ,
  predicted_window_end        TIMESTAMPTZ,
  atm_location_id             BIGINT REFERENCES atm_locations(id) ON DELETE SET NULL,
  assigned_police_station_id  BIGINT REFERENCES police_stations(id) ON DELETE SET NULL,
  district                    TEXT,
  state                       TEXT,
  actionable_intelligence     TEXT,
  -- SHAP feature importance for XAI panel
  shap_top_features           JSONB DEFAULT '[]',
  -- Raw ML output for debugging
  ml_raw_output               JSONB DEFAULT '{}',
  status                      TEXT DEFAULT 'ACTIVE'
                              CHECK (status IN ('ACTIVE','ACKNOWLEDGED','RESOLVED','EXPIRED')),
  acknowledged_by             TEXT,
  acknowledged_at             TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ph_geom        ON predicted_hotspots USING GIST(center_geom);
CREATE INDEX IF NOT EXISTS idx_ph_status      ON predicted_hotspots(status);
CREATE INDEX IF NOT EXISTS idx_ph_alert_level ON predicted_hotspots(alert_level);
CREATE INDEX IF NOT EXISTS idx_ph_created     ON predicted_hotspots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ph_risk        ON predicted_hotspots(risk_score DESC);

-- Keep existing databases aligned if predicted_hotspots was created with
-- the previous cybercrime_complaints table name.
ALTER TABLE predicted_hotspots
  DROP CONSTRAINT IF EXISTS predicted_hotspots_complaint_id_fkey;
ALTER TABLE predicted_hotspots
  ADD CONSTRAINT predicted_hotspots_complaint_id_fkey
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL;

-- =============================================================
-- 6. ENABLE SUPABASE REALTIME
-- (The dashboard uses this for live map updates)
-- =============================================================
ALTER TABLE predicted_hotspots REPLICA IDENTITY FULL;
ALTER TABLE complaints REPLICA IDENTITY FULL;

-- =============================================================
-- 7. SEED DATA — Police Stations
-- =============================================================
INSERT INTO police_stations (name, station_code, city, district, state, geom) VALUES
('Rohini Sector 14 PS',  'DL-ROH-014', 'Delhi',     'North West Delhi', 'Delhi',        ST_SetSRID(ST_MakePoint(77.0900, 28.7100), 4326)),
('Andheri PS',           'MH-AND-001', 'Mumbai',    'Mumbai Suburban',  'Maharashtra',   ST_SetSRID(ST_MakePoint(72.8600, 19.1200), 4326)),
('Cyberabad PS',         'TS-CYB-001', 'Hyderabad', 'Rangareddy',       'Telangana',     ST_SetSRID(ST_MakePoint(78.3500, 17.4400), 4326)),
('Nashik Road PS',       'MH-NSK-002', 'Nashik',    'Nashik',           'Maharashtra',   ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326)),
('Lalbazar PS',          'WB-LAL-001', 'Kolkata',   'Kolkata',          'West Bengal',   ST_SetSRID(ST_MakePoint(88.3697, 22.5726), 4326)),
('Anna Nagar PS',        'TN-ANN-001', 'Chennai',   'Chennai',          'Tamil Nadu',    ST_SetSRID(ST_MakePoint(80.2107, 13.0827), 4326))
ON CONFLICT DO NOTHING;

-- =============================================================
-- 8. SEED DATA — ATM Locations
-- =============================================================
INSERT INTO atm_locations (atm_id, bank_name, city, district, state, risk_tier, geom) VALUES
('ATM-DL-001',  'SBI',   'Delhi',     'North West Delhi', 'Delhi',       'HIGH',     ST_SetSRID(ST_MakePoint(77.0780, 28.7041), 4326)),
('ATM-MH-001',  'HDFC',  'Mumbai',    'Mumbai Suburban',  'Maharashtra', 'CRITICAL', ST_SetSRID(ST_MakePoint(72.8697, 19.1136), 4326)),
('ATM-TS-001',  'ICICI', 'Hyderabad', 'Rangareddy',       'Telangana',   'HIGH',     ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326)),
('ATM-MH-002',  'Axis',  'Nashik',    'Nashik',           'Maharashtra', 'MEDIUM',   ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326)),
('ATM-DL-002',  'PNB',   'Delhi',     'Central Delhi',    'Delhi',       'MEDIUM',   ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)),
('ATM-WB-001',  'SBI',   'Kolkata',   'Kolkata',          'West Bengal', 'HIGH',     ST_SetSRID(ST_MakePoint(88.3697, 22.5726), 4326)),
('ATM-TS-002',  'HDFC',  'Hyderabad', 'Hyderabad',        'Telangana',   'CRITICAL', ST_SetSRID(ST_MakePoint(78.5011, 17.3616), 4326)),
('ATM-TN-001',  'ICICI', 'Chennai',   'Chennai',          'Tamil Nadu',  'MEDIUM',   ST_SetSRID(ST_MakePoint(80.2107, 13.0827), 4326))
ON CONFLICT DO NOTHING;
