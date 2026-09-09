import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  MapPin,
  Cpu,
  GitFork,
  ShieldAlert,
  BellRing,
  FileSpreadsheet,
  BarChart3,
  Network,
  Sun,
  Moon,
  ShieldCheck,
  LogIn,
  LogOut,
} from "lucide-react";

// Officer / Command & Control Nav Modules
const OFFICER_NAV_MODULES = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/gis-heatmap", label: "GIS Heatmap", icon: MapPin },
  { path: "/predictive-analytics", label: "Predictive AI", icon: Cpu },
  { path: "/mule-graph", label: "Mule Graph", icon: GitFork },
  { path: "/lea-interface", label: "LEA Dispatch", icon: ShieldAlert },
  { path: "/alerts-center", label: "Alerts", icon: BellRing },
  { path: "/ncrp-complaints", label: "NCRP / 1930", icon: FileSpreadsheet },
  { path: "/analytics-reports", label: "Analytics", icon: BarChart3 },
  { path: "/pipeline-topology", label: "Pipeline", icon: Network },
];

export default function Navbar({
  isRunningML,
  onTriggerML,
  activeAlertsCount = 2,
  theme = "dark",
  onToggleTheme,
}) {
  const location = useLocation();
  const [time, setTime] = useState("");

  const isAuthPage =
    location.pathname === "/auth" ||
    location.pathname === "/login" ||
    location.pathname === "/";

  const isCitizenPage =
    location.pathname === "/ncrp-portal" ||
    location.pathname === "/citizen-portal" ||
    location.pathname === "/ncrp-simulation";

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background:
          "linear-gradient(to bottom, rgba(7,11,20,0.97) 0%, rgba(7,11,20,0.85) 75%, rgba(7,11,20,0) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "0 24px",
      }}
    >
      {/* Single row: logo | nav pills | time */}
      <div
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* Logo */}
        <Link
          to={isAuthPage ? "/auth" : isCitizenPage ? "/ncrp-portal" : "/dashboard"}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            marginRight: "20px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#040914",
              boxShadow: "0 0 14px rgba(0,229,255,0.4)",
              flexShrink: 0,
            }}
          >
            <Shield size={17} strokeWidth={2.5} />
          </div>
          <span
            className="shimmer-text"
            style={{
              fontSize: "0.95rem",
              fontWeight: 900,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            TRINETRA
          </span>
        </Link>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "20px",
            background: "rgba(255,255,255,0.08)",
            marginRight: "20px",
            flexShrink: 0,
          }}
        />

        {/* Navigation Section */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flex: 1,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* 1. When on Auth / Landing Page: Show ONLY "Portal Login" */}
          {isAuthPage && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <NavLink
                to="/auth"
                className={({ isActive }) =>
                  `nav-pill${isActive ? " active" : ""}`
                }
              >
                <LogIn size={14} strokeWidth={2} />
                Portal Login / Role Selection
              </NavLink>
            </div>
          )}

          {/* 2. When on Citizen Portal: Show Citizen Navigation */}
          {isCitizenPage && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <NavLink
                to="/ncrp-portal"
                className={({ isActive }) =>
                  `nav-pill${isActive ? " active" : ""}`
                }
              >
                <ShieldCheck size={14} strokeWidth={2} />
                Citizen NCRP Portal
              </NavLink>

              <NavLink
                to="/auth"
                className="nav-pill"
                style={{ opacity: 0.8 }}
                title="Switch role or login as Field Officer"
              >
                <LogOut size={13} strokeWidth={1.8} />
                Switch Portal / Login
              </NavLink>
            </div>
          )}

          {/* 3. When Logged in on Field Officer / LEA Pages: Show All Command Modules */}
          {!isAuthPage && !isCitizenPage && (
            <>
              {OFFICER_NAV_MODULES.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/dashboard"}
                  className={({ isActive }) =>
                    `nav-pill${isActive ? " active" : ""}`
                  }
                >
                  <Icon size={13} strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}

              <NavLink
                to="/auth"
                className="nav-pill"
                style={{
                  marginLeft: "6px",
                  background: "rgba(255, 56, 92, 0.08)",
                  borderColor: "rgba(255, 56, 92, 0.2)",
                  color: "#ff7597",
                }}
                title="Log out or switch role"
              >
                <LogOut size={13} strokeWidth={1.8} />
                Logout / Switch
              </NavLink>
            </>
          )}

          <style>{`nav::-webkit-scrollbar{display:none}`}</style>
        </nav>

        {/* Right: theme toggle + live clock */}
        <div
          style={{
            marginLeft: "16px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
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
              color: theme === "dark" ? "#fbbf24" : "#3b82f6",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
            }
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Live Clock */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00e676",
                boxShadow: "0 0 6px #00e676",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.01em",
              }}
            >
              {time}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
