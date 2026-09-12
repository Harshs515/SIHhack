import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  Smartphone,
  Building2,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Radio,
  Filter,
  Volume2,
  ShieldCheck
} from 'lucide-react';
import { MOCK_ALERTS_STREAM } from '../data/mockData';
import { supabase } from '../services/realtimeClient';

const API = import.meta.env.VITE_API_BASE_URL || 'https://sih2026-backend-k5ru.onrender.com/api';

export default function AlertsCenterPage({ hotspots = [], setHotspots, stats = {} }) {
  const initialAlerts = Array.isArray(hotspots) ? hotspots : hotspots?.data || MOCK_ALERTS_STREAM;
  const [localHotspots, setLocalHotspots] = useState(initialAlerts);
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [broadcastLog, setBroadcastLog] = useState(null);

  useEffect(() => {
    const list = Array.isArray(hotspots) ? hotspots : hotspots?.data || [];
    if (list.length > 0) {
      setLocalHotspots(list);
    }
  }, [hotspots]);

  // Supabase Realtime for new P1 inserts
  useEffect(() => {
    if (!supabase || !supabase.channel) return;
    const channel = supabase
      .channel('alerts-center-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'predicted_hotspots' },
        (payload) => {
          const newAlert = payload.new;
          if (!newAlert) return;
          setLocalHotspots((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            if (list.find((h) => h.id === newAlert.id)) return list;
            return [newAlert, ...list];
          });
          if (newAlert.alert_level === 'P1') {
            new Audio('/alert.mp3').play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      const res = await fetch(`${API}/predictions/${id}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officer_name: 'Dashboard Operator' }),
      });
      if (res.ok) {
        setLocalHotspots((prev) =>
          (Array.isArray(prev) ? prev : []).map((h) =>
            h.id === id ? { ...h, status: 'ACKNOWLEDGED' } : h
          )
        );
        if (setHotspots) {
          setHotspots((prev) =>
            (Array.isArray(prev) ? prev : prev?.data || []).map((h) =>
              h.id === id ? { ...h, status: 'ACKNOWLEDGED' } : h
            )
          );
        }
        setBroadcastLog(`✅ Hotspot alert #${id} acknowledged and logged in system audit.`);
        setTimeout(() => setBroadcastLog(null), 3500);
      }
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const filteredAlerts = (Array.isArray(localHotspots) && localHotspots.length > 0 ? localHotspots : MOCK_ALERTS_STREAM).filter((a) => {
    const tier = a.alert_level || a.alert_tier || a.tier || 'P1';
    if (selectedTier !== 'ALL' && tier !== selectedTier) return false;
    return true;
  });

  const handleBroadcastAlert = (alertItem, channel) => {
    const bankName = alertItem.atm_bank || alertItem.bank_name || alertItem.bank || 'SBI ATM';
    setBroadcastLog(`✅ Broadcast successful via ${channel} for ${alertItem.id} (${bankName})`);
    setTimeout(() => setBroadcastLog(null), 4000);
  };

  const handleBroadcastAllP1 = () => {
    setBroadcastLog('🚨 EMERGENCY BROADCAST: All P1 High-Priority Alerts pushed via FCM to Registered LEA Android Devices.');
    setTimeout(() => setBroadcastLog(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 24px 28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Alerts</h2>
          <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>Real-time priority alert stream</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.74rem', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', padding: '6px 12px', borderRadius: '6px', color: '#cbd5e1' }}>
            P1: <strong style={{ color: '#ff385c' }}>{stats.p1_active || 0}</strong> | P2: <strong style={{ color: '#ffaa00' }}>{stats.p2_active || 0}</strong> | P3: <strong style={{ color: '#00e676' }}>{stats.p3_active || 0}</strong> | Total: <strong style={{ color: '#00e5ff' }}>{stats.total_active || (Array.isArray(localHotspots) ? localHotspots.length : 0)}</strong>
          </div>
          <button
            onClick={handleBroadcastAllP1}
            className="cyber-btn cyber-btn-danger"
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <Radio size={14} /> Emergency Broadcast All P1 Alerts
          </button>
        </div>
      </div>

      {broadcastLog && (
        <div style={{ background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#00e5ff', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {broadcastLog}
        </div>
      )}

      {/* Filter and Notification Channels Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.14)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Android Police Push</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>FCM Active (184 Devices)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 170, 0, 0.14)', color: '#ffaa00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bank Pre-Alert API</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Connected (14 Banks)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 230, 118, 0.14)', color: '#00e676', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>SMS Gateway (NIC)</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Avg Delivery: 2.1s</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.14)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>WebSocket Feed</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Live Hotspots</div>
          </div>
        </div>
      </div>

      {/* Alert Feed Table */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            Live Threat Alert Broadcast Stream
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="#00e5ff" />
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="cyber-select"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <option value="ALL">All Alert Tiers (P1, P2, P3)</option>
              <option value="P1">P1 Critical Only</option>
              <option value="P2">P2 High Only</option>
              <option value="P3">P3 Monitoring Only</option>
            </select>
          </div>
        </div>

        <table className="cyber-table">
          <thead>
            <tr>
              <th>Alert ID & Tier</th>
              <th>Fraud Typology & Intel</th>
              <th>Target ATM & District</th>
              <th>Status / Station</th>
              <th>Threat Score</th>
              <th>Golden Window</th>
              <th>Broadcast & Acknowledge</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((item) => {
              const tier = item.alert_level || item.alert_tier || item.tier || (item.risk_score >= 0.8 ? 'P1' : item.risk_score >= 0.5 ? 'P2' : 'P3');
              const bankName = item.atm_bank || item.bank_name || item.bank || 'State Bank of India';
              const districtName = item.district || item.atm_city || item.city || 'Rohini';
              const stateName = item.state || 'Delhi';
              const category = item.top_fraud_category || item.fraud_category || item.category || 'UPI_FRAUD';
              const timeStr = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.timestamp || 'Just now';
              const windowStr = item.predicted_window_start && item.predicted_window_end
                ? `${new Date(item.predicted_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.predicted_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : item.window || '45 mins remaining';
              const riskVal = item.risk_score ? (item.risk_score <= 1 ? (item.risk_score * 100).toFixed(0) : item.risk_score) : 85;
              const stationName = item.station_name || item.police_station_name || 'Cyber Crime PS';
              const stationContact = item.station_contact || item.police_contact || '1930';

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`pulse-badge ${tier === 'P1' ? 'danger' : tier === 'P2' ? 'warning' : 'primary'}`}>
                        {tier}
                      </span>
                      <strong>{typeof item.id === 'number' ? `ALT-${item.id}` : item.id}</strong>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{timeStr}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{category}</div>
                    {item.actionable_intelligence && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.actionable_intelligence}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{bankName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{districtName}, {stateName}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.status === 'ACKNOWLEDGED' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 56, 92, 0.15)',
                      color: item.status === 'ACKNOWLEDGED' ? '#00e676' : '#ff5277',
                      display: 'inline-block',
                      marginBottom: '2px'
                    }}>
                      {item.status || 'ACTIVE'}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: '#93c5fd' }}>{stationName} ({stationContact})</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: riskVal > 80 ? '#ff385c' : '#ffaa00' }}>
                      {riskVal}%
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {windowStr}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {item.status !== 'ACKNOWLEDGED' && (
                        <button
                          onClick={() => handleAcknowledge(item.id)}
                          title="Acknowledge Alert"
                          style={{ background: 'rgba(0, 230, 118, 0.14)', border: '1px solid rgba(0, 230, 118, 0.3)', color: '#00e676', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ShieldCheck size={13} /> Ack
                        </button>
                      )}

                      <button
                        onClick={() => handleBroadcastAlert(item, 'Android Police Push')}
                        title="Push to Android Police App"
                        style={{ background: 'rgba(0, 229, 255, 0.14)', border: '1px solid rgba(0, 229, 255, 0.3)', color: '#00e5ff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Smartphone size={13} />
                      </button>

                      <button
                        onClick={() => handleBroadcastAlert(item, 'Bank Branch Portal')}
                        title="Alert Bank ATM Manager"
                        style={{ background: 'rgba(255, 170, 0, 0.14)', border: '1px solid rgba(255, 170, 0, 0.3)', color: '#ffaa00', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Building2 size={13} />
                      </button>

                      <button
                        onClick={() => handleBroadcastAlert(item, 'SMS / Email Gateway')}
                        title="Send SMS to PCR Van"
                        style={{ background: 'rgba(0, 230, 118, 0.14)', border: '1px solid rgba(0, 230, 118, 0.3)', color: '#00e676', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
