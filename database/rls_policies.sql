-- RLS Policies for SIH Crime Prediction System
-- This file enables Row Level Security policies to allow frontend access

-- Enable RLS on tables that need frontend access
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicted_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE atm_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE police_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_runs ENABLE ROW LEVEL SECURITY;

-- Complaints Table Policies
-- Allow read access for all authenticated users (field officers, etc.)
CREATE POLICY "Allow read access for authenticated users" ON complaints
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow read access for anonymous users (public dashboard)
CREATE POLICY "Allow read access for anonymous users" ON complaints
  FOR SELECT
  TO anon
  USING (true);

-- Predicted Hotspots Table Policies
-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON predicted_hotspots
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow read access for anonymous users (public dashboard)
CREATE POLICY "Allow read access for anonymous users" ON predicted_hotspots
  FOR SELECT
  TO anon
  USING (true);

-- ATM Locations Table Policies
-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON atm_locations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow read access for anonymous users
CREATE POLICY "Allow read access for anonymous users" ON atm_locations
  FOR SELECT
  TO anon
  USING (true);

-- Police Stations Table Policies
-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON police_stations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow read access for anonymous users
CREATE POLICY "Allow read access for anonymous users" ON police_stations
  FOR SELECT
  TO anon
  USING (true);

-- Model Runs Table Policies
-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON model_runs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow read access for anonymous users
CREATE POLICY "Allow read access for anonymous users" ON model_runs
  FOR SELECT
  TO anon
  USING (true);

-- Note: For production, you should implement more restrictive policies
-- based on user roles, geographic jurisdiction, or specific authentication checks
