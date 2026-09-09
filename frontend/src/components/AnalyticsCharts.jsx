import React from 'react';
import { Info, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      {/* Threat Trend Area Chart */}
      <div className="theme-card rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[var(--text-main)]">Threat Trend</h3>
            <Info size={14} className="text-[var(--text-muted)] cursor-pointer" />
          </div>
          <select className="bg-[var(--bg-main)] text-xs border border-[var(--border-color)] rounded-lg px-2.5 py-1 font-medium text-[var(--text-muted)] outline-none">
            <option>24 Hours</option>
            <option>7 Days</option>
            <option>30 Days</option>
          </select>
        </div>

        {/* SVG Area Line Chart */}
        <div className="relative h-44 w-full mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" opacity="0.1" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="currentColor" opacity="0.1" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" opacity="0.1" strokeDasharray="3 3" />

            {/* Y axis labels */}
            <text x="0" y="24" className="text-[10px] fill-[var(--text-muted)]">800</text>
            <text x="0" y="64" className="text-[10px] fill-[var(--text-muted)]">600</text>
            <text x="0" y="104" className="text-[10px] fill-[var(--text-muted)]">400</text>

            {/* Area path */}
            <path
              d="M 30,95 Q 80,85 130,50 T 230,70 T 330,30 T 390,45 L 390,110 L 30,110 Z"
              fill="url(#trendGradient)"
            />

            {/* Smooth line path */}
            <path
              d="M 30,95 Q 80,85 130,50 T 230,70 T 330,30 T 390,45"
              fill="none"
              stroke="#00d2ff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Selected Tooltip Point */}
            <circle cx="215" cy="68" r="5" fill="#00d2ff" stroke="#ffffff" strokeWidth="2" />
            <line x1="215" y1="68" x2="215" y2="110" stroke="#00d2ff" strokeWidth="1" strokeDasharray="2 2" />

            {/* Tooltip Box */}
            <g transform="translate(180, 28)">
              <rect width="70" height="26" rx="6" fill="#0f172a" opacity="0.9" />
              <text x="35" y="14" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-medium">11:42</text>
              <text x="35" y="22" textAnchor="middle" fill="#00d2ff" className="text-[10px] font-bold">609</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Threat Distribution Donut Chart */}
      <div className="theme-card rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <h3 className="text-sm font-bold text-[var(--text-main)]">Threat Distribution</h3>
          <Info size={14} className="text-[var(--text-muted)] cursor-pointer" />
        </div>

        <div className="relative h-44 flex items-center justify-center">
          {/* Donut Chart SVG */}
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-color)" strokeWidth="14" />
            {/* Segment 1: Cyan (Digital Arrest / Phishing) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#00d2ff"
              strokeWidth="14"
              strokeDasharray="140 240"
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
            {/* Segment 2: Orange (OTP Fraud) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#ffa502"
              strokeWidth="14"
              strokeDasharray="60 240"
              strokeDashoffset="-140"
              transform="rotate(-90 50 50)"
            />
            {/* Segment 3: Red (Atm Mule Withdrawals) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#ff4757"
              strokeWidth="14"
              strokeDasharray="30 240"
              strokeDashoffset="-200"
              transform="rotate(-90 50 50)"
            />
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-extrabold text-[var(--text-main)] leading-tight">18,472</span>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total</span>
          </div>
        </div>
      </div>

      {/* Security Insights Banner */}
      <div className="theme-card rounded-2xl p-5 flex flex-col justify-between shadow-sm bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-sky-500/10 border-sky-500/20">
        <div className="flex items-center gap-2 text-sky-500">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
            <Sparkles size={16} />
          </div>
          <h3 className="text-sm font-bold text-sky-500">Security Insight</h3>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed my-3 font-normal">
          Ransomware and mule withdrawal activity <strong className="text-[var(--text-main)] font-semibold">increased 32%</strong> in the last 24 hours. Most attacks target <em className="not-italic text-sky-500 font-medium">Finance</em> and <em className="not-italic text-sky-500 font-medium">Engineering systems</em> via phishing emails with malicious attachments.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
          <span className="text-[11px] font-medium text-[var(--text-sub)]">AI Model Confidence: 96.4%</span>
          <button className="text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors flex items-center gap-1">
            View Analytics <TrendingUp size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
