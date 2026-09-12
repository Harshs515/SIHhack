import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Bell,
  BellRing,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Radio,
  Eye,
  PhoneCall,
  Navigation,
  ChevronRight,
  X,
  CreditCard,
  TrendingUp,
  Activity,
  Zap,
  BadgeAlert,
  Download,
  LogOut,
} from "lucide-react";
import FieldOfficerPWAModal from "../components/FieldOfficerPWAModal";
import AppLogo from "../components/AppLogo";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { FIELD_OFFICERS } from "../data/personnel";
import { getSession, clearSession } from "../utils/session";
import { supabase } from "../services/realtimeClient";

const API = import.meta.env.VITE_API_URL || "https://sih2026-backend-k5ru.onrender.com/api";

const navigateToAtm = (lat, lng, bankName) => {
  if (lat && lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bankName || "ATM Near Me")}`, "_blank");
  }
};

// ─── Mock Notifications (Clean Tactical Law Enforcement Formatting) ───────────
const generateNotifications = (district) => {
  const allNotifications = [
    {
      id: "NOTIF-001",
      tier: "P1",
      type: "CRITICAL_ALERT",
      title: "CRITICAL: UPI Fraud Interception Required",
      body: "UPI Fraud complaint filed. Mule ATM linked to your patrol zone. Victim: Ananya Sen. Amount: ₹2,10,000. Immediate on-site interception required.",
      district: "Rohini",
      atmId: "ATM-DEL-NW-07",
      bank: "Canara Bank",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      ackStatus: null,
      fraudCategory: "SIM Swap Fraud",
      amount: 210000,
      victimContact: "+91-98300-11928",
      goldenWindow: "38 mins remaining",
      riskScore: 0.91,
    },
    {
      id: "NOTIF-002",
      tier: "P1",
      type: "HOTSPOT_ALERT",
      title: "HIGH-RISK ATM CASH EXTRACTION PREDICTED",
      body: "Predictive model forecasts imminent cash withdrawal at your assigned ATM (SBI Sector 8). Cluster volume ₹14.5 Lakhs. Heightened surveillance required.",
      district: "Rohini",
      atmId: "ATM-DEL-NW-07",
      bank: "State Bank of India",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      ackStatus: "ACKNOWLEDGED",
      fraudCategory: "Digital Arrest Scam",
      amount: 1450000,
      victimContact: null,
      goldenWindow: "22 mins remaining",
      riskScore: 0.942,
    },
    {
      id: "NOTIF-003",
      tier: "P2",
      type: "PRE_ALERT",
      title: "PRE-ALERT: Suspicious Transaction Cluster",
      body: "Cardless withdrawal pattern detected in Rohini Sector 9 (0.4 km from your assigned ATM). Monitor ATM kiosk for uncarded withdrawal activity.",
      district: "Rohini",
      atmId: "ATM-DEL-NW-07",
      bank: "State Bank of India",
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
      ackStatus: "ACKNOWLEDGED",
      fraudCategory: "Cardless Withdrawal",
      amount: 85000,
      victimContact: null,
      goldenWindow: "Elapsed",
      riskScore: 0.78,
    },
    {
      id: "NOTIF-004",
      tier: "P3",
      type: "AREA_BRIEF",
      title: "Area Intelligence Brief: Rohini Sector",
      body: "Rohini district has logged 4 cybercrime complaints in the last 2 hours. Remain alert and report any suspicious individuals near ATM premises.",
      district: "Rohini",
      atmId: null,
      bank: null,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      ackStatus: "ACKNOWLEDGED",
      fraudCategory: null,
      amount: null,
      victimContact: null,
      goldenWindow: null,
      riskScore: null,
    },
    // New Delhi officer notifications
    {
      id: "NOTIF-005",
      tier: "P1",
      type: "CRITICAL_ALERT",
      title: "CRITICAL: Digital Arrest Fraud Escalation",
      body: "Digital Arrest Scam complaint registered. Mule ATM linked to Connaught Place zone. Victim: Rajesh Sharma. Amount: ₹8,50,000. Immediate response required.",
      district: "New Delhi",
      atmId: "ATM-DEL-CP-02",
      bank: "State Bank of India",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      ackStatus: null,
      fraudCategory: "Digital Arrest Scam",
      amount: 850000,
      victimContact: "+91-98112-44120",
      goldenWindow: "25 mins remaining",
      riskScore: 0.92,
    },
    // Mumbai officer notifications
    {
      id: "NOTIF-006",
      tier: "P1",
      type: "CRITICAL_ALERT",
      title: "CRITICAL: Stock Market Scam Account Activity",
      body: "Stock Market Trading Scam complaint. Mule ATM linked to Andheri zone. Victim: Vikram Mehta. Amount: ₹12,50,000. Intercept within active window.",
      district: "Mumbai Suburban",
      atmId: "ATM-MUM-AN-03",
      bank: "ICICI Bank",
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      ackStatus: "ACKNOWLEDGED",
      fraudCategory: "Stock Market / Trading Scam",
      amount: 1250000,
      victimContact: "+91-98201-99882",
      goldenWindow: "Elapsed",
      riskScore: 0.95,
    },
  ];
  return allNotifications.filter((n) => n.district === district);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const tierColor = (tier) => {
  if (tier === "P1") return "#ff385c";
  if (tier === "P2") return "#ffaa00";
  return "#00e5ff";
};

const tierBg = (tier) => {
  if (tier === "P1") return "rgba(255,56,92,0.14)";
  if (tier === "P2") return "rgba(255,170,0,0.14)";
  return "rgba(0,229,255,0.14)";
};

// ─── Notification Card (Clean Law-Enforcement Vector Badging) ────────────────
function NotificationCard({ notif, onAcknowledge, onViewDetails }) {
  const isUnread = !notif.ackStatus;
  const color = tierColor(notif.tier);
  const bg = tierBg(notif.tier);

  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px 18px",
        border: `1px solid ${isUnread ? color + "55" : "rgba(255,255,255,0.06)"}`,
        boxShadow: isUnread
          ? `0 0 24px ${color}22, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 8px 32px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        animation: isUnread ? "notifPulse 2.5s ease-in-out infinite" : "none",
      }}
    >
      {/* Tier accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />

      <div style={{ paddingLeft: "8px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Professional Vector Priority Badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: bg,
                  border: `1px solid ${color}44`,
                  color: color,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  flexShrink: 0,
                }}
              >
                {notif.tier === "P1" && (
                  <AlertTriangle size={12} color={color} strokeWidth={2.5} />
                )}
                {notif.tier === "P2" && (
                  <Clock size={12} color={color} strokeWidth={2.5} />
                )}
                {notif.tier === "P3" && (
                  <Radio size={12} color={color} strokeWidth={2.5} />
                )}
                {notif.tier}
              </span>

              {isUnread && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(255,56,92,0.15)",
                    border: "1px solid rgba(255,56,92,0.3)",
                    color: "#ff5277",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#ff385c",
                      boxShadow: "0 0 6px #ff385c",
                    }}
                  />
                  NEW
                </span>
              )}

              <span
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: "0.86rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {notif.title}
              </span>
            </div>

            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                marginTop: "6px",
                lineHeight: 1.5,
              }}
            >
              {notif.body}
            </p>
          </div>
        </div>

        {/* Meta info row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {notif.amount && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={12} color="#00e676" />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#00e676",
                  fontWeight: 700,
                }}
              >
                ₹{(notif.amount / 100000).toFixed(1)}L at risk
              </span>
            </div>
          )}
          {notif.goldenWindow && notif.goldenWindow !== "Elapsed" && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} color="#ffaa00" />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#ffaa00",
                  fontWeight: 700,
                }}
              >
                {notif.goldenWindow}
              </span>
            </div>
          )}
          {notif.goldenWindow === "Elapsed" && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} color="var(--text-muted)" />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Window elapsed
              </span>
            </div>
          )}
          {notif.riskScore && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Activity size={12} color="#a855f7" />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#a855f7",
                  fontWeight: 700,
                }}
              >
                Risk: {(notif.riskScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={12} color="var(--text-muted)" />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {timeAgo(notif.timestamp)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {isUnread && (
            <button
              onClick={() => onAcknowledge(notif.id)}
              className="cyber-btn"
              style={{ padding: "6px 14px", fontSize: "0.75rem" }}
            >
              <CheckCircle2 size={13} /> Acknowledge
            </button>
          )}
          <button
            onClick={() => onViewDetails(notif)}
            className="cyber-btn cyber-btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
          >
            <Eye size={13} /> View Details
          </button>
          {isUnread && notif.tier === "P1" && (
            <button
              onClick={() => navigateToAtm(notif.atm_lat, notif.atm_lng, notif.bank)}
              className="cyber-btn cyber-btn-danger"
              style={{ padding: "6px 14px", fontSize: "0.75rem" }}
            >
              <Navigation size={13} /> Navigate to ATM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ notif, onClose }) {
  if (!notif) return null;
  const color = tierColor(notif.tier);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "24px",
          border: `1px solid ${color}44`,
          boxShadow: `0 0 40px ${color}22`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `${color}22`,
                border: `1px solid ${color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BadgeAlert size={18} color={color} />
            </div>
            <div>
              <div
                style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}
              >
                Incident Detail
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {notif.id} · {notif.fraudCategory || "Area Brief"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Detail rows */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {[
            { label: "Alert Tier", value: notif.tier, color },
            { label: "District", value: notif.district },
            ...(notif.atmId
              ? [{ label: "Target ATM", value: notif.atmId }]
              : []),
            ...(notif.bank ? [{ label: "Bank", value: notif.bank }] : []),
            ...(notif.amount
              ? [
                  {
                    label: "Amount at Risk",
                    value: `₹${(notif.amount / 100000).toFixed(2)}L`,
                    color: "#00e676",
                  },
                ]
              : []),
            ...(notif.riskScore
              ? [
                  {
                    label: "Risk Score",
                    value: `${(notif.riskScore * 100).toFixed(1)}%`,
                    color: "#a855f7",
                  },
                ]
              : []),
            ...(notif.goldenWindow
              ? [
                  {
                    label: "Golden Window",
                    value: notif.goldenWindow,
                    color:
                      notif.goldenWindow === "Elapsed"
                        ? "var(--text-muted)"
                        : "#ffaa00",
                  },
                ]
              : []),
            ...(notif.victimContact
              ? [
                  {
                    label: "Victim Contact",
                    value: notif.victimContact,
                    color: "#00e5ff",
                  },
                ]
              : []),
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: item.color || "#fff",
                  fontSize: "0.85rem",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Full description */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Intelligence Brief
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {notif.body}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onClose}
            className="cyber-btn cyber-btn-secondary"
            style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Portal Dashboard ────────────────────────────────────────────────────
function mapHotspotToNotif(h, district) {
  const isP1 = h.alert_level === "P1";
  return {
    id: h.id,
    tier: h.alert_level || "P1",
    type: isP1 ? "CRITICAL_ALERT" : "HOTSPOT_ALERT",
    title: `${isP1 ? "CRITICAL" : "HIGH-RISK"}: ATM Cash Extraction Alert - ${h.atm_bank || "Bank ATM"}`,
    body:
      h.actionable_intelligence ||
      `Active extraction risk at ${h.atm_bank || "ATM"}. Risk Score: ${Math.round((h.risk_score || 0.8) * 100)}%. Immediate patrol recommended.`,
    district: h.station_name || district || "Rohini",
    atmId: h.predicted_atm_id || h.atm_id || "ATM-DEL-NW-07",
    bank: h.atm_bank || "State Bank of India",
    atm_lat: h.atm_lat,
    atm_lng: h.atm_lng,
    timestamp: new Date(h.created_at || Date.now()),
    ackStatus: h.status === "ACKNOWLEDGED" || h.acknowledged_by ? "ACKNOWLEDGED" : null,
    fraudCategory: h.fraud_category || "Mule Account Withdrawal",
    amount: h.amount || 150000,
    victimContact: "+91-98300-11928",
    goldenWindow: "38 mins remaining",
    riskScore: h.risk_score || 0.88,
  };
}

function PortalDashboard({ officer, hotspots = [], setHotspots, stats = {} }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    if (hotspots && hotspots.length > 0) {
      const active = hotspots
        .filter((h) => (h.alert_level === "P1" || h.alert_level === "P2") && h.status !== "RESOLVED")
        .map((h) => mapHotspotToNotif(h, officer.district));
      if (active.length > 0) return active;
    }
    return generateNotifications(officer.district);
  });
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [broadcastMsg, setBroadcastMsg] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { isInstalled } = usePWAInstall();

  const unreadCount = notifications.filter((n) => !n.ackStatus).length;

  // Close notification popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with hotspots prop updates
  useEffect(() => {
    if (hotspots && hotspots.length > 0) {
      const active = hotspots
        .filter((h) => (h.alert_level === "P1" || h.alert_level === "P2") && h.status !== "RESOLVED")
        .map((h) => mapHotspotToNotif(h, officer.district));
      if (active.length > 0) {
        setNotifications((prev) => {
          // preserve any ackStatus overrides
          const ackedIds = new Set(prev.filter((p) => p.ackStatus === "ACKNOWLEDGED").map((p) => p.id));
          return active.map((a) => (ackedIds.has(a.id) ? { ...a, ackStatus: "ACKNOWLEDGED" } : a));
        });
      }
    }
  }, [hotspots, officer.district]);

  // Realtime Supabase subscription on predicted_hotspots
  useEffect(() => {
    const channel = supabase
      .channel("field-officer-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "predicted_hotspots" },
        (payload) => {
          const newH = payload.new;
          if (newH && (newH.alert_level === "P1" || newH.alert_level === "P2")) {
            if (navigator.vibrate) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch (e) {}
            }
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.value = 880;
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.5);
            } catch (e) {}

            const formatted = mapHotspotToNotif(newH, officer.district);
            setNotifications((prev) => [formatted, ...prev.filter((n) => n.id !== formatted.id)]);
            if (setHotspots) {
              setHotspots((prev) => [newH, ...prev.filter((h) => h.id !== newH.id)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [officer.district, setHotspots]);

  const handleAcknowledge = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ackStatus: "ACKNOWLEDGED" } : n)),
    );
    if (setHotspots) {
      setHotspots((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, status: "ACKNOWLEDGED", acknowledged_by: officer.name || "Field Officer" }
            : h
        )
      );
    }
    setBroadcastMsg("Alert acknowledged and logged to dispatch command.");
    setTimeout(() => setBroadcastMsg(null), 3500);

    try {
      await fetch(`${API}/predictions/${id}/acknowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officer_name: officer.name || "Field Officer" }),
      });
    } catch (err) {
      console.error("Failed to acknowledge hotspot:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 10% 20%, rgba(0,229,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(59,130,246,0.06) 0%, transparent 50%), #070b14",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top Bar ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(7,11,20,0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,229,255,0.12)",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            height: "58px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Brand + role */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <AppLogo size={36} radius={10} />
            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.02em",
                  lineHeight: 1.1,
                }}
              >
                FIELD OFFICER PORTAL
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#00e5ff",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Rapid Incident Response & ATM Surveillance
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          />

          {/* Officer info */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: `${officer.color}22`,
                border: `1px solid ${officer.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: officer.color,
                flexShrink: 0,
              }}
            >
              {officer.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {officer.name}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                {officer.district} · Shift: {officer.shift}
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {/* Install Field Officer PWA Button */}
            <button
              onClick={() => setShowInstallModal(true)}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(59,130,246,0.15) 100%)",
                border: "1px solid rgba(0,229,255,0.45)",
                color: "#00e5ff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                boxShadow: "0 0 12px rgba(0,229,255,0.15)",
              }}
              title="Install Field Officer App on this device"
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(0,229,255,0.25) 0%, rgba(59,130,246,0.25) 100%)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0,229,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(59,130,246,0.15) 100%)";
                e.currentTarget.style.boxShadow =
                  "0 0 12px rgba(0,229,255,0.15)";
              }}
            >
              <Download size={13} />
              Install App
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                clearSession();
                navigate("/auth");
              }}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "8px",
                background: "rgba(255, 56, 92, 0.12)",
                border: "1px solid rgba(255, 56, 92, 0.35)",
                color: "#ff7597",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
              title="Logout and return to authentication gateway"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 56, 92, 0.25)";
                e.currentTarget.style.borderColor = "rgba(255, 56, 92, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 56, 92, 0.12)";
                e.currentTarget.style.borderColor = "rgba(255, 56, 92, 0.35)";
              }}
            >
              <LogOut size={13} />
              Logout
            </button>

            {/* Functional, Simple & Sober Notification Button */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                onClick={() => setNotifOpen((p) => !p)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  background: notifOpen
                    ? "rgba(0,229,255,0.18)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${
                    notifOpen ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.1)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color:
                    notifOpen || unreadCount > 0
                      ? "#00e5ff"
                      : "var(--text-muted)",
                  transition: "all 0.18s ease",
                  position: "relative",
                }}
                title={
                  unreadCount > 0
                    ? `${unreadCount} unacknowledged alerts`
                    : "Notifications"
                }
              >
                <BellRing size={17} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      minWidth: "16px",
                      height: "16px",
                      borderRadius: "8px",
                      background: "#00e5ff",
                      color: "#040914",
                      fontSize: "0.62rem",
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      boxShadow: "0 0 10px rgba(0,229,255,0.6)",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Simple & Sober Dropdown Popover */}
              {notifOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "310px",
                    background: "#0b1220",
                    border: "1px solid rgba(0,229,255,0.28)",
                    borderRadius: "12px",
                    boxShadow:
                      "0 18px 45px rgba(0,0,0,0.65), 0 0 24px rgba(0,229,255,0.12)",
                    zIndex: 200,
                    overflow: "hidden",
                    animation: "fadeSlideIn 0.2s ease both",
                  }}
                >
                  {/* Dropdown Header */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(0,229,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: "0.64rem",
                            fontWeight: 800,
                            color: "#00e5ff",
                            background: "rgba(0,229,255,0.12)",
                            padding: "1px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => ({
                              ...n,
                              ackStatus: "ACKNOWLEDGED",
                            })),
                          );
                          setBroadcastMsg("All alerts acknowledged.");
                          setTimeout(() => setBroadcastMsg(null), 2500);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#00e5ff",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "2px 4px",
                        }}
                      >
                        Acknowledge All
                      </button>
                    )}
                  </div>

                  {/* Dropdown Items (Sober, compact, 0 chunky clutter) */}
                  <div style={{ maxHeight: "270px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "20px 14px",
                          textAlign: "center",
                          color: "var(--text-muted)",
                          fontSize: "0.75rem",
                        }}
                      >
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = !notif.ackStatus;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setSelectedDetail(notif);
                              setNotifOpen(false);
                            }}
                            style={{
                              padding: "10px 14px",
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "9px",
                              background: isUnread
                                ? "rgba(0,229,255,0.04)"
                                : "transparent",
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(0,229,255,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isUnread
                                ? "rgba(0,229,255,0.04)"
                                : "transparent";
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: isUnread
                                  ? "#00e5ff"
                                  : "rgba(255,255,255,0.2)",
                                marginTop: "5px",
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: isUnread ? 700 : 500,
                                  color: isUnread
                                    ? "#fff"
                                    : "var(--text-muted)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {notif.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.65rem",
                                  color: "var(--text-muted)",
                                  marginTop: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <span>{notif.atmId || notif.district}</span>
                                <span>·</span>
                                <span>{timeAgo(notif.timestamp)}</span>
                              </div>
                            </div>
                            {isUnread ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledge(notif.id);
                                }}
                                style={{
                                  background: "rgba(0,229,255,0.12)",
                                  border: "1px solid rgba(0,229,255,0.3)",
                                  color: "#00e5ff",
                                  borderRadius: "4px",
                                  padding: "3px 7px",
                                  fontSize: "0.64rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  flexShrink: 0,
                                }}
                              >
                                Ack
                              </button>
                            ) : (
                              <CheckCircle2
                                size={13}
                                color="#00e676"
                                style={{ flexShrink: 0, marginTop: "3px" }}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Separate PWA Installation Prompt Banner ── */}
      {!isInstalled && !bannerDismissed && (
        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(0,229,255,0.1) 0%, rgba(11,17,32,0.98) 100%)",
            borderBottom: "1px solid rgba(0,229,255,0.22)",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={16} color="#00e5ff" />
            <span style={{ fontSize: "0.78rem", color: "#f1f5f9" }}>
              <strong>Field Officer PWA:</strong> Install this dedicated app on
              your device for instant live dispatch alerts and fast offline
              access.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setShowInstallModal(true)}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #00e5ff, #3b82f6)",
                border: "none",
                color: "#040914",
                fontSize: "0.74rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 10px rgba(0,229,255,0.35)",
              }}
            >
              <Download size={13} /> Install App
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
              }}
              title="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Broadcast message banner ── */}
      {broadcastMsg && (
        <div
          style={{
            background: "rgba(0,229,255,0.12)",
            border: "none",
            borderBottom: "1px solid rgba(0,229,255,0.25)",
            padding: "10px 20px",
            color: "#00e5ff",
            fontSize: "0.82rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeSlideIn 0.25s ease both",
          }}
        >
          <CheckCircle2 size={16} />
          {broadcastMsg}
        </div>
      )}

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Unread alert banner (Styled in platform cyan theme) */}
          {unreadCount > 0 && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                animation: "notifPulse 2s ease-in-out infinite",
              }}
            >
              <BellRing size={20} color="#00e5ff" />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#00e5ff",
                    fontSize: "0.88rem",
                  }}
                >
                  {unreadCount} Unacknowledged Alert
                  {unreadCount > 1 ? "s" : ""} Require Attention
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                  }}
                >
                  Acknowledge alerts promptly to keep command center updated.
                </div>
              </div>
            </div>
          )}

          {/* Notifications list */}
          <div>
            <h3
              style={{
                fontSize: "0.82rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Bell size={14} color="var(--text-muted)" />
              Live Alerts for {officer.district}
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onAcknowledge={handleAcknowledge}
                  onViewDetails={setSelectedDetail}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Officer ID card */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${officer.color}22`,
                  border: `2px solid ${officer.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  color: officer.color,
                  flexShrink: 0,
                }}
              >
                {officer.avatar}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#fff",
                    fontSize: "0.95rem",
                  }}
                >
                  {officer.name}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: officer.color,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    marginTop: "2px",
                  }}
                >
                  {officer.rank}
                </div>
              </div>
            </div>

            {[
              { icon: CreditCard, label: "Badge", value: officer.badge },
              {
                icon: MapPin,
                label: "District",
                value: `${officer.district}, ${officer.state}`,
              },
              {
                icon: CreditCard,
                label: "ATM Assigned",
                value: officer.assignedAtm,
              },
              { icon: Building2, label: "Bank", value: officer.bank },
              { icon: Clock, label: "Shift", value: officer.shift },
              { icon: PhoneCall, label: "Control Room", value: officer.phone },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Icon
                  size={13}
                  color="var(--text-muted)"
                  style={{ flexShrink: 0, marginTop: "1px" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "0.62rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Area crime stats */}
          <div className="glass-panel" style={{ padding: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
              }}
            >
              <Activity size={14} color="#a855f7" />
              <h3
                style={{ fontSize: "0.8rem", fontWeight: 800, color: "#fff" }}
              >
                {officer.district} — Crime Stats (24h)
              </h3>
            </div>

            {[
              {
                label: "Total Complaints",
                value: "4",
                delta: "+2 last hr",
                color: "#ff385c",
              },
              {
                label: "Active Interventions",
                value: "2",
                delta: "",
                color: "#ffaa00",
              },
              {
                label: "Amount at Risk",
                value: "₹36.8L",
                delta: "",
                color: "#00e676",
              },
              {
                label: "Golden Windows Closed",
                value: "1 / 3",
                delta: "",
                color: "#00e5ff",
              },
            ].map(({ label, value, delta, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color }}>
                    {value}
                  </div>
                  {delta && (
                    <div
                      style={{
                        fontSize: "0.62rem",
                        color: "#ff5277",
                        fontWeight: 600,
                      }}
                    >
                      {delta}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <DetailModal
          notif={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}

      {/* Dedicated Field Officer PWA Install Modal */}
      <FieldOfficerPWAModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Keyframes */}
      <style>{`
        @keyframes notifPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Root Export (Direct View Without Profile Selection / Auth Gate) ──────────
export default function FieldOfficerPortal({ hotspots, setHotspots, stats }) {
  const session = getSession();
  const matchedOfficer =
    session?.role === "field_officer" && session.profile
      ? FIELD_OFFICERS.find((officer) => officer.id === session.profile.id) ||
        session.profile
      : null;
  const [currentOfficer] = useState(matchedOfficer || FIELD_OFFICERS[0]);

  // Dynamically set the manifest link to Field Officer specific PWA manifest
  useEffect(() => {
    const manifestLink = document.getElementById("app-manifest");
    const prevHref = manifestLink
      ? manifestLink.getAttribute("href")
      : "/manifest.json";
    if (manifestLink) {
      manifestLink.setAttribute("href", "/manifest-officer.json");
    }
    return () => {
      if (manifestLink) {
        manifestLink.setAttribute("href", prevHref || "/manifest.json");
      }
    };
  }, []);

  return (
    <PortalDashboard
      officer={currentOfficer}
      hotspots={hotspots}
      setHotspots={setHotspots}
      stats={stats}
    />
  );
}
