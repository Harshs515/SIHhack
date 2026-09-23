"""
predict_api.py
FastAPI inference server wrapping all 3 models.
Startup loads models into memory once. Each request gets ensemble prediction.
Target: <200ms p99 latency.
Run: uvicorn src.serve.predict_api:app --host 0.0.0.0 --port 8001 --workers 1
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import torch, xgboost as xgb, joblib, json, numpy as np
import time

app = FastAPI(title="CyberPrediction ML API", version="1.0")

# ── MODEL LOADING (once at startup) ──────────────────────────────────────────
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

@app.on_event("startup")
async def load_models():
    global model_xgb, model_gnn, district_enc, FEATURE_COLS
    global cluster_risk_map, db_ball_tree, db_core_labels, dbscan_config
    global MuleGNN_class  # imported from training module

    from .gnn_model import MuleGNN  # separate file with just the class def
    gnn_config = json.load(open('models/gnn_config.json'))
    
    model_gnn = MuleGNN(**{k:v for k,v in gnn_config.items()
                           if k in ['node_features','hidden','out_classes','dropout']})
    model_gnn.load_state_dict(torch.load('models/gnn_weights.pt', map_location=DEVICE))
    model_gnn = model_gnn.to(DEVICE).eval()
    
    model_xgb = xgb.XGBClassifier()
    model_xgb.load_model('models/xgb_model.json')
    
    district_enc    = joblib.load('models/district_target_enc.pkl')
    FEATURE_COLS    = json.load(open('models/xgb_feature_names.json'))
    db_ball_tree    = joblib.load('models/dbscan_ball_tree.pkl')
    db_core_labels  = joblib.load('models/dbscan_core_labels.pkl')
    dbscan_config   = json.load(open('models/dbscan_config.json'))
    
    import pandas as pd
    atm_df = pd.read_csv('data/processed/atm_cluster_assignments.csv')
    cluster_risk_map = dict(zip(atm_df['atm_id'], atm_df['risk_score']))
    
    print(f"All models loaded on {DEVICE}")

# ── REQUEST/RESPONSE SCHEMAS ──────────────────────────────────────────────────
class PredictRequest(BaseModel):
    # From Spark-enriched complaint event
    complaint_id:          str
    hour_of_fraud:         int
    day_of_week:           int
    month:                 int
    is_weekend:            int
    is_night:              int
    filing_lag_min:        float
    amount_log:            float
    amount_band:           int
    is_round_amount:       int
    amount_retention_pct:  float
    amount_start:          float
    num_hops:              int
    chain_duration_min:    float
    unique_banks:          int
    unique_districts:      int
    intra_bank_ratio:      float
    vom_score:             float
    is_hot_chain:          int
    velocity_per_min:      float
    state_weight:          float
    crime_rate_norm:       float
    cyber_activity:        float
    historical_activity:   float
    ncrb_crime_rate_2022:  float
    ncrb_chargesheet_rate_2022: float
    ncrb_motive_total:     float
    ncrb_trend_2019_2021:  float
    fraud_type_enc:        int
    bank_enc:              int
    victim_state_enc:      int
    # GNN graph tensors (serialized from Spark)
    gnn_node_features:     list    # [[f1..f12], [f1..f12], ...]
    gnn_edge_src:          list    # [0, 1, 2, ...]
    gnn_edge_dst:          list    # [1, 2, 3, ...]
    # DBSCAN input
    cashout_atm_id:        Optional[str] = None

class PredictResponse(BaseModel):
    complaint_id:       str
    predicted_districts: list   # Top-3 district names
    probabilities:      list    # Top-3 probabilities
    risk_score:         float   # Ensemble max probability
    alert_tier:         str     # P1 / P2 / P3
    vom_flag:           bool    # Hot chain flag
    inference_ms:       float

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    t0 = time.perf_counter()
    
    try:
        # ── XGBoost inference ────────────────────────────────────────────────
        xgb_features = np.array([[getattr(req, f) for f in FEATURE_COLS]])
        xgb_proba = model_xgb.predict_proba(xgb_features)[0]   # shape: (35,)
        
        # ── GNN inference ─────────────────────────────────────────────────────
        x = torch.tensor(req.gnn_node_features, dtype=torch.float).to(DEVICE)
        edge_index = torch.tensor(
            [req.gnn_edge_src, req.gnn_edge_dst], dtype=torch.long
        ).to(DEVICE)
        batch = torch.zeros(x.size(0), dtype=torch.long).to(DEVICE)
        
        with torch.no_grad():
            gnn_out = model_gnn(x, edge_index, batch)
            gnn_proba = torch.softmax(gnn_out, dim=1).cpu().numpy()[0]  # (35,)
        
        # ── DBSCAN risk modifier ──────────────────────────────────────────────
        atm_risk = cluster_risk_map.get(req.cashout_atm_id or '', 0.3)
        
        # ── Ensemble ──────────────────────────────────────────────────────────
        W_XGB, W_GNN, W_DB = 0.45, 0.40, 0.15
        ensemble = (W_XGB * xgb_proba + W_GNN * gnn_proba)
        ensemble = ensemble / ensemble.sum()
        ensemble = ensemble * (1 - W_DB) + atm_risk * W_DB * ensemble
        
        top3_idx = np.argsort(ensemble)[::-1][:3]
        top3_names = district_enc.inverse_transform(top3_idx).tolist()
        top3_probs = ensemble[top3_idx].tolist()
        risk_score = float(ensemble.max())
        
        alert_tier = ("P1" if risk_score >= 0.80 else
                      "P2" if risk_score >= 0.55 else "P3")
        
        return PredictResponse(
            complaint_id       = req.complaint_id,
            predicted_districts = top3_names,
            probabilities      = top3_probs,
            risk_score         = round(risk_score, 4),
            alert_tier         = alert_tier,
            vom_flag           = bool(req.is_hot_chain),
            inference_ms       = round((time.perf_counter() - t0) * 1000, 2)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "device": str(DEVICE)}