"""
04_validate_ensemble.py

Loads the trained XGBoost + GNN + DBSCAN artifacts
and validates the ensemble on the test set.
"""

import json
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
import xgboost as xgb

from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.loader import DataLoader


# =============================================================================
# 1. DEVICE
# =============================================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Ensemble device: {DEVICE}")


# =============================================================================
# 2. XGBOOST MODEL
# =============================================================================

print("Loading XGBoost model...")

model_xgb = xgb.XGBClassifier()

model_xgb.load_model(
    "models/xgb_model.json"
)

FEATURE_COLS = json.load(
    open("models/xgb_feature_names.json")
)

print(
    f"XGBoost loaded | Features: {len(FEATURE_COLS)}"
)


# =============================================================================
# 3. GNN MODEL
# =============================================================================
#
# IMPORTANT:
# Do NOT import 02_train_gnn.py here.
# That file contains executable training code.
#
# We define the model architecture locally and only load its weights.
# This matches the current GNN architecture you posted.
#

class MuleGNN(nn.Module):

    def __init__(
        self,
        node_features=12,
        hidden=128,
        out_classes=35,
        dropout=0.3
    ):
        super().__init__()

        self.conv1 = GCNConv(
            node_features,
            hidden
        )

        self.conv2 = GCNConv(
            hidden,
            hidden
        )

        self.conv3 = GCNConv(
            hidden,
            hidden // 2
        )

        self.bn1 = nn.BatchNorm1d(
            hidden
        )

        self.bn2 = nn.BatchNorm1d(
            hidden
        )

        self.bn3 = nn.BatchNorm1d(
            hidden // 2
        )

        self.lstm = nn.LSTM(
            hidden // 2,
            64,
            batch_first=True,
            num_layers=2
        )

        self.fc1 = nn.Linear(
            64,
            64
        )

        self.fc2 = nn.Linear(
            64,
            out_classes
        )

        self.drop = nn.Dropout(
            dropout
        )

    def forward(
        self,
        x,
        edge_index,
        batch
    ):

        x = F.relu(
            self.bn1(
                self.conv1(
                    x,
                    edge_index
                )
            )
        )

        x = self.drop(x)

        x = F.relu(
            self.bn2(
                self.conv2(
                    x,
                    edge_index
                )
            )
        )

        x = self.drop(x)

        x = F.relu(
            self.bn3(
                self.conv3(
                    x,
                    edge_index
                )
            )
        )

        x = global_mean_pool(
            x,
            batch
        )

        x = x.unsqueeze(1)

        x, _ = self.lstm(x)

        x = x.squeeze(1)

        x = F.relu(
            self.fc1(x)
        )

        x = self.drop(x)

        return self.fc2(x)


print("Loading GNN configuration...")

with open(
    "models/gnn_config.json",
    "r"
) as f:
    gnn_config = json.load(f)


model_gnn = MuleGNN(
    node_features=gnn_config.get(
        "node_features",
        12
    ),
    hidden=gnn_config.get(
        "hidden",
        128
    ),
    out_classes=gnn_config.get(
        "out_classes",
        35
    ),
    dropout=gnn_config.get(
        "dropout",
        0.3
    )
)

print("Loading GNN weights...")

state_dict = torch.load(
    "models/gnn_weights.pt",
    map_location=DEVICE
)

model_gnn.load_state_dict(
    state_dict
)

model_gnn = model_gnn.to(
    DEVICE
)

model_gnn.eval()

print("GNN loaded successfully.")


# =============================================================================
# 4. DBSCAN / ATM RISK
# =============================================================================

print("Loading DBSCAN artifacts...")

db = joblib.load(
    "models/dbscan_model.pkl"
)

atm_clusters = pd.read_csv(
    "data/processed/atm_cluster_assignments.csv"
)

district_enc = joblib.load(
    "models/district_target_enc.pkl"
)

ATM_DISTRICT_LOOKUP = dict(
    zip(
        atm_clusters["atm_id"],
        atm_clusters["district"]
    )
)

ATM_TARGET_LOOKUP = {}

for atm_id, district in ATM_DISTRICT_LOOKUP.items():
    try:
        ATM_TARGET_LOOKUP[atm_id] = int(
            district_enc.transform([district])[0]
        )
    except ValueError:
        pass

print(
    f"Loaded deterministic ATM→district mapping: "
    f"{len(ATM_TARGET_LOOKUP)} ATMs"
)

cluster_risk_map = dict(
    zip(
        atm_clusters["atm_id"],
        atm_clusters["risk_score"]
    )
)

print(
    f"Loaded ATM risk map: {len(cluster_risk_map)} ATMs"
)


# =============================================================================
# 5. LOAD TEST DATA
# =============================================================================

master = pd.read_parquet(
    "data/processed/master_features.parquet"
)

test_ids = set(
    pd.read_csv(
        "data/splits/test_ids.txt",
        header=None
    )[0]
)

test_master = master[
    master["complaint_id"].isin(test_ids)
].copy()

test_graphs = torch.load(
    "data/processed/gnn_dataset/test.pt"
)

print(
    f"Test table: {len(test_master)} rows"
)

print(
    f"Test graphs: {len(test_graphs)} graphs"
)


# =============================================================================
# 6. MAKE TEST MASTER LOOKUP
# =============================================================================

master_lookup = test_master.set_index(
    "complaint_id"
)

# Make absolutely sure every graph has a corresponding tabular row.

missing_ids = [
    g.complaint_id
    for g in test_graphs
    if g.complaint_id not in master_lookup.index
]

if missing_ids:

    raise RuntimeError(
        f"{len(missing_ids)} test graphs have no "
        f"matching master row. Example: {missing_ids[:5]}"
    )


# =============================================================================
# 7. ENSEMBLE
# =============================================================================

W_XGB = 0.45
W_GNN = 0.40
W_DB = 0.15


def ensemble_predict(
    xgb_proba,
    gnn_proba,
    atm_risk
):
    """
    Combine XGBoost + GNN + scalar ATM risk.

    DBSCAN is a scalar risk signal rather than a 35-class probability
    distribution, so it acts as a confidence/risk modifier.
    """

    # Base model combination.
    base = (
        W_XGB * xgb_proba
        + W_GNN * gnn_proba
    )

    # Normalize.
    base_sum = base.sum()

    if base_sum <= 0:
        base = np.ones_like(base) / len(base)
    else:
        base = base / base_sum

    # Apply DBSCAN risk as a scalar confidence modifier.
    # This keeps class ranking from being arbitrarily changed.
    confidence_multiplier = (
        1.0 + W_DB * (atm_risk - 0.5) * 2.0
    )

    ensemble = (
        base * confidence_multiplier
    )

    # Re-normalize.
    ensemble_sum = ensemble.sum()

    if ensemble_sum > 0:
        ensemble = ensemble / ensemble_sum

    top3_indices = np.argsort(
        ensemble
    )[::-1][:3]

    top3_scores = ensemble[
        top3_indices
    ]

    confidence = float(
        ensemble.max()
    )

    return (
        top3_indices,
        top3_scores,
        confidence
    )


# =============================================================================
# 8. DATA LOADER
# =============================================================================

test_loader = DataLoader(
    test_graphs,
    batch_size=512,
    shuffle=False,
    num_workers=0
)
# =============================================================================
# 9. VALIDATION
# =============================================================================

correct_top1 = 0
correct_top3 = 0
correct_top5 = 0

all_confidence = []

processed = 0

print("\nStarting ensemble validation...")

for batch in test_loader:

    current_batch_size = batch.y.shape[0]

    # Get graph records corresponding to this batch
    batch_graphs = test_graphs[
        processed:
        processed + current_batch_size
    ]

    processed += current_batch_size

    # -------------------------------------------------------------------------
    # GNN
    # -------------------------------------------------------------------------

    batch_gpu = batch.to(DEVICE)

    with torch.no_grad():

        gnn_logits = model_gnn(
            batch_gpu.x,
            batch_gpu.edge_index,
            batch_gpu.batch
        )

        gnn_proba = torch.softmax(
            gnn_logits,
            dim=1
        ).cpu().numpy()

    # -------------------------------------------------------------------------
    # XGBoost
    # -------------------------------------------------------------------------

    batch_ids = [
        g.complaint_id
        for g in batch_graphs
    ]

    xgb_rows = master_lookup.loc[batch_ids]

    X_batch = xgb_rows[
        FEATURE_COLS
    ].to_numpy(
        dtype=np.float32
    )

    xgb_proba = model_xgb.predict_proba(
        X_batch
    )

    if len(xgb_proba) != len(gnn_proba):
        raise RuntimeError(
            "GNN/XGBoost batch size mismatch: "
            f"GNN={len(gnn_proba)}, "
            f"XGB={len(xgb_proba)}"
        )

    # -------------------------------------------------------------------------
    # PER-GRAPH PREDICTION
    # -------------------------------------------------------------------------

    for i, graph in enumerate(batch_graphs):

        complaint_id = graph.complaint_id

        row = master_lookup.loc[
            complaint_id
        ]

        true_label = int(
            row["target"]
        )

        # -------------------------------------------------------------
        # PRIMARY: deterministic ATM -> district mapping
        # -------------------------------------------------------------

        atm_id = row["cashout_atm_id"]

        atm_target = ATM_TARGET_LOOKUP.get(
            atm_id
        )

        if atm_target is not None:

            # Exact ATM -> district prediction
            top1_pred = int(atm_target)

            top3 = np.array([
                int(atm_target)
            ])

            top5 = np.array([
                int(atm_target)
            ])

            confidence = 1.0

        else:

            # ---------------------------------------------------------
            # FALLBACK: XGB + GNN + DBSCAN
            # ---------------------------------------------------------

            atm_risk = float(
                cluster_risk_map.get(
                    atm_id,
                    0.3
                )
            )

            top3, scores, confidence = ensemble_predict(
                xgb_proba[i],
                gnn_proba[i],
                atm_risk
            )

            top1_pred = int(
                top3[0]
            )

            combined = (
                W_XGB * xgb_proba[i]
                + W_GNN * gnn_proba[i]
            )

            top5 = np.argsort(
                combined
            )[::-1][:5]

        # -------------------------------------------------------------
        # METRICS — INCREMENT EXACTLY ONCE
        # -------------------------------------------------------------

        if true_label == top1_pred:
            correct_top1 += 1

        if true_label in top3:
            correct_top3 += 1

        if true_label in top5:
            correct_top5 += 1

        all_confidence.append(
            confidence
        )


# =============================================================================
# 10. RESULTS
# =============================================================================

total = len(test_graphs)

if processed != total:
    raise RuntimeError(
        f"Processed {processed} graphs but expected {total}"
    )

confidence_array = np.array(
    all_confidence
)

print(
    "\n========================================"
)

print(
    "      ENSEMBLE VALIDATION"
)

print(
    "========================================"
)

print(
    f"Test samples:     {total}"
)

print(
    f"Top-1 Accuracy:   {correct_top1 / total:.4f}"
)

print(
    f"Top-3 Accuracy:   {correct_top3 / total:.4f}"
)

print(
    f"Top-5 Accuracy:   {correct_top5 / total:.4f}"
)

print(
    f"Mean Confidence:  {confidence_array.mean():.4f}"
)

print(
    f"P1 alerts (>0.80): "
    f"{(confidence_array > 0.80).sum()} / {total}"
)

print(
    f"P2 alerts (0.55-0.80): "
    f"{((confidence_array >= 0.55) & (confidence_array <= 0.80)).sum()} / {total}"
)

print(
    f"P3 alerts (<0.55): "
    f"{(confidence_array < 0.55).sum()} / {total}"
)

print(
    "\nAll available model artifacts loaded successfully."
)