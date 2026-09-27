-- RLS Policies and Database Grants for SIH Crime Prediction System
-- Run this script in your Supabase SQL Editor to grant table privileges and enable RLS policies.

-- =================================================================
-- 1. Schema & Table Grants for Supabase Roles (anon & authenticated)
-- =================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.complaints TO anon, authenticated;
GRANT INSERT ON public.cybercrime_complaints TO anon, authenticated;
GRANT UPDATE ON public.predicted_hotspots TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Default grants for any future tables created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

-- =================================================================
-- 2. Enable Row Level Security (RLS) on Application Tables
-- =================================================================
ALTER TABLE IF EXISTS public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.predicted_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.atm_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.police_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.model_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cybercrime_complaints ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 3. Complaints Table Policies
-- =================================================================
DROP POLICY IF EXISTS "Allow read access on complaints" ON public.complaints;
CREATE POLICY "Allow read access on complaints" ON public.complaints
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow insert on complaints" ON public.complaints;
CREATE POLICY "Allow insert on complaints" ON public.complaints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =================================================================
-- 4. Predicted Hotspots Table Policies
-- =================================================================
DROP POLICY IF EXISTS "Allow read access on predicted_hotspots" ON public.predicted_hotspots;
CREATE POLICY "Allow read access on predicted_hotspots" ON public.predicted_hotspots
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow update on predicted_hotspots" ON public.predicted_hotspots;
CREATE POLICY "Allow update on predicted_hotspots" ON public.predicted_hotspots
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =================================================================
-- 5. ATM Locations Table Policies
-- =================================================================
DROP POLICY IF EXISTS "Allow read access on atm_locations" ON public.atm_locations;
CREATE POLICY "Allow read access on atm_locations" ON public.atm_locations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =================================================================
-- 6. Police Stations Table Policies
-- =================================================================
DROP POLICY IF EXISTS "Allow read access on police_stations" ON public.police_stations;
CREATE POLICY "Allow read access on police_stations" ON public.police_stations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =================================================================
-- 7. Model Runs Table Policies
-- =================================================================
DROP POLICY IF EXISTS "Allow read access on model_runs" ON public.model_runs;
CREATE POLICY "Allow read access on model_runs" ON public.model_runs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =================================================================
-- 8. Predictions Table Policies (0 rows currently, ready for data)
-- =================================================================
DROP POLICY IF EXISTS "Allow read access on predictions" ON public.predictions;
CREATE POLICY "Allow read access on predictions" ON public.predictions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =================================================================
-- 9. Cybercrime Complaints Table Policies (Sensitive Data)
-- Allows inserting new complaints and reading for authenticated roles / backend
-- =================================================================
DROP POLICY IF EXISTS "Allow insert on cybercrime_complaints" ON public.cybercrime_complaints;
CREATE POLICY "Allow insert on cybercrime_complaints" ON public.cybercrime_complaints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access on cybercrime_complaints" ON public.cybercrime_complaints;
CREATE POLICY "Allow read access on cybercrime_complaints" ON public.cybercrime_complaints
  FOR SELECT
  TO anon, authenticated
  USING (true);

