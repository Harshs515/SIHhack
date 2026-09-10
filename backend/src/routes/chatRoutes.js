const express = require('express');
const router = express.Router();

const KNOWLEDGE_BASE = [
  {
    keywords: ['gis', 'heatmap', 'map', 'location', 'atm cluster', 'zones', 'radius', 'hotspot'],
    route: '/gis-heatmap',
    routeLabel: 'Open GIS Risk Heatmap',
    reply: `The GIS Risk Heatmap visualizes real-time and forecasted ATM cash withdrawal risk zones across focus states.

• Red Zones: High-probability withdrawal clusters identified by spatial clustering algorithms.
• Candidate ATMs: Orange markers indicate ATMs categorized by monthly transaction density and proximity.
• Police Jurisdictions: Blue markers display local Cyber Police Stations and active patrol units.

You can adjust the buffer radius slider between 500 meters to 3 kilometers and apply time window filters to see where cashouts are most likely to occur.`
  },
  {
    keywords: ['ai', 'predict', 'ml', 'xgboost', 'shap', 'model', 'accuracy', 'xai', 'reinforcement', 'feedback'],
    route: '/predictive-analytics',
    routeLabel: 'Open Predictive AI Engine',
    reply: `The Predictive AI Engine uses an ensemble machine learning approach:

1. XGBoost Tabular Classifier: Achieves 74.2% top-3 district accuracy using 38 distinct cybercrime features.
2. Spatial DBSCAN: Groups nearby suspicious withdrawal patterns into 47 distinct risk clusters.
3. SHAP Explainable AI: Provides a transparent breakdown of why an alert was triggered, showing factors like complaint velocity and fraud category.
4. Officer Feedback Loop: Allows field officers to log confirmed interceptions or false alarms to continually adjust risk weights.`
  },
  {
    keywords: ['mule', 'graph', 'neo4j', 'chain', 'hop', 'freeze', 'bank', 'account', 'transfer'],
    route: '/mule-graph',
    routeLabel: 'Open Mule Chain Graph',
    reply: `The Mule Chain Graph maps out multi-hop money routing from victim to final cashout accounts using graph traversal:

• Layer Tracking: Shows how money moves from victim through Layer 1 and Layer 2 mule accounts to the ATM withdrawal point.
• Velocity Score: Measures how rapidly funds are transferred between different banks.
• Quick Action: You can trigger an emergency account freeze directly through the 1930 portal or alert the bank nodal risk desk.`
  },
  {
    keywords: ['police', 'dispatch', 'pcr', 'patrol', 'lea', 'intercept', 'station', 'officer'],
    route: '/lea-interface',
    routeLabel: 'Open Police & LEA Dispatch',
    reply: `The Police & LEA Dispatch console is designed for tactical field interception:

• Proximity Matching: Automatically routes the alert to the nearest Cyber Police Station.
• Patrol Vectoring: Assigns PCR patrol teams with estimated arrival times to target ATMs before cash extraction.
• Action Logging: Officers can update status from dispatched to on-scene and record successful cash seizures.`
  },
  {
    keywords: ['alert', 'fcm', 'push', 'broadcast', 'sms', 'notification', 'p1', 'p2'],
    route: '/alerts-center',
    routeLabel: 'Open Real-Time Alerts Hub',
    reply: `The Real-Time Alerts Hub broadcasts emergency warnings across multiple channels:

• P1 High Priority Alerts: Instant push notifications sent to field officer Android devices, designed to bypass Do Not Disturb.
• Bank Pre-Alerts: Automatically notifies bank managers and cash replenishment agencies to hold ATM dispensing.
• SMS & Email: Transmits emergency incident dispatches via secure government gateways.`
  },
  {
    keywords: ['ncrp', 'complaint', '1930', 'file', 'lodge', 'nlp', 'spark', 'ner'],
    route: '/ncrp-complaints',
    routeLabel: 'Open NCRP Complaint Triage',
    reply: `The NCRP Complaint Triage module ingests 1930 helpline complaints and uses natural language processing to extract key data:

• Entity Recognition: Identifies victim locations, fraud typologies, stolen amounts, and mentioned beneficiary banks from free-text descriptions.
• Live Presets: You can try sample scam scenarios with one tap to see how entities are extracted into machine learning feature vectors.`
  },
  {
    keywords: ['report', 'analytics', 'dossier', 'pdf', 'recovery', 'statistics', 'benchmark'],
    route: '/analytics-reports',
    routeLabel: 'Open Analytics & Reports',
    reply: `The Analytics & Reports section tracks overall performance and generates intelligence dossiers:

• Fund Recovery: Demonstrates a 78.4% proactive recovery rate compared to the legacy 22.4% baseline.
• Withdrawal Patterns: Highlights peak cash extraction windows within 30 to 90 minutes of the crime.
• Official Dossiers: Lets you export official restricted intelligence dossiers in PDF format for court and law enforcement use.`
  },
  {
    keywords: ['pipeline', 'architecture', 'kafka', 'spark', 'flow', 'topology', 'how it works'],
    route: '/pipeline-topology',
    routeLabel: 'Open Pipeline Topology',
    reply: `The system operates on a 6-stage reactive streaming pipeline:

1. Complaint Intake: Citizen complaints stream into Apache Kafka topics.
2. Stream NLP: Apache Spark extracts entities and calculates time deltas.
3. Graph Traversal: Neo4j maps out multi-hop account hops.
4. AI Prediction: XGBoost and DBSCAN forecast the exact ATM cluster.
5. Real-Time Alerts: Redis and FCM push notifications to officers.
6. Field Action: Police PCR units intercept the cash withdrawal within the golden hour.`
  },
  {
    keywords: ['help', 'guide', 'start', 'how to use', 'features', 'tour'],
    route: '/',
    routeLabel: 'Go to Command Center',
    reply: `Welcome to TRINETRA CyberDrishti. Here is a quick guide to help you navigate:

• Command Center: Central overview showing the live surveillance map and active alerts.
• GIS Risk Heatmap: View all 47 ATM clusters, candidate banks, and jurisdictional police stations.
• Predictive AI Engine: Inspect machine learning confidence scores and explainability factors.
• Mule Chain Graph: Trace how stolen funds travel across multiple accounts.
• Police Dispatch: Coordinate field patrol teams to intercept cashouts before they happen.`
  }
];

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lower = message.toLowerCase();
    
    // Match against intelligence domain knowledge base
    let matchedEntry = KNOWLEDGE_BASE.find(k =>
      k.keywords.some(kw => lower.includes(kw))
    );

    let reply = matchedEntry
      ? matchedEntry.reply
      : `I received your question regarding "${message}". As your TRINETRA Assistant, I can help you investigate ATM cash withdrawal hotspots, understand AI predictions, trace mule transactions, coordinate police dispatches, or triage 1930 complaints. You can select one of the suggestion chips or ask about any specific module.`;

    let route = matchedEntry ? matchedEntry.route : null;
    let routeLabel = matchedEntry ? matchedEntry.routeLabel : null;

    // Simulate AI response timing
    setTimeout(() => {
      res.json({
        reply,
        route,
        routeLabel,
        timestamp: new Date().toISOString()
      });
    }, 400);

  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
