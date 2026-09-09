import React, { useState } from "react";
import {
  GitFork,
  AlertOctagon,
  Terminal,
  ArrowRight,
  Ban,
  Building2,
  Play,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { MOCK_MULE_GRAPH } from "../data/mockData";

export default function MuleGraphPage() {
  const [selectedNode, setSelectedNode] = useState(MOCK_MULE_GRAPH.nodes[1]);
  const [frozenNodes, setFrozenNodes] = useState([]);
  const [cypherQuery, setCypherQuery] = useState(
    'MATCH path = (v:Victim {id: "VIC-01"})-[:TRANSFER*1..3]->(m:MuleAccount)-[:CASHOUT_AT]->(a:ATM)\nRETURN path, m.velocity_score, m.risk_score ORDER BY m.velocity_score DESC',
  );
  const [freezeNotification, setFreezeNotification] = useState(null);
  const [isSimulatingTrace, setIsSimulatingTrace] = useState(false);

  const handleFreezeAccount = (node) => {
    if (!frozenNodes.includes(node.id)) {
      setFrozenNodes([...frozenNodes, node.id]);
      setFreezeNotification(
        `🚨 Account ${node.account} (${node.bank}) FROZEN via 1930 / CFCFRMS Gateway.`,
      );
      setTimeout(() => setFreezeNotification(null), 4000);
    }
  };

  const handleSimulateTrace = () => {
    setIsSimulatingTrace(true);
    setTimeout(() => {
      setIsSimulatingTrace(false);
      setFreezeNotification(
        "⚡ Live Neo4j Graph Traversal Completed: 4 Nodes & 3 High-Velocity Edges Mapped.",
      );
      setTimeout(() => setFreezeNotification(null), 4000);
    }, 1000);
  };

  const sampleQueries = [
    {
      name: "3-Hop Trail",
      query:
        "MATCH path = (v:Victim)-[:TRANSFER*1..3]->(m:MuleAccount) RETURN path",
    },
    {
      name: "High Velocity > 0.85",
      query:
        "MATCH (m:MuleAccount) WHERE m.velocity_score > 0.85 RETURN m.account, m.bank",
    },
    {
      name: "ATM Cashout Convergence",
      query:
        "MATCH (m:MuleAccount)-[:CASHOUT_AT]->(a:ATM) RETURN a.atm_id, count(m)",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "12px 24px 28px",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "4px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            Mule Graph
          </h2>
          <p
            style={{
              fontSize: "0.66rem",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            Transaction chain explorer & account velocity
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleSimulateTrace}
            disabled={isSimulatingTrace}
            className="cyber-btn"
            style={{ fontSize: "0.8rem", padding: "7px 14px" }}
          >
            <Play
              size={13}
              style={{
                animation: isSimulatingTrace
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            />
            {isSimulatingTrace
              ? "Traversing Graph..."
              : "Simulate Graph Traversal"}
          </button>
        </div>
      </div>

      {freezeNotification && (
        <div
          style={{
            background: "rgba(255, 56, 92, 0.15)",
            border: "1px solid rgba(255, 56, 92, 0.4)",
            padding: "10px 16px",
            borderRadius: "8px",
            color: "#ff6b81",
            fontSize: "0.82rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertOctagon size={16} /> {freezeNotification}
        </div>
      )}

      {/* Main Content Layout: Visual Graph Flow + Node Inspector */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: "16px",
          minHeight: 0,
        }}
      >
        {/* Left: Interactive Multi-Hop Flow Cards */}
        <div
          className="glass-panel"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "0.96rem", fontWeight: 800, color: "#fff" }}>
              Active Mule Layering Chain: Case #2026MHA001284 (₹8.50 Lakhs
              Pipeline)
            </h3>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#00e5ff",
                fontFamily: "var(--font-mono)",
              }}
            >
              Bolt Protocol: neo4j://graph.i4c.gov.in:7687
            </span>
          </div>

          {/* FIX: Interleaved 5-Column Grid (3 data columns, 2 arrow columns) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)",
              gap: "24px 12px",
              padding: "12px 4px",
              alignItems: "stretch", // Ensures nodes on the same row are equal height
            }}
          >
            {MOCK_MULE_GRAPH.nodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              const isFrozen = frozenNodes.includes(node.id);

              const hasNext = index < MOCK_MULE_GRAPH.nodes.length - 1;
              const isEndOfRow = (index + 1) % 3 === 0;

              return (
                <React.Fragment key={node.id}>
                  {/* Node Box */}
                  <div style={{ minWidth: 0, height: "100%" }}>
                    <div
                      onClick={() => setSelectedNode(node)}
                      className="glass-panel-hover"
                      style={{
                        height: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: isFrozen
                          ? "rgba(255, 56, 92, 0.2)"
                          : isSelected
                            ? "rgba(0, 229, 255, 0.16)"
                            : "rgba(13, 20, 36, 0.85)",
                        border: `1.5px solid ${isFrozen ? "#ff385c" : isSelected ? "#00e5ff" : "var(--border-glass)"}`,
                        boxShadow: isSelected
                          ? "0 0 24px rgba(0, 229, 255, 0.35)"
                          : "none",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {isFrozen && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-1px",
                            right: "-1px",
                            background: "#ff385c",
                            color: "#fff",
                            fontSize: "0.55rem",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "0 12px 0 8px",
                          }}
                        >
                          FROZEN
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color:
                            node.type === "VICTIM"
                              ? "#00e5ff"
                              : node.type === "CASHOUT"
                                ? "#ff385c"
                                : "#ffaa00",
                          textTransform: "uppercase",
                        }}
                      >
                        {node.type.replace("_", " ")}
                      </span>

                      <h4
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#fff",
                          margin: "4px 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {node.label}
                      </h4>

                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {node.bank}
                      </div>

                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          color: "#00e676",
                          marginTop: "auto",
                          paddingTop: "6px",
                        }}
                      >
                        ₹{node.amount.toLocaleString()}
                      </div>

                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: node.risk > 0.8 ? "#ff385c" : "#ffaa00",
                          marginTop: "4px",
                          fontWeight: 700,
                        }}
                      >
                        Mule Risk: {(node.risk * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Interleaved Grid Arrow - Now a proper grid item, not absolute! */}
                  {hasNext && !isEndOfRow && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.55rem",
                          color: "#00e5ff",
                          fontWeight: 800,
                          background: "rgba(10,15,28,0.7)",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          marginBottom: "2px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {MOCK_MULE_GRAPH.links[index]?.txn_type || "IMPS"}
                      </span>
                      <ArrowRight size={18} color="#00e5ff" />
                      <span
                        style={{
                          fontSize: "0.5rem",
                          color: "var(--text-muted)",
                          background: "rgba(10,15,28,0.7)",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          marginTop: "2px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {MOCK_MULE_GRAPH.links[index]?.velocity || "< 10m"}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Cypher Query Console & Preset Queries */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.45)",
              borderRadius: "10px",
              padding: "14px",
              border: "1px solid var(--border-glass)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#ffaa00",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Terminal size={14} /> Cypher Graph Traversal Query
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                {sampleQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCypherQuery(sq.query)}
                    className="interactive-chip"
                    style={{ fontSize: "0.68rem", padding: "2px 8px" }}
                  >
                    {sq.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={cypherQuery}
              onChange={(e) => setCypherQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#070b14",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#00e5ff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.76rem",
                padding: "8px 10px",
                outline: "none",
                resize: "none",
              }}
            />
          </div>
        </div>

        {/* Right: Node Details & Actions */}
        <div
          className="glass-panel"
          style={{
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <h3
            style={{
              fontSize: "0.96rem",
              fontWeight: 800,
              color: "#fff",
              borderBottom: "1px solid var(--border-glass)",
              paddingBottom: "8px",
            }}
          >
            Node Intelligence Dossier
          </h3>

          {selectedNode ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Entity Identifier
                </span>
                <div
                  style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}
                >
                  {selectedNode.label}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "0.78rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}
                  >
                    Bank Name
                  </span>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#cbd5e1",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedNode.bank}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}
                  >
                    IFSC Prefix
                  </span>
                  <div style={{ fontWeight: 600, color: "#cbd5e1" }}>
                    {selectedNode.ifsc}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}
                  >
                    Account / ID
                  </span>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#00e5ff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedNode.account}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}
                  >
                    Mule Risk Score
                  </span>
                  <div
                    style={{
                      fontWeight: 800,
                      color: selectedNode.risk > 0.8 ? "#ff385c" : "#ffaa00",
                    }}
                  >
                    {(selectedNode.risk * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                }}
              >
                <span
                  style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}
                >
                  Registered Location
                </span>
                <div style={{ fontWeight: 600, color: "#cbd5e1" }}>
                  {selectedNode.city}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {selectedNode.type !== "VICTIM" && (
                  <button
                    onClick={() => handleFreezeAccount(selectedNode)}
                    disabled={frozenNodes.includes(selectedNode.id)}
                    className="cyber-btn cyber-btn-danger"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <Ban size={15} />
                    {frozenNodes.includes(selectedNode.id)
                      ? "Account Frozen"
                      : "Emergency Freeze Account (1930)"}
                  </button>
                )}

                <button
                  onClick={() =>
                    alert(
                      `Pre-alert sent to ${selectedNode.bank} Fraud Risk Desk.`,
                    )
                  }
                  className="cyber-btn cyber-btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Building2 size={15} /> Alert {selectedNode.bank} Nodal Desk
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                textAlign: "center",
                padding: "20px",
              }}
            >
              Click any node in the graph to inspect intelligence details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
