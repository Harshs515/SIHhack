import React, { useState, useEffect, useMemo } from "react";
import StatsCards from "../components/StatsCards";
import MapView from "../components/MapView";
import AlertsPanel from "../components/AlertsPanel";
import { Layers, RefreshCw, Calendar } from "lucide-react";

export default function CommandCenter({
  complaints = [],
  hotspots = [],
  atms = [],
  policeStations = [],
  isRunningML,
  onTriggerML,
  mlStatus = "ACTIVE",
  refreshKey,
}) {
  /* ── Date Range Helper ─────────────────────────────────────── */
  function getCurrentMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);
    const fmt = (d) => {
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const dy = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${mo}-${dy}T${h}:${mi}`;
    };
    return { start: fmt(firstDay), end: fmt(lastDay) };
  }

  /* ── Sync / Refresh State ─────────────────────────────────── */
  const [lastSynced, setLastSynced] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeAgoText, setTimeAgoText] = useState("Just now");

  /* ── Date Range State ─────────────────────────────────────── */
  const currentMonth = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(currentMonth.start);
  const [endDate, setEndDate] = useState(currentMonth.end);
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ── Auto-update Last Sync text ───────────────────────────── */
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((new Date() - lastSynced) / 1000);
      if (diff < 30) setTimeAgoText("Just now");
      else if (diff < 60) setTimeAgoText("1 min ago");
      else setTimeAgoText(`${Math.floor(diff / 60)} mins ago`);
    };
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, [lastSynced]);

  /* ── Refresh handler ──────────────────────────────────────── */
  const handleRefresh = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      await new Promise((r) => setTimeout(r, 800));
      setLastSynced(new Date());
      setTimeAgoText("Just now");
    } catch (e) {
      console.error("Refresh failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  /* ── Format date for display ──────────────────────────────── */
  const formatDisplayDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const h = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${month} ${d.getDate()}, ${d.getFullYear()} ${h}:${mi}`;
  };

  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedTier, setSelectedTier] = useState("ALL");

  // Robust State Matcher Utility
  const isMatchingState = (item, targetState) => {
    if (!item) return false;
    if (!targetState || targetState === "ALL") return true;
    const target = targetState.toLowerCase();
    const itemState = (item.state || "").toLowerCase();
    const itemDistrict = (item.district || "").toLowerCase();
    const itemCity = (item.city || "").toLowerCase();
    const itemAddress = (item.address || item.atm_address || "").toLowerCase();

    if (itemState.includes(target) || target.includes(itemState)) return true;
    if (
      target === "delhi" &&
      (itemDistrict.includes("delhi") ||
        itemCity.includes("delhi") ||
        itemAddress.includes("delhi") ||
        itemAddress.includes("rohini") ||
        itemAddress.includes("connaught"))
    )
      return true;
    if (
      target === "maharashtra" &&
      (itemDistrict.includes("mumbai") ||
        itemDistrict.includes("pune") ||
        itemCity.includes("mumbai") ||
        itemCity.includes("pune") ||
        itemAddress.includes("andheri") ||
        itemAddress.includes("mumbai"))
    )
      return true;
    if (
      target === "karnataka" &&
      (itemDistrict.includes("bengaluru") ||
        itemCity.includes("bengaluru") ||
        itemAddress.includes("koramangala") ||
        itemAddress.includes("bengaluru"))
    )
      return true;
    if (
      target === "telangana" &&
      (itemDistrict.includes("hyderabad") ||
        itemCity.includes("hyderabad") ||
        itemAddress.includes("hitech"))
    )
      return true;
    if (
      target === "gujarat" &&
      (itemDistrict.includes("ahmedabad") ||
        itemCity.includes("ahmedabad") ||
        itemAddress.includes("navrangpura"))
    )
      return true;

    return false;
  };

  // Filter hotspots, complaints, atms, and police stations safely
  const filteredHotspots = (hotspots || []).filter((h) => {
    if (!h) return false;
    if (!isMatchingState(h, selectedState)) return false;
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

  const filteredComplaints = (complaints || []).filter((c) =>
    isMatchingState(c, selectedState),
  );

  const filteredAtms = (atms || []).filter((a) =>
    isMatchingState(a, selectedState),
  );

  const filteredPoliceStations = (policeStations || []).filter((p) =>
    isMatchingState(p, selectedState),
  );

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
        ></div>

        <div
          className="dash-animate"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 25px 0 25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                cursor: isSyncing ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: isSyncing ? 0.7 : 1,
              }}
            >
              <RefreshCw
                size={13}
                color="#3b82f6"
                className={isSyncing ? "sync-spinning" : ""}
              />

              <span>
                Last sync:{" "}
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  {isSyncing ? "Syncing..." : timeAgoText}
                </span>
              </span>
            </button>

            <div
              style={{
                position: "relative",
              }}
            >
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: showDatePicker
                    ? "1px solid #3b82f6"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  color: "#e2e8f0",
                  cursor: "pointer",
                }}
              >
                <Calendar size={13} color="var(--text-muted)" />

                <span>
                  {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
                </span>
              </div>{" "}
            </div>
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
              selectedState={selectedState}
              complaints={filteredComplaints}
              hotspots={filteredHotspots}
              atms={filteredAtms}
              policeStations={filteredPoliceStations}
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
