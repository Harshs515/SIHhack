import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  GitFork,
  ShieldAlert,
  BellRing,
  FileSpreadsheet,
  BarChart3,
  Database,
} from "lucide-react";

const NAV_ITEMS = [
  // {
  //   path: '/',
  //   label: 'Command Center',
  //   icon: LayoutDashboard,
  //   badge: 'LIVE',
  //   badgeColor: '#00e5ff',
  //   desc: 'Central War Room Dashboard'
  // },
  {
    path: "/gis-heatmap",
    label: "GIS Risk Heatmap",
    icon: MapPin,
    badge: "47 Clusters",
    badgeColor: "#ff385c",
    desc: "ATM Risk & Buffer Zones",
  },
  {
    path: "/mule-graph",
    label: "Mule Chain Graph",
    icon: GitFork,
    badge: "Neo4j",
    badgeColor: "#ffaa00",
    desc: "Multi-Hop Layering Graph",
  },
  {
    path: "/lea-interface",
    label: "Police & LEA Dispatch",
    icon: ShieldAlert,
    badge: "Actionable",
    badgeColor: "#00e676",
    desc: "PCR Interception Vectoring",
  },
  {
    path: "/alerts-center",
    label: "Real-Time Alerts Hub",
    icon: BellRing,
    badge: "P1 / P2",
    badgeColor: "#ff385c",
    desc: "FCM Push & Bank Pre-Alerts",
  },
  {
    path: "/ncrp-complaints",
    label: "NCRP Complaint Triage",
    icon: FileSpreadsheet,
    badge: "1930 Feed",
    badgeColor: "#00e5ff",
    desc: "SparkNLP Entity Extraction",
  },
  {
    path: "/analytics-reports",
    label: "Analytics & Reports",
    icon: BarChart3,
    badge: "Dossiers",
    badgeColor: "#3b82f6",
    desc: "MHA Recovery Benchmarks",
  },
];

export default function Sidebar() {
  return (
    <aside
      className="glass-panel"
      style={{
        width: "270px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "14px 10px",
        gap: "6px",
        overflowY: "auto",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          padding: "6px 10px 10px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}
        >
          INTELLIGENCE SUITE
        </span>
        <span
          style={{
            fontSize: "0.65rem",
            color: "#00e676",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00e676",
            }}
          ></span>
          SOVEREIGN
        </span>
      </div>

      {/* Navigation List */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          flex: 1,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "#fff" : "var(--text-secondary)",
                background: isActive
                  ? "linear-gradient(90deg, rgba(0, 229, 255, 0.16) 0%, rgba(59, 130, 246, 0.08) 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(0, 229, 255, 0.4)"
                  : "1px solid transparent",
                boxShadow: isActive
                  ? "0 4px 16px rgba(0, 229, 255, 0.15)"
                  : "none",
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: isActive ? "#00e5ff" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isActive ? 800 : 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: isActive ? "#fff" : "var(--text-main)",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.64rem",
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: `rgba(${item.badgeColor === "#00e5ff" ? "0,229,255,0.14" : item.badgeColor === "#ff385c" ? "255,56,92,0.14" : item.badgeColor === "#00e676" ? "0,230,118,0.14" : "168,85,247,0.14"})`,
                        color: item.badgeColor,
                        border: `1px solid ${item.badgeColor}35`,
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Diagnostics */}
      <div
        style={{
          marginTop: "auto",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: "0.7rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Database size={12} color="#00e676" /> Kafka • Neo4j • ML
          </span>
          <span
            style={{ color: "#00e676", fontWeight: 700, fontSize: "0.66rem" }}
          >
            SYNCHRONIZED
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "var(--text-muted)",
            fontSize: "0.64rem",
          }}
        >
          <span>1930 Helpline Ingestion</span>
          <span style={{ color: "#00e5ff" }}>8,000+ txns/day</span>
        </div>
      </div>
    </aside>
  );
}
