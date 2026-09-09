import React, { useState } from 'react';
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
  Volume2
} from 'lucide-react';
import { MOCK_ALERTS_STREAM } from '../data/mockData';

export default function AlertsCenterPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS_STREAM);
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [broadcastLog, setBroadcastLog] = useState(null);

  const filteredAlerts = alerts.filter(a => {
    if (selectedTier !== 'ALL' && a.tier !== selectedTier) return false;
    return true;
  });

  const handleBroadcastAlert = (alertItem, channel) => {
    setBroadcastLog(`✅ Broadcast successful via ${channel} for ${alertItem.id} (${alertItem.bank})`);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Spring Boot STOMP</div>
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
              <th>Fraud Typology</th>
              <th>Target ATM & District</th>
              <th>Amount Pipeline</th>
              <th>Threat Score</th>
              <th>Golden Window</th>
              <th>Broadcast Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`pulse-badge ${item.tier === 'P1' ? 'danger' : item.tier === 'P2' ? 'warning' : 'primary'}`}>
                      {item.tier}
                    </span>
                    <strong>{item.id}</strong>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.timestamp}</div>
                </td>
                <td>{item.category}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{item.bank} ({item.atm_id})</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.district}</div>
                </td>
                <td style={{ color: '#00e676', fontWeight: 800 }}>₹{(item.target_volume / 100000).toFixed(1)}L</td>
                <td>
                  <div style={{ fontWeight: 800, color: item.risk_score > 0.85 ? '#ff385c' : '#ffaa00' }}>
                    {(item.risk_score * 100).toFixed(1)}%
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.74rem', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {item.window}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
