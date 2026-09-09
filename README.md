# SIH 2026 - Predictive Analytics Framework for Cybercrime Complaints (SIH26184)

> **Ministry of Home Affairs (MHA) Problem Statement**: Development of a Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance, Enabling Generation of Actionable Intelligence for Timely and Proactive Cybercrime Intervention.

---

## Hybrid Development Architecture

For maximum developer velocity during team hackathons:
- **Local Node.js + npm**: Powers React Frontend & Express Backend for instant Hot Module Replacement (HMR) and fast debugging.
- **Docker Desktop**: Hosts PostgreSQL 16 + PostGIS, Python ML Microservice, Apache Spark, and Apache Airflow.

Refer to [`SETUP.md`](file:///C:/Users/Harsh/.gemini/antigravity-ide/scratch/SIH26/SETUP.md) for full team installation and setup instructions.

---

## Tech Stack Overview

- **Frontend**: React (Vite) + Leaflet (Interactive Spatial Map) + Lucide Icons + Glassmorphism Styling.
- **Backend**: Node.js + Express REST API (`pg` Pool driver).
- **Database**: PostgreSQL 16 + PostGIS extension for spatial queries (`postgis/postgis:16-3.4`).
- **ML Microservice**: Python FastAPI, **Spatial DBSCAN** (Haversine spatial metric clustering), **XGBoost** (Withdrawal probability scoring).
- **Simulation**: Apache Spark (Batch telemetry processing).
- **Orchestration**: Apache Airflow (Automated 15-minute pipeline DAG).
- **Containers**: Docker + Docker Compose.

---

## Quick Start (Hybrid Workflow)

1. **Start PostGIS Database**:
   ```bash
   docker compose up -d postgres
   ```

2. **Start Backend API (Local)**:
   ```bash
   cd backend && npm install && npm run dev
   ```

3. **Start Frontend Command Center (Local)**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

4. **Start ML Service Container**:
   ```bash
   docker compose up -d ml-service
   ```
