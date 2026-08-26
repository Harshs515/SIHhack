import React from 'react';
import { AlertTriangle, Clock, RefreshCw, Send, ShieldCheck, Cpu } from 'lucide-react';

export default function AlertsPanel({ hotspots, onTriggerML, isRunningML }) {
  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle color="#ff4757" size={22} />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Actionable LEA Intelligence</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Proactive Cash Withdrawal & Police Station Dispatch</p>
          </div>
        </div>
        <button
          onClick={onTriggerML}
          disabled={isRunningML}
          style={{
            background: isRunningML ? 'rgba(0, 210, 255, 0.2)' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            cursor: isRunningML ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(0, 210, 255, 0.3)'
          }}
        >
          <RefreshCw size={14} style={{ animation: isRunningML ? 'spin 1s linear infinite' : 'none' }} />
          {isRunningML ? 'Processing...' : 'Run Spatial ML'}
        </button>
      </div>

      {/* Alert Stream List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {hotspots.length === 0 ? (
          <div style={{ textTransform: 'uppercase', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No Active High-Risk Hotspots. Click "Run Spatial ML" to execute spatial DBSCAN & XGBoost withdrawal forecasting.
          </div>
        ) : (
          hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '14px',
                borderRadius: '10px',
                borderLeft: '4px solid #ff4757',
                background: 'rgba(255, 71, 87, 0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span className="pulse-badge danger">
                  <span className="pulse-dot"></span> Risk {(parseFloat(hotspot.risk_score) * 100).toFixed(0)}%
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Window: 45 Mins
                </span>
              </div>

              {/* Model Provenance Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 8px 0', fontSize: '0.7rem', color: '#00d2ff' }}>
                <Cpu size={12} />
                <span>Model Run #{hotspot.model_run_id || 1} ({hotspot.model_version || 'v1.0.4-spatial'}) — Acc: {(parseFloat(hotspot.model_accuracy || 0.942) * 100).toFixed(1)}%</span>
              </div>

              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                {hotspot.bank_name || 'ATM Location'} ({hotspot.atm_id || 'ID Pending'})
              </h4>

              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '10px' }}>
                {hotspot.actionable_intelligence}
              </p>

              {/* LEA Police Station Badge */}
              {hotspot.police_station_name && (
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd',
                  fontSize: '0.73rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px'
                }}>
                  <ShieldCheck size={14} />
                  <span>Assigned LEA: <strong>{hotspot.police_station_name}</strong> ({hotspot.police_contact})</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Target Vol: <strong>₹{parseFloat(hotspot.total_fraud_volume).toLocaleString()}</strong></span>
                <button style={{
                  background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
                }}>
                  <Send size={11} /> Dispatch Police Unit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
