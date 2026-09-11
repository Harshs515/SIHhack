import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import AnalyticsReportsPage from "./pages/AnalyticsReportsPage";
import FieldOfficerPortal from "./pages/FieldOfficerPortal";

// Domain Intelligence Mock Data
import {
  MOCK_COMPLAINTS,
  MOCK_HOTSPOTS,
  MOCK_ATMS,
  MOCK_POLICE_STATIONS,
} from "./data/mockData";

// Supabase Direct Services
import {
  fetchSupabaseComplaints,
  fetchSupabaseHotspots,
  fetchSupabaseAtms,
  fetchSupabasePoliceStations,
} from "./services/supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function AppShell({
  isRunningML,
  handleTriggerML,
  theme,
  toggleTheme,
  hotspots,
  complaints,
  atms,
  policeStations,
  mlStatus,
  handleAddComplaint,
}) {
  const location = useLocation();
  const isFieldOfficer = location.pathname.startsWith("/field-officer");

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
            (hotspots || []).filter(
              (h) => h.alert_tier === "P1" || h.atm_risk_tier === "CRITICAL",
            ).length || 2
          }
        />
      )}

      {/* Page content — full width */}
      <main style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <ErrorBoundary>
          <Routes>
            {/* Default → Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
                />
              }
            />

            {/* 2. Fullscreen GIS Risk Heatmap */}
            <Route
              path="/gis-heatmap"
              element={
                <GisHeatmapPage
                  complaints={complaints}
                  hotspots={hotspots}
                  atms={atms}
                  policeStations={policeStations}
                />
              }
            />

            {/* 3. Mule Chain Graph & Neo4j Explorer */}
            <Route path="/mule-graph" element={<MuleGraphPage />} />

            {/* 4. Law Enforcement Agency (LEA) Tactical Dispatch */}
            <Route path="/lea-interface" element={<LeaInterfacePage />} />

            {/* 5. Real-Time Alerts & Notification Center */}
            <Route path="/alerts-center" element={<AlertsCenterPage />} />

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

            {/* 7. Executive Analytics & I4C Dossier Reports */}
            <Route
              path="/analytics-reports"
              element={<AnalyticsReportsPage />}
            />

            {/* 8. Field Officer Portal */}
            <Route path="/field-officer" element={<FieldOfficerPortal />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Hide Chatbot on Field Officer Portal for clean distraction-free field view */}
      {!isFieldOfficer && <AiChatbot />}
    </div>
  );
}

export default function App() {
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [atms, setAtms] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
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

  const fetchData = async () => {
    try {
      const [compRes, hotRes, atmRes, psRes] = await Promise.all([
        fetch(`${API_BASE_URL}/complaints`),
        fetch(`${API_BASE_URL}/predictions/hotspots`),
        fetch(`${API_BASE_URL}/predictions/atms`),
        fetch(`${API_BASE_URL}/predictions/police-stations`),
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.data && compData.data.length > 0)
          setComplaints(compData.data);
      }
      if (hotRes.ok) {
        const hotData = await hotRes.json();
        if (hotData.data && hotData.data.length > 0)
          setHotspots(hotData.data);
      }
      if (atmRes.ok) {
        const atmData = await atmRes.json();
        if (atmData.data && atmData.data.length > 0) setAtms(atmData.data);
      }
      if (psRes.ok) {
        const psData = await psRes.json();
        if (psData.data && psData.data.length > 0)
          setPoliceStations(psData.data);
      }
    } catch (err) {
      console.warn("Using offline mock intelligence cache");
      setComplaints(MOCK_COMPLAINTS);
      setHotspots(MOCK_HOTSPOTS);
      setAtms(MOCK_ATMS);
      setPoliceStations(MOCK_POLICE_STATIONS);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerML = async () => {
    setIsRunningML(true);
    setMlStatus("COMPUTING");

    try {
      await fetch(`${API_BASE_URL}/predictions/trigger`, {
        method: "POST",
      });

      await fetchData();
    } catch (e) {
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
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  return (
    <BrowserRouter>
      <AppShell
        isRunningML={isRunningML}
        handleTriggerML={handleTriggerML}
        theme={theme}
        toggleTheme={toggleTheme}
        hotspots={hotspots}
        complaints={complaints}
        atms={atms}
        policeStations={policeStations}
        mlStatus={mlStatus}
        handleAddComplaint={handleAddComplaint}
      />
    </BrowserRouter>
  );
}
