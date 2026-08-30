import React from 'react';
<<<<<<< HEAD
import { ArrowUpRight, Shield, AlertOctagon, CheckCircle2, Server, Gauge } from 'lucide-react';
=======
import { ShieldAlert, MapPin, DollarSign, Cpu, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function StatsCards({ complaintsCount = 0, hotspotsCount = 0, totalFraudAmount = 0, mlStatus = 'ACTIVE' }) {
  const cards = [
    {
      title: "1930 Cybercrime Complaints",
      value: complaintsCount.toLocaleString(),
      icon: ShieldAlert,
      color: "#00e5ff",
      badge: "+12.4% Today",
      subtitle: "NCRB & 1930 Live Stream Feeds"
    },
    {
      title: "Predicted Cashout Hotspots",
      value: hotspotsCount,
      icon: MapPin,
      color: "#ff385c",
      badge: "Golden Window < 60m",
      subtitle: "Spatial ST-DBSCAN Risk Zones"
    },
    {
      title: "Target Fraud Pipeline",
      value: `₹${(totalFraudAmount / 100000).toFixed(2)} Lakhs`,
      icon: DollarSign,
      color: "#00e676",
      badge: "78.4% Intercept Rate",
      subtitle: "Multi-Hop Mule Layered Funds"
    },
    {
      title: "AI Predictive Engine",
      value: mlStatus,
      icon: Cpu,
      color: "#ffaa00",
      badge: "XGBoost 94.2% Acc",
      subtitle: "Real-time 21-District Inference"
    }
  ];
>>>>>>> test

export default function StatsCards({ complaintsCount, hotspotsCount, totalFraudAmount }) {
  return (
<<<<<<< HEAD
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Security Score (Gradient Blue Featured Card) */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-cyan-200" />
            <span className="text-xs font-semibold tracking-wide text-cyan-100 opacity-90">Security Score</span>
=======
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="glass-panel glass-panel-hover"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              borderLeft: `4px solid ${card.color}`
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: '3px 0', fontFamily: 'var(--font-display)' }}>
                {card.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                <span style={{ color: card.color, fontWeight: 700 }}>{card.badge}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.subtitle}
                </span>
              </div>
            </div>

            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: `${card.color}15`,
              border: `1px solid ${card.color}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              flexShrink: 0
            }}>
              <IconComponent size={22} />
            </div>
>>>>>>> test
          </div>
        </div>

        <div className="mt-4 z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">94</span>
            <span className="text-lg font-medium text-cyan-200 opacity-80">/100</span>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* Card 2: Active Threats */}
      <div className="theme-card theme-card-hover rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <AlertOctagon size={16} className="text-[var(--text-main)]" />
            <span>Active Threats</span>
          </div>
          <ArrowUpRight size={16} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            {complaintsCount ? complaintsCount : '182'}
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            ▾ 10.2% <span className="font-normal text-[var(--text-muted)] ml-1">vs yesterday</span>
          </span>
        </div>
      </div>

      {/* Card 3: Critical Incidents */}
      <div className="theme-card theme-card-hover rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <AlertOctagon size={16} className="text-[var(--text-main)]" />
            <span>Critical Incidents</span>
          </div>
          <ArrowUpRight size={16} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            {hotspotsCount ? hotspotsCount : '12'}
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
            ▴ 5 <span className="font-normal text-[var(--text-muted)] ml-1">vs yesterday</span>
          </span>
        </div>
      </div>

      {/* Card 4: Threats Blocked */}
      <div className="theme-card theme-card-hover rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <CheckCircle2 size={16} className="text-[var(--text-main)]" />
            <span>Threats Blocked</span>
          </div>
          <ArrowUpRight size={16} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            17,483
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            ▴ 8.5% <span className="font-normal text-[var(--text-muted)] ml-1">vs yesterday</span>
          </span>
        </div>
      </div>

      {/* Card 5: Vulnerable Assets */}
      <div className="theme-card theme-card-hover rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <Server size={16} className="text-[var(--text-main)]" />
            <span>Vulnerable Assets</span>
          </div>
          <ArrowUpRight size={16} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            255
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            ▴ 6.0% <span className="font-normal text-[var(--text-muted)] ml-1">vs yesterday</span>
          </span>
        </div>
      </div>
    </div>
  );
}
