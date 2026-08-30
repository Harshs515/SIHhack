import React, { useState } from 'react';
import StatsCards from '../components/StatsCards';
import MapView from '../components/MapView';
import AlertsPanel from '../components/AlertsPanel';
import { Filter, Eye, ShieldAlert, Zap, Layers, MapPin } from 'lucide-react';

export default function CommandCenter({
  complaints = [],
  hotspots = [],
  atms = [],
  policeStations = [],
  isRunningML,
  onTriggerML,
  mlStatus = 'ACTIVE'
}) {
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');

  // Filter hotspots and complaints safely
  const filteredHotspots = (hotspots || []).filter(h => {
    if (!h) return false;
    if (selectedState !== 'ALL' && (h.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
    if (selectedTier !== 'ALL') {
      const tier = h.alert_tier || (h.atm_risk_tier === 'CRITICAL' ? 'P1' : h.atm_risk_tier === 'HIGH' ? 'P2' : 'P3') || 'P1';
      if (tier !== selectedTier) return false;
    }
    return true;
  });

  const filteredComplaints = (complaints || []).filter(c => {
    if (!c) return false;
    if (selectedState !== 'ALL' && (c.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
    return true;
  });

  const totalFraudAmount = filteredComplaints.reduce(
    (sum, c) => sum + (parseFloat(c.fraud_amount) || 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Top Filter and Status Strip */}
      <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#00d2ff', fontWeight: 600 }}>
            <Filter size={15} />
            <span>Tactical Filters:</span>
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="cyber-select"
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            <option value="ALL">All States (National View)</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Telangana">Telangana</option>
            <option value="Gujarat">Gujarat</option>
          </select>

          {/* Alert Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="cyber-select"
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            <option value="ALL">All Threat Tiers (P1, P2, P3)</option>
            <option value="P1">P1 Critical (Golden Hour &lt; 60m)</option>
            <option value="P2">P2 High Risk (60–90m)</option>
            <option value="P3">P3 Elevated Surveillance</option>
          </select>
        </div>

        {/* Quick Intel Highlights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Zap size={14} color="#ffa502" />
            <span>Target Districts: <strong>21 Focus Zones</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="#ff4757" />
            <span>ATM Clusters: <strong>47 Identified</strong></span>
          </div>
        </div>
      </div>

      {/* Stats Summary KPIs */}
      <StatsCards
        complaintsCount={filteredComplaints.length}
        hotspotsCount={filteredHotspots.length}
        totalFraudAmount={totalFraudAmount}
        mlStatus={mlStatus}
      />

      {/* Main Grid: Leaflet GIS Map + Alerts Intelligence Panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '68% 32%', gap: '14px', minHeight: 0 }}>
        {/* Left: GIS Map View */}
        <div className="glass-panel" style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 999, background: 'rgba(12, 18, 32, 0.85)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)' }}>
            <Layers size={13} color="#00d2ff" />
            <span>Overlay: <strong>PostGIS ST_DBSCAN Clusters + Police Stations</strong></span>
          </div>
          <MapView
            complaints={filteredComplaints}
            hotspots={filteredHotspots}
            atms={atms}
            policeStations={policeStations}
          />
        </div>

        {/* Right: Actionable Alerts Intelligence Feed */}
        <div style={{ height: '100%' }}>
          <AlertsPanel
            hotspots={filteredHotspots}
            onTriggerML={onTriggerML}
            isRunningML={isRunningML}
          />
        </div>
      </div>
    </div>
  );
}
