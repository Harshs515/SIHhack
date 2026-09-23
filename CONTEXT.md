# SIH26184 / TRINETRA Codebase Context

## Purpose

TRINETRA (also called CyberDrishti in the UI) is a hackathon prototype for the Smart India Hackathon 2026 problem SIH26184: predict likely cash-withdrawal locations from cybercrime complaints so law-enforcement agencies can intervene during the short window after a fraud report.

The intended intelligence flow is:

1. Ingest cybercrime complaints from the NCRP/1930 workflow.
2. Group nearby active complaints into spatial clusters with Haversine DBSCAN.
3. Rank nearby ATMs with a withdrawal-risk score derived from complaint and ATM features.
4. Match each predicted hotspot to a nearby cyber-police station.
5. Store active hotspots and expose them to an operational command center for maps, alerts, analytics, and dispatch.

This is a demonstration/prototype. Several UI modules use static mock data and simulated actions when services are unavailable.

## Repository Layout

The tracked project root is the directory containing this file.

```text
.
├── backend/                 Node.js/Express REST API
│   ├── package.json
│   └── src/
│       ├── server.js        Express bootstrap and route registration
│       ├── db.js            Legacy query-compatible Supabase wrapper
│       ├── supabase.js      Supabase client and PostGIS EWKB parser
│       └── routes/
│           ├── complaintRoutes.js
│           ├── predictionRoutes.js
│           └── chatRoutes.js
├── database/
│   ├── schema.sql           PostgreSQL/PostGIS schema and indexes
│   └── seed_data.py         Generates synthetic seed.sql data
├── frontend/
│   ├── package.json
│   ├── vite.config.js        Vite and PWA/workbox configuration
│   ├── public/               Manifests and icons
│   └── src/
│       ├── App.jsx           Router, shared state, polling, ML trigger
│       ├── main.jsx          React entry point and PWA provider
│       ├── index.css         Theme tokens and global styling
│       ├── api/api.js        Backend REST client
│       ├── services/         Direct Supabase browser helpers
│       ├── data/mockData.js  Offline/demo intelligence data
│       ├── components/       Shared navigation, maps, panels, charts, PWA UI
│       └── pages/             Route-level operational screens
├── ml_service/               FastAPI prediction microservice
│   ├── app.py                Pipeline and model-run endpoints
│   ├── dbscan_clustering.py  Haversine spatial DBSCAN
│   └── xgboost_model.py      Feature scoring and police-station matching
├── orchestration/dags/       Airflow DAG that triggers the ML pipeline
├── simulation/               Local Apache Spark telemetry example
├── csv_to_db.py              Tkinter CSV-to-PostgreSQL/PostGIS uploader
├── docker-compose.yml        Database, API, ML, Airflow, and Spark services
├── README.md                 Short architecture and quick-start guide
└── SETUP.md                  Team onboarding and local/container setup
```

There is also an untracked nested `SIHhack-main/` directory that mirrors the project. Treat the outer tracked root as canonical unless explicitly comparing or recovering files. Generated PWA files under `frontend/dev-dist/` may be modified build artifacts, not primary source.

## Technology Stack

- Frontend: React 18, Vite, React Router, React Leaflet/Leaflet, Recharts, Lucide React, Tailwind/PostCSS, and `vite-plugin-pwa`.
- Frontend styling: custom CSS variables with dark/light themes, glass-panel styling, responsive dashboard layouts, Google Fonts (Outfit, Plus Jakarta Sans, Space Grotesk, JetBrains Mono), and Leaflet map layers.
- Backend: Node.js 18 container, Express 4, CORS, dotenv, native `fetch`, and `@supabase/supabase-js`.
- Data store: PostgreSQL 16 with PostGIS 3.4, using `GEOGRAPHY(POINT, 4326)` and GiST spatial indexes.
- ML service: Python 3.10, FastAPI/Uvicorn, pandas, NumPy, scikit-learn DBSCAN, XGBoost, psycopg2, and Pydantic.
- Batch/orchestration: Apache Spark 3.5 simulation and Apache Airflow 2.8.1, with a 15-minute prediction DAG.
- Deployment: Docker Compose bridge network with named PostgreSQL volume; frontend/backend can also run locally with npm for faster development.

## Frontend Behavior

`frontend/src/App.jsx` owns the shared complaint, hotspot, ATM, police-station, ML-status, and theme state. It initializes from `mockData.js`, polls the backend every 20 seconds, and replaces mock collections when API data is available. Failed requests restore the mock intelligence cache. The ML button calls the backend trigger endpoint and refreshes data; offline failure simulates a short computation state.

Registered routes include:

| Route | Screen | Main purpose |
| --- | --- | --- |
| `/auth`, `/login` | Authentication landing | Entry gateway/demo role selection |
| `/dashboard` | Dashboard | Operational overview and module launchpad |
| `/gis-heatmap` | GIS Heatmap | Complaints, hotspots, ATMs, police stations, and risk circles on Leaflet |
| `/mule-graph` | Mule Graph | Demo money-flow/account-chain investigation |
| `/lea-interface` | LEA Dispatch | Tactical police dispatch workflow |
| `/alerts-center` | Alerts Center | Prioritized alert stream and acknowledgement UI |
| `/ncrp-complaints` | NCRP Complaints | Complaint intake, search, presets, and simulated NLP extraction |
| `/ncrp-portal` | Citizen Portal | Citizen-facing complaint simulation |
| `/analytics-reports` | Analytics | Recharts reports, benchmarks, and simulated dossier export |
| `/field-officer` | Field Officer Portal | Field-officer/PWA workflow |
| `/pipeline-topology` | Pipeline Topology | Architecture/pipeline visualization |

The global Navbar exposes theme switching and ML triggering. `AiChatbot.jsx` provides a voice/text assistant using browser Speech Recognition and Speech Synthesis plus the backend keyword-based chat endpoint. `PWAProvider`, `PWAInstallModal`, and `usePWAInstall` support install/update flows. The service worker caches API responses, map tiles, fonts, and images.

## Backend API

The Express server listens on `PORT` or `5000`, enables CORS and JSON parsing, and mounts:

- `GET /api/health`: returns health and timestamp.
- `GET /api/complaints`: returns complaints ordered by incident time, including parsed latitude/longitude.
- `POST /api/complaints`: inserts a complaint into Supabase and returns the inserted record. The route accepts acknowledgement, victim, fraud, bank, address, time, and coordinates fields.
- `GET /api/complaints/:acknowledgementNo`: client helper exists for tracking, but verify the current backend route before relying on it.
- `GET /api/predictions/hotspots`: returns active hotspots enriched with ATM, police-station, and model-run data.
- `GET /api/predictions/atms`: returns all candidate ATMs with coordinates.
- `GET /api/predictions/police-stations`: returns all police stations with coordinates.
- `GET /api/predictions/model-runs`: returns the latest ten model runs.
- `POST /api/predictions/trigger`: calls `${ML_SERVICE_URL}/api/ml/process-pipeline`.
- `POST /api/chat`: keyword-matches a knowledge base and returns a reply plus optional frontend route after a simulated 400 ms delay.

The API reads records through Supabase rather than the `pg` pool described by some older documentation. `db.js` remains as a compatibility wrapper for legacy SQL-like callers and converts PostGIS EWKB points into coordinates.

## Database Model

`database/schema.sql` enables PostGIS and creates:

- `police_stations`: jurisdiction, contact, city/state, point geometry.
- `cybercrime_complaints`: acknowledgement, victim/contact, fraud category and amount, incident time, mule bank/account, status, point geometry.
- `atm_locations`: ATM identity, bank/address, city/state, risk tier, point geometry.
- `model_runs`: model version, algorithm, and accuracy/precision/recall/F1 provenance.
- `predicted_hotspots`: cluster center/radius, risk score, complaint/fraud totals, prediction window, ATM/police foreign keys, intelligence text, and status.

GiST indexes accelerate geometry queries; B-tree indexes cover complaint timestamps/categories and hotspot status. `database/seed_data.py` generates synthetic data for three cities (Delhi NCR, Mumbai, Bengaluru), including police stations, ATMs, 100 complaints, and an initial model run. It writes `database/seed.sql`; it does not itself insert into the database.

## ML Pipeline

`POST /api/ml/process-pipeline` in `ml_service/app.py` performs the following:

1. Opens PostgreSQL using `DATABASE_URL`.
2. Gets the latest model run, creating a default `v1.0.4-spatial` record when none exists.
3. Fetches `UNDER_INVESTIGATION` complaints and their PostGIS coordinates.
4. Stops successfully with zero hotspots when fewer than two complaints exist or no DBSCAN clusters are found.
5. Runs `perform_spatial_dbscan_clustering` with a 3 km Haversine epsilon and minimum two complaints.
6. Loads ATMs and police stations, expires existing `ACTIVE` hotspots, and scores each cluster.
7. Uses `predict_atm_withdrawal_risk` to filter ATMs within 5 km, generate features, compute a weighted logistic-style XGBoost-compatible score, select the top ATM, and choose the nearest police station.
8. Inserts active hotspots with a 45-minute prediction window and actionable intelligence.

Despite the module name and product language, the current scoring code does not load a trained XGBoost model; it computes a hand-weighted probability from engineered features and clips it to 0.15-0.98. Treat model metrics and advanced NLP/graph/streaming claims in demo screens as prototype/demo content unless implemented elsewhere.

## Service Topology and Ports

| Service | Default port | Compose role |
| --- | ---: | --- |
| PostgreSQL/PostGIS | 5432 | `postgres`, database `cybercrime_db` |
| Express API | 5000 | `backend` |
| FastAPI ML engine | 8000 | `ml-service`, Swagger at `/docs` |
| React/Vite | 3000 | `frontend` |
| Airflow webserver | 8080 | `airflow-webserver` |
| Spark master UI | 8081 | `spark-master` |
| Spark master protocol | 7077 | `spark-master` |

The Compose network is `sih_network`; the PostgreSQL data volume is `pgdata`. The Airflow DAG calls `http://ml-service:8000/api/ml/process-pipeline` every 15 minutes with one retry after five minutes. `simulation/spark_simulation.py` is a local batch example that flags telemetry with fraud amounts of at least 200,000; it is not wired into the database pipeline.

## Configuration and Run Commands

For local development:

```bash
docker compose up -d postgres
python database/seed_data.py
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
docker compose up -d ml-service
```

Useful environment variables:

- Backend: `PORT`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ML_SERVICE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.
- Frontend: `VITE_API_BASE_URL` and optionally `VITE_SUPABASE_ANON_KEY` for direct browser Supabase helpers.
- ML service: `DATABASE_URL`.

Frontend scripts are `npm run dev`, `npm run build`, and `npm run preview`. Backend scripts are `npm start` and `npm run dev`. The frontend dev server binds to `0.0.0.0:3000`; the backend defaults to port 5000.

## Important Caveats

- There is no visible backend authentication or authorization layer; routes are open behind CORS.
- `backend/src/supabase.js` contains a hard-coded secret fallback. Remove secrets from source, rotate any exposed key, and require environment configuration before deployment.
- `backend/src/routes/complaintRoutes.js` inserts `status: 'ACTIVE'`, while the ML query only processes `status = 'UNDER_INVESTIGATION'`; align these statuses if newly submitted complaints should enter prediction.
- `frontend/src/services/supabase.js` contains a public Supabase URL and reads an anon key from Vite environment; direct browser access should be reviewed against Supabase RLS policies.
- Several pages use mock data, setTimeout-based simulations, or UI-only export/dispatch actions. Neo4j, Kafka, Redis, FCM, real NLP, and true model training are referenced in product copy but are not represented as Compose services or implemented as end-to-end integrations in the current tree.
- The root README has an outdated `pg`-pool description; current backend route implementations use Supabase REST/JS.
- Generated files under `frontend/dev-dist/` should generally be regenerated by the Vite/PWA build instead of edited manually.

## Suggested Change Boundaries

- UI and shared state: `frontend/src/App.jsx`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/index.css`.
- Frontend API contract: `frontend/src/api/api.js`.
- Backend HTTP behavior: `backend/src/server.js` and `backend/src/routes/`.
- Supabase/PostGIS coordinate handling: `backend/src/supabase.js` and `frontend/src/services/supabase.js`.
- Schema/data contract: `database/schema.sql` and `database/seed_data.py`.
- Prediction behavior: `ml_service/app.py`, `ml_service/dbscan_clustering.py`, and `ml_service/xgboost_model.py`.
- Scheduling/runtime wiring: `docker-compose.yml` and `orchestration/dags/cybercrime_pipeline.py`.