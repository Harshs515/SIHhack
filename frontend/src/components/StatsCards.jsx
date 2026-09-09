import React from "react";
import { ShieldAlert, MapPin, DollarSign, Cpu } from "lucide-react";

export default function StatsCards({
  complaintsCount = 0,
  hotspotsCount = 0,
  totalFraudAmount = 0,
  mlStatus = "ACTIVE",
}) {
  const cards = [
    {
      title: "1930 Cybercrime Complaints",
      value: complaintsCount.toLocaleString(),
      icon: ShieldAlert,
      color: "#00e5ff",
      badge: "+12.4% Today",
      subtitle: "NCRB & 1930 Live Stream Feeds",
    },
    {
      title: "Predicted Cashout Hotspots",
      value: hotspotsCount,
      icon: MapPin,
      color: "#ff385c",
      badge: "Golden Window < 60m",
      subtitle: "Spatial ST-DBSCAN Risk Zones",
    },
    {
      title: "Target Fraud Pipeline",
      value: `₹${(totalFraudAmount / 100000).toFixed(2)} Lakhs`,
      icon: DollarSign,
      color: "#00e676",
      badge: "78.4% Intercept Rate",
      subtitle: "Multi-Hop Mule Layered Funds",
    },
    {
      title: "AI Predictive Engine",
      value: mlStatus,
      icon: Cpu,
      color: "#ffaa00",
      badge: "XGBoost 94.2% Acc",
      subtitle: "Real-time 21-District Inference",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="glass-panel glass-panel-hover"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: "#fff",
                  margin: "3px 0",
                  fontFamily: "var(--font-display)",
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.7rem",
                }}
              >
                <span style={{ color: card.color, fontWeight: 700 }}>
                  {card.badge}
                </span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
                <span
                  style={{
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {card.subtitle}
                </span>
              </div>
            </div>

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: `${card.color}15`,
                border: `1px solid ${card.color}35`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
                flexShrink: 0,
              }}
            >
              <IconComponent size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
