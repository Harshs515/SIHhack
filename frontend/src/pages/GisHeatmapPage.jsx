import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Layers, Filter, Shield, Clock, AlertTriangle, Crosshair, CheckSquare, Square } from 'lucide-react';

const complaintIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#00d2ff; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #00d2ff;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const atmIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#ffa502; width:14px; height:14px; border-radius:4px; border:2px solid white; box-shadow:0 0 8px #ffa502;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const policeStationIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#3b82f6; width:18px; height:18px; border-radius:4px; border:2px solid #93c5fd; box-shadow:0 0 12px #3b82f6; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">👮</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const targetAtmIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#ff4757; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 0 20px #ff4757; animation: pulse-ring 1.5s infinite;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const STATE_CENTERS = {
  ALL: { center: [22.5937, 78.9629], zoom: 5 },
  Delhi: { center: [28.6139, 77.2090], zoom: 11 },
  Maharashtra: { center: [19.0760, 72.8777], zoom: 10 },
  Karnataka: { center: [12.9716, 77.5946], zoom: 10 },
  Telangana: { center: [17.3850, 78.4867], zoom: 10 },
  Gujarat: { center: [23.0225, 72.5714], zoom: 10 },
};

function MapCenterController({
  selectedState,
  validComplaints,
  validHotspots,
  validAtms,
  validPoliceStations,
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const allPoints = [];
    (validHotspots || []).forEach((h) => {
      const lat = parseFloat(h.center_latitude);
      const lng = parseFloat(h.center_longitude);
      if (!isNaN(lat) && !isNaN(lng)) allPoints.push([lat, lng]);
    });
    (validComplaints || []).forEach((c) => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (!isNaN(lat) && !isNaN(lng)) allPoints.push([lat, lng]);
    });
    (validAtms || []).forEach((a) => {
      const lat = parseFloat(a.latitude);
      const lng = parseFloat(a.longitude);
      if (!isNaN(lat) && !isNaN(lng)) allPoints.push([lat, lng]);
    });
    (validPoliceStations || []).forEach((p) => {
      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      if (!isNaN(lat) && !isNaN(lng)) allPoints.push([lat, lng]);
    });

    if (selectedState && selectedState !== "ALL" && allPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(allPoints);
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 12, duration: 1.2 });
          return;
        }
      } catch (e) {
        console.error("Error setting map bounds", e);
      }
    }

    const stateConfig = STATE_CENTERS[selectedState] || STATE_CENTERS.ALL;
    map.flyTo(stateConfig.center, stateConfig.zoom, { duration: 1.2 });
  }, [
    map,
    selectedState,
    validComplaints,
    validHotspots,
    validAtms,
    validPoliceStations,
  ]);

  return null;
}

export default function GisHeatmapPage({ complaints = [], hotspots = [], atms = [], policeStations = [] }) {
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('60');
  const [radiusMultiplier, setRadiusMultiplier] = useState(1);
  const [selectedCluster, setSelectedCluster] = useState(null);

  // Layer toggles
  const [showHotspots, setShowHotspots] = useState(true);
  const [showAtms, setShowAtms] = useState(true);
  const [showPoliceStations, setShowPoliceStations] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);

  // Safe Filters
  const filteredHotspots = (hotspots || []).filter(h => {
    if (!h || isNaN(parseFloat(h.center_latitude)) || isNaN(parseFloat(h.center_longitude))) return false;
    if (selectedState !== 'ALL' && (h.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
    return true;
  });

  const filteredComplaints = (complaints || []).filter(c => {
    if (!c || isNaN(parseFloat(c.latitude)) || isNaN(parseFloat(c.longitude))) return false;
    if (selectedState !== 'ALL' && (c.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
    if (selectedCategory !== 'ALL' && !(c.fraud_category || '').toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    return true;
  });

  const filteredAtms = (atms || []).filter(a => {
    if (!a || isNaN(parseFloat(a.latitude)) || isNaN(parseFloat(a.longitude))) return false;
    if (selectedState !== 'ALL' && (a.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
    return true;
  });

  const filteredPolice = (policeStations || []).filter(p => {
    if (!p || isNaN(parseFloat(p.latitude)) || isNaN(parseFloat(p.longitude))) return false;
    if (selectedState !== 'ALL' && (p.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
    return true;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '14px', height: '600px', padding: '0 24px 24px' }}>
      {/* Left GIS Control Panel */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>GIS Heatmap</h3>
          <p style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>Spatial risk & buffer zones</p>
        </div>

        {/* State Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Geographic Focus:
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="cyber-select"
            style={{ width: '100%' }}
          >
            <option value="ALL">All 5 Target States (National)</option>
            <option value="Delhi">Delhi NCR (14 Clusters)</option>
            <option value="Maharashtra">Maharashtra (16 Clusters)</option>
            <option value="Karnataka">Karnataka (9 Clusters)</option>
            <option value="Telangana">Telangana (8 Clusters)</option>
            <option value="Gujarat">Gujarat (6 Clusters)</option>
          </select>
        </div>

        {/* Fraud Category Filter */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Fraud Typology:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cyber-select"
            style={{ width: '100%' }}
          >
            <option value="ALL">All Fraud Types</option>
            <option value="UPI">UPI / QR Fraud (32%)</option>
            <option value="Digital Arrest">Digital Arrest Scam (10%)</option>
            <option value="Stock">Stock / Trading Scam (12%)</option>
            <option value="OTP">OTP Phishing (15%)</option>
            <option value="Task">Task / Job Fraud (5%)</option>
            <option value="SIM">SIM Swap / KYC (8%)</option>
          </select>
        </div>

        {/* Golden Hour Time Window */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="#00d2ff" /> Golden Window:
            </label>
            <span style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: 700 }}>
              {selectedTimeWindow} Mins
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            step="15"
            value={selectedTimeWindow}
            onChange={(e) => setSelectedTimeWindow(e.target.value)}
            style={{ width: '100%', accentColor: '#00d2ff', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span>30m (Critical)</span>
            <span>60m (Standard)</span>
            <span>120m (Extended)</span>
          </div>
        </div>

        {/* Buffer Radius Modeling */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Hotspot Intercept Radius:
            </label>
            <span style={{ fontSize: '0.72rem', color: '#ff4757', fontWeight: 700 }}>
              {(1500 * radiusMultiplier).toFixed(0)} meters
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            value={radiusMultiplier}
            onChange={(e) => setRadiusMultiplier(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#ff4757', cursor: 'pointer' }}
          />
        </div>

        {/* Layer Visibility Toggles */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
            Map Overlays
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showHotspots ? 'rgba(255, 71, 87, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showHotspots ? '#ff4757' : 'var(--border-glass)'}`,
                borderRadius: '6px',
                padding: '7px 10px',
                color: showHotspots ? '#ff4757' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left'
              }}
            >
              {showHotspots ? <CheckSquare size={14} /> : <Square size={14} />}
              <span>Predicted Hotspots ({filteredHotspots.length})</span>
            </button>

            <button
              onClick={() => setShowAtms(!showAtms)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showAtms ? 'rgba(255, 165, 2, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showAtms ? '#ffa502' : 'var(--border-glass)'}`,
                borderRadius: '6px',
                padding: '7px 10px',
                color: showAtms ? '#ffa502' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left'
              }}
            >
              {showAtms ? <CheckSquare size={14} /> : <Square size={14} />}
              <span>ATM Locations ({filteredAtms.length})</span>
            </button>

            <button
              onClick={() => setShowPoliceStations(!showPoliceStations)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showPoliceStations ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showPoliceStations ? '#3b82f6' : 'var(--border-glass)'}`,
                borderRadius: '6px',
                padding: '7px 10px',
                color: showPoliceStations ? '#93c5fd' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left'
              }}
            >
              {showPoliceStations ? <CheckSquare size={14} /> : <Square size={14} />}
              <span>Police Stations / LEA ({filteredPolice.length})</span>
            </button>

            <button
              onClick={() => setShowComplaints(!showComplaints)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showComplaints ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showComplaints ? '#00d2ff' : 'var(--border-glass)'}`,
                borderRadius: '6px',
                padding: '7px 10px',
                color: showComplaints ? '#00d2ff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left'
              }}
            >
              {showComplaints ? <CheckSquare size={14} /> : <Square size={14} />}
              <span>Incident Coordinates ({filteredComplaints.length})</span>
            </button>
          </div>
        </div>

        {/* Selected Cluster Drawer */}
        {selectedCluster && (
          <div style={{ marginTop: 'auto', background: 'rgba(255, 71, 87, 0.08)', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="pulse-badge danger">
                <span className="pulse-dot"></span> {selectedCluster.cluster_id || 'Cluster Target'}
              </span>
              <button
                onClick={() => setSelectedCluster(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ✕
              </button>
            </div>
            <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '4px' }}>{selectedCluster.bank_name || 'ATM Location'} ({selectedCluster.atm_id || 'N/A'})</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{selectedCluster.district || 'Focus Zone'}, {selectedCluster.state || 'India'}</p>
            <div style={{ fontSize: '0.72rem', color: '#00d2ff', display: 'flex', justifyContent: 'space-between' }}>
              <span>Threat Score: <strong>{(parseFloat(selectedCluster.risk_score || 0.85) * 100).toFixed(1)}%</strong></span>
              <span>Fraud Vol: <strong>₹{(parseFloat(selectedCluster.total_fraud_volume || 0) / 100000).toFixed(1)}L</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Right Map Canvas */}
      <div className="glass-panel" style={{ padding: '6px', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <MapCenterController
            selectedState={selectedState}
            validComplaints={filteredComplaints}
            validHotspots={filteredHotspots}
            validAtms={filteredAtms}
            validPoliceStations={filteredPolice}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Complaints */}
          {showComplaints && filteredComplaints.map((c) => {
            const lat = parseFloat(c.latitude);
            const lng = parseFloat(c.longitude);
            return (
              <Marker key={`gis-comp-${c.id || Math.random()}`} position={[lat, lng]} icon={complaintIcon}>
                <Popup>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: '#00d2ff' }}>Cybercrime Origin</strong><br/>
                    <b>Ack No:</b> {c.acknowledgement_no || 'N/A'}<br/>
                    <b>Victim:</b> {c.victim_name || 'Citizen'}<br/>
                    <b>Category:</b> {c.fraud_category || 'Fraud'}<br/>
                    <b>Amount:</b> ₹{parseFloat(c.fraud_amount || 0).toLocaleString()}<br/>
                    <b>Mule Bank:</b> {c.mule_bank_name || 'N/A'}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* ATMs */}
          {showAtms && filteredAtms.map((a) => {
            const lat = parseFloat(a.latitude);
            const lng = parseFloat(a.longitude);
            return (
              <Marker key={`gis-atm-${a.id || a.atm_id || Math.random()}`} position={[lat, lng]} icon={atmIcon}>
                <Popup>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: '#ffa502' }}>{a.bank_name || 'Bank'} ATM</strong><br/>
                    <b>ID:</b> {a.atm_id || 'N/A'}<br/>
                    <b>Address:</b> {a.address || 'N/A'}<br/>
                    <b>Type:</b> {a.atm_type || 'OFF_SITE'}<br/>
                    <b>Monthly Txn Vol:</b> {a.monthly_txn_vol || 1200} txns<br/>
                    <b>Risk Tier:</b> {a.risk_tier || 'HIGH'}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Police Stations */}
          {showPoliceStations && filteredPolice.map((ps) => {
            const lat = parseFloat(ps.latitude);
            const lng = parseFloat(ps.longitude);
            return (
              <Marker key={`gis-ps-${ps.id || ps.jurisdiction_code || Math.random()}`} position={[lat, lng]} icon={policeStationIcon}>
                <Popup>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: '#3b82f6' }}>👮 {ps.name || 'Police Station'}</strong><br/>
                    <b>Jurisdiction:</b> {ps.jurisdiction_code || 'N/A'}<br/>
                    <b>Officer:</b> {ps.officer_in_charge || 'Station In-Charge'}<br/>
                    <b>Contact:</b> {ps.contact_number || '1930'}<br/>
                    <b>PCR Units:</b> {ps.pcr_vans_active || 3} Teams
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Hotspots & Intercept Radiuses */}
          {showHotspots && filteredHotspots.map((h) => {
            const centerLat = parseFloat(h.center_latitude);
            const centerLng = parseFloat(h.center_longitude);
            const radius = parseFloat(h.radius_meters || 1500) * radiusMultiplier;

            return (
              <React.Fragment key={`gis-hotspot-${h.id || h.cluster_id || Math.random()}`}>
                <Circle
                  center={[centerLat, centerLng]}
                  radius={radius}
                  pathOptions={{
                    color: '#ff4757',
                    fillColor: '#ff4757',
                    fillOpacity: 0.28,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedCluster(h)
                  }}
                />
                <Marker
                  position={[centerLat, centerLng]}
                  icon={targetAtmIcon}
                  eventHandlers={{
                    click: () => setSelectedCluster(h)
                  }}
                >
                  <Popup>
                    <div style={{ fontSize: '0.86rem', maxWidth: '320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span className="pulse-badge danger">
                          <span className="pulse-dot"></span> {h.alert_tier || 'P1'} FORECAST
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Cluster: {h.cluster_id || 'Active Zone'}
                        </span>
                      </div>
                      <strong>Target Cashout ATM:</strong> {h.bank_name || 'Bank ATM'} ({h.atm_id || 'Target'})<br/>
                      <b>Location:</b> {h.atm_address || 'Jurisdiction Target'}<br/>
                      <b>Withdrawal Probability:</b> {(parseFloat(h.risk_score || 0.85) * 100).toFixed(1)}%<br/>
                      <b>Cluster Volume:</b> ₹{parseFloat(h.total_fraud_volume || 0).toLocaleString()}<br/>
                      <b>Golden Hour Window:</b> {h.time_window || 'Next 45-60 min'}<br/>
                      <hr style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                      <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {h.actionable_intelligence || 'Proactive police patrol deployment recommended.'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
