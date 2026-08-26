import React, { useState, useEffect } from 'react';
import StatsCards from './components/StatsCards';
import MapView from './components/MapView';
import AlertsPanel from './components/AlertsPanel';
import { Shield, Radio } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [atms, setAtms] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [isRunningML, setIsRunningML] = useState(false);
  const [mlStatus, setMlStatus] = useState('ACTIVE');

  // Fetch data from backend
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
        actionable_intelligence: 'HIGH RISK CASH WITHDRAWAL FORECAST: Mule account withdrawal predicted at HDFC Bank ATM (Barakhamba Road). Proximity: 0.45 km. Fraud Vol: ₹10.50 Lakhs. ACTIONABLE LEA DISPATCH: Recommended immediate patrol dispatch via Connaught Place Cyber Police Station within 45-minute window.'
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px', gap: '16px' }}>
      {/* Top Command Navbar */}
      <header className="glass-panel" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(0, 210, 255, 0.4)'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 0%, #00d2ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MHA CYBERCRIME PREDICTIVE ANALYTICS FRAMEWORK
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SIH 2026 (SIH26184) — Actionable Intelligence for Cash Withdrawal Intervention
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="pulse-badge danger" style={{ padding: '6px 12px' }}>
            <span className="pulse-dot"></span> LIVE SURVEILLANCE FEED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Radio size={14} color="#00d2ff" />
            <span>Airflow Orchestrator: <strong>15m Sync</strong></span>
          </div>
        </div>
      </header>

      {/* Stats Summary Cards */}
      <StatsCards
        complaintsCount={complaints.length}
        hotspotsCount={hotspots.length}
        totalFraudAmount={totalFraudAmount}
        mlStatus={mlStatus}
      />

      {/* Main Grid View */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '70% 30%', gap: '16px', minHeight: 0 }}>
        {/* Left Side: Interactive Leaflet Map */}
        <div className="glass-panel" style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <MapView complaints={complaints} hotspots={hotspots} atms={atms} policeStations={policeStations} />
        </div>

        {/* Right Side: Alerts Panel */}
        <div style={{ height: '100%' }}>
          <AlertsPanel hotspots={hotspots} onTriggerML={handleTriggerML} isRunningML={isRunningML} />
        </div>
      </div>
    </div>
  );
}
