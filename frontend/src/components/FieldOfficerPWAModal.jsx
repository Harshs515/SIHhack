import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  X,
  Share2,
  MoreVertical,
  PlusSquare,
  Shield,
  Zap,
} from "lucide-react";

export default function FieldOfficerPWAModal({ isOpen, onClose }) {
  const { canInstall, platform, triggerInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState(
    platform === "ios" ? "ios" : platform === "desktop" ? "desktop" : "android"
  );
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await triggerInstall();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
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
          background: "linear-gradient(180deg, #0b1120 0%, #070b14 100%)",
          border: "1px solid rgba(0, 229, 255, 0.35)",
          borderRadius: "18px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 229, 255, 0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 229, 255, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #00e5ff, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)",
              }}
            >
              <Shield size={22} color="#040914" strokeWidth={2.4} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                Install Field Officer App
              </div>
              <div
                style={{
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                Dedicated Progressive Web App (PWA) for On-Duty Officers
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {installedSuccess ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(0, 230, 118, 0.15)",
                  border: "1px solid #00e676",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={32} color="#00e676" />
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  fontWeight: 800,
                }}
              >
                Field Officer App Installed!
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  maxWidth: "340px",
                }}
              >
                The portal is now installed as a standalone app on your device
                for rapid tactical response.
              </p>
            </div>
          ) : (
            <>
              {/* Perks */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "rgba(0, 229, 255, 0.04)",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Zap size={16} color="#00e5ff" />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Instant Incident Alerts
                  </span>
                </div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.04)",
                    border: "1px solid rgba(59, 130, 246, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Shield size={16} color="#3b82f6" />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    ATM Surveillance Access
                  </span>
                </div>
              </div>

              {/* Native 1-Tap button if browser prompt ready */}
              {canInstall && (
                <div style={{ marginBottom: "18px" }}>
                  <button
                    onClick={handleInstallClick}
                    style={{
                      width: "100%",
                      padding: "13px 18px",
                      borderRadius: "12px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)",
                      color: "#040914",
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "9px",
                      boxShadow: "0 4px 20px rgba(0, 229, 255, 0.35)",
                      letterSpacing: "0.02em",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Download size={18} />
                    Install Field Officer App (1-Click)
                  </button>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    Native installation ready on this browser
                  </div>
                </div>
              )}

              {/* Device Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "4px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  marginBottom: "16px",
                }}
              >
                {[
                  { id: "android", label: "Android", icon: Smartphone },
                  { id: "ios", label: "iOS (iPhone/iPad)", icon: Smartphone },
                  { id: "desktop", label: "PC / Laptop", icon: Laptop },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        activeTab === id
                          ? "rgba(0, 229, 255, 0.15)"
                          : "transparent",
                      color: activeTab === id ? "#00e5ff" : "var(--text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: activeTab === id ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === "android" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Open this URL in <strong>Google Chrome</strong> on your
                      Android mobile.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>Tap the three dots</span>
                      <MoreVertical size={16} color="#ffffff" />
                      <span>in top-right corner.</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Select <strong>"Install app"</strong> or{" "}
                      <strong>"Add to Home screen"</strong>.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ios" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Open this page in <strong>Safari</strong> on your iPhone
                      or iPad.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>Tap the <strong>Share</strong> button</span>
                      <Share2 size={16} color="#00e5ff" />
                      <span>at the bottom.</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>Scroll down and tap</span>
                      <PlusSquare size={16} color="#00e676" />
                      <span><strong>"Add to Home Screen"</strong>.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "desktop" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      In Google Chrome or Microsoft Edge address bar, click the
                      <strong> Install icon</strong> (computer screen with down arrow) on the far right.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 229, 255, 0.15)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Click <strong>"Install"</strong> to launch the Field
                      Officer Portal in its own dedicated, borderless app window.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <button
            onClick={onClose}
            className="cyber-btn cyber-btn-secondary"
            style={{ padding: "8px 18px", fontSize: "0.8rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
