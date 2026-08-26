import React from 'react';
import { ShieldAlert, MapPin, DollarSign, Cpu } from 'lucide-react';

export default function StatsCards({ complaintsCount, hotspotsCount, totalFraudAmount, mlStatus }) {
  const cards = [
    {
      title: "Total Complaints Logged",
      value: complaintsCount.toLocaleString(),
      icon: ShieldAlert,
      color: "#00d2ff",
      subtitle: "NCRB / 1930 Helpline Feeds"
    },
    {
      title: "Predicted ATM Hotspots",
      value: hotspotsCount,
      icon: MapPin,
      color: "#ff4757",
      subtitle: "DBSCAN + XGBoost Active Windows"
    },
    {
      title: "Target Fraud Volume",
      value: `₹${(totalFraudAmount / 100000).toFixed(2)} Lakhs`,
      icon: DollarSign,
      color: "#2ed573",
      subtitle: "Tracked Mule Accounts"
    },
    {
      title: "ML Engine Status",
      value: mlStatus,
      icon: Cpu,
      color: "#ffa502",
      subtitle: "Continuous Spatial Inference"
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="glass-panel glass-panel-hover" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${card.color}15`,
              border: `1px solid ${card.color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color
            }}>
              <IconComponent size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{card.title}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '2px 0' }}>{card.value}</div>
              <div style={{ fontSize: '0.72rem', color: card.color, fontWeight: 500 }}>{card.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
