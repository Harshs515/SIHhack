import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  GitFork,
  ShieldAlert,
  BellRing,
  FileSpreadsheet,
  BarChart3,
  Network,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  Banknote,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Calendar,
  Download,
  MoreVertical,
} from "lucide-react";

import {
  MOCK_COMPLAINTS,
  MOCK_HOTSPOTS,
  MOCK_ALERTS_STREAM,
  MOCK_HOURLY_CASHOUT_PATTERNS,
  MOCK_MODEL_METRICS,
} from "../data/mockData";

import CommandCenter from "./CommandCenter";

/* ── Module definitions ────────────────────────────────────────── */

const MODULES = [
  {
    path: "/command-center",
    label: "Command Center",
    icon: Shield,
    accentColor: "#00e5ff",
    badge: "LIVE",
    badgeColor: "success",
    desc: "GIS war room",
  },
  {
    path: "/gis-heatmap",
    label: "GIS Heatmap",
    icon: MapPin,
    accentColor: "#ff385c",
    badge: "47 Zones",
    badgeColor: "danger",
    desc: "ATM risk clusters",
  },
  {
    path: "/predictive-analytics",
    label: "Predictive AI",
    icon: Cpu,
    accentColor: "#a855f7",
    badge: "XGBoost",
    badgeColor: "purple",
    desc: "ML forecasting engine",
  },
  {
    path: "/mule-graph",
    label: "Mule Graph",
    icon: GitFork,
    accentColor: "#ffaa00",
    badge: "Neo4j",
    badgeColor: "warning",
    desc: "Transaction chains",
  },
  {
    path: "/lea-interface",
    label: "LEA Dispatch",
    icon: ShieldAlert,
    accentColor: "#00e676",
    badge: "Active",
    badgeColor: "success",
    desc: "PCR intercept",
  },
  {
    path: "/alerts-center",
    label: "Alerts",
    icon: BellRing,
    accentColor: "#ff385c",
    badge: "P1 P2",
    badgeColor: "danger",
    desc: "Real-time stream",
  },
  {
    path: "/ncrp-complaints",
    label: "NCRP / 1930",
    icon: FileSpreadsheet,
    accentColor: "#00e5ff",
    badge: "1930",
    badgeColor: "primary",
    desc: "Complaint intake",
  },
  {
    path: "/analytics-reports",
    label: "Analytics",
    icon: BarChart3,
    accentColor: "#3b82f6",
    badge: "Reports",
    badgeColor: "blue",
    desc: "MHA benchmarks",
  },
  {
    path: "/pipeline-topology",
    label: "Pipeline",
    icon: Network,
    accentColor: "#a855f7",
    badge: "Real-Time",
    badgeColor: "purple",
    desc: "Kafka → Neo4j",
  },
];

const BADGE_COLORS = {
  success: {
    bg: "rgba(0,230,118,0.1)",
    color: "#00e676",
    border: "rgba(0,230,118,0.25)",
  },
  danger: {
    bg: "rgba(255,56,92,0.1)",
    color: "#ff385c",
    border: "rgba(255,56,92,0.25)",
  },
  warning: {
    bg: "rgba(255,170,0,0.1)",
    color: "#ffaa00",
    border: "rgba(255,170,0,0.25)",
  },
  primary: {
    bg: "rgba(0,229,255,0.1)",
    color: "#00e5ff",
    border: "rgba(0,229,255,0.25)",
  },
  purple: {
    bg: "rgba(168,85,247,0.1)",
    color: "#a855f7",
    border: "rgba(168,85,247,0.25)",
  },
  blue: {
    bg: "rgba(59,130,246,0.1)",
    color: "#3b82f6",
    border: "rgba(59,130,246,0.25)",
  },
};

const TIER_COLORS = {
  P1: "#ff385c",
  P2: "#ffaa00",
  P3: "#3b82f6",
};

/* ── Current Month Date Range Helper ───────────────────────────── */

/*
  Automatically calculates:

  Start:
  First day of current month at 00:00

  End:
  Last day of current month at 23:59

  Example:
  August 2026:
  2026-08-01T00:00
  2026-08-31T23:59

  September 2026:
  2026-09-01T00:00
  2026-09-30T23:59
*/

const getCurrentMonthRange = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  // First day of the current month
  const firstDay = new Date(year, month, 1, 0, 0);

  // Last day of the current month
  // Using day 0 of the next month automatically handles
  // months with 28, 29, 30, or 31 days.
  const lastDay = new Date(year, month + 1, 0, 23, 59);

  const formatDateTimeLocal = (date) => {
    const pad = (num) => String(num).padStart(2, "0");

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1,
    )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
      date.getMinutes(),
    )}`;
  };

  return {
    start: formatDateTimeLocal(firstDay),
    end: formatDateTimeLocal(lastDay),
  };
};

/* ── Sparkline ─────────────────────────────────────────────────── */

function Sparkline({ data, color = "#00e5ff", height = 44 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const W = 100;
  const H = height;

  const step = W / (data.length - 1);

  const pts = data
    .map((v, i) => `${i * step},${H - ((v - min) / range) * (H - 4)}`)
    .join(" ");

  const fill = `0,${H} ${pts} ${(data.length - 1) * step},${H}`;

  const uid = color.replace("#", "");

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon points={fill} fill={`url(#g${uid})`} />

      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Mini Donut ────────────────────────────────────────────────── */

function MiniDonut({ slices }) {
  const total = slices.reduce((a, s) => a + s.value, 0);

  let cum = -90;

  const r = 32;
  const cx = 40;
  const cy = 40;

  const rad = (d) => (d * Math.PI) / 180;

  const arc = (start, sweep) => {
    if (sweep >= 359.9) sweep = 359.9;

    const s = {
      x: cx + r * Math.cos(rad(start)),
      y: cy + r * Math.sin(rad(start)),
    };

    const e = {
      x: cx + r * Math.cos(rad(start + sweep)),
      y: cy + r * Math.sin(rad(start + sweep)),
    };

    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${
      sweep > 180 ? 1 : 0
    } 1 ${e.x} ${e.y}`;
  };

  return (
    <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={8}
      />

      {slices.map((s, i) => {
        const sweep = (s.value / total) * 360;

        const d = arc(cum, sweep - 1.5);

        cum += sweep;

        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })}

      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="#fff"
        fontSize={10}
        fontWeight={700}
      >
        {total}
      </text>
    </svg>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  return (
    <div
      className="dash-kpi-card dash-animate"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>

        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: `${accent}14`,
            border: `1px solid ${accent}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={accent} strokeWidth={2} />
        </div>
      </div>

      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          fontFamily: "var(--font-display)",
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            marginTop: "5px",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* ── Module Card ───────────────────────────────────────────────── */

function ModuleCard({
  path,
  label,
  icon: Icon,
  accentColor,
  badge,
  badgeColor,
  desc,
  delay = 0,
}) {
  const navigate = useNavigate();

  const bc = BADGE_COLORS[badgeColor] || BADGE_COLORS.primary;

  return (
    <div
      className="dash-module-card dash-animate"
      style={{
        animationDelay: `${delay}ms`,
      }}
      onClick={() => navigate(path)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(path)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={17} color={accentColor} strokeWidth={1.8} />
        </div>

        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "4px",
            background: bc.bg,
            color: bc.color,
            border: `1px solid ${bc.border}`,
            letterSpacing: "0.05em",
          }}
        >
          {badge}
        </span>
      </div>

      <div>
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: "2px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: "0.64rem",
            color: "var(--text-muted)",
          }}
        >
          {desc}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          fontSize: "0.63rem",
          color: accentColor,
        }}
      >
        Open <ArrowUpRight size={10} />
      </div>
    </div>
  );
}

/* ══ Dashboard Page ════════════════════════════════════════════════ */

export default function DashboardPage({
  complaints = MOCK_COMPLAINTS,
  hotspots = MOCK_HOTSPOTS,
  atms = [],
  policeStations = [],
  isRunningML = false,
  onTriggerML,
  mlStatus = "ACTIVE",
  onRefreshData,
}) {
  // ── State for Refresh / Sync ──

  const [lastSynced, setLastSynced] = useState(new Date());

  const [isSyncing, setIsSyncing] = useState(false);

  const [timeAgoText, setTimeAgoText] = useState("Just now");

  // ── State for Date Range / Month Filtering ──

  /*
    Automatically get the current month.

    For example, if today is August 30, 2026:

    startDate = 2026-08-01T00:00
    endDate   = 2026-08-31T23:59

    When the month changes, the default range
    automatically changes as well.
  */

  const currentMonthRange = getCurrentMonthRange();

  const [startDate, setStartDate] = useState(currentMonthRange.start);

  const [endDate, setEndDate] = useState(currentMonthRange.end);

  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Auto-update "Last sync" string every 10 seconds ──

  useEffect(() => {
    const updateTimeAgo = () => {
      const diffSecs = Math.floor((new Date() - lastSynced) / 1000);

      if (diffSecs < 30) {
        setTimeAgoText("Just now");
      } else if (diffSecs < 60) {
        setTimeAgoText("1 min ago");
      } else {
        const mins = Math.floor(diffSecs / 60);

        setTimeAgoText(`${mins} mins ago`);
      }
    };

    updateTimeAgo();

    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [lastSynced]);

  // ── Handle Refresh Action ──

  const handleRefresh = async () => {
    setIsSyncing(true);

    if (onRefreshData) {
      await onRefreshData();
    } else {
      // Simulate API fetch delay
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setLastSynced(new Date());
    setTimeAgoText("Just now");
    setIsSyncing(false);
  };

  // ── Helper to format ISO strings into clean dates ──

  const formatDisplayDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    const month = date.toLocaleDateString("en-US", {
      month: "short",
    });

    const day = date.getDate();

    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // ── Filter complaints based on selected date/month range ──

  const filteredComplaints = useMemo(() => {
    const start = new Date(startDate).getTime();

    const end = new Date(endDate).getTime();

    return complaints.filter((c) => {
      if (!c.created_at) return true;

      const cTime = new Date(c.created_at).getTime();

      return cTime >= start && cTime <= end;
    });
  }, [complaints, startDate, endDate]);

  const totalFraud = useMemo(
    () =>
      filteredComplaints.reduce(
        (s, c) => s + (parseFloat(c.fraud_amount) || 0),
        0,
      ),
    [filteredComplaints],
  );

  const p1Count = hotspots.filter((h) => h.alert_tier === "P1").length;

  const p2Count = hotspots.filter((h) => h.alert_tier === "P2").length;

  const p3Count = Math.max(hotspots.length - p1Count - p2Count, 1);

  const sparkData = MOCK_HOURLY_CASHOUT_PATTERNS.map((d) => d.volume_lakhs);

  const recentAlerts = MOCK_ALERTS_STREAM.slice(0, 5);

  return (
    <div
      style={{
        padding: "10px 2px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Inline styles for spinner rotation animation */}

      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .sync-spinning {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* ── Page Header ── */}

      <div
        className="dash-animate"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 25px 0 25px",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            color: "#fff",
            margin: 0,
          }}
        >
          Overview
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* Functional Refresh Button */}

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
                {timeAgoText}
              </span>
            </span>
          </button>

          {/* Functional Date & Month Range Trigger */}

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
            </div>
          </div>
        </div>
      </div>

      <CommandCenter
        complaints={filteredComplaints}
        hotspots={hotspots}
        atms={atms}
        policeStations={policeStations}
        isRunningML={isRunningML}
        onTriggerML={onTriggerML}
        mlStatus={mlStatus}
      />

      {/* ── Model health bar ── */}

      <div
        className="dash-animate"
        style={{
          animationDelay: "380ms",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          padding: "10px 16px",
          borderRadius: "9px",
          background: "rgba(0,229,255,0.03)",
          border: "1px solid rgba(0,229,255,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <CheckCircle2 size={13} color="#00e676" />

          <span
            style={{
              fontSize: "0.66rem",
              color: "var(--text-muted)",
            }}
          >
            Model
          </span>

          <span
            style={{
              fontSize: "0.66rem",
              color: "#00e5ff",
              fontWeight: 700,
            }}
          >
            {MOCK_MODEL_METRICS.version}
          </span>
        </div>

        {[
          [
            "Accuracy",
            `${(MOCK_MODEL_METRICS.overall_accuracy * 100).toFixed(1)}%`,
          ],
          ["Precision", `${(MOCK_MODEL_METRICS.precision * 100).toFixed(1)}%`],
          ["Recall", `${(MOCK_MODEL_METRICS.recall * 100).toFixed(1)}%`],
          ["F1", `${(MOCK_MODEL_METRICS.f1_score * 100).toFixed(1)}%`],
          ["Clusters", MOCK_MODEL_METRICS.clusters_identified],
          ["Window", MOCK_MODEL_METRICS.golden_hour_window],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                fontSize: "0.62rem",
                color: "var(--text-muted)",
              }}
            >
              {k}
            </span>

            <span
              style={{
                fontSize: "0.68rem",
                color: "#e2e8f0",
                fontWeight: 700,
              }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
