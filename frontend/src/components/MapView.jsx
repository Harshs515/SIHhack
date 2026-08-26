import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG Markers
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
  html: `<div style="background:#3b82f6; width:16px; height:16px; border-radius:3px; border:2px solid #93c5fd; box-shadow:0 0 12px #3b82f6; display:flex; align-items:center; justify-center; color:white; font-size:10px; font-weight:bold;">P</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const targetAtmIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#ff4757; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 16px #ff4757; animation: pulse-ring 1.5s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function MapView({ complaints, hotspots, atms, policeStations }) {
  const defaultPosition = [28.6139, 77.2090];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
      <MapContainer center={defaultPosition} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Complaint Markers */}
        {complaints.map((c) => (
          <Marker key={`comp-${c.id}`} position={[c.latitude, c.longitude]} icon={complaintIcon}>
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#00d2ff' }}>Cybercrime Incident</strong><br/>
                <b>Ack No:</b> {c.acknowledgement_no}<br/>
                <b>Category:</b> {c.fraud_category}<br/>
                <b>Amount Stolen:</b> ₹{parseFloat(c.fraud_amount).toLocaleString()}<br/>
                <b>Mule Bank:</b> {c.mule_bank_name || 'N/A'}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ATM Locations */}
        {atms.map((a) => (
          <Marker key={`atm-${a.id}`} position={[a.latitude, a.longitude]} icon={atmIcon}>
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#ffa502' }}>{a.bank_name} ATM</strong><br/>
                <b>ID:</b> {a.atm_id}<br/>
                <b>Address:</b> {a.address}<br/>
                <b>Risk Tier:</b> {a.risk_tier}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Police Station Markers */}
        {policeStations && policeStations.map((ps) => (
          <Marker key={`ps-${ps.id}`} position={[ps.latitude, ps.longitude]} icon={policeStationIcon}>
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#3b82f6' }}>👮 {ps.station_name}</strong><br/>
                <b>Jurisdiction:</b> {ps.jurisdiction_code}<br/>
                <b>Contact:</b> {ps.contact_number}<br/>
                <b>City:</b> {ps.city}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Predicted Hotspots & Police Dispatch Recommendations */}
        {hotspots.map((h) => (
          <React.Fragment key={`hotspot-${h.id}`}>
            <Circle
              center={[h.center_latitude, h.center_longitude]}
              radius={h.radius_meters || 1500}
              pathOptions={{
                color: '#ff4757',
                fillColor: '#ff4757',
                fillOpacity: 0.25,
                weight: 2
              }}
            />
            <Marker position={[h.center_latitude, h.center_longitude]} icon={targetAtmIcon}>
              <Popup>
                <div style={{ fontSize: '0.88rem', maxWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span className="pulse-badge danger">
                      <span className="pulse-dot"></span> HIGH RISK FORECAST
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Model Run #{h.model_run_id || 'v1.0.4'}
                    </span>
                  </div>
                  <strong>Target ATM:</strong> {h.bank_name} ({h.atm_id})<br/>
                  <b>Withdrawal Risk Score:</b> {(parseFloat(h.risk_score) * 100).toFixed(1)}%<br/>
                  <b>Cluster Incidents:</b> {h.total_complaints_in_cluster}<br/>
                  <b>Target Volume:</b> ₹{parseFloat(h.total_fraud_volume).toLocaleString()}<br/>
                  <hr style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{h.actionable_intelligence}</p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
