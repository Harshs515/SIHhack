This is the summary for NCRP Portal that i am using:
I’m reviewing the NCRP app and its API contract so I can summarize the portal accurately, including the data model, payload shape, and project layout.

Searched for regex `NCRP|complaint|complaints` (`**/{sih-ncrp-main/**,frontend/src/**,backend/src/**}`), 321 results

Read 

Read , lines 1 to 260

Read 

Read , lines 1 to 260

Read 

Read 

I’ve confirmed the portal’s actual intake fields and the API contract; I’m now aligning that with the app structure so the summary reflects both the frontend flow and the backend schema.

Read 

Read 

## NCRP Portal overview

The NCRP portal in this project is a citizen-facing cybercrime complaint intake and tracking system built around a complaint workflow:
- mobile verification
- complainant details
- cyber-fraud details
- suspect information
- review and submit
- acknowledgement/track status

The live citizen UI is implemented in `page.tsx`, and the backend API that persists it is in `route.ts`. The older React dashboard and API layer in the main repo also follow the same complaint pattern in `NcrpCitizenPortalPage.jsx` and `api.js`.

This portal is meant for reporting financial fraud/cybercrime cases such as:
- UPI / internet banking fraud
- vishing / scam calls
- card/SIM-swap fraud
- AEPS / wallet / demat fraud
- digital arrest / impersonation scams

---

## What kind of data it takes

The intake form captures both:
1. Identity/contact information of the complainant
2. Fraud details and investigation metadata

### 1) Complainant details
From `page.tsx`:
- mobile number
- full name
- email ID
- city / district
- state / union territory

### 2) Fraud / crime category
Examples include:
- UPI Related Fraud
- Internet Banking Related Fraud
- Fraud Call / Vishing
- AEPS Fraud
- Business Email Compromise
- Debit / Credit Card Fraud / SIM Swap
- Demat / Depository Fraud
- E-Wallet Related Fraud

### 3) Money-loss fields
- have you lost money?
- bank name
- account number
- transaction ID / UTR
- transaction date
- time
- amount lost
- incident platform(s) used

### 4) Suspect details
- suspect bank
- suspect account / UPI ID
- suspect transaction ID
- suspect amount
- suspect transaction date

### 5) Narrative fields
- description of the incident
- platform used: WhatsApp, Telegram, Instagram, Facebook, X, SMS, email, call, etc.
- other platform if not listed

### 6) Tracking / operational metadata
- acknowledgement number
- complaint status
- incident timestamp
- district / state / city
- amount
- fraud category

---

## Fields the system actually uses

The app builds a payload like this in `page.tsx`:

```json
{
  "acknowledgement_no": "NCRP-20260925-123456",
  "fraud_category": "UPI Related Fraud",
  "fraud_amount": 25000,
  "victim_name": "Rajesh Sharma",
  "victim_phone": "+919876543210",
  "victim_email": "rajesh@example.com",
  "victim_bank": "HDFC Bank",
  "victim_account_no": "123456789012",
  "mule_bank_name": "SBI",
  "mule_account_no": "9876543210",
  "incident_timestamp": "2026-09-25T10:15:00.000Z",
  "state": "Delhi",
  "district": "Rohini",
  "city": "Rohini",
  "transaction_id": "UTR123456789",
  "lost_money": "Yes",
  "description": "Fraudster contacted victim via WhatsApp ...",
  "amount_lost": 25000,
  "suspect_transaction_id": "MULE-987",
  "suspect_amount": 25000,
  "incident_platforms": ["WhatsApp", "Other"]
}
```

The API layer in `route.ts` accepts a type like:

```ts
type ComplaintPayload = {
  acknowledgement_no?: string
  fraud_category?: string
  fraud_amount?: number
  victim_name?: string
  victim_phone?: string
  victim_email?: string
  victim_bank?: string
  victim_account_no?: string
  mule_bank_name?: string
  mule_account_no?: string
  incident_timestamp?: string
  state?: string
  district?: string
  city?: string
  transaction_id?: string
}
```

Important point: the app sends a richer payload, but the persisted DB insert is narrower and maps fields into a database-friendly shape.

---

## What API call it sends

The portal sends a `POST` request to:

`/api/complaints`

with JSON body as above.

The call is made in `page.tsx` using:

```ts
fetch('/api/complaints', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
```

And it also supports tracking with:

`GET /api/complaints?id=<acknowledgement_number>`

This is implemented in `route.ts`.

---

## What the backend stores

The main complaint table is defined in `schema.sql`. The relevant schema is:

- `acknowledgement_no`
- `victim_name`
- `victim_contact`
- `fraud_category`
- `fraud_amount`
- `incident_timestamp`
- `mule_bank_name`
- `mule_account_no`
- `victim_address`
- `geom` (GIS coordinates)
- `status`
- `created_at`
- `updated_at`

The Next.js API then inserts into Supabase with a smaller subset:

```ts
await supabase
  .from('complaints')
  .insert({
    complaint_id: complaintId,
    complaint_date: payload.incident_timestamp ?? new Date().toISOString(),
    crime_category: payload.fraud_category,
    state: payload.state ?? null,
    district: payload.district ?? null,
    city: payload.city ?? null,
    amount: payload.fraud_amount ?? null,
    status: 'submitted',
  })
```

### Field mapping
The system uses a naming bridge between portal and database:

- `acknowledgement_no` → `complaint_id`
- `fraud_category` → `crime_category`
- `fraud_amount` → `amount`
- `incident_timestamp` → `complaint_date`

---

## Project structure

### 1) Main portal app
`sih-ncrp-main`
- `page.tsx`: multi-step complaint form and tracking flow
- `route.ts`: POST/GET complaint API
- `ui`: reusable UI components
- `utils.ts`: utility helpers
- `public`: static assets

### 2) Older operational dashboard
`src`
- `NcrpCitizenPortalPage.jsx`: older citizen portal
- `NcrpComplaintsPage.jsx`: complaint triage dashboard
- `api.js`: API wrappers
- `components`: UI modules like map, analytics, navbar, sidebar, etc.

### 3) Backend API
`src`
- `server.js`: Express entry point
- `complaintRoutes.js`: complaint CRUD and tracking logic
- `supabase.js`: Supabase client config

### 4) Data and analytics
- `schema.sql`: database schema
- `ml-services`: model training, data splits, and prediction pipeline
- `session-intercept`: session simulation / interception utilities

---

## High-level summary

This NCRP portal is effectively a digital cybercrime complaint intake system with:
- multilingual citizen form
- OTP/mobile verification
- complaint registration
- complaint tracking by acknowledgement ID
- backend persistence in Supabase/Postgres
- GIS/analytics-ready complaint data for hotspot detection and law-enforcement triage

So the portal is not just a form; it is a complaint ingestion + monitoring layer feeding into the broader cybercrime intelligence and prediction platform.

If you want, I can also give you:
1. a field-by-field schema table for the portal, or
2. a “request/response contract” version of the API exactly as used by the frontend.


I’m reviewing the app structure and the key frontend/backend files so I can give you a precise architecture summary without the excluded folders.

Read 

Read 

Read 

Read , lines 1 to 260

Read , lines 1 to 260

Read 

Read 

Read 

I’ve confirmed the core backend and routing shape; I’m checking the page components and data layer so the summary reflects how the UI actually consumes the API.

Read , lines 1 to 260

Read , lines 1 to 260

Read , lines 1 to 260

Read , lines 1 to 220

Read 

Read 

## Project purpose

This project is a cybercrime intelligence and predictive policing dashboard for the Ministry of Home Affairs use case. Its goal is to detect suspicious cybercrime complaint patterns, forecast likely ATM/cash withdrawal hotspots in advance, and help officers respond before fraud money is withdrawn.

In simple terms, the system does three jobs:

- Collects cybercrime complaints and victim details
- Finds clusters of risky behavior using spatial and fraud analytics
- Shows the risk on a live dashboard so LEA teams and command centers can act quickly

The app combines:
- React frontend for visualization and operator workflows
- Node.js + Express backend for API endpoints
- PostgreSQL/PostGIS for geospatial data storage
- Live fraud/ATM/police station data from a Supabase-backed data layer
- ML-driven hotspot prediction logic

---

## High-level architecture

The codebase is split into a few main layers:

- Frontend: React app with pages, reusable UI components, map visualization, analytics panels, forms, alerts
- Backend: Express REST API that serves complaint data, hotspot predictions, ATMs, police stations, and model run stats
- Database layer: PostGIS tables storing complaints, predicted hotspots, ATM locations, police stations, and model metadata
- Supporting setup: Docker, environment config, sample data generation, database schema

The frontend is designed like a command center dashboard, while the backend acts as the data bridge between the UI and the database/ML pipeline.

---

## Project structure summary

Excluding the folders you asked not to include, the relevant structure is:

- Root:
  - README and setup documents
  - `docker-compose.yml` for services
  - database schema and seed scripts
  - backend app
  - frontend app

- Backend:
  - Node Express server
  - API routes for complaints, predictions, and chat
  - Supabase integration layer

- Frontend:
  - App shell and router
  - Navbar and global chatbot
  - Dashboard and operational pages
  - Map and analytics components
  - API helper layer
  - Mock data fallback files

- Database:
  - police stations
  - complaints
  - ATM locations
  - model runs
  - predicted hotspots

This is the real functional part of the repo for the application itself.

---

## What the backend does

The backend is the data and intelligence layer.

### Main backend responsibilities

1. Exposes REST APIs
   - Complaint fetching and search
   - Hotspot queries by status/alert level
   - ATM and police station metadata
   - Summary stats
   - Model run history
   - Triggering ML prediction pipeline
   - Acknowledge and resolve alert actions

2. Connects to Supabase
   - It uses a Supabase client to query and update database tables
   - It converts PostGIS geography points into latitude/longitude for the frontend

3. Maps raw database rows to frontend-friendly objects
   - For complaints, fields are normalized into names like victim_name, fraud_category, fraud_amount, district, state, latitude, longitude
   - For hotspot rows, it derives risk tier, ATM info, police station info, bank name, risk score, and actionable intelligence

4. Provides live operational logic
   - Acknowledge alert endpoint updates hotspot status
   - Resolve endpoint marks an alert resolved
   - Trigger endpoint calls the ML service if available, and falls back to a Node-based spatial pipeline when it is not

### Backend route logic

The key APIs are:

- Complaints API
  - Get all complaints
  - Search complaints
  - Get a complaint by acknowledgement number
  - Create a complaint
  - Track complaint status

- Prediction API
  - Get hotspots
  - Get stats
  - Get ATMs
  - Get police stations
  - Get model runs
  - Trigger prediction pipeline
  - Acknowledge/resolve hotspot

This is the backbone of the whole application.

---

## What the frontend does

The frontend is a single-page React dashboard tailored for command and control.

### Core frontend behavior

- Uses React Router for different operational screens
- Keeps global state for:
  - complaints
  - hotspots
  - ATM locations
  - police stations
  - model stats
  - ML trigger status
- Calls backend APIs on load and when the user refreshes data
- Displays live intelligence panels, maps, tables, and status indicators
- Uses mock data as initial fallback while real backend data loads

The app shell loads all relevant data through a central function and passes it as props to pages.

---

## Main pages and what they mean

### 1. Dashboard page
This is the executive overview screen.

It shows:
- total complaints
- active hotspots
- fraud volume
- P1/P2/P3 counts
- risk summary cards
- recent alerts
- model health
- operational panels

Purpose:
- central monitoring and situational awareness
- quick answer: what is happening now and how severe is it?

Data sources:
- stats endpoint
- hotspots endpoint
- complaints endpoint
- ATM/police data indirectly through hotspot details

---

### 2. GIS Heatmap page
This is the map-based risk visualization screen.

It shows:
- complaint clusters on a map
- ATM locations
- police stations
- predicted hotspots with colored risk circles
- state filters and category filters
- spatial cluster detail

Purpose:
- find where fraud activity is concentrating geographically
- understand which ATM regions are likely to be used for cash withdrawal
- support tactical response planning

Data sources:
- complaints list
- hotspots list
- ATM data
- police station data
- real-time Supabase insert events for new hotspots

This page uses Leaflet and react-leaflet for map rendering.

---

### 3. LEA Dispatch page
This is the law enforcement action screen.

It shows:
- active high-risk incidents
- assigned patrol teams
- dispatch states like DISPATCHED, ON_SCENE, PENDING_APPROVAL
- location, district, bank, police station, selected incident details
- time remaining for crisis window

Purpose:
- help police and intelligence units act on hotspots
- convert a risk alert into a dispatch action
- keep field operations organized

Data sources:
- hotspots with status not resolved
- update calls to acknowledge and resolve endpoints

---

### 4. Alerts Center page
This is the live alert stream.

It shows:
- P1/P2/P3 alert feed
- alert tier filters
- broadcast and acknowledgements
- notification channel summary
- emergency push actions

Purpose:
- notify agencies about active risk zones
- give operators a place to acknowledge and escalate issues

Data sources:
- hotspot dataset
- real-time Supabase table subscriptions for new hotspot rows
- status update calls to acknowledge endpoint

This page includes broadcast simulation and status updates.

---

### 5. NCRP Complaints page
This is the complaint intake and complaint tracking page.

It shows:
- complaint records
- search by victim name, phone, complaint number, fraud type, district, etc.
- complaint submission form
- status and location details

Purpose:
- capture cybercrime complaint data from victims or staff
- support investigation by incident number and location
- feed the analytics engine

Data source:
- complaints endpoint
- POST complaint submission to backend
- complaint tracking by acknowledgement number

---

### 6. Analytics Reports page
This is the reporting and decision-support screen.

It likely summarizes:
- fraud pattern trends
- risk metrics
- model performance
- geographic concentrations
- operational summaries

Purpose:
- show strategic insight for leadership and MHA-level analysis
- support decisions beyond day-to-day tactical response

Data sources:
- stats from prediction endpoints
- model runs
- hotspot and complaint summaries

---

### 7. Auth / Login landing page
This is the initial entry screen.

Purpose:
- gate the app
- let different user types enter the system
- direct users to operational or citizen-related views

This is more of a landing experience than a real business function.

---

### 8. Command Center and other feature pages
Some pages are present but currently disabled or partially implemented, such as:
- Command center
- Field officer portal
- Citizen portal
- Mule graph explorer

These are intended for specialized use cases but are not the main active operational flow.

---

## How data is fetched and displayed

### Startup data loading

The app starts by loading data through a single central function in the main app component.

It does a Promise.all to fetch:
- stats
- hotspots
- complaints
- ATMs
- police stations
- model runs

This means the dashboard is populated in one shot with all major intelligence data.

### API layer

The frontend API helper wraps fetch calls and sends requests to the backend base URL. It includes:
- getComplaints
- getHotspots
- getStats
- getAtms
- getPoliceStations
- getModelRuns
- triggerPredictions
- acknowledgeAlert
- resolveAlert

So the UI does not talk directly to the database; it talks to the backend API.

### Data transformation layer

The backend is responsible for shaping database results into the exact format the frontend expects.

Examples:
- Complaint rows are mapped to include victim, fraud, address, district, state, latitude, and longitude
- Hotspot rows add ATM name, risk tier, police station info, actionable intelligence, and model metadata
- Geometry fields are parsed from PostGIS WKB/WKT to latitude/longitude values

This makes the frontend simple and reduces map and UI errors.

---

## Database model and business meaning

The database schema revolves around risk analysis and operations.

### Tables

- police_stations
  - LEA jurisdiction mapping
  - used to assign police stations to hotspot alerts

- cybercrime_complaints
  - victim and fraud complaint data
  - the main input for predictive analysis

- atm_locations
  - candidate cash withdrawal points
  - critical because hotspot prediction is usually centered around ATM risk clusters

- model_runs
  - records model versions and metrics
  - supports explainability and auditability

- predicted_hotspots
  - the actual forecast output
  - includes risk_score, cluster_id, radius, predicted_window, ATM link, assigned police station, status

These tables are spatially aware using PostGIS geography points, which is essential because the app is geospatial.

---

## End-to-end flow of the system

1. Cybercrime complaint is entered or loaded
   - complaint record gets stored in the complaints table

2. Backend exposes complaint and prediction APIs
   - the frontend queries them

3. Prediction engine identifies risky clusters
   - hotspot records are generated around ATM/cashout areas

4. Frontend page loads hotspot + complaint + ATM + police data
   - map, stats, and alerts become live

5. Operators act on the data
   - acknowledge alert
   - assign dispatch
   - resolve incident

6. Institutional intelligence is visible to leaders
   - dashboards, summary cards, reports, risk scores, and alerts

This is the core operational loop of the project.

---

## Overall takeaway

This is a cybercrime risk intelligence platform designed for proactive law enforcement. The frontend acts like a command center, the backend acts like the intelligence API, and the database holds all spatial and operational evidence. The app focuses on predicting likely ATM cash withdrawal hotspots before fraud is fully executed, then enabling quick LEA action and response coordination.

If you want, I can also turn this into:
- a cleaner architecture diagram in text form
- a page-by-page component breakdown
- a developer handoff summary for team onboarding
- a “how to run and understand this app” guide for new contributors

Field officer App:
TRINETRA Field Officer App — MVP Complete
Your bilingual (English/हिंदी) cybercrime field-officer app is live, connected to your Supabase data, and fully tested.

Login → 3 tabs (Alerts, Complaints, Profile) in a dark navy law-enforcement theme, with an instant EN|हिं toggle on every screen that's saved across restarts.
Alerts: P1/P2/P3 colour-coded hotspot cards with risk %, countdown timer, ATM & station info, Acknowledge (updates Supabase + green toast) and Navigate (opens Google Maps), plus a "My District vs All India" filter, pull-to-refresh, and a P1 critical vibration + full-screen alert.
Complaints & Profile: searchable complaints with status filters, ₹ Indian-format amounts and IST dates; profile shows officer badge, live quick-stats, 1930/I4C tap-to-call helplines, sound toggle and logout.
Important setup notes:

Login PIN is 1234 (badge = any text). For populated alerts pick Central Delhi or Rohini.
Your data connects securely: since Supabase Row Level Security blocks the public key, your secret key stays safely on the server and the app talks to it — nothing sensitive ships in the app.
Your seeded alert time-windows are already in the past, so timers show "EXPIRED" but the alert cards still appear. To see live countdowns and the P1 pop-up in action, add a few rows with a future predicted_window_end.
Vibration & notification sound are best experienced on a real Android build (after Publish), not the web preview.

