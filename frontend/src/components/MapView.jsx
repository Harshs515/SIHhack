import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Maximize2,
  Info,
  Plus,
  Minus,
  Target,
  Globe,
  Navigation,
  Shield,
  MapPin,
  Building2,
  Radio,
} from "lucide-react";

const createDotIcon = (color, borderColor = "white", size = 12) =>
  L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background:${color}; width:${size}px; height:${size}px; border-radius:50%; border:2px solid ${borderColor}; box-shadow:0 0 10px ${color};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const complaintIcon = createDotIcon("#00d2ff", "#ffffff", 12);

const atmIcon = L.divIcon({
  className: "custom-leaflet-icon",
  html: `<div style="background:#ffa502; width:14px; height:14px; border-radius:4px; border:2px solid white; box-shadow:0 0 8px #ffa502;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const policeStationIcon = L.divIcon({
  className: "custom-leaflet-icon",
  html: `<div style="background:#3b82f6; width:18px; height:18px; border-radius:4px; border:2px solid #93c5fd; box-shadow:0 0 12px #3b82f6; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">👮</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const targetAtmIcon = L.divIcon({
  className: "custom-leaflet-icon",
  html: `<div style="background:#ff4757; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 0 20px #ff4757; animation: pulse-ring 1.5s infinite;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const invalidate = () => {
      map.invalidateSize({
        animate: false,
        pan: false,
      });
    };

    // Leaflet may initialize before the parent grid/flex layout is complete
    const timers = [
      setTimeout(invalidate, 0),
      setTimeout(invalidate, 100),
      setTimeout(invalidate, 300),
      setTimeout(invalidate, 600),
    ];

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(invalidate);
    });

    const container = map.getContainer();

    if (container) {
      resizeObserver.observe(container);

      // Also watch the parent because the grid/flex container
      // is what is actually changing size.
      if (container.parentElement) {
        resizeObserver.observe(container.parentElement);
      }
    }

    window.addEventListener("resize", invalidate);

    return () => {
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  return null;
}
const STATE_CENTERS = {
  ALL: { center: [22.5937, 78.9629], zoom: 5 },
  Delhi: { center: [28.6139, 77.209], zoom: 11 },
  Maharashtra: { center: [19.076, 72.8777], zoom: 10 },
  Karnataka: { center: [12.9716, 77.5946], zoom: 10 },
  Telangana: { center: [17.385, 78.4867], zoom: 10 },
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
          map.flyToBounds(bounds, {
            padding: [40, 40],
            maxZoom: 12,
            duration: 1.2,
          });
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

export default function MapView({
  selectedState = "ALL",
  complaints = [],
  hotspots = [],
  atms = [],
  policeStations = [],
}) {
  const defaultPosition = [28.6139, 77.209]; // Delhi NCR default

  // Safe Coordinate Filters
  const validComplaints = (complaints || []).filter(
    (c) =>
      c && !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude)),
  );

  const validHotspots = (hotspots || []).filter(
    (h) =>
      h &&
      !isNaN(parseFloat(h.center_latitude)) &&
      !isNaN(parseFloat(h.center_longitude)),
  );

  const validAtms = (atms || []).filter(
    (a) =>
      a && !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude)),
  );

  const validPoliceStations = (policeStations || []).filter(
    (ps) =>
      ps && !isNaN(parseFloat(ps.latitude)) && !isNaN(parseFloat(ps.longitude)),
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={defaultPosition}
        zoom={11}
        scrollWheelZoom={true}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <MapResizeHandler />
        <MapCenterController
          selectedState={selectedState}
          validComplaints={validComplaints}
          validHotspots={validHotspots}
          validAtms={validAtms}
          validPoliceStations={validPoliceStations}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Complaint Markers */}
        {validComplaints.map((c) => {
          const lat = parseFloat(c.latitude);
          const lng = parseFloat(c.longitude);
          return (
            <Marker
              key={`comp-${c.id || Math.random()}`}
              position={[lat, lng]}
              icon={complaintIcon}
            >
              <Popup>
                <div style={{ fontSize: "0.85rem" }}>
                  <strong style={{ color: "#00d2ff" }}>
                    Cybercrime Incident
                  </strong>
                  <br />
                  <b>Ack No:</b> {c.acknowledgement_no || "N/A"}
                  <br />
                  <b>Category:</b> {c.fraud_category || "Cyber Fraud"}
                  <br />
                  <b>Amount Stolen:</b> ₹
                  {parseFloat(c.fraud_amount || 0).toLocaleString()}
                  <br />
                  <b>Mule Bank:</b> {c.mule_bank_name || "N/A"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ATM Locations */}
        {validAtms.map((a) => {
          const lat = parseFloat(a.latitude);
          const lng = parseFloat(a.longitude);
          return (
            <Marker
              key={`atm-${a.id || a.atm_id || Math.random()}`}
              position={[lat, lng]}
              icon={atmIcon}
            >
              <Popup>
                <div style={{ fontSize: "0.85rem" }}>
                  <strong style={{ color: "#ffa502" }}>
                    {a.bank_name || "Bank"} ATM
                  </strong>
                  <br />
                  <b>ID:</b> {a.atm_id || "N/A"}
                  <br />
                  <b>Address:</b> {a.address || "N/A"}
                  <br />
                  <b>Risk Tier:</b> {a.risk_tier || "LOW"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Police Station Markers */}
        {validPoliceStations.map((ps) => {
          const lat = parseFloat(ps.latitude);
          const lng = parseFloat(ps.longitude);
          return (
            <Marker
              key={`ps-${ps.id || ps.jurisdiction_code || Math.random()}`}
              position={[lat, lng]}
              icon={policeStationIcon}
            >
              <Popup>
                <div style={{ fontSize: "0.85rem" }}>
                  <strong style={{ color: "#3b82f6" }}>
                    👮 {ps.station_name || "Cyber Police Station"}
                  </strong>
                  <br />
                  <b>Jurisdiction:</b> {ps.jurisdiction_code || "N/A"}
                  <br />
                  <b>Contact:</b> {ps.contact_number || "1930 / 112"}
                  <br />
                  <b>City:</b> {ps.city || "N/A"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Predicted Hotspots & Police Dispatch Recommendations */}
        {validHotspots.map((h) => {
          const centerLat = parseFloat(h.center_latitude);
          const centerLng = parseFloat(h.center_longitude);
          const radius = parseFloat(h.radius_meters || 1500);

          return (
            <React.Fragment
              key={`hotspot-${h.id || h.cluster_id || Math.random()}`}
            >
              <Circle
                center={[centerLat, centerLng]}
                radius={radius}
                pathOptions={{
                  color: "#ff4757",
                  fillColor: "#ff4757",
                  fillOpacity: 0.25,
                  weight: 2,
                }}
              />
              <Marker position={[centerLat, centerLng]} icon={targetAtmIcon}>
                <Popup>
                  <div style={{ fontSize: "0.86rem", maxWidth: "300px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      <span className="pulse-badge danger">
                        <span className="pulse-dot"></span> HIGH RISK FORECAST
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                        Run #{h.model_run_id || 104}
                      </span>
                    </div>
                    <strong>Target ATM:</strong> {h.bank_name || "ATM Node"} (
                    {h.atm_id || "Cluster"})<br />
                    <b>Withdrawal Risk Score:</b>{" "}
                    {(parseFloat(h.risk_score || 0.85) * 100).toFixed(1)}%<br />
                    <b>Cluster Incidents:</b>{" "}
                    {h.total_complaints_in_cluster || 1}
                    <br />
                    <b>Target Volume:</b> ₹
                    {parseFloat(h.total_fraud_volume || 0).toLocaleString()}
                    <br />
                    <hr
                      style={{
                        margin: "8px 0",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.76rem",
                        color: "#cbd5e1",
                        lineHeight: "1.4",
                      }}
                    >
                      {h.actionable_intelligence ||
                        "Proactive police patrol deployment recommended."}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
