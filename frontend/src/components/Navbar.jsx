import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  GitFork,
  ShieldAlert,
  BellRing,
  FileSpreadsheet,
  BarChart3,
  Sun,
  Moon,
  Download,
  ShieldCheck,
  LogIn,
  LogOut,
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import PWAInstallModal from "./PWAInstallModal";
import AppLogo from "./AppLogo";
import { getSession, clearSession } from "../utils/session";

// Officer / Command & Control Nav Modules
const OFFICER_NAV_MODULES = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/gis-heatmap", label: "GIS Heatmap", icon: MapPin },
  { path: "/mule-graph", label: "Mule Graph", icon: GitFork },
  { path: "/lea-interface", label: "LEA Dispatch", icon: ShieldAlert },
  { path: "/alerts-center", label: "Alerts", icon: BellRing },
  { path: "/ncrp-complaints", label: "NCRP / 1930", icon: FileSpreadsheet },
  { path: "/analytics-reports", label: "Analytics", icon: BarChart3 },
];

export default function Navbar({
  isRunningML,
  onTriggerML,
  activeAlertsCount = 2,
  theme = "dark",
  onToggleTheme,
}) {
  const location = useLocation();
  const session = getSession();
  const [time, setTime] = useState("");
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installPulse, setInstallPulse] = useState(false);

  const { isInstalled, canInstall, platform, modalDismissed } = usePWAInstall();

  // Show the install button if: not installed, and either native prompt OR iOS
  const showInstallBtn = !isInstalled && !modalDismissed;

  // Pulse the button after 3s to draw attention
  useEffect(() => {
    if (!showInstallBtn) return;
    const t = setTimeout(() => setInstallPulse(true), 3000);
    return () => clearTimeout(t);
  }, [showInstallBtn]);

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
    <>
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
        {/* Inner container */}
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
            <AppLogo size={32} radius={8} />
            <span
              className="shimmer-text"
              style={{
                fontSize: "1.05rem",
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
                onClick={clearSession}
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
                onClick={clearSession}
              >
                <LogOut size={13} strokeWidth={1.8} />
                Logout / Switch
              </NavLink>
            </>
          )}

          <style>{`nav::-webkit-scrollbar{display:none}`}</style>
        </nav>

          {/* Right: install btn + theme toggle + live clock */}
          <div
            style={{
              marginLeft: "16px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {session?.profile?.name && !isAuthPage && (
              <span
                title={session.profile.badge || session.profile.email || ""}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  maxWidth: "180px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {session.profile.name}
              </span>
            )}
            {/* ── PWA Install Button ── */}
            {showInstallBtn && (
              <div style={{ position: "relative" }}>
                {/* Pulse ring */}
                {installPulse && (
                  <span
                    style={{
                      position: "absolute",
                      inset: "-4px",
                      borderRadius: "10px",
                      border: "2px solid rgba(0,229,255,0.6)",
                      animation: "pwaRingPulse 2s ease-in-out infinite",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <button
                  id="pwa-install-btn"
                  onClick={() => setInstallModalOpen(true)}
                  title="Install TRINETRA as an app"
                  style={{
                    height: "32px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(58,123,213,0.15) 100%)",
                    border: "1px solid rgba(0,229,255,0.4)",
                    color: "#00e5ff",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    boxShadow: "0 0 12px rgba(0,229,255,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(0,229,255,0.25) 0%, rgba(58,123,213,0.25) 100%)";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(0,229,255,0.3)";
                    e.currentTarget.style.borderColor = "rgba(0,229,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(58,123,213,0.15) 100%)";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(0,229,255,0.15)";
                    e.currentTarget.style.borderColor = "rgba(0,229,255,0.4)";
                  }}
                >
                  <Download size={13} strokeWidth={2.2} />
                  Install App
                </button>
              </div>
            )}

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

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {/* Pulse keyframes */}
      <style>{`
        @keyframes pwaRingPulse {
          0%   { transform: scale(1);    opacity: 0.8; }
          50%  { transform: scale(1.12); opacity: 0.3; }
          100% { transform: scale(1);    opacity: 0.8; }
        }
      `}</style>
    </>
  );
}
