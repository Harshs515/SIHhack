# SIH 2026 Team Onboarding & Setup Guide (SIH26184)

This repository uses a **Hybrid Development Architecture**:
- **Frontend & Backend**: Local Node.js + npm (`npm run dev` for instant HMR & fast API debugging).
- **Database & Services**: Docker Desktop (`PostgreSQL + PostGIS`, `Python ML Engine`, `Apache Spark`, `Apache Airflow`).

---

## 🛠️ Required Prerequisites for Team Members

| Tool | Status | Download Link | Purpose |
|------|--------|---------------|---------|
| **Git** | Mandatory | [git-scm.com](https://git-scm.com/) | Version control & GitHub sync |
| **Node.js LTS** | Mandatory | [nodejs.org](https://nodejs.org/) | Local React (Vite) & Express API runtime |
| **Docker Desktop** | Mandatory | [docker.com](https://www.docker.com/products/docker-desktop/) | PostGIS DB, ML Engine, Spark & Airflow containers |
| **VS Code / Antigravity** | Recommended | - | IDE & pair programming |

---

## 🚀 Quick Start Guide for Team Members

### Step 1: Clone Repository & Verify Node.js

```bash
git clone https://github.com/NeuroRogue/SIH26.git
cd SIH26
```

Verify Node.js installation:
```bash
node -v
npm -v
```

---

### Step 2: Start PostGIS Database Container

Launch the spatial database container:
```bash
docker compose up -d postgres
```

Seed synthetic Indian cybercrime complaint & ATM datasets:
```bash
python database/seed_data.py
```

---

### Step 3: Run Backend API Locally (Express)

In a new terminal window:
```bash
cd backend
npm install
npm run dev
```
- **Local Express API**: `http://localhost:5000/api/health`

---

### Step 4: Run Frontend Dashboard Locally (React + Leaflet)

In another terminal window:
```bash
cd frontend
npm install
npm run dev
```
- **Local Command Center UI**: `http://localhost:3000` (with instant Hot Module Replacement)

---

### Step 5: Start Python ML Microservice (Docker)

To run the DBSCAN + XGBoost predictive engine:
```bash
docker compose up -d ml-service
```
- **ML Swagger API**: `http://localhost:8000/docs`

---

## 📊 Environment Reference

```
Developer Machine
│
├── Local Node.js + npm (Fast HMR & Instant Debugging)
│     ├── React Frontend (Port 3000)
│     └── Express Backend API (Port 5000)
│
└── Docker Desktop (Isolated Heavy Services)
      ├── PostgreSQL 16 + PostGIS (Port 5432)
      ├── Python ML Microservice (Port 8000)
      ├── Apache Spark Master/Worker (Ports 7077 / 8081)
      └── Apache Airflow DAG Orchestrator (Port 8080)
```
