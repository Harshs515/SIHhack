import React, { useState, useEffect } from 'react';
<<<<<<< HEAD

import StatsCards from './components/StatsCards';
import MapView from './components/MapView';
import AlertsPanel from './components/AlertsPanel';
import AnalyticsCharts from './components/AnalyticsCharts';

import {
  Shield,
  Search,
  Sun,
  Moon,
  Bell,
  RefreshCw,
  Calendar,
  Download,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Global Navigation & Error Boundary Components
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import AiChatbot from './components/AiChatbot';

// Pages
import DashboardPage from './pages/DashboardPage';
import CommandCenter from './pages/CommandCenter';
import GisHeatmapPage from './pages/GisHeatmapPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import MuleGraphPage from './pages/MuleGraphPage';
import LeaInterfacePage from './pages/LeaInterfacePage';
import AlertsCenterPage from './pages/AlertsCenterPage';
import NcrpComplaintsPage from './pages/NcrpComplaintsPage';
import AnalyticsReportsPage from './pages/AnalyticsReportsPage';
import PipelineTopologyPage from './pages/PipelineTopologyPage';

// Domain Intelligence Mock Data
import {
  MOCK_COMPLAINTS,
  MOCK_HOTSPOTS,
  MOCK_ATMS,
  MOCK_POLICE_STATIONS
} from './data/mockData';
>>>>>>> test

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
<<<<<<< HEAD
  // =========================
  // UI STATES
  // =========================

  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  // =========================
  // MAP DATA STATES
  // =========================

  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [atms, setAtms] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);

  // =========================
  // ML STATUS STATES
  // =========================

  const [isRunningML, setIsRunningML] = useState(false);
  const [mlStatus, setMlStatus] = useState('ACTIVE');

  // =========================
  // MOCK DATA
  // Temporary until backend/database
  // is completed
  // =========================

  const loadMockData = () => {
    const mockComplaints = [
      {
        id: 1,
        acknowledgement_no: '2026MHA001284',
        fraud_category: 'Digital Arrest Scam',
        fraud_amount: 350000,
        latitude: 28.6289,
        longitude: 77.2065,
        mule_bank_name: 'State Bank of India'
      },
      {
        id: 2,
        acknowledgement_no: '2026MHA001285',
        fraud_category: 'OTP Phishing Fraud',
        fraud_amount: 180000,
        latitude: 28.6200,
        longitude: 77.2150,
        mule_bank_name: 'HDFC Bank'
      },
      {
        id: 3,
        acknowledgement_no: '2026MHA001286',
        fraud_category: 'Stock Market Scam',
        fraud_amount: 520000,
        latitude: 28.6100,
        longitude: 77.2300,
        mule_bank_name: 'ICICI Bank'
      },
      {
        id: 4,
        acknowledgement_no: '2026MHA001287',
        fraud_category: 'Task Fraud',
        fraud_amount: 95000,
        latitude: 28.6350,
        longitude: 77.2250,
        mule_bank_name: 'Axis Bank'
      },
      {
        id: 5,
        acknowledgement_no: '2026MHA001288',
        fraud_category: 'UPI Fraud',
        fraud_amount: 125000,
        latitude: 28.6320,
        longitude: 77.2140,
        mule_bank_name: 'Punjab National Bank'
      },
      {
        id: 6,
        acknowledgement_no: '2026MHA001289',
        fraud_category: 'Investment Scam',
        fraud_amount: 640000,
        latitude: 28.6180,
        longitude: 77.2220,
        mule_bank_name: 'Kotak Mahindra Bank'
      },
      {
        id: 7,
        acknowledgement_no: '2026MHA001290',
        fraud_category: 'QR Code Scam',
        fraud_amount: 75000,
        latitude: 28.6270,
        longitude: 77.2120,
        mule_bank_name: 'Yes Bank'
      },
      {
        id: 8,
        acknowledgement_no: '2026MHA001291',
        fraud_category: 'Digital Arrest Scam',
        fraud_amount: 890000,
        latitude: 28.6230,
        longitude: 77.2180,
        mule_bank_name: 'HDFC Bank'
      }
    ];

    const mockAtms = [
      {
        id: 101,
        atm_id: 'ATM-DEL-01',
        bank_name: 'State Bank of India',
        address: 'Connaught Place Circle, New Delhi',
        risk_tier: 'HIGH',
        latitude: 28.6315,
        longitude: 77.2180
      },
      {
        id: 102,
        atm_id: 'ATM-DEL-02',
        bank_name: 'HDFC Bank',
        address: 'Barakhamba Road, New Delhi',
        risk_tier: 'CRITICAL',
        latitude: 28.6250,
        longitude: 77.2250
      },
      {
        id: 103,
        atm_id: 'ATM-DEL-03',
        bank_name: 'ICICI Bank',
        address: 'Kasturba Gandhi Marg, New Delhi',
        risk_tier: 'MEDIUM',
        latitude: 28.6290,
        longitude: 77.2100
      },
      {
        id: 104,
        atm_id: 'ATM-DEL-04',
        bank_name: 'Axis Bank',
        address: 'Janpath, New Delhi',
        risk_tier: 'LOW',
        latitude: 28.6210,
        longitude: 77.2080
      },
      {
        id: 105,
        atm_id: 'ATM-DEL-05',
        bank_name: 'Punjab National Bank',
        address: 'Mandi House, New Delhi',
        risk_tier: 'MEDIUM',
        latitude: 28.6250,
        longitude: 77.2350
      }
    ];

    const mockPoliceStations = [
      {
        id: 1,
        station_name: 'Connaught Place Cyber Police Station',
        jurisdiction_code: 'PS-DEL-001',
        contact_number: '+91-11-23340001',
        city: 'Delhi NCR',
        latitude: 28.6280,
        longitude: 77.2190
      },
      {
        id: 2,
        station_name: 'South Delhi Cyber Police Station',
        jurisdiction_code: 'PS-DEL-002',
        contact_number: '+91-11-23340002',
        city: 'Delhi NCR',
        latitude: 28.6150,
        longitude: 77.2280
      },
      {
        id: 3,
        station_name: 'Central Delhi Police Station',
        jurisdiction_code: 'PS-DEL-003',
        contact_number: '+91-11-23340003',
        city: 'Delhi NCR',
        latitude: 28.6400,
        longitude: 77.2050
      }
    ];

    const mockHotspots = [
      {
        id: 1,
        model_run_id: 1,
        model_version: 'v1.0.4-spatial',
        model_accuracy: 0.942,

        cluster_id: 10,

        // Cybercrime cluster center (BKC, Mumbai)
        center_latitude: 19.0600,
        center_longitude: 72.8600,

        radius_meters: 1800,
        risk_score: 0.942,

        total_complaints_in_cluster: 8,
        total_fraud_volume: 1050000,

        // Actual predicted target ATM
        target_atm_latitude: 19.0608,
        target_atm_longitude: 72.8642,

        atm_id: 'ATM-MUM-01',
        bank_name: 'HDFC Bank',

        police_station_name:
          'BKC Cyber Crime Police Station',

        police_contact: '+91-22-26504008',

        actionable_intelligence:
          'HIGH RISK CASH WITHDRAWAL FORECAST: Mule account withdrawal predicted at HDFC Bank ATM in BKC G-Block. Immediate police station dispatch advised.'
      },
      {
        id: 2,
        model_run_id: 1,
        model_version: 'v1.0.4-spatial',
        model_accuracy: 0.942,

        cluster_id: 11,

        // Cybercrime cluster center (Colaba, South Mumbai)
        center_latitude: 18.9220,
        center_longitude: 72.8340,

        radius_meters: 1200,
        risk_score: 0.81,

        total_complaints_in_cluster: 5,
        total_fraud_volume: 720000,

        target_atm_latitude: 18.9234,
        target_atm_longitude: 72.8315,

        atm_id: 'ATM-MUM-02',
        bank_name: 'ICICI Bank',

        police_station_name:
          'Colaba Police Station',

        police_contact: '+91-22-22856030',

        actionable_intelligence:
          'Elevated withdrawal probability detected. Monitor nearby ATM locations in the Colaba Causeway area and notify the responsible police station.'
      }
    ];


    setComplaints(mockComplaints);
    setAtms(mockAtms);
    setPoliceStations(mockPoliceStations);
    setHotspots(mockHotspots);
  };

  // =========================
  // THEME HANDLING
  // =========================

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'light' ? 'dark' : 'light'
    );
  };

  // =========================
  // BACKEND DATA FETCHING
  // =========================

  const fetchData = async () => {
    try {
      const [compRes, hotRes, atmRes, psRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/complaints`),
          fetch(`${API_BASE_URL}/predictions/hotspots`),
          fetch(`${API_BASE_URL}/predictions/atms`),
          fetch(
            `${API_BASE_URL}/predictions/police-stations`
          )
        ]);

      // If backend is not fully ready,
      // use frontend mock data
      if (
        !compRes.ok ||
        !hotRes.ok ||
        !atmRes.ok ||
        !psRes.ok
      ) {
        throw new Error('Backend API unavailable');
      }

      const compData = await compRes.json();
      const hotData = await hotRes.json();
      const atmData = await atmRes.json();
      const psData = await psRes.json();

      setComplaints(compData.data || []);
      setHotspots(hotData.data || []);
      setAtms(atmData.data || []);
      setPoliceStations(psData.data || []);

    } catch (error) {
      console.warn(
        'Backend unavailable. Using mock dashboard data.',
        error
      );

      loadMockData();
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchData();

    const interval = setInterval(
      fetchData,
      15000
    );

=======
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);
  const [atms, setAtms] = useState(MOCK_ATMS);
  const [policeStations, setPoliceStations] = useState(MOCK_POLICE_STATIONS);
  const [isRunningML, setIsRunningML] = useState(false);
  const [mlStatus, setMlStatus] = useState('ACTIVE');

  // Fetch real data from backend when available with seamless fallback to mock data
  const fetchData = async () => {
    try {
      const [compRes, hotRes, atmRes, psRes] = await Promise.all([
        fetch(`${API_BASE_URL}/complaints`),
        fetch(`${API_BASE_URL}/predictions/hotspots`),
        fetch(`${API_BASE_URL}/predictions/atms`),
        fetch(`${API_BASE_URL}/predictions/police-stations`)
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.data && compData.data.length > 0) setComplaints(compData.data);
      }
      if (hotRes.ok) {
        const hotData = await hotRes.json();
        if (hotData.data && hotData.data.length > 0) setHotspots(hotData.data);
      }
      if (atmRes.ok) {
        const atmData = await atmRes.json();
        if (atmData.data && atmData.data.length > 0) setAtms(atmData.data);
      }
      if (psRes.ok) {
        const psData = await psRes.json();
        if (psData.data && psData.data.length > 0) setPoliceStations(psData.data);
      }
    } catch (err) {
      // Backend not yet running or offline; loaded mock datasets seamlessly
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
>>>>>>> test
    return () => clearInterval(interval);
  }, []);

  // =========================
  // ML TRIGGER
  // =========================

  const handleTriggerML = async () => {
    setIsRunningML(true);
    setMlStatus('COMPUTING');

    try {
      await fetch(
        `${API_BASE_URL}/predictions/trigger`,
        {
          method: 'POST'
        }
      );

      await fetchData();
<<<<<<< HEAD

    } catch (error) {
      console.error(
        'ML service unavailable:',
        error
      );

    } finally {
      setIsRunningML(false);
      setMlStatus('ACTIVE');
=======
    } catch (e) {
      // Offline fallback simulation
      setTimeout(() => {
        setIsRunningML(false);
        setMlStatus('ACTIVE');
      }, 1200);
      return;
>>>>>>> test
    }
    setIsRunningML(false);
    setMlStatus('ACTIVE');
  };

<<<<<<< HEAD
  // =========================
  // SEARCH FILTERING
  // =========================

  const filteredComplaints = complaints.filter((c) => {
    const query = searchQuery.toLowerCase();

    return (
      c.acknowledgement_no
        ?.toLowerCase()
        .includes(query) ||
      c.fraud_category
        ?.toLowerCase()
        .includes(query) ||
      c.mule_bank_name
        ?.toLowerCase()
        .includes(query)
    );
  });

  const filteredHotspots = hotspots.filter((h) => {
    const query = searchQuery.toLowerCase();

    return (
      h.bank_name
        ?.toLowerCase()
        .includes(query) ||
      h.atm_id
        ?.toLowerCase()
        .includes(query) ||
      h.police_station_name
        ?.toLowerCase()
        .includes(query)
    );
  });

  // =========================
  // CALCULATIONS
  // =========================

  const totalFraudAmount = complaints.reduce(
    (sum, complaint) =>
      sum +
      parseFloat(
        complaint.fraud_amount || 0
      ),
    0
  );

  // =========================
  // NAVIGATION
  // =========================

  const navTabs = [
    'Overview',
    'Threat Feed',
    'Incidents',
    'Vulnerabilities',
    'Endpoints'
  ];

  // =========================
  // APP UI
  // =========================

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 p-4 md:p-6 flex flex-col gap-5">

      {/* =====================
          TOP NAVBAR
      ====================== */}

      <header className="theme-card rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm">

        {/* BRAND */}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Shield size={22} />
          </div>

          <span className="text-lg font-black tracking-tight text-[var(--text-main)]">
            threatlens
          </span>
        </div>

        {/* NAVIGATION */}

        <nav className="hidden lg:flex items-center gap-1.5 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-color)]">

          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab
                ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
            >
              {tab}
            </button>
          ))}

        </nav>

        {/* RIGHT CONTROLS */}

        <div className="flex items-center gap-3">

          {/* SEARCH */}

          <div className="relative hidden sm:block w-48 md:w-64">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              type="text"
              placeholder="Search threat, ATM, Ack..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 transition-colors"
            />

          </div>

          {/* THEME */}

          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light'
              ? 'Dark'
              : 'Light'
              } Mode`}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all shadow-sm flex items-center justify-center"
          >
            {theme === 'light'
              ? <Moon size={17} />
              : <Sun
                size={17}
                className="text-amber-400"
              />
            }
          </button>

          {/* NOTIFICATIONS */}

          <button className="relative p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">

            <Bell size={17} />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />

          </button>

          {/* PROFILE */}

          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
              AM
            </div>

            <div className="hidden xl:flex flex-col text-left">

              <span className="text-xs font-bold leading-none">
                Alex Morgan
              </span>

              <span className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
                SOC Analyst
              </span>

            </div>

            <ChevronDown
              size={14}
              className="text-[var(--text-muted)] hidden xl:block"
            />

          </div>

        </div>

      </header>

      {/* =====================
          SUB HEADER
      ====================== */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">

          {/* SYNC STATUS */}

          <div className="flex items-center gap-1.5 text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">

            <RefreshCw
              size={13}
              className="text-sky-500 animate-spin-slow"
            />

            <span>
              Last sync:{' '}
              <strong className="text-[var(--text-main)]">
                2 min ago
              </strong>
            </span>

          </div>

          {/* DATE */}

          <div className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">

            <Calendar
              size={14}
              className="text-[var(--text-muted)]"
            />

            <span>
              Jul 1, 2026 00:00 - Jul 31, 2026 23:59
            </span>

          </div>

          {/* EXPORT */}

          <button className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">

            <Download size={14} />

            <span>
              Export
            </span>

          </button>

          {/* MORE */}

          <button className="p-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">

            <MoreVertical size={16} />

          </button>

        </div>

      </div>

      {/* =====================
          STATISTICS
      ====================== */}

      <StatsCards
        complaintsCount={filteredComplaints.length}
        hotspotsCount={filteredHotspots.length}
        totalFraudAmount={totalFraudAmount}
        mlStatus={mlStatus}
      />

      {/* =====================
          MAIN COMMAND CENTER
      ====================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* MAP */}
        <div className="lg:col-span-8 h-[550px]">
          <MapView
            complaints={filteredComplaints}
            hotspots={filteredHotspots}
            atms={atms}
            policeStations={policeStations}
            theme={theme}
          />
        </div>

        {/* ALERT PANEL */}
        <div className="lg:col-span-4 h-[550px]">
          <AlertsPanel
            hotspots={filteredHotspots}
            onTriggerML={handleTriggerML}
            isRunningML={isRunningML}
          />
        </div>

      </div>

      {/* =====================
          ANALYTICS
      ====================== */}

      <AnalyticsCharts />

    </div>
=======
  const handleAddComplaint = (newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Fade Navbar — fuses seamlessly with the background */}
        <Navbar
          isRunningML={isRunningML}
          onTriggerML={handleTriggerML}
          activeAlertsCount={(hotspots || []).filter(h =>
            (h.alert_tier === 'P1') || (h.atm_risk_tier === 'CRITICAL')
          ).length || 2}
        />

        {/* Page content — full width, no sidebar */}
        <main style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
                  />
                }
              />

              {/* 1. Master Command & Control Center */}
              <Route
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

              {/* 3. AI/ML Predictive Hub */}
              <Route
                path="/predictive-analytics"
                element={
                  <PredictiveAnalyticsPage
                    onTriggerML={handleTriggerML}
                    isRunningML={isRunningML}
                  />
                }
              />

              {/* 4. Mule Chain Graph & Neo4j Explorer */}
              <Route path="/mule-graph" element={<MuleGraphPage />} />

              {/* 5. Law Enforcement Agency (LEA) Tactical Dispatch */}
              <Route path="/lea-interface" element={<LeaInterfacePage />} />

              {/* 6. Real-Time Alerts & Notification Center */}
              <Route path="/alerts-center" element={<AlertsCenterPage />} />

              {/* 7. NCRP & 1930 Cybercrime Complaint Ingestion Suite */}
              <Route
                path="/ncrp-complaints"
                element={
                  <NcrpComplaintsPage
                    complaints={complaints}
                    onAddComplaint={handleAddComplaint}
                  />
                }
              />

              {/* 8. Executive Analytics & I4C Dossier Reports */}
              <Route path="/analytics-reports" element={<AnalyticsReportsPage />} />

              {/* 9. End-to-End Pipeline & System Topology */}
              <Route path="/pipeline-topology" element={<PipelineTopologyPage />} />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {/* Global AI Voice & Chat Copilot */}
        <AiChatbot />
      </div>
    </BrowserRouter>
>>>>>>> test
  );
}