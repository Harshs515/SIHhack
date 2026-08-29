import React from 'react';
import { ArrowUpRight, Lock, Mail, FileText, Axe, Send, RefreshCw } from 'lucide-react';

export default function AlertsPanel({ hotspots, onTriggerML, isRunningML }) {
  // Mock threat feed items matching screenshot aesthetics + live LEA actionable intelligence
  const defaultFeedItems = [
    {
      id: 'tf-1',
      title: 'Ransomware Detected',
      detail: '192.168.10.45 ➔ SERVER-01',
      severity: 'Critical',
      badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      time: '8 sec ago',
      icon: Lock,
      isFlagged: true
    },
    {
      id: 'tf-2',
      title: 'Phishing Attempt Blocked',
      detail: '172.217.14.9 ➔ sarah@gmail.com',
      severity: 'High',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      time: '1 min ago',
      icon: Mail,
      isFlagged: false
    },
    {
      id: 'tf-3',
      title: 'Suspicious File Detected',
      detail: 'workstation-56 ➔ HR-LAPTOP-12',
      severity: 'Low',
      badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      time: '44 sec ago',
      icon: FileText,
      isFlagged: false
    },
    {
      id: 'tf-4',
      title: 'Brute Force Attack',
      detail: '192.168.10.45 ➔ VPN-GATEWAY',
      severity: 'Medium',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      time: '2 min ago',
      icon: Axe,
      isFlagged: true
    }
  ];

  return (
    <div className="theme-card rounded-2xl p-4 h-full flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight">Live Threats Feed</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerML}
            disabled={isRunningML}
            className="text-[11px] font-semibold text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRunningML ? 'animate-spin' : ''} />
            {isRunningML ? 'Scanning...' : 'Run ML Scan'}
          </button>
          <ArrowUpRight size={16} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1">
        {/* Hotspots / Interventions List */}
        {hotspots && hotspots.length > 0 && hotspots.map((h) => (
          <div
            key={`hs-${h.id}`}
            className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition-all flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                  <Lock size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] leading-snug">
                    {h.bank_name || 'ATM Withdrawal Risk'} ({h.atm_id})
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                    Target Vol: ₹{parseFloat(h.total_fraud_volume || 1050000).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-rose-500/10 text-rose-500 border-rose-500/20">
                  Critical
                </span>
                <span className="text-[10px] text-[var(--text-sub)]">Just now</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-10">
              {h.actionable_intelligence || 'Mule withdrawal forecast active. Immediate police station dispatch advised.'}
            </p>

            <div className="pl-10 pt-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-sky-500">
                LEA: {h.police_station_name || 'Cyber PS'}
              </span>
              <button className="text-[11px] font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white px-2.5 py-1 rounded-lg hover:brightness-110 shadow-sm transition-all flex items-center gap-1">
                <Send size={10} /> Dispatch Unit
              </button>
            </div>
          </div>
        ))}

        {/* Standard Threat Feed Items matching screenshot */}
        {defaultFeedItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] shrink-0 shadow-sm">
                  <IconComp size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.severity}
                </span>
                <span className="text-[10px] text-[var(--text-sub)]">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
