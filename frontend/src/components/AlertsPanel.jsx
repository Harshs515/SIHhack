import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Send,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function AlertsPanel({
  hotspots = [],
  onTriggerML,
  isRunningML,
}) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [dispatchedMap, setDispatchedMap] = useState({});
  const [dispatchToast, setDispatchToast] = useState(null);

  const filteredHotspots = (hotspots || []).filter((h) => {
    if (!h) return false;
    if (
      activeFilter === "P1" &&
      h.alert_tier !== "P1" &&
      h.atm_risk_tier !== "CRITICAL"
    )
      return false;
    if (
      activeFilter === "P2" &&
      h.alert_tier !== "P2" &&
      h.atm_risk_tier !== "HIGH"
    )
      return false;
    return true;
  });

  const handleDispatch = (hotspot) => {
    setDispatchedMap((prev) => ({ ...prev, [hotspot.id]: true }));
    setDispatchToast(
      `🚨 PCR Patrol Dispatched to ${hotspot.bank_name} ATM (${hotspot.district})!`,
    );
    setTimeout(() => setDispatchToast(null), 3500);
  };

  return (
    <div
      className="glass-panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        gap: "12px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-glass)",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255, 56, 92, 0.15)",
              color: "#ff385c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
              Actionable LEA Intelligence
            </h3>
            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Proactive Cash Withdrawal Forecasts & Dispatches
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerML}
          disabled={isRunningML}
          className="cyber-btn"
          style={{
            padding: "6px 12px",
            fontSize: "0.74rem",
          }}
        >
          <RefreshCw
            size={12}
            style={{
              animation: isRunningML ? "spin 1s linear infinite" : "none",
            }}
          />
          {isRunningML ? "Scoring..." : "Run Spatial AI"}
        </button>
      </div>

      {dispatchToast && (
        <div
          style={{
            background: "rgba(0, 230, 118, 0.15)",
            border: "1px solid rgba(0, 230, 118, 0.4)",
            padding: "8px 12px",
            borderRadius: "8px",
            color: "#00e676",
            fontSize: "0.76rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <CheckCircle2 size={14} /> {dispatchToast}
        </div>
      )}

      {/* Interactive Filter Chips */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "2px",
        }}
      >
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`interactive-chip ${activeFilter === "ALL" ? "active" : ""}`}
          style={{ fontSize: "0.7rem", padding: "3px 10px" }}
        >
          All Forecasts ({hotspots.length})
        </button>
        <button
          onClick={() => setActiveFilter("P1")}
          className={`interactive-chip ${activeFilter === "P1" ? "active" : ""}`}
          style={{
            fontSize: "0.7rem",
            padding: "3px 10px",
            color: activeFilter === "P1" ? "#ff385c" : "inherit",
          }}
        >
          P1 Critical (&lt;45m)
        </button>
        <button
          onClick={() => setActiveFilter("P2")}
          className={`interactive-chip ${activeFilter === "P2" ? "active" : ""}`}
          style={{
            fontSize: "0.7rem",
            padding: "3px 10px",
            color: activeFilter === "P2" ? "#ffaa00" : "inherit",
          }}
        >
          P2 High Risk
        </button>
      </div>

      {/* Alert Stream List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {filteredHotspots.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 16px",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
            }}
          >
            No Active Forecasts in this filter. Click "Run Spatial AI" to
            execute clustering.
          </div>
        ) : (
          filteredHotspots.map((hotspot) => {
            const isDispatched = dispatchedMap[hotspot.id];
            const riskPct = (
              parseFloat(hotspot.risk_score || 0.85) * 100
            ).toFixed(0);

            return (
              <div
                key={hotspot.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  borderLeft: `4px solid ${hotspot.alert_tier === "P1" || hotspot.atm_risk_tier === "CRITICAL" ? "#ff385c" : "#ffaa00"}`,
                  background: "rgba(255, 56, 92, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    className={`pulse-badge ${hotspot.alert_tier === "P1" || hotspot.atm_risk_tier === "CRITICAL" ? "danger" : "warning"}`}
                  >
                    <span className="pulse-dot"></span> Risk {riskPct}%
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={11} />{" "}
                    {hotspot.time_window || "Golden Window: 45m"}
                  </span>
                </div>

                {/* Model Provenance Badge */}

                <h4
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "4px",
                  }}
                >
                  {hotspot.bank_name || "ATM Point"} (
                  {hotspot.atm_id || "Target"})
                </h4>

                <p
                  style={{
                    fontSize: "0.74rem",
                    color: "#cbd5e1",
                    lineHeight: "1.4",
                    marginBottom: "8px",
                  }}
                >
                  {hotspot.actionable_intelligence ||
                    "Imminent cash extraction predicted. Intercept team vectoring advised."}
                </p>

                {/* LEA Police Station Badge */}
                {hotspot.police_station_name && (
                  <div
                    style={{
                      padding: "5px 8px",
                      borderRadius: "6px",
                      background: "rgba(59, 130, 246, 0.12)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      color: "#93c5fd",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>
                      Jurisdiction:{" "}
                      <strong>{hotspot.police_station_name}</strong>
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>
                    Target:{" "}
                    <strong style={{ color: "#00e676" }}>
                      ₹
                      {parseFloat(
                        hotspot.total_fraud_volume || 0,
                      ).toLocaleString()}
                    </strong>
                  </span>
                  <button
                    onClick={() => handleDispatch(hotspot)}
                    disabled={isDispatched}
                    className="cyber-btn"
                    style={{
                      background: isDispatched
                        ? "rgba(0, 230, 118, 0.2)"
                        : "linear-gradient(135deg, #ff385c 0%, #ff6b81 100%)",
                      color: isDispatched ? "#00e676" : "#fff",
                      border: isDispatched
                        ? "1px solid rgba(0, 230, 118, 0.4)"
                        : "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: isDispatched ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: isDispatched
                        ? "none"
                        : "0 2px 8px rgba(255, 56, 92, 0.3)",
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
      </div>
    </div>
  );
}
