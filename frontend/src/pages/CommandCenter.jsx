import React, { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import MapView from "../components/MapView";
import AlertsPanel from "../components/AlertsPanel";
import { Layers } from "lucide-react";

export default function CommandCenter({
  complaints = [],
  hotspots = [],
  atms = [],
  policeStations = [],
  isRunningML,
  onTriggerML,
  mlStatus = "ACTIVE",
}) {
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedTier, setSelectedTier] = useState("ALL");

  // Filter hotspots and complaints safely
  const filteredHotspots = (hotspots || []).filter((h) => {
    if (!h) return false;
    if (
      selectedState !== "ALL" &&
      (h.state || "").toLowerCase() !== selectedState.toLowerCase()
    )
      return false;
    if (selectedTier !== "ALL") {
      const tier =
        h.alert_tier ||
        (h.atm_risk_tier === "CRITICAL"
          ? "P1"
          : h.atm_risk_tier === "HIGH"
            ? "P2"
            : "P3") ||
        "P1";
      if (tier !== selectedTier) return false;
    }
    return true;
  });

  const filteredComplaints = (complaints || []).filter((c) => {
    if (!c) return false;
    if (
      selectedState !== "ALL" &&
      (c.state || "").toLowerCase() !== selectedState.toLowerCase()
    )
      return false;
    return true;
  });

  const totalFraudAmount = filteredComplaints.reduce(
    (sum, c) => sum + (parseFloat(c.fraud_amount) || 0),
    0,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        padding: "12px 24px 24px",
      }}
    >
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="cyber-select"
          style={{ fontSize: "0.75rem", padding: "5px 10px" }}
        >
          <option value="ALL">All States</option>
          <option value="Delhi">Delhi NCR</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Telangana">Telangana</option>
          <option value="Gujarat">Gujarat</option>
        </select>

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="cyber-select"
          style={{ fontSize: "0.75rem", padding: "5px 10px" }}
        >
          <option value="ALL">All Tiers</option>
          <option value="P1">P1 Critical</option>
          <option value="P2">P2 High</option>
          <option value="P3">P3 Watch</option>
        </select>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          <span>
            <strong style={{ color: "#fff" }}>21</strong> Districts
          </span>
          <span>
            <strong style={{ color: "#fff" }}>47</strong> ATM Clusters
          </span>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "14px",
          height: "520px",
          width: "100%",
        }}
      >
        {/* MAP */}
        <div
          className="glass-panel"
          style={{
            padding: "8px",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              zIndex: 999,
              background: "rgba(12, 18, 32, 0.85)",
              padding: "5px 10px",
              borderRadius: "7px",
              border: "1px solid var(--border-glass)",
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(10px)",
            }}
          >
            <Layers size={12} color="#00d2ff" />
            <span>ST-DBSCAN Clusters + Police Stations</span>
          </div>

          <div
            style={{
              flex: 1,
              width: "100%",
              minWidth: 0,
              minHeight: 0,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <MapView
              complaints={filteredComplaints}
              hotspots={filteredHotspots}
              atms={atms}
              policeStations={policeStations}
            />
          </div>
        </div>

        {/* ALERTS */}
        <div
          style={{
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow: "auto",
          }}
        >
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
