import React, { useState, useEffect } from 'react';
import StatsCards from './components/StatsCards';
import MapView from './components/MapView';
import AlertsPanel from './components/AlertsPanel';
import AnalyticsCharts from './components/AnalyticsCharts';
import {
  Shield, Search, Sun, Moon, Bell, RefreshCw, Calendar, Download, MoreVertical, ChevronDown
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [atms, setAtms] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [isRunningML, setIsRunningML] = useState(false);
  const [mlStatus, setMlStatus] = useState('ACTIVE');

  // Sync theme class on HTML element
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
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch backend data with mock fallbacks
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
        setComplaints(compData.data || []);
      }
      if (hotRes.ok) {
        const hotData = await hotRes.json();
        setHotspots(hotData.data || []);
      }
      if (atmRes.ok) {
        const atmData = await atmRes.json();
        setAtms(atmData.data || []);
      }
      if (psRes.ok) {
        const psData = await psRes.json();
        setPoliceStations(psData.data || []);
      }
    } catch (err) {
      console.warn('Backend API connection offline, loading mock dashboard data.', err);
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockComplaints = [
      { id: 1, acknowledgement_no: '2026MHA001284', fraud_category: 'Digital Arrest Scam', fraud_amount: 350000, latitude: 28.6289, longitude: 77.2065, mule_bank_name: 'State Bank of India' },
      { id: 2, acknowledgement_no: '2026MHA001285', fraud_category: 'OTP Phishing Fraud', fraud_amount: 180000, latitude: 28.6200, longitude: 77.2150, mule_bank_name: 'HDFC Bank' },
      { id: 3, acknowledgement_no: '2026MHA001286', fraud_category: 'Stock Market Scam', fraud_amount: 520000, latitude: 28.6100, longitude: 77.2300, mule_bank_name: 'ICICI Bank' },
      { id: 4, acknowledgement_no: '2026MHA001287', fraud_category: 'Task Fraud', fraud_amount: 95000, latitude: 19.0760, longitude: 72.8777, mule_bank_name: 'Axis Bank' }
    ];

    const mockAtms = [
      { id: 101, atm_id: 'ATM-DEL-01', bank_name: 'State Bank of India', address: 'Connaught Place Circle, New Delhi', risk_tier: 'HIGH', latitude: 28.6315, longitude: 77.2180 },
      { id: 102, atm_id: 'ATM-DEL-02', bank_name: 'HDFC Bank', address: 'Barakhamba Road, New Delhi', risk_tier: 'CRITICAL', latitude: 28.6250, longitude: 77.2250 }
    ];

    const mockPoliceStations = [
      { id: 1, station_name: 'Connaught Place Cyber Police Station', jurisdiction_code: 'PS-DEL-001', contact_number: '+91-11-23340001', city: 'Delhi NCR', latitude: 28.6280, longitude: 77.2190 },
      { id: 2, station_name: 'South Delhi Cyber Police Station', jurisdiction_code: 'PS-DEL-002', contact_number: '+91-11-23340002', city: 'Delhi NCR', latitude: 28.6150, longitude: 77.2280 }
    ];

    const mockHotspots = [
      {
        id: 1,
        model_run_id: 1,
        model_version: 'v1.0.4-spatial',
        model_accuracy: 0.942,
        cluster_id: 10,
        center_latitude: 28.6250,
        center_longitude: 77.2200,
        radius_meters: 1800,
        risk_score: 0.9420,
        total_complaints_in_cluster: 3,
        total_fraud_volume: 1050000,
        atm_id: 'ATM-DEL-02',
        bank_name: 'HDFC Bank',
        police_station_name: 'Connaught Place Cyber Police Station',
        police_contact: '+91-11-23340001',
        actionable_intelligence: 'HIGH RISK CASH WITHDRAWAL FORECAST: Mule account withdrawal predicted at HDFC Bank ATM (Barakhamba Road). Proximity: 0.45 km. Fraud Vol: ₹10.50 Lakhs. Immediate police station dispatch advised.'
      }
    ];

    setComplaints(mockComplaints);
    setAtms(mockAtms);
    setPoliceStations(mockPoliceStations);
    setHotspots(mockHotspots);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerML = async () => {
    setIsRunningML(true);
    setMlStatus('COMPUTING');
    try {
      await fetch(`${API_BASE_URL}/predictions/trigger`, { method: 'POST' });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningML(false);
      setMlStatus('ACTIVE');
    }
  };

  const totalFraudAmount = complaints.reduce((sum, c) => sum + parseFloat(c.fraud_amount || 0), 0);

  // Search Filter logic
  const filteredComplaints = complaints.filter(c =>
    c.acknowledgement_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.fraud_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mule_bank_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHotspots = hotspots.filter(h =>
    h.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.atm_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.police_station_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navTabs = ['Overview', 'Threat Feed', 'Incidents', 'Vulnerabilities', 'Endpoints'];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 p-4 md:p-6 flex flex-col gap-5">
      {/* Top Navbar */}
      <header className="theme-card rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Shield size={22} />
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--text-main)]">
            threatlens
          </span>
        </div>

        {/* Center: Navigation Pill Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-color)]">
          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right Controls: Search, Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Top Menu Search Bar */}
          <div className="relative hidden sm:block w-48 md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search threat, ATM, Ack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Theme Toggle Button (Light & Dark) */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all shadow-sm flex items-center justify-center"
          >
            {theme === 'light' ? <Moon size={17} className="text-slate-700" /> : <Sun size={17} className="text-amber-400" />}
          </button>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-sm">
              AM
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-[var(--text-main)]">Alex Morgan</span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] leading-tight mt-0.5">SOC Analyst</span>
            </div>
            <ChevronDown size={14} className="text-[var(--text-muted)] hidden xl:block" />
          </div>
        </div>
      </header>

      {/* Sub Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {/* Sync Status */}
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">
            <RefreshCw size={13} className="text-sky-500 animate-spin-slow" />
            <span>Last sync: <strong className="text-[var(--text-main)] font-semibold">2 min ago</strong></span>
          </div>

          {/* Date Picker Button */}
          <div className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-semibold cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors">
            <Calendar size={14} className="text-[var(--text-muted)]" />
            <span>Jul 1, 2026 00:00 - Jul 31, 2026 23:59</span>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-semibold hover:bg-[var(--bg-card-hover)] transition-colors">
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Options Menu Button */}
          <button className="p-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* 5 Header Metric Cards */}
      <StatsCards
        complaintsCount={filteredComplaints.length}
        hotspotsCount={filteredHotspots.length}
        totalFraudAmount={totalFraudAmount}
        mlStatus={mlStatus}
      />

      {/* Main Command Center Grid: Map on Left (70%), Live Threats Feed on Right (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[440px]">
        {/* Left Side: Interactive Map */}
        <div className="lg:col-span-8 h-full">
          <MapView
            complaints={filteredComplaints}
            hotspots={filteredHotspots}
            atms={atms}
            policeStations={policeStations}
            theme={theme}
          />
        </div>

        {/* Right Side: Live Threats Feed */}
        <div className="lg:col-span-4 h-full">
          <AlertsPanel
            hotspots={filteredHotspots}
            onTriggerML={handleTriggerML}
            isRunningML={isRunningML}
          />
        </div>
      </div>

      {/* Bottom Analytics & AI Security Insights Row */}
      <AnalyticsCharts />
    </div>
  );
}
