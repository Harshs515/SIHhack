import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Maximize2, Info, Plus, Minus, Target, Globe, Navigation, Shield, MapPin, Building2, Radio } from 'lucide-react';

// Custom DivIcons
const createDotIcon = (color, borderColor = 'white', size = 12) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:${color}; width:${size}px; height:${size}px; border-radius:50%; border:2px solid ${borderColor}; box-shadow:0 0 10px ${color};"></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2]
});

const complaintIcon = createDotIcon('#00d2ff', '#ffffff', 12);
const atmIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#ffa502; width:14px; height:14px; border-radius:4px; border:2px solid white; box-shadow:0 0 8px #ffa502;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});
const policeStationIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#3b82f6; width:18px; height:18px; border-radius:6px; border:2px solid #93c5fd; box-shadow:0 0 12px #3b82f6; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">P</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});
const targetAtmIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background:#ff4757; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 0 16px #ff4757; animation: pulse-ring 1.5s infinite;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export default function MapView({ complaints, hotspots, atms, policeStations, theme }) {
  const defaultPosition = [19.0760, 72.8777];

  // Layer Toggles
  const [showComplaints, setShowComplaints] = useState(true);
  const [showAtms, setShowAtms] = useState(true);
  const [showPoliceStations, setShowPoliceStations] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  const topOrigins = [
    { country: 'Delhi NCR', flag: '🇮🇳', count: '2,643' },
    { country: 'Mumbai Metropolitan', flag: '🇮🇳', count: '1,688' },
    { country: 'Cyberabad / Hyd', flag: '🇮🇳', count: '1,490' },
    { country: 'Bengaluru Tech', flag: '🇮🇳', count: '872' },
    { country: 'Kolkata Central', flag: '🇮🇳', count: '520' }
  ];

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="theme-card rounded-2xl p-4 h-full flex flex-col justify-between shadow-sm relative overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] z-20">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">Global Threat Activity</h3>
          <Info size={14} className="text-[var(--text-muted)] cursor-pointer" />
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex items-center gap-2">
          {/* Layer Filter Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-muted)]">
            <button
              onClick={() => setShowComplaints(!showComplaints)}
              className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${showComplaints ? 'bg-sky-500/20 text-sky-500' : 'opacity-60'}`}
            >
              <Radio size={10} /> Complaints
            </button>
            <button
              onClick={() => setShowAtms(!showAtms)}
              className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${showAtms ? 'bg-amber-500/20 text-amber-500' : 'opacity-60'}`}
            >
              <MapPin size={10} /> ATMs
            </button>
            <button
              onClick={() => setShowPoliceStations(!showPoliceStations)}
              className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${showPoliceStations ? 'bg-blue-500/20 text-blue-500' : 'opacity-60'}`}
            >
              <Building2 size={10} /> Police Stations
            </button>
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 ${showHotspots ? 'bg-rose-500/20 text-rose-500' : 'opacity-60'}`}
            >
              <Shield size={10} /> Hotspots
            </button>
          </div>

          <select className="bg-[var(--bg-main)] text-xs border border-[var(--border-color)] rounded-xl px-2.5 py-1 font-semibold text-[var(--text-muted)] outline-none">
            <option>All Regions</option>
            <option>Delhi NCR</option>
            <option>Maharashtra</option>
            <option>Karnataka</option>
          </select>
          <button className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative flex-1 w-full mt-3 rounded-xl overflow-hidden min-h-[300px]">
        <MapContainer center={defaultPosition} zoom={12} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; CARTO' url={tileUrl} />

          {/* Complaints */}
          {showComplaints && complaints && complaints.map((c) => (
            <Marker key={`comp-${c.id}`} position={[c.latitude, c.longitude]} icon={complaintIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-sky-500 font-bold">Cybercrime Incident</strong><br />
                  <b>Ack No:</b> {c.acknowledgement_no}<br />
                  <b>Category:</b> {c.fraud_category}<br />
                  <b>Amount:</b> ₹{parseFloat(c.fraud_amount).toLocaleString()}<br />
                  <b>Mule Bank:</b> {c.mule_bank_name || 'N/A'}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ATMs */}
          {showAtms && atms && atms.map((a) => (
            <Marker key={`atm-${a.id}`} position={[a.latitude, a.longitude]} icon={atmIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-amber-500 font-bold">{a.bank_name} ATM</strong><br />
                  <b>ID:</b> {a.atm_id}<br />
                  <b>Address:</b> {a.address}<br />
                  <b>Risk Tier:</b> {a.risk_tier}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Police Stations */}
          {showPoliceStations && policeStations && policeStations.map((ps) => (
            <Marker key={`ps-${ps.id}`} position={[ps.latitude, ps.longitude]} icon={policeStationIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-blue-500 font-bold">👮 {ps.station_name}</strong><br />
                  <b>Jurisdiction:</b> {ps.jurisdiction_code}<br />
                  <b>Contact:</b> {ps.contact_number}<br />
                  <b>City:</b> {ps.city}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hotspots */}
          {showHotspots && hotspots && hotspots.map((h) => (
            <React.Fragment key={`hotspot-${h.id}`}>
              <Circle
                center={[h.center_latitude, h.center_longitude]}
                radius={h.radius_meters || 1500}
                pathOptions={{
                  color: '#ff4757',
                  fillColor: '#ff4757',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
              <Marker position={[h.center_latitude, h.center_longitude]} icon={targetAtmIcon}>
                <Popup>
                  <div className="text-xs max-w-xs">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 inline-block mb-1">
                      HIGH RISK FORECAST
                    </span><br />
                    <strong className="text-rose-500 font-bold">{h.bank_name} ({h.atm_id})</strong><br />
                    <b>Risk Score:</b> {(parseFloat(h.risk_score) * 100).toFixed(1)}%<br />
                    <b>Cluster Incidents:</b> {h.total_complaints_in_cluster}<br />
                    <b>Target Volume:</b> ₹{parseFloat(h.total_fraud_volume).toLocaleString()}<br />
                    <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-1 border-t pt-1 border-slate-200 dark:border-slate-700">
                      {h.actionable_intelligence}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Custom Zoom Controls (Left floating) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
          <button className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-main)] shadow-md hover:bg-[var(--bg-card-hover)] transition-colors">
            <Plus size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-main)] shadow-md hover:bg-[var(--bg-card-hover)] transition-colors">
            <Minus size={16} />
          </button>
        </div>

        {/* Custom Map Tools (Bottom Left floating) */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-[var(--bg-card)] p-1.5 rounded-xl border border-[var(--border-color)] shadow-md">
          <button className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Target size={15} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Globe size={15} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Navigation size={15} />
          </button>
        </div>

        {/* Floating "Top Attack Origin" Overlay Widget (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 w-48 bg-[var(--bg-card)]/90 backdrop-blur-md p-3 rounded-xl border border-[var(--border-color)] shadow-xl text-xs">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Top Attack Origin
          </h4>
          <div className="space-y-1.5">
            {topOrigins.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span>{item.flag}</span>
                  <span className="font-semibold text-[var(--text-main)] truncate max-w-[100px]">{item.country}</span>
                </div>
                <span className="font-mono text-[var(--text-muted)]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
