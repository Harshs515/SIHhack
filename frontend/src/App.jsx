import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
      console.error("Error loading data from API:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // ML TRIGGER
  // =========================

  const handleTriggerML = async () => {
    setIsRunningML(true);
    setMlStatus("COMPUTING");

    try {
      await fetch(`${API_BASE_URL}/predictions/trigger`, {
        method: "POST",
      });

      await fetchData();
    } catch (e) {
      // Offline fallback simulation
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
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        {/* Fade Navbar — fuses seamlessly with the background */}
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

        {/* Page content — full width, no sidebar */}
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

              {/* 1. Master Command & Control Center */}
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

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {/* Global AI Voice & Chat Copilot */}
        <AiChatbot />
      </div>
    </BrowserRouter>
  );
}
