import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Cpu, GitFork, ShieldAlert,
  BellRing, FileSpreadsheet, BarChart3, Network, Shield,
  TrendingUp, AlertTriangle, Activity, Banknote, Users,
  CheckCircle2, ArrowUpRight, Clock
} from 'lucide-react';
import {
  MOCK_COMPLAINTS, MOCK_HOTSPOTS, MOCK_ALERTS_STREAM,
  MOCK_HOURLY_CASHOUT_PATTERNS, MOCK_MODEL_METRICS
} from '../data/mockData';

/* ── Module definitions ────────────────────────────────────────── */
const MODULES = [
  { path: '/command-center',       label: 'Command Center',  icon: Shield,         accentColor: '#00e5ff', badge: 'LIVE',      badgeColor: 'success', desc: 'GIS war room'          },
  { path: '/gis-heatmap',          label: 'GIS Heatmap',     icon: MapPin,         accentColor: '#ff385c', badge: '47 Zones',  badgeColor: 'danger',  desc: 'ATM risk clusters'     },
  { path: '/predictive-analytics', label: 'Predictive AI',   icon: Cpu,            accentColor: '#a855f7', badge: 'XGBoost',   badgeColor: 'purple',  desc: 'ML forecasting engine' },
  { path: '/mule-graph',           label: 'Mule Graph',      icon: GitFork,        accentColor: '#ffaa00', badge: 'Neo4j',     badgeColor: 'warning', desc: 'Transaction chains'    },
  { path: '/lea-interface',        label: 'LEA Dispatch',    icon: ShieldAlert,    accentColor: '#00e676', badge: 'Active',    badgeColor: 'success', desc: 'PCR intercept'         },
  { path: '/alerts-center',        label: 'Alerts',          icon: BellRing,       accentColor: '#ff385c', badge: 'P1 P2',     badgeColor: 'danger',  desc: 'Real-time stream'      },
  { path: '/ncrp-complaints',      label: 'NCRP / 1930',     icon: FileSpreadsheet,accentColor: '#00e5ff', badge: '1930',      badgeColor: 'primary', desc: 'Complaint intake'      },
  { path: '/analytics-reports',    label: 'Analytics',       icon: BarChart3,      accentColor: '#3b82f6', badge: 'Reports',   badgeColor: 'blue',    desc: 'MHA benchmarks'        },
  { path: '/pipeline-topology',    label: 'Pipeline',        icon: Network,        accentColor: '#a855f7', badge: 'Real-Time', badgeColor: 'purple',  desc: 'Kafka → Neo4j'         },
];

const BADGE_COLORS = {
  success: { bg: 'rgba(0,230,118,0.1)',  color: '#00e676', border: 'rgba(0,230,118,0.25)' },
  danger:  { bg: 'rgba(255,56,92,0.1)',  color: '#ff385c', border: 'rgba(255,56,92,0.25)'  },
  warning: { bg: 'rgba(255,170,0,0.1)',  color: '#ffaa00', border: 'rgba(255,170,0,0.25)'  },
  primary: { bg: 'rgba(0,229,255,0.1)',  color: '#00e5ff', border: 'rgba(0,229,255,0.25)'  },
  purple:  { bg: 'rgba(168,85,247,0.1)', color: '#a855f7', border: 'rgba(168,85,247,0.25)' },
  blue:    { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
};

const TIER_COLORS = { P1: '#ff385c', P2: '#ffaa00', P3: '#3b82f6' };

/* ── Sparkline ─────────────────────────────────────────────────── */
function Sparkline({ data, color = '#00e5ff', height = 44 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 100, H = height;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${H - ((v - min) / range) * (H - 4)}`).join(' ');
  const fill = `0,${H} ${pts} ${(data.length - 1) * step},${H}`;
  const uid = color.replace('#', '');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#g${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Mini Donut ────────────────────────────────────────────────── */
function MiniDonut({ slices }) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  let cum = -90;
  const r = 32, cx = 40, cy = 40;
  const rad = d => (d * Math.PI) / 180;
  const arc = (start, sweep) => {
    if (sweep >= 359.9) sweep = 359.9;
    const s = { x: cx + r * Math.cos(rad(start)), y: cy + r * Math.sin(rad(start)) };
    const e = { x: cx + r * Math.cos(rad(start + sweep)), y: cy + r * Math.sin(rad(start + sweep)) };
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  };
  return (
    <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
      {slices.map((s, i) => {
        const sweep = (s.value / total) * 360;
        const d = arc(cum, sweep - 1.5);
        cum += sweep;
        return <path key={i} d={d} fill="none" stroke={s.color} strokeWidth={7} strokeLinecap="round" />;
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>{total}</text>
    </svg>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  return (
    <div className="dash-kpi-card dash-animate" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${accent}14`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={accent} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '5px' }}>{sub}</div>}
    </div>
  );
}

/* ── Module Card ───────────────────────────────────────────────── */
function ModuleCard({ path, label, icon: Icon, accentColor, badge, badgeColor, desc, delay = 0 }) {
  const navigate = useNavigate();
  const bc = BADGE_COLORS[badgeColor] || BADGE_COLORS.primary;
  return (
    <div
      className="dash-module-card dash-animate"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(path)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(path)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${accentColor}12`, border: `1px solid ${accentColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={accentColor} strokeWidth={1.8} />
        </div>
        <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`, letterSpacing: '0.05em' }}>{badge}</span>
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.63rem', color: accentColor }}>
        Open <ArrowUpRight size={10} />
      </div>
    </div>
  );
}

/* ══ Dashboard Page ════════════════════════════════════════════════ */
export default function DashboardPage({ complaints = MOCK_COMPLAINTS, hotspots = MOCK_HOTSPOTS }) {
  const totalFraud = useMemo(() => complaints.reduce((s, c) => s + (parseFloat(c.fraud_amount) || 0), 0), [complaints]);
  const p1Count = hotspots.filter(h => h.alert_tier === 'P1').length;
  const p2Count = hotspots.filter(h => h.alert_tier === 'P2').length;
  const p3Count = Math.max(hotspots.length - p1Count - p2Count, 1);
  const sparkData = MOCK_HOURLY_CASHOUT_PATTERNS.map(d => d.volume_lakhs);
  const recentAlerts = MOCK_ALERTS_STREAM.slice(0, 5);

  return (
    <div style={{ padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Page header ── */}
      <div className="dash-animate" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.02em' }}>
            Overview
          </h2>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00e676', boxShadow: '0 0 7px #00e676', display: 'inline-block' }} />
          <span style={{ fontSize: '0.68rem', color: '#00e676', fontWeight: 600 }}>Systems Operational</span>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
        <KpiCard icon={FileSpreadsheet} label="Complaints"    value={complaints.length}                                accent="#00e5ff" sub="Active intake"     delay={0}   />
        <KpiCard icon={AlertTriangle}   label="Hotspots"      value={hotspots.length}                                  accent="#ff385c" sub={`${p1Count} P1`}   delay={50}  />
        <KpiCard icon={Banknote}        label="Fraud Volume"  value={`₹${(totalFraud/100000).toFixed(1)}L`}            accent="#ffaa00" sub="Interceptable"      delay={100} />
        <KpiCard icon={Users}           label="Mule Accounts" value="3,842"                                             accent="#a855f7" sub="Flagged"            delay={150} />
        <KpiCard icon={TrendingUp}      label="Recovery Rate" value="79.4%"                                             accent="#00e676" sub="vs 22% baseline"    delay={200} />
        <KpiCard icon={Activity}        label="Active Alerts" value={MOCK_ALERTS_STREAM.length}                         accent="#ff385c" sub={`${p1Count}P1 · ${p2Count}P2`} delay={250} />
      </div>

      {/* ── Body: module grid (left) + side panel (right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: '14px', alignItems: 'start' }}>

        {/* Module grid */}
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Intelligence Modules
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {MODULES.map((m, i) => <ModuleCard key={m.path} {...m} delay={i * 35} />)}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Sparkline card */}
          <div className="dash-kpi-card dash-animate" style={{ animationDelay: '180ms', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Cashout Trend</span>
              <span style={{ fontSize: '0.6rem', color: '#00e5ff' }}>₹ Lakhs / hr</span>
            </div>
            <Sparkline data={sparkData} color="#00e5ff" height={44} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              <span>00:00</span><span style={{ color: '#ffaa00' }}>Peak 19:00</span><span>23:00</span>
            </div>
          </div>

          {/* Donut card */}
          <div className="dash-kpi-card dash-animate" style={{ animationDelay: '230ms', gap: '10px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Alert Tiers</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <MiniDonut slices={[
                { value: p1Count || 2, color: '#ff385c' },
                { value: p2Count || 2, color: '#ffaa00' },
                { value: p3Count,      color: '#3b82f6' },
              ]} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[['P1 Critical', p1Count || 2, '#ff385c'], ['P2 High', p2Count || 2, '#ffaa00'], ['P3 Watch', p3Count, '#3b82f6']].map(([t, v, c]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flex: 1 }}>{t}</span>
                    <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="dash-kpi-card dash-animate" style={{ animationDelay: '280ms', gap: '10px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Recent Alerts</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentAlerts.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  paddingBottom: i < recentAlerts.length - 1 ? '8px' : '0',
                  borderBottom: i < recentAlerts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.57rem', fontWeight: 800, background: `${TIER_COLORS[a.tier]}14`, color: TIER_COLORS[a.tier], border: `1px solid ${TIER_COLORS[a.tier]}30`, flexShrink: 0 }}>{a.tier}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.district}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>₹{(a.target_volume/100000).toFixed(1)}L</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Model health bar ── */}
      <div className="dash-animate" style={{
        animationDelay: '380ms',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
        padding: '10px 16px', borderRadius: '9px',
        background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircle2 size={13} color="#00e676" />
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Model</span>
          <span style={{ fontSize: '0.66rem', color: '#00e5ff', fontWeight: 700 }}>{MOCK_MODEL_METRICS.version}</span>
        </div>
        {[
          ['Accuracy',  `${(MOCK_MODEL_METRICS.overall_accuracy * 100).toFixed(1)}%`],
          ['Precision', `${(MOCK_MODEL_METRICS.precision * 100).toFixed(1)}%`],
          ['Recall',    `${(MOCK_MODEL_METRICS.recall * 100).toFixed(1)}%`],
          ['F1',        `${(MOCK_MODEL_METRICS.f1_score * 100).toFixed(1)}%`],
          ['Clusters',  MOCK_MODEL_METRICS.clusters_identified],
          ['Window',    MOCK_MODEL_METRICS.golden_hour_window],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontSize: '0.68rem', color: '#e2e8f0', fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
