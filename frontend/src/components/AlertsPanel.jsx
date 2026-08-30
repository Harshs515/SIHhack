<<<<<<< HEAD
import React from 'react';
import { ArrowUpRight, Lock, Mail, FileText, Axe, Send, RefreshCw } from 'lucide-react';

export default function AlertsPanel({ hotspots, onTriggerML, isRunningML }) {
  // Mock threat feed items matching screenshot aesthetics + live LEA actionable intelligence
  const defaultFeedItems = [
    {
      id: 'tf-1',
      title: 'Ransomware Detected',
      detail: '192.168.10.45 ➔ SERVER-01',
      severity: 'Critical',
      badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      time: '8 sec ago',
      icon: Lock,
      isFlagged: true
    },
    {
      id: 'tf-2',
      title: 'Phishing Attempt Blocked',
      detail: '172.217.14.9 ➔ sarah@gmail.com',
      severity: 'High',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      time: '1 min ago',
      icon: Mail,
      isFlagged: false
    },
    {
      id: 'tf-3',
      title: 'Suspicious File Detected',
      detail: 'workstation-56 ➔ HR-LAPTOP-12',
      severity: 'Low',
      badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      time: '44 sec ago',
      icon: FileText,
      isFlagged: false
    },
    {
      id: 'tf-4',
      title: 'Brute Force Attack',
      detail: '192.168.10.45 ➔ VPN-GATEWAY',
      severity: 'Medium',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      time: '2 min ago',
      icon: Axe,
      isFlagged: true
    }
  ];

  return (
    <div className="theme-card rounded-2xl p-4 h-full flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">Live Threats Feed</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerML}
            disabled={isRunningML}
            className="text-[11px] font-semibold text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRunningML ? 'animate-spin' : ''} />
            {isRunningML ? 'Scanning...' : 'Run ML Scan'}
          </button>
          <ArrowUpRight size={16} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1">
        {/* Hotspots / Interventions List */}
        {hotspots && hotspots.length > 0 && hotspots.map((h) => (
          <div
            key={`hs-${h.id}`}
            className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition-all flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                  <Lock size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] leading-snug">
                    {h.bank_name || 'ATM Withdrawal Risk'} ({h.atm_id})
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                    Target Vol: ₹{parseFloat(h.total_fraud_volume || 1050000).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-rose-500/10 text-rose-500 border-rose-500/20">
                  Critical
                </span>
                <span className="text-[10px] text-[var(--text-sub)]">Just now</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-10">
              {h.actionable_intelligence || 'Mule withdrawal forecast active. Immediate police station dispatch advised.'}
            </p>

            <div className="pl-10 pt-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-sky-500">
                LEA: {h.police_station_name || 'Cyber PS'}
              </span>
              <button className="text-[11px] font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white px-2.5 py-1 rounded-lg hover:brightness-110 shadow-sm transition-all flex items-center gap-1">
                <Send size={10} /> Dispatch Unit
              </button>
            </div>
          </div>
        ))}

        {/* Standard Threat Feed Items matching screenshot */}
        {defaultFeedItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] shrink-0 shadow-sm">
                  <IconComp size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.severity}
                </span>
                <span className="text-[10px] text-[var(--text-sub)]">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
=======
import React, { useState } from 'react';
import { AlertTriangle, Clock, RefreshCw, Send, ShieldCheck, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AlertsPanel({ hotspots = [], onTriggerML, isRunningML }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dispatchedMap, setDispatchedMap] = useState({});
  const [dispatchToast, setDispatchToast] = useState(null);

  const filteredHotspots = (hotspots || []).filter(h => {
    if (!h) return false;
    if (activeFilter === 'P1' && (h.alert_tier !== 'P1' && h.atm_risk_tier !== 'CRITICAL')) return false;
    if (activeFilter === 'P2' && (h.alert_tier !== 'P2' && h.atm_risk_tier !== 'HIGH')) return false;
    return true;
  });

  const handleDispatch = (hotspot) => {
    setDispatchedMap(prev => ({ ...prev, [hotspot.id]: true }));
    setDispatchToast(`🚨 PCR Patrol Dispatched to ${hotspot.bank_name} ATM (${hotspot.district})!`);
    setTimeout(() => setDispatchToast(null), 3500);
  };

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 56, 92, 0.15)', color: '#ff385c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>Actionable LEA Intelligence</h3>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proactive Cash Withdrawal Forecasts & Dispatches</p>
          </div>
        </div>

        <button
          onClick={onTriggerML}
          disabled={isRunningML}
          className="cyber-btn"
          style={{
            padding: '6px 12px',
            fontSize: '0.74rem'
          }}
        >
          <RefreshCw size={12} style={{ animation: isRunningML ? 'spin 1s linear infinite' : 'none' }} />
          {isRunningML ? 'Scoring...' : 'Run Spatial AI'}
        </button>
      </div>

      {dispatchToast && (
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', padding: '8px 12px', borderRadius: '8px', color: '#00e676', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} /> {dispatchToast}
        </div>
      )}

      {/* Interactive Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`interactive-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
          style={{ fontSize: '0.7rem', padding: '3px 10px' }}
        >
          All Forecasts ({hotspots.length})
        </button>
        <button
          onClick={() => setActiveFilter('P1')}
          className={`interactive-chip ${activeFilter === 'P1' ? 'active' : ''}`}
          style={{ fontSize: '0.7rem', padding: '3px 10px', color: activeFilter === 'P1' ? '#ff385c' : 'inherit' }}
        >
          P1 Critical (&lt;45m)
        </button>
        <button
          onClick={() => setActiveFilter('P2')}
          className={`interactive-chip ${activeFilter === 'P2' ? 'active' : ''}`}
          style={{ fontSize: '0.7rem', padding: '3px 10px', color: activeFilter === 'P2' ? '#ffaa00' : 'inherit' }}
        >
          P2 High Risk
        </button>
      </div>

      {/* Alert Stream List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredHotspots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No Active Forecasts in this filter. Click "Run Spatial AI" to execute clustering.
          </div>
        ) : (
          filteredHotspots.map((hotspot) => {
            const isDispatched = dispatchedMap[hotspot.id];
            const riskPct = (parseFloat(hotspot.risk_score || 0.85) * 100).toFixed(0);

            return (
              <div
                key={hotspot.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  borderLeft: `4px solid ${hotspot.alert_tier === 'P1' || hotspot.atm_risk_tier === 'CRITICAL' ? '#ff385c' : '#ffaa00'}`,
                  background: 'rgba(255, 56, 92, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`pulse-badge ${hotspot.alert_tier === 'P1' || hotspot.atm_risk_tier === 'CRITICAL' ? 'danger' : 'warning'}`}>
                    <span className="pulse-dot"></span> Risk {riskPct}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {hotspot.time_window || 'Golden Window: 45m'}
                  </span>
                </div>

                {/* Model Provenance Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0 6px 0', fontSize: '0.68rem', color: '#00e5ff' }}>
                  <Cpu size={11} />
                  <span>XGBoost + ST-DBSCAN Cluster #{hotspot.cluster_id || hotspot.id}</span>
                </div>

                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {hotspot.bank_name || 'ATM Point'} ({hotspot.atm_id || 'Target'})
                </h4>

                <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '8px' }}>
                  {hotspot.actionable_intelligence || 'Imminent cash extraction predicted. Intercept team vectoring advised.'}
                </p>

                {/* LEA Police Station Badge */}
                {hotspot.police_station_name && (
                  <div style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px'
                  }}>
                    <ShieldCheck size={13} />
                    <span>Jurisdiction: <strong>{hotspot.police_station_name}</strong></span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Target: <strong style={{ color: '#00e676' }}>₹{parseFloat(hotspot.total_fraud_volume || 0).toLocaleString()}</strong></span>
                  <button
                    onClick={() => handleDispatch(hotspot)}
                    disabled={isDispatched}
                    className="cyber-btn"
                    style={{
                      background: isDispatched ? 'rgba(0, 230, 118, 0.2)' : 'linear-gradient(135deg, #ff385c 0%, #ff6b81 100%)',
                      color: isDispatched ? '#00e676' : '#fff',
                      border: isDispatched ? '1px solid rgba(0, 230, 118, 0.4)' : 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: isDispatched ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: isDispatched ? 'none' : '0 2px 8px rgba(255, 56, 92, 0.3)'
                    }}
                  >
                    {isDispatched ? (
                      <>
                        <CheckCircle2 size={12} /> Unit Vectoring
                      </>
                    ) : (
                      <>
                        <Send size={11} /> Vector Patrol Unit
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
>>>>>>> test
      </div>
    </div>
  );
}
