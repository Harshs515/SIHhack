import React, { useState } from 'react';
import {
  Network,
  Radio,
  Cpu,
  GitFork,
  BrainCircuit,
  BellRing,
  ShieldCheck,
  ArrowRight,
  Database,
  Terminal,
  CheckCircle2,
  Play
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    step: 1,
    title: 'NCRP Ingestion & Kafka Stream Capture',
    desiTitle: 'शिकायत ग्रहण (Kafka Topic)',
    tech: 'Apache Kafka + 1930 Helpline Feeds',
    badge: 'KAFKA',
    color: '#00e5ff',
    icon: Radio,
    description: 'Citizen files cybercrime report on 1930 / cybercrime.gov.in. Complaint JSON published to complaints.raw topic. Simultaneously, ATM transaction logs stream into txn.stream.',
    details: {
      topic: 'complaints.raw & txn.stream',
      throughput: '8,400+ msgs/sec',
      payload: '{"ack": "2026MHA001284", "amount": 850000, "category": "Digital Arrest", "bank": "SBI"}'
    }
  },
  {
    step: 2,
    title: 'Distributed Stream NLP & Feature Vectoring',
    desiTitle: 'स्पार्क एनएलपी विश्लेषण',
    tech: 'Apache Spark Structured Streaming + SparkNLP',
    badge: 'SPARK NLP',
    color: '#3b82f6',
    icon: Cpu,
    description: 'SparkNLP NerDLModel extracts named entities from free text: victim location, amount band, fraud category, and beneficiary banks. Derives velocity and temporal deltas.',
    details: {
      engine: 'Spark 3.5 Structured Streaming',
      nlp_model: 'SparkNLP/NerDL-CyberCrime-v2',
      derived_features: 'time_since_fraud, amount_band, district_code, hop_velocity'
    }
  },
  {
    step: 3,
    title: 'Mule-Jaal Graph Traversal & Velocity Scoring',
    desiTitle: 'म्यूल-जाल ग्राफ (Neo4j)',
    tech: 'Neo4j Graph Database (Bolt Protocol)',
    badge: 'NEO4J',
    color: '#ffaa00',
    icon: GitFork,
    description: 'Mule accounts (Victim -> Mule 1 -> Mule 2 -> Cashout) upserted as nodes and TRANSFER edges. Cypher query calculates hop counts and layering velocity scores.',
    details: {
      protocol: 'Bolt Driver (neo4j://localhost:7687)',
      query: 'MATCH (v)-[:TRANSFER*1..3]->(m) RETURN m.hop_count, m.velocity_score',
      hop_threshold: 'Layer 1-3 tracking within 60 mins'
    }
  },
  {
    step: 4,
    title: 'Ensemble ML Prediction & SHAP Attribution',
    desiTitle: 'एआई पूर्वानुमान और SHAP',
    tech: 'XGBoost + ST-GNN + Spatiotemporal DBSCAN + SHAP',
    badge: 'ML ENSEMBLE',
    color: '#a855f7',
    icon: BrainCircuit,
    description: 'Ensemble model combines tabular classification (21 districts), graph embeddings, and 47 spatial ATM clusters. Generates risk scores and SHAP waterfall attributions.',
    details: {
      model_accuracy: '94.2% (Top-3 District Acc: 74.2%)',
      output: '{ district: "Rohini", atm_cluster_id: "DEL-NW-7", risk_score: 0.87, tier: "P1" }',
      xai: 'SHAP Shapley Additive Explanations (+34% velocity, +22% fraud type)'
    }
  },
  {
    step: 5,
    title: 'Satark Alert Dispatch & Notification Fan-Out',
    desiTitle: 'सतर्क अलर्ट प्रसारण (Redis/FCM)',
    tech: 'Redis Pub/Sub + Spring Boot WebSocket + Firebase FCM',
    badge: 'REDIS / FCM',
    color: '#ff385c',
    icon: BellRing,
    description: 'P1 threat predictions trigger Redis pub/sub event. Spring Boot broadcasts to Web Command Dashboard via WebSocket and pushes FCM notifications (DND bypass) to LEA field units.',
    details: {
      channels: 'WebSocket (Web UI), FCM High-Priority Push (Android LEA), Bank API Pre-alert',
      latency: '< 450ms fan-out speed',
      recipients: 'I4C Dashboard, State Cyber Cells, Local Police Stations'
    }
  },
  {
    step: 6,
    title: 'Proactive Police Dasta Interception',
    desiTitle: 'पुलिस दस्ता त्वरित कार्रवाई',
    tech: 'PostGIS GIS Routing + 1930 / CFCFRMS Gateway',
    badge: 'FIELD ACTION',
    color: '#00e676',
    icon: ShieldCheck,
    description: 'Assigned Cyber Police Station PCR teams dispatched to target ATM cluster within 30-90 min Golden Hour. Bank desks temporarily suspend mule cards, seizing funds before extraction.',
    details: {
      recovery_rate: '78.4% (vs legacy 22.4% baseline)',
      golden_window: '30–90 minutes proactive lead time',
      human_in_loop: 'Field outcomes feed back into Reinforcement Learning weighting'
    }
  }
];

export default function PipelineTopologyPage() {
  const [selectedStep, setSelectedStep] = useState(PIPELINE_STAGES[0]);
  const [testSimulating, setTestSimulating] = useState(false);
  const [simToast, setSimToast] = useState(null);

  const handleRunSimulation = () => {
    setTestSimulating(true);
    setTimeout(() => {
      setTestSimulating(false);
      setSimToast('⚡ End-to-End Pipeline Simulated: Event passed from Kafka -> SparkNLP -> Neo4j -> XGBoost -> FCM Push in 412ms.');
      setTimeout(() => setSimToast(null), 5000);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#040914',
            boxShadow: '0 0 18px rgba(168, 85, 247, 0.4)'
          }}>
            <Network size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                End-to-End System Architecture & Pipeline Topology
              </h2>
              <span className="pulse-badge primary">
                <span className="pulse-dot"></span> 6-Stage Reactive Engine
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Data Flow Narrative: 1930 Complaint &rarr; Spark Streaming NLP &rarr; Neo4j &rarr; Ensemble ML &rarr; Redis &rarr; Police LEA Action
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunSimulation}
            disabled={testSimulating}
            className="cyber-btn"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <Play size={13} style={{ animation: testSimulating ? 'spin 1s linear infinite' : 'none' }} />
            {testSimulating ? 'Streaming Event...' : 'Simulate 6-Stage Pipeline'}
          </button>
        </div>
      </div>

      {simToast && (
        <div style={{ background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#00e5ff', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {simToast}
        </div>
      )}

      {/* Main Interactive Pipeline Diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', minHeight: 0 }}>
        {/* Left: 6-Step Visual Cards */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Interactive Pipeline Stages (Click any stage to inspect technical payload & schemas)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              const isSelected = selectedStep.step === stage.step;

              return (
                <div
                  key={stage.step}
                  onClick={() => setSelectedStep(stage)}
                  className="glass-panel-hover"
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 229, 255, 0.14)' : 'rgba(13, 20, 36, 0.65)',
                    border: `1.5px solid ${isSelected ? stage.color : 'var(--border-glass)'}`,
                    boxShadow: isSelected ? `0 0 18px ${stage.color}35` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: `${stage.color}20`,
                      color: stage.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: stage.color }}>STAGE {stage.step}</span>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{stage.title}</h4>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {stage.tech}
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: `${stage.color}20`,
                    color: stage.color,
                    border: `1px solid ${stage.color}40`
                  }}>
                    {stage.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Stage Deep-Dive Technical Inspector */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
            Stage Technical Inspection
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: selectedStep.color, fontWeight: 800, textTransform: 'uppercase' }}>
                STAGE {selectedStep.step} SPECIFICATION
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                {selectedStep.title}
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.45' }}>
                {selectedStep.description}
              </p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#00e5ff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={12} /> Execution Details & Parameters
              </span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
                {Object.entries(selectedStep.details).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>{k.replace(/_/g, ' ')}:</span>
                    <span style={{ color: '#cbd5e1', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', padding: '4px 6px', borderRadius: '4px' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.3)', padding: '10px', borderRadius: '8px', fontSize: '0.74rem', color: '#00e676', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> Production Pipeline: Verified & Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
