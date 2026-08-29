import React from 'react';
import { ArrowUpRight, Shield, AlertOctagon, CheckCircle2, Server, Gauge } from 'lucide-react';

export default function StatsCards({ complaintsCount, hotspotsCount, totalFraudAmount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Security Score (Gradient Blue Featured Card) */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-cyan-200" />
            <span className="text-xs font-semibold tracking-wide text-cyan-100 opacity-90">Security Score</span>
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
