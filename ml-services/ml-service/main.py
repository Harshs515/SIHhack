"""
ML Service — SIH 2026
Wraps your trained models:
  - XGBoost  (xgb_model.json + xgb_feature_names.json)
  - DBSCAN   (dbscan_model.pkl + dbscan_ball_tree.pkl + dbscan_core_labels.pkl)
  - Encoders (bank_enc.pkl, district_target_enc.pkl, fraud_type_enc.pkl, state_enc.pkl)
  - GNN      (gnn_weights.pt — optional, skipped if torch unavailable)

POST /predict  → returns alert_level, risk_score, predicted_districts, shap_features
GET  /health   → liveness check
"""

import os, json, logging
import numpy  as np
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing   import List, Optional, Any

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ml-service")

app = FastAPI(title="SIH 2026 ML Service", version="1.0.0")

# ─────────────────────────────────────────────────────────────
# MODEL PATHS — adjust if your serve/ folder structure differs
# ─────────────────────────────────────────────────────────────
BASE = os.path.join(os.path.dirname(__file__), "models")

def load(filename):
    path = os.path.join(BASE, filename)
    if not os.path.exists(path):
        log.warning(f"Model file not found: {path}")
        return None
    log.info(f"Loading {filename}...")
    return joblib.load(path)

# ── Load XGBoost ──────────────────────────────────────────────
try:
    import xgboost as xgb
    xgb_model = xgb.XGBClassifier()
    xgb_path  = os.path.join(BASE, "xgb_model.json")
    if os.path.exists(xgb_path):
        xgb_model.load_model(xgb_path)
        log.info("✅ XGBoost loaded")
    else:
        xgb_model = None
        log.warning("⚠️  xgb_model.json not found")
except Exception as e:
    xgb_model = None
    log.warning(f"⚠️  XGBoost load failed: {e}")

# ── Load feature names ────────────────────────────────────────
try:
    with open(os.path.join(BASE, "xgb_feature_names.json")) as f:
        XGB_FEATURES = json.load(f)  # list of column names in training order
    log.info(f"✅ Feature names loaded: {len(XGB_FEATURES)} features")
except Exception as e:
    XGB_FEATURES = None
    log.warning(f"⚠️  xgb_feature_names.json load failed: {e}")

# ── Load DBSCAN ───────────────────────────────────────────────
dbscan_model      = load("dbscan_model.pkl")
dbscan_ball_tree  = load("dbscan_ball_tree.pkl")
dbscan_core_labels= load("dbscan_core_labels.pkl")

try:
    with open(os.path.join(BASE, "dbscan_config.json")) as f:
        dbscan_config = json.load(f)
    DBSCAN_EPS = dbscan_config.get("eps", 0.05)
except:
    DBSCAN_EPS = 0.05

# ── Load Encoders ─────────────────────────────────────────────
bank_enc          = load("bank_enc.pkl")
district_enc      = load("district_target_enc.pkl")
fraud_type_enc    = load("fraud_type_enc.pkl")
state_enc         = load("state_enc.pkl")

# ── Load district classes ─────────────────────────────────────
try:
    with open(os.path.join(BASE, "district_classes.json")) as f:
        DISTRICT_CLASSES = json.load(f)   # {0: "Rohini", 1: "Andheri", ...}
except:
    DISTRICT_CLASSES = {}

# ── Load GNN (optional) ───────────────────────────────────────
gnn_model = None
try:
    import torch
    from torch_geometric.nn import GCNConv   # only if torch_geometric installed
    gnn_weights_path = os.path.join(BASE, "gnn_weights.pt")
    if os.path.exists(gnn_weights_path):
        # Load weights only — full model class must be importable
        gnn_model = torch.load(gnn_weights_path, map_location='cpu')
        log.info("✅ GNN weights loaded")
except Exception as e:
    log.info(f"GNN not loaded (optional): {e}")

# ── Load SHAP (optional, for explainability) ──────────────────
try:
    import shap
    shap_explainer = shap.TreeExplainer(xgb_model) if xgb_model else None
    log.info("✅ SHAP explainer ready")
except Exception as e:
    shap_explainer = None
    log.info(f"SHAP not available: {e}")


# ─────────────────────────────────────────────────────────────
# REQUEST SCHEMA
# Matches exactly what simulationEngine.js sends
# ─────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    complaint_id:          str
    hour_of_fraud:         int   = 12
    day_of_week:           int   = 1
    month:                 int   = 1
    is_weekend:            int   = 0
    is_night:              int   = 0
    filing_lag_min:        float = 60.0
    amount_log:            float = 9.0
    amount_band:           int   = 1
    is_round_amount:       int   = 0
    amount_retention_pct:  float = 0.94
    amount_start:          float = 10000.0
    num_hops:              int   = 3
    chain_duration_min:    float = 45.0
    unique_banks:          int   = 2
    unique_districts:      int   = 2
    intra_bank_ratio:      float = 0.0
    vom_score:             float = 0.60
    is_hot_chain:          int   = 0
    velocity_per_min:      float = 400.0
    fraud_type_enc:        int   = 0
    bank_enc:              int   = 0
    victim_state_enc:      int   = 0
    state_weight:          float = 0.028
    crime_rate_norm:       float = 5.2
    cyber_activity:        float = 4.0
    historical_activity:   float = 2.0
    ncrb_crime_rate_2022:  float = 200.0
    ncrb_chargesheet_rate_2022: float = 75.0
    ncrb_motive_total:     float = 100.0
    ncrb_trend_2019_2021:  float = 0.5
    gnn_node_features:     List[Any] = []
    gnn_edge_src:          List[int] = []
    gnn_edge_dst:          List[int] = []
    cashout_atm_id:        Optional[int] = None
    victim_lat:            float = 28.6139
    victim_lng:            float = 77.2090
    victim_state:          str   = "Delhi"
    victim_district:       str   = "Central Delhi"


# ─────────────────────────────────────────────────────────────
# /predict
# ─────────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(req: PredictRequest):
    log.info(f"[/predict] {req.complaint_id}")

    # ── Step 1: Build feature vector in training order ────────
    feature_dict = {
        "hour_of_fraud":         req.hour_of_fraud,
        "day_of_week":           req.day_of_week,
        "month":                 req.month,
        "is_weekend":            req.is_weekend,
        "is_night":              req.is_night,
        "filing_lag_min":        req.filing_lag_min,
        "amount_log":            req.amount_log,
        "amount_band":           req.amount_band,
        "is_round_amount":       req.is_round_amount,
        "amount_retention_pct":  req.amount_retention_pct,
        "amount_start":          req.amount_start,
        "num_hops":              req.num_hops,
        "chain_duration_min":    req.chain_duration_min,
        "unique_banks":          req.unique_banks,
        "unique_districts":      req.unique_districts,
        "intra_bank_ratio":      req.intra_bank_ratio,
        "vom_score":             req.vom_score,
        "is_hot_chain":          req.is_hot_chain,
        "velocity_per_min":      req.velocity_per_min,
        "fraud_type_enc":        req.fraud_type_enc,
        "bank_enc":              req.bank_enc,
        "victim_state_enc":      req.victim_state_enc,
        "state_weight":          req.state_weight,
        "crime_rate_norm":       req.crime_rate_norm,
        "cyber_activity":        req.cyber_activity,
        "historical_activity":   req.historical_activity,
        "ncrb_crime_rate_2022":  req.ncrb_crime_rate_2022,
        "ncrb_chargesheet_rate_2022": req.ncrb_chargesheet_rate_2022,
        "ncrb_motive_total":     req.ncrb_motive_total,
        "ncrb_trend_2019_2021":  req.ncrb_trend_2019_2021,
    }

    # Reorder to match training feature order if feature names known
    if XGB_FEATURES:
        X = np.array([[feature_dict.get(f, 0.0) for f in XGB_FEATURES]])
    else:
        X = np.array([[v for v in feature_dict.values()]])

    # ── Step 2: XGBoost risk score ────────────────────────────
    if xgb_model:
        try:
            risk_score = float(xgb_model.predict_proba(X)[0][1])
        except Exception as e:
            log.warning(f"XGB predict failed: {e}")
            risk_score = _rule_score(req)
    else:
        risk_score = _rule_score(req)

    alert_level = "P1" if risk_score >= 0.80 else "P2" if risk_score >= 0.55 else "P3"

    # ── Step 3: DBSCAN — find nearest cluster ─────────────────
    predicted_district = req.victim_district
    cluster_id         = -1

    if dbscan_ball_tree is not None:
        try:
            point = np.radians([[req.victim_lat, req.victim_lng]])
            dist, idx = dbscan_ball_tree.query(point, k=1)
            if dist[0][0] < DBSCAN_EPS and dbscan_core_labels is not None:
                cluster_id = int(dbscan_core_labels[idx[0][0]])
                if str(cluster_id) in DISTRICT_CLASSES:
                    predicted_district = DISTRICT_CLASSES[str(cluster_id)]
        except Exception as e:
            log.warning(f"DBSCAN query failed: {e}")

    # ── Step 4: SHAP explanations ─────────────────────────────
    shap_top_features = []
    if shap_explainer is not None:
        try:
            sv = shap_explainer.shap_values(X)
            vals = sv[1][0] if isinstance(sv, list) else sv[0]
            feature_names = XGB_FEATURES or list(feature_dict.keys())
            pairs = sorted(zip(feature_names, vals), key=lambda x: abs(x[1]), reverse=True)
            shap_top_features = [
                {"feature": f, "value": round(float(v), 4)}
                for f, v in pairs[:5]
            ]
        except Exception as e:
            log.warning(f"SHAP failed: {e}")

    return {
        "complaint_id":        req.complaint_id,
        "risk_score":          round(risk_score, 4),
        "alert_level":         alert_level,
        "predicted_districts": [predicted_district],
        "cluster_id":          cluster_id,
        "shap_top_features":   shap_top_features,
        "model_used":          "xgboost+dbscan",
        "gnn_applied":         gnn_model is not None,
    }


def _rule_score(req: PredictRequest) -> float:
    """Fallback scoring when model files unavailable."""
    base = {0: 0.82, 1: 0.74, 2: 0.91, 3: 0.68, 4: 0.61, 5: 0.72}.get(req.fraud_type_enc, 0.58)
    mult = min(1.15, req.amount_log / 12)
    return min(0.97, base * mult)


@app.get("/health")
def health():
    return {
        "status":       "ok",
        "xgb_loaded":   xgb_model is not None,
        "dbscan_loaded": dbscan_ball_tree is not None,
        "gnn_loaded":   gnn_model is not None,
        "shap_ready":   shap_explainer is not None,
    }
