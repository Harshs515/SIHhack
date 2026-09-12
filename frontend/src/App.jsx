import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Global Navigation & Error Boundary Components
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import AiChatbot from "./components/AiChatbot";

// Pages
import DashboardPage from "./pages/DashboardPage";
import CommandCenter from "./pages/CommandCenter";
import GisHeatmapPage from "./pages/GisHeatmapPage";
import MuleGraphPage from "./pages/MuleGraphPage";
import LeaInterfacePage from "./pages/LeaInterfacePage";
import AlertsCenterPage from "./pages/AlertsCenterPage";
import NcrpComplaintsPage from "./pages/NcrpComplaintsPage";
import NcrpCitizenPortalPage from "./pages/NcrpCitizenPortalPage";
import AuthLandingPage from "./pages/AuthLandingPage";
import AnalyticsReportsPage from "./pages/AnalyticsReportsPage";
import FieldOfficerPortal from "./pages/FieldOfficerPortal";

import {
  getAtms,
  getComplaints,
  getHotspots,
  getPoliceStations,
  getModelRuns,
  triggerPredictions,
} from "./api/api";

// Domain Intelligence Mock Data
import {
  MOCK_COMPLAINTS,
  MOCK_HOTSPOTS,
  MOCK_ATMS,
  MOCK_POLICE_STATIONS,
} from "./data/mockData";

const API = import.meta.env.VITE_API_BASE_URL || 'https://sih2026-backend-k5ru.onrender.com/api';

function AppContent({
  isRunningML,
  handleTriggerML,
  theme,
  toggleTheme,
  hotspots,
  setHotspots,
  complaints,
  setComplaints,
  atms,
  policeStations,
  mlStatus,
  modelRuns,
  stats,
  loadAllData,
  handleAddComplaint,
}) {
  const location = useLocation();
  const isFieldOfficer = location.pathname.startsWith("/field-officer");
  const hiddenChatRoutes = [
    "/",
    "/ncrp-portal",
    "/citizen-portal",
    "/ncrp-simulation",
    "/auth",
    "/login",
  ];
  const hideChatbot =
    hiddenChatRoutes.includes(location.pathname) || isFieldOfficer;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Hide the global Navbar on Field Officer portal */}
      {!isFieldOfficer && (
        <Navbar
          isRunningML={isRunningML}
          onTriggerML={handleTriggerML}
          theme={theme}
          onToggleTheme={toggleTheme}
          activeAlertsCount={
            stats?.p1_active ||
            (hotspots || []).filter(
              (h) => h.alert_level === "P1" || h.alert_tier === "P1" || h.atm_risk_tier === "CRITICAL"
            ).length || 2
          }
        />
      )}

      {/* Page content — full width, no sidebar */}
      <main style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <ErrorBoundary>
          <Routes>
            {/* Default → Authentication Gateway / Landing */}
            <Route path="/" element={<Navigate to="/auth" replace />} />

            {/* 0. Overview Dashboard */}
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  complaints={complaints}
                  hotspots={hotspots}
                  atms={atms}
                  policeStations={policeStations}
                  isRunningML={isRunningML}
                  onTriggerML={handleTriggerML}
                  mlStatus={mlStatus}
                  modelRuns={modelRuns}
                  stats={stats}
                  onRefreshData={loadAllData}
                />
              }
            />

            {/* 1. Master Command & Control Center (if needed) */}
            {/* <Route
              path="/command-center"
              element={
                <CommandCenter
                  complaints={complaints}
                  hotspots={hotspots}
                  atms={atms}
                  policeStations={policeStations}
                  isRunningML={isRunningML}
                  onTriggerML={handleTriggerML}
                  mlStatus={mlStatus}
                  stats={stats}
                  onRefreshData={loadAllData}
                />
              }
            /> */}

            {/* 2. Fullscreen GIS Risk Heatmap */}
            <Route
              path="/gis-heatmap"
              element={
                <GisHeatmapPage
                  complaints={complaints}
                  hotspots={hotspots}
                  setHotspots={setHotspots}
                  atms={atms}
                  policeStations={policeStations}
                  stats={stats}
                />
              }
            />

            {/* 3. Mule Chain Graph & Neo4j Explorer */}
            <Route path="/mule-graph" element={<MuleGraphPage />} />

            {/* 4. Law Enforcement Agency (LEA) Tactical Dispatch */}
            <Route
              path="/lea-interface"
              element={
                <LeaInterfacePage
                  hotspots={hotspots}
                  setHotspots={setHotspots}
                  stats={stats}
                />
              }
            />

            {/* 5. Real-Time Alerts & Notification Center */}
            <Route
              path="/alerts-center"
              element={
                <AlertsCenterPage
                  hotspots={hotspots}
                  setHotspots={setHotspots}
                  stats={stats}
                />
              }
            />

            {/* 6. NCRP & 1930 Cybercrime Complaint Ingestion Suite */}
            <Route
              path="/ncrp-complaints"
              element={
                <NcrpComplaintsPage
                  complaints={complaints}
                  onAddComplaint={handleAddComplaint}
                />
              }
            />

            {/* 7.1. NCRP Citizen Portal Simulation (cybercrime.gov.in) */}
            <Route
              path="/ncrp-portal"
              element={
                <NcrpCitizenPortalPage
                  complaints={complaints}
                  onAddComplaint={handleAddComplaint}
                />
              }
            />
            <Route
              path="/citizen-portal"
              element={<Navigate to="/ncrp-portal" replace />}
            />
            <Route
              path="/ncrp-simulation"
              element={<Navigate to="/ncrp-portal" replace />}
            />

            {/* 8. Executive Analytics & I4C Dossier Reports */}
            <Route
              path="/analytics-reports"
              element={<AnalyticsReportsPage />}
            />

            {/* 9. Field Officer Portal */}
            <Route
              path="/field-officer"
              element={
                <FieldOfficerPortal
                  hotspots={hotspots}
                  setHotspots={setHotspots}
                  stats={stats}
                />
              }
            />

            {/* 11. Authentication Gateway (Citizen & Field Officer) */}
            <Route path="/auth" element={<AuthLandingPage />} />
            <Route path="/login" element={<AuthLandingPage />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Global AI Voice & Chat Copilot (excluded on Citizen Portal, Login, and Field Officer) */}
      {!hideChatbot && <AiChatbot />}
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);
  const [atms, setAtms] = useState(MOCK_ATMS);
  const [policeStations, setPoliceStations] = useState(MOCK_POLICE_STATIONS);
  const [modelRuns, setModelRuns] = useState([]);
  const [isRunningML, setIsRunningML] = useState(false);
  const [mlStatus, setMlStatus] = useState("ACTIVE");
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  async function loadAllData() {
    try {
      const [statsRes, hotspotsRes, complaintsRes, atmsRes, stationsRes, modelRunsRes] =
        await Promise.all([
          fetch(`${API}/predictions/stats`),
          fetch(`${API}/predictions/hotspots`),
          fetch(`${API}/complaints?limit=100`),
          fetch(`${API}/predictions/atms`),
          fetch(`${API}/predictions/police-stations`),
          fetch(`${API}/predictions/model-runs`).catch(() => ({ ok: false })),
        ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData);
      }
      if (hotspotsRes.ok) {
        const hotspotsData = await hotspotsRes.json();
        setHotspots(hotspotsData.data || hotspotsData);
      }
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        setComplaints(complaintsData.data || complaintsData);
      }
      if (atmsRes.ok) {
        const atmsData = await atmsRes.json();
        setAtms(atmsData.data || atmsData);
      }
      if (stationsRes.ok) {
        const stationsData = await stationsRes.json();
        setPoliceStations(stationsData.data || stationsData);
      }
      if (modelRunsRes && modelRunsRes.ok) {
        const mrData = await modelRunsRes.json();
        setModelRuns(mrData.data || mrData);
      }
    } catch (err) {
      console.error("[App] Data load failed:", err.message);
      // Keep previous state — do NOT reset to mock data
    }
  }

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerML = async () => {
    setIsRunningML(true);
    setMlStatus("COMPUTING");

    try {
      await fetch(`${API}/predictions/trigger`, { method: "POST" });
      await loadAllData();
    } catch (e) {
      console.warn("ML trigger failed:", e);
      setTimeout(() => {
        setIsRunningML(false);
        setMlStatus("ACTIVE");
      }, 1200);
      return;
    }
    setIsRunningML(false);
    setMlStatus("ACTIVE");
  };

  const handleAddComplaint = (newComplaint) => {
    if (!newComplaint) return;
    setComplaints((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const ack = newComplaint.acknowledgement_no;
      const withoutDup = ack
        ? list.filter((c) => c.acknowledgement_no !== ack)
        : list;
      return [newComplaint, ...withoutDup];
    });
    fetch(`${API}/complaints?limit=100`)
      .then((res) => res.json())
      .then((compData) => {
        const list = compData.data || compData;
        if (Array.isArray(list)) setComplaints(list);
      })
      .catch(() => {});
  };

  return (
    <BrowserRouter>
      <AppContent
        isRunningML={isRunningML}
        handleTriggerML={handleTriggerML}
        theme={theme}
        toggleTheme={toggleTheme}
        hotspots={hotspots}
        setHotspots={setHotspots}
        complaints={complaints}
        setComplaints={setComplaints}
        atms={atms}
        policeStations={policeStations}
        mlStatus={mlStatus}
        modelRuns={modelRuns}
        stats={stats}
        loadAllData={loadAllData}
        handleAddComplaint={handleAddComplaint}
      />
    </BrowserRouter>
  );
}
