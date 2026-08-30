import React, { useState } from 'react';
import {
  Cpu,
  BrainCircuit,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  BarChart,
  HelpCircle,
  Award,
  Zap,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';
import { MOCK_MODEL_METRICS, MOCK_HOTSPOTS, MOCK_RL_FEEDBACK_LOGS } from '../data/mockData';

const DEFAULT_SHAP_FEATURES = [
  { name: 'High Complaint Velocity (1hr window)', impact: '+34%', positive: true },
  { name: 'UPI & Digital Arrest Chain Match', impact: '+22%', positive: true },
  { name: 'Off-site ATM Proximity Cluster', impact: '+18%', positive: true },
  { name: 'Inter-state Layering Velocity (MH -> DL)', impact: '+14%', positive: true },
  { name: 'Cardless Cashout Pattern Signal', impact: '+6%', positive: true }
];

export default function PredictiveAnalyticsPage({ onTriggerML, isRunningML }) {
  const [activeTab, setActiveTab] = useState('shap'); // 'shap' | 'models' | 'rl_feedback' | 'tuner'
  const [selectedHotspot, setSelectedHotspot] = useState(MOCK_HOTSPOTS[0] || null);
  const [rlLogs, setRlLogs] = useState(MOCK_RL_FEEDBACK_LOGS || []);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);

  // Model hyperparameter tuner state
  const [dbscanEps, setDbscanEps] = useState(2.0); // km
  const [dbscanMinPts, setDbscanMinPts] = useState(5);
  const [xgbThreshold, setXgbThreshold] = useState(0.75);

  const handleOfficerFeedback = (type) => {
    const newEntry = {
      id: rlLogs.length + 1,
      alert_id: `ALT-2026-0${890 + rlLogs.length}`,
      officer: 'Field Intercept Team (Current Session)',
      outcome: type === 'positive' ? 'TRUE_POSITIVE_INTERCEPTED' : 'FALSE_POSITIVE_FLAGGED',
      cash_seized: type === 'positive' ? 320000 : 0,
      reward_delta: type === 'positive' ? '+0.052' : '-0.031',
      timestamp: new Date().toLocaleTimeString('en-IN')
    };
    setRlLogs([newEntry, ...rlLogs]);
    setFeedbackSuccess(type === 'positive' ? 'Reinforcement reward logged: +0.052 weight adjustment.' : 'Penalty logged: -0.031 weight adjustment recorded.');
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  const currentHotspot = selectedHotspot || MOCK_HOTSPOTS[0] || {
    id: 1,
    cluster_id: 'DEL-NW-7',
    bank_name: 'State Bank of India',
    atm_id: 'ATM-DEL-NW-07',
    district: 'Rohini',
    state: 'Delhi',
    risk_score: 0.942
  };

  const shapFeatures = (currentHotspot && Array.isArray(currentHotspot.shap_features) && currentHotspot.shap_features.length > 0)
    ? currentHotspot.shap_features
    : DEFAULT_SHAP_FEATURES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 24px 28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Predictive AI</h2>
          <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>ML forecasting engine & SHAP explainability</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onTriggerML}
            disabled={isRunningML}
            className="cyber-btn"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} style={{ animation: isRunningML ? 'spin 1s linear infinite' : 'none' }} />
            {isRunningML ? 'Re-scoring Ensemble...' : 'Re-run Inference Pipeline'}
          </button>
        </div>
      </div>

      {/* KPI Cards: AI Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top-3 District Accuracy</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', margin: '4px 0' }}>
            {(parseFloat(MOCK_MODEL_METRICS.top3_district_accuracy || 0.742) * 100).toFixed(1)}%
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Held-out 10,000 samples test</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid #00d2ff' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Precision</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00d2ff', margin: '4px 0' }}>
            {(parseFloat(MOCK_MODEL_METRICS.precision || 0.928) * 100).toFixed(1)}%
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Recall: {(parseFloat(MOCK_MODEL_METRICS.recall || 0.951) * 100).toFixed(1)}% | F1: {MOCK_MODEL_METRICS.f1_score || '0.9393'}</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid #2ed573' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ST-DBSCAN Clusters</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2ed573', margin: '4px 0' }}>
            {MOCK_MODEL_METRICS.clusters_identified || 47} Active
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Avg Inter-cluster: {MOCK_MODEL_METRICS.avg_intercluster_distance || '2.4 km'}</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid #ffa502' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Feature-to-Sample Ratio</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffa502', margin: '4px 0' }}>
            1 : 1,053
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>38 features across 50k samples</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('shap')}
          className={`cyber-btn ${activeTab === 'shap' ? '' : 'cyber-btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '7px 14px' }}
        >
          <Sparkles size={14} /> SHAP (XAI) Explainability
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`cyber-btn ${activeTab === 'models' ? '' : 'cyber-btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '7px 14px' }}
        >
          <Cpu size={14} /> Multi-Stage Pipeline Specs
        </button>

        <button
          onClick={() => setActiveTab('rl_feedback')}
          className={`cyber-btn ${activeTab === 'rl_feedback' ? '' : 'cyber-btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '7px 14px' }}
        >
          <Award size={14} /> Reinforcement Learning (HITL)
        </button>

        <button
          onClick={() => setActiveTab('tuner')}
          className={`cyber-btn ${activeTab === 'tuner' ? '' : 'cyber-btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '7px 14px' }}
        >
          <Sliders size={14} /> Hyperparameter Tuning
        </button>
      </div>

      {/* Tab 1: SHAP (Explainable AI) Feature Importance Breakdown */}
      {activeTab === 'shap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
          {/* Left Cluster Selector */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="#00d2ff" /> Select Prediction Case
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Choose a predicted hotspot to inspect its Shapley feature attribution waterfall.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MOCK_HOTSPOTS.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedHotspot(h)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: currentHotspot.id === h.id ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${currentHotspot.id === h.id ? '#00d2ff' : 'var(--border-glass)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{h.cluster_id || `Cluster #${h.id}`}</span>
                    <span className="pulse-badge danger" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {(parseFloat(h.risk_score || 0.85) * 100).toFixed(0)}% Risk
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {h.bank_name || 'Target Bank'} • {h.district || 'Focus District'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right SHAP Waterfall Visualizer */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="pulse-badge primary" style={{ marginBottom: '6px' }}>
                  XAI INTERPRETABILITY ENGINE (SHAPLEY ATTRIBUTIONS)
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Why did the AI forecast cash extraction at {currentHotspot.bank_name || 'ATM Point'} ({currentHotspot.atm_id || 'ID Pending'})?
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  District: <strong>{currentHotspot.district || 'New Delhi'}, {currentHotspot.state || 'Delhi'}</strong> | Overall Predicted Risk Score: <strong>{(parseFloat(currentHotspot.risk_score || 0.942) * 100).toFixed(1)}%</strong>
                </p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)', textAlign: 'right' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Baseline Prior Probability</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>E[f(x)] = 12.4%</div>
              </div>
            </div>

            {/* Waterfall Factor List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shapFeatures.map((feature, idx) => {
                const numericImpact = parseInt((feature.impact || '+20%').replace(/[^0-9]/g, ''), 10) || 20;
                return (
                  <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                        #{idx + 1}. {feature.name}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: feature.positive ? '#ff4757' : '#2ed573' }}>
                        {feature.impact}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(numericImpact * 2.5, 100)}%`,
                          background: feature.positive ? 'linear-gradient(90deg, #ff6b81, #ff4757)' : '#2ed573',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LEA Trust Note */}
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.78rem', color: '#93c5fd' }}>
              <strong>🛡️ LEA Actionability Justification:</strong> The primary driver (+34%) is anomalous multi-mule velocity originating from cybercrime complaints within the last 60 minutes, converging onto off-site ATMs in {currentHotspot.district || 'Target Area'}. This establishes clear justification for proactive PCR team deployment.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Stage Pipeline Specs */}
      {activeTab === 'models' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00d2ff', marginBottom: '8px' }}>
              Task 1: Mule Account Scoring
            </h4>
            <table className="cyber-table">
              <tbody>
                <tr><td><strong>Algorithm</strong></td><td>XGBoost + GNN Node Classifier</td></tr>
                <tr><td><strong>Input Features</strong></td><td>Graph traversal hops, velocity score, account tenure</td></tr>
                <tr><td><strong>Output</strong></td><td>Probability account is a mule (0.00 – 1.00)</td></tr>
                <tr><td><strong>Threshold</strong></td><td>&ge; 0.85 &rarr; Flagged for Instant Freeze</td></tr>
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '8px' }}>
              Task 2: Cashout District Classifier
            </h4>
            <table className="cyber-table">
              <tbody>
                <tr><td><strong>Algorithm</strong></td><td>21-Class Tabular XGBoost + District Embeddings</td></tr>
                <tr><td><strong>Input Features</strong></td><td>38 NCRP features, victim pin, fraud category, amount band</td></tr>
                <tr><td><strong>Top-3 District Accuracy</strong></td><td><strong>74.2%</strong> on 10k hold-out test set</td></tr>
                <tr><td><strong>Coverage</strong></td><td>21 focus districts across 5 primary states</td></tr>
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff4757', marginBottom: '8px' }}>
              Task 3: ATM Hotspot Detection
            </h4>
            <table className="cyber-table">
              <tbody>
                <tr><td><strong>Algorithm</strong></td><td>ST-DBSCAN (Spatiotemporal Clustering)</td></tr>
                <tr><td><strong>ATM Population</strong></td><td>3,000 geocoded ATMs across target districts</td></tr>
                <tr><td><strong>Clusters Identified</strong></td><td>47 distinct withdrawal risk zones</td></tr>
                <tr><td><strong>Spatial Density</strong></td><td>Avg inter-cluster separation &gt; 2.0 km</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reinforcement Learning (Human-in-the-Loop) */}
      {activeTab === 'rl_feedback' && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                Reinforcement Learning from LEA Field Feedback (RLHF)
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Field officers report interception outcomes to continuously update ensemble reward/penalty scoring without manual re-training.
              </p>
            </div>

            {/* Simulated Feedback Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOfficerFeedback('positive')}
                className="cyber-btn"
                style={{ background: 'linear-gradient(135deg, #2ed573 0%, #10b981 100%)', fontSize: '0.78rem' }}
              >
                <ThumbsUp size={14} /> Log Intercepted (+Reward)
              </button>
              <button
                onClick={() => handleOfficerFeedback('negative')}
                className="cyber-btn-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                <ThumbsDown size={14} /> Log False Positive (-Penalty)
              </button>
            </div>
          </div>

          {feedbackSuccess && (
            <div style={{ background: 'rgba(46, 213, 115, 0.15)', border: '1px solid rgba(46, 213, 115, 0.4)', padding: '10px 14px', borderRadius: '8px', color: '#2ed573', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {feedbackSuccess}
            </div>
          )}

          <table className="cyber-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Reporting Officer / Unit</th>
                <th>Outcome Classification</th>
                <th>Cash Intercepted</th>
                <th>Reward Delta</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {rlLogs.map((log) => (
                <tr key={log.id}>
                  <td><strong>{log.alert_id}</strong></td>
                  <td>{log.officer}</td>
                  <td>
                    <span className={`pulse-badge ${log.outcome.includes('TRUE') || log.outcome.includes('FROZEN') ? 'success' : 'danger'}`}>
                      {log.outcome}
                    </span>
                  </td>
                  <td>₹{(log.cash_seized || 0).toLocaleString()}</td>
                  <td style={{ color: (log.reward_delta || '+0.0').startsWith('+') ? '#2ed573' : '#ff4757', fontWeight: 700 }}>
                    {log.reward_delta}
                  </td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Hyperparameter Tuner */}
      {activeTab === 'tuner' && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
            Spatial ML & Clustering Hyperparameter Configuration
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Adjust spatial density thresholds and decision boundaries for live prediction inference.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00d2ff', display: 'block', marginBottom: '8px' }}>
                ST-DBSCAN Epsilon (Radius Threshold): {dbscanEps} km
              </label>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={dbscanEps}
                onChange={(e) => setDbscanEps(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#00d2ff' }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Current optimum: 2.0 km inter-cluster separation</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8b5cf6', display: 'block', marginBottom: '8px' }}>
                ST-DBSCAN MinPts (Minimum Complaints): {dbscanMinPts} incidents
              </label>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={dbscanMinPts}
                onChange={(e) => setDbscanMinPts(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Prevents false positives on isolated single complaints</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff4757', display: 'block', marginBottom: '8px' }}>
                XGBoost Probability Decision Threshold: {xgbThreshold}
              </label>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={xgbThreshold}
                onChange={(e) => setXgbThreshold(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ff4757' }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>P1 Critical threat requires &ge; 0.85 probability</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
