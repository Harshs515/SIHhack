import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  PhoneCall,
  Download,
  AlertTriangle,
  Radio,
  FileCheck2,
  Navigation,
  CheckCircle2,
  Car
} from 'lucide-react';
import { MOCK_HOTSPOTS } from '../data/mockData';

const API = import.meta.env.VITE_API_BASE_URL || 'https://sih2026-backend-k5ru.onrender.com/api';

function getTimeRemaining(windowEnd) {
  if (!windowEnd) return 'ACTIVE';
  const now = new Date();
  const end = new Date(windowEnd);
  const diffMs = end - now;
  if (diffMs <= 0) return 'EXPIRED';
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function LeaInterfacePage({ hotspots = [], setHotspots, stats = {} }) {
  const parseHotspots = (rawList) => {
    const list = Array.isArray(rawList) ? rawList : rawList?.data || MOCK_HOTSPOTS;
    return list
      .filter((h) => !h.status || h.status === 'ACTIVE' || h.status === 'DISPATCHED' || h.status === 'ON_SCENE')
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .map((h, idx) => ({
        ...h,
        alert_tier: h.alert_level || h.alert_tier || (h.risk_score >= 0.8 ? 'P1' : 'P2'),
        bank_name: h.atm_bank || h.bank_name || 'State Bank of India',
        atm_id: h.atm_id || `ATM-DEL-${idx + 1}`,
        district: h.district || h.atm_city || h.city || 'Rohini',
        state: h.state || 'Delhi',
        actionable_intelligence: h.actionable_intelligence || 'High confidence pattern detected. Dispatch recommended.',
        police_station_name: h.station_name || h.police_station_name || 'Cyber Crime Police Station',
        police_contact: h.station_contact || h.police_contact || '1930',
        dispatch_status: h.dispatch_status || (h.status === 'ACKNOWLEDGED' ? 'DISPATCHED' : idx === 0 ? 'DISPATCHED' : idx === 1 ? 'ON_SCENE' : 'PENDING_APPROVAL'),
        assigned_team: h.assigned_team || `PCR-ALPHA-${idx + 1}`,
        eta_mins: (idx + 1) * 5 + 3,
        action_logs: h.action_logs || [
          { time: '19:15', note: 'Spatial AI engine triggered P1 withdrawal forecast' },
          { time: '19:18', note: 'Automated proximity dispatch matched to nearest Cyber Police Station' }
        ]
      }));
  };

  const [incidents, setIncidents] = useState(() => parseHotspots(hotspots));
  const [selectedIncident, setSelectedIncident] = useState(incidents[0] || null);
  const [dispatchAlert, setDispatchAlert] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const list = parseHotspots(hotspots);
    if (list.length > 0) {
      setIncidents(list);
      setSelectedIncident((prev) => (prev ? list.find((i) => i.id === prev.id) || list[0] : list[0]));
    }
  }, [hotspots]);

  // 1-second countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (incidentId, newStatus) => {
    // Optimistically update local UI state
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === incidentId) {
          const updated = {
            ...item,
            dispatch_status: newStatus,
            status: newStatus === 'DISPATCHED' ? 'ACKNOWLEDGED' : item.status,
            action_logs: [
              ...(item.action_logs || []),
              {
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                note: `Status updated to ${newStatus}`
              }
            ]
          };
          if (selectedIncident?.id === incidentId) setSelectedIncident(updated);
          return updated;
        }
        return item;
      })
    );

    setDispatchAlert(`Tactical directive confirmed: ${newStatus} for Cluster ${incidentId}`);
    setTimeout(() => setDispatchAlert(null), 3500);

    try {
      if (newStatus === 'DISPATCHED') {
        await fetch(`${API}/predictions/${incidentId}/acknowledge`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ officer_name: 'PCR Unit 01' })
        });
      }
    } catch (err) {
      console.warn('LEA dispatch patch error:', err);
    }
  };

  const handleResolveIncident = async (incidentId) => {
    // Optimistic removal from active list
    setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(null);
    }
    if (setHotspots) {
      setHotspots((prev) =>
        (Array.isArray(prev) ? prev : prev?.data || []).map((h) =>
          h.id === incidentId ? { ...h, status: 'RESOLVED' } : h
        )
      );
    }
    setDispatchAlert(`Incident #${incidentId} marked as RESOLVED and archived to evidence log.`);
    setTimeout(() => setDispatchAlert(null), 3500);

    try {
      await fetch(`${API}/predictions/${incidentId}/resolve`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.warn('LEA resolve patch error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 24px 28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>LEA Dispatch</h2>
          <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>PCR intercept vectoring & patrol coordination</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            Active Patrol Teams: <strong>16 PCR Units</strong> | Intercept Rate: <strong style={{ color: '#00e676' }}>81.2%</strong>
          </div>
        </div>
      </div>

      {dispatchAlert && (
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#00e676', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {dispatchAlert}
        </div>
      )}

      {/* Main Grid: Incident Queue + Detailed Field Action Dossier */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', minHeight: 0 }}>
        {/* Left: Dispatch Queue Table */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff' }}>
              Active Incident Dispatch Queue ({incidents.length} High-Risk Targets)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-refreshed every 20s</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Target ATM & Cluster</th>
                  <th>Location / District</th>
                  <th>Fraud Volume</th>
                  <th>Risk Tier</th>
                  <th>Window Remaining</th>
                  <th>Assigned Station</th>
                  <th>Field Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedIncident(item)}
                    style={{
                      cursor: 'pointer',
                      background: selectedIncident?.id === item.id ? 'rgba(0, 229, 255, 0.08)' : 'transparent'
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{item.bank_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.atm_id} ({item.cluster_id || item.id})</div>
                    </td>
                    <td>{item.district}, {item.state}</td>
                    <td style={{ color: '#00e676', fontWeight: 800 }}>
                      ₹{item.total_fraud_volume ? (item.total_fraud_volume / 100000).toFixed(1) + 'L' : '8.5L'}
                    </td>
                    <td>
                      <span className={`pulse-badge ${item.alert_tier === 'P1' ? 'danger' : 'warning'}`}>
                        {item.alert_tier}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.72rem', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {getTimeRemaining(item.predicted_window_end)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.76rem', color: '#93c5fd' }}>{item.police_station_name}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{item.police_contact}</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: item.dispatch_status === 'ON_SCENE' ? 'rgba(0, 230, 118, 0.2)' : item.dispatch_status === 'DISPATCHED' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 170, 0, 0.2)',
                        color: item.dispatch_status === 'ON_SCENE' ? '#00e676' : item.dispatch_status === 'DISPATCHED' ? '#00e5ff' : '#ffaa00'
                      }}>
                        {item.dispatch_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(item.id, 'DISPATCHED');
                        }}
                        className="cyber-btn"
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        <Send size={11} /> Vector Patrol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Incident Field Directive Dossier */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
            Tactical Action Directive
          </h3>

          {selectedIncident ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span className="pulse-badge danger" style={{ marginBottom: '4px' }}>
                  {selectedIncident.alert_tier} PRIORITY INTERVENTION ({((selectedIncident.risk_score || 0.88) * 100).toFixed(0)}% Risk)
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{selectedIncident.bank_name} ({selectedIncident.atm_id})</h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{selectedIncident.district}, {selectedIncident.state}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                <strong>Intelligence Directive:</strong> {selectedIncident.actionable_intelligence}
              </div>

              {/* Station & PCR Assignment */}
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem' }}>
                <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={14} /> Assigned Unit: {selectedIncident.assigned_team}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  Station: {selectedIncident.police_station_name}<br />
                  Emergency Hotline: {selectedIncident.police_contact}<br />
                  Window Time Left: <strong style={{ color: '#00e5ff' }}>{getTimeRemaining(selectedIncident.predicted_window_end)}</strong><br />
                  Estimated Arrival Time (ETA): <strong>~{selectedIncident.eta_mins} minutes</strong>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.id, 'DISPATCHED')}
                  className="cyber-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Send size={14} /> Dispatch Patrol Unit to ATM
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedIncident.id, 'ON_SCENE')}
                  className="cyber-btn cyber-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <CheckCircle size={14} /> Mark Team "On Scene / Surveilling"
                </button>

                <button
                  onClick={() => handleResolveIncident(selectedIncident.id)}
                  className="cyber-btn"
                  style={{ background: 'linear-gradient(135deg, #00e676 0%, #10b981 100%)', color: '#040914', width: '100%', justifyContent: 'center', fontWeight: 800 }}
                >
                  <FileCheck2 size={14} /> Mark Resolved & Confirm Seizure
                </button>
              </div>

              {/* Action Log Timeline */}
              <div style={{ marginTop: '6px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Action Audit Trail
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {selectedIncident.action_logs?.map((log, idx) => (
                    <div key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>[{log.time}]</span>
                      <span>{log.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
              Select an incident from the queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
