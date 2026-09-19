"""
03_train_xgboost.py

Trains XGBoost multi-class district classifier.
"""

import os
import json
import joblib

import pandas as pd
import numpy as np
import xgboost as xgb
import shap

from sklearn.metrics import top_k_accuracy_score


# =============================================================================
# 0. DIRECTORIES
# =============================================================================

os.makedirs("models", exist_ok=True)


# =============================================================================
# 1. FEATURE SELECTION
# =============================================================================

FEATURE_COLS = [
    # Temporal
    "hour_of_fraud",
    "day_of_week",
    "month",
    "is_weekend",
    "is_night",
    "filing_lag_min",

    # Financial
    "amount_log",
    "amount_band",
    "is_round_amount",
    "amount_retention_pct",
    "amount_start",

    # Chain structure
    "num_hops",
    "chain_duration_min",
    "unique_banks",
    "unique_districts",
    "intra_bank_ratio",

    # Velocity of Money
    "vom_score",
    "is_hot_chain",
    "velocity_per_min",

    # NCRB
    "state_weight",
    "crime_rate_norm",
    "cyber_activity",
    "historical_activity",
    "ncrb_crime_rate_2022",
    "ncrb_chargesheet_rate_2022",
    "ncrb_motive_total",
    "ncrb_trend_2019_2021",

    # Encoded categoricals
    "fraud_type_enc",
    "bank_enc",
    "victim_state_enc",
]

TARGET_COL = "target"
N_CLASSES = 35


# =============================================================================
# 2. LOAD DATA
# =============================================================================

master = pd.read_parquet(
    "data/processed/master_features.parquet"
)

train_ids = set(
    pd.read_csv(
        "data/splits/train_ids.txt",
        header=None
    )[0]
)

val_ids = set(
    pd.read_csv(
        "data/splits/val_ids.txt",
        header=None
    )[0]
)

test_ids = set(
    pd.read_csv(
        "data/splits/test_ids.txt",
        header=None
    )[0]
)

train = master[
    master["complaint_id"].isin(train_ids)
].copy()

val = master[
    master["complaint_id"].isin(val_ids)
].copy()

test = master[
    master["complaint_id"].isin(test_ids)
].copy()


# =============================================================================
# 3. SAFETY CHECKS
# =============================================================================

assert TARGET_COL not in FEATURE_COLS
assert "cashout_district" not in FEATURE_COLS
assert "cashout_atm_id" not in FEATURE_COLS
assert "cashout_lat" not in FEATURE_COLS
assert "cashout_lon" not in FEATURE_COLS

X_train = train[FEATURE_COLS].to_numpy(dtype=np.float32)
y_train = train[TARGET_COL].to_numpy()

X_val = val[FEATURE_COLS].to_numpy(dtype=np.float32)
y_val = val[TARGET_COL].to_numpy()

X_test = test[FEATURE_COLS].to_numpy(dtype=np.float32)
y_test = test[TARGET_COL].to_numpy()

print(
    f"Train: {X_train.shape} | "
    f"Val: {X_val.shape} | "
    f"Test: {X_test.shape}"
)

print(
    f"Classes: {len(np.unique(y_train))} ({N_CLASSES} districts)"
)


# =============================================================================
# 4. TRAIN XGBOOST
# =============================================================================

model_xgb = xgb.XGBClassifier(
    n_estimators=800,
    max_depth=7,
    learning_rate=0.05,

    subsample=0.8,
    colsample_bytree=0.75,
    colsample_bylevel=0.75,

    min_child_weight=5,
    gamma=0.1,

    reg_alpha=0.1,
    reg_lambda=1.0,

    objective="multi:softprob",
    num_class=N_CLASSES,

    eval_metric=["mlogloss", "merror"],

    early_stopping_rounds=30,

    tree_method="hist",
    device="cpu",
    n_jobs=-1,

    random_state=42,
    verbosity=1,
)

print("\nStarting XGBoost training...")

model_xgb.fit(
    X_train,
    y_train,
    eval_set=[(X_val, y_val)],
    verbose=50
)


# =============================================================================
# 5. EVALUATION
# =============================================================================

proba_test = model_xgb.predict_proba(X_test)

top1 = top_k_accuracy_score(
    y_test,
    proba_test,
    k=1
)

top3 = top_k_accuracy_score(
    y_test,
    proba_test,
    k=3
)

top5 = top_k_accuracy_score(
    y_test,
    proba_test,
    k=5
)

print("\nXGBoost Results:")
print(f"  Top-1 Accuracy: {top1:.3f}")
print(f"  Top-3 Accuracy: {top3:.3f}")
print(f"  Top-5 Accuracy: {top5:.3f}")

print(
    f"  Best iteration: {model_xgb.best_iteration}"
)


# =============================================================================
# 6. SAVE MODEL FIRST
# =============================================================================
#
# IMPORTANT:
# Do this BEFORE SHAP.
# SHAP is only for explainability; it must never prevent the model
# artifact from being saved.
#

model_path = "models/xgb_model.json"

model_xgb.save_model(model_path)

print(f"\nXGBoost model saved: {model_path}")


with open(
    "models/xgb_feature_names.json",
    "w"
) as f:
    json.dump(
        FEATURE_COLS,
        f,
        indent=2
    )


with open(
    "models/xgb_metadata.json",
    "w"
) as f:
    json.dump(
        {
            "top1_test": round(float(top1), 4),
            "top3_test": round(float(top3), 4),
            "top5_test": round(float(top5), 4),
            "n_features": len(FEATURE_COLS),
            "n_classes": N_CLASSES,
            "best_iteration": int(
                model_xgb.best_iteration
            ),
        },
        f,
        indent=2
    )


# =============================================================================
# 7. SHAP
# =============================================================================

print("\nComputing SHAP values...")

try:
    # Small sample to keep SHAP reasonably fast.
    X_shap = X_test[:500]

    explainer = shap.TreeExplainer(
        model_xgb
    )

    # ============================================================
    # CRITICAL FIX:
    #
    # tree_limit = BOOSTING ROUNDS
    #
    # DO NOT multiply by number of classes.
    # ============================================================

    tree_limit = model_xgb.best_iteration + 1

    print(
        f"SHAP tree_limit = {tree_limit} "
        f"(best_iteration = {model_xgb.best_iteration})"
    )

    shap_values = explainer.shap_values(
        X_shap,
        tree_limit=tree_limit
    )

    print("SHAP values computed successfully.")

    # -----------------------------------------------------------------
    # Handle modern SHAP multiclass output:
    # [samples, features, classes]
    # -----------------------------------------------------------------

    if isinstance(shap_values, np.ndarray):

        if shap_values.ndim == 3:

            # Global feature importance across all classes.
            mean_abs_shap = np.abs(
                shap_values
            ).mean(axis=2)

        elif shap_values.ndim == 2:

            mean_abs_shap = np.abs(
                shap_values
            )

        else:
            raise ValueError(
                f"Unexpected SHAP ndarray shape: "
                f"{shap_values.shape}"
            )

    # -----------------------------------------------------------------
    # Handle older SHAP output:
    # list[class] -> [samples, features]
    # -----------------------------------------------------------------

    elif isinstance(shap_values, list):

        mean_abs_shap = np.mean(
            [
                np.abs(v)
                for v in shap_values
            ],
            axis=0
        )

    else:

        raise TypeError(
            f"Unexpected SHAP type: "
            f"{type(shap_values)}"
        )


    # =============================================================================
    # 8. SAVE SIMPLE GLOBAL SHAP PLOT
    # =============================================================================

    import matplotlib.pyplot as plt

    feature_importance = mean_abs_shap.mean(
        axis=0
    )

    top_n = min(
        20,
        len(FEATURE_COLS)
    )

    top_indices = np.argsort(
        feature_importance
    )[-top_n:]

    plt.figure(
        figsize=(10, 8)
    )

    plt.barh(
        range(top_n),
        feature_importance[top_indices]
    )

    plt.yticks(
        range(top_n),
        np.array(FEATURE_COLS)[top_indices]
    )

    plt.xlabel(
        "Mean Absolute SHAP Value"
    )

    plt.title(
        "XGBoost Feature Importance"
    )

    plt.tight_layout()

    plt.savefig(
        "models/shap_summary_plot.png",
        dpi=150,
        bbox_inches="tight"
    )

    plt.close()

    print(
        "SHAP plot saved to "
        "models/shap_summary_plot.png"
    )

except Exception as e:

    print(
        "\nWARNING: SHAP failed."
    )

    print(
        f"Reason: {type(e).__name__}: {e}"
    )

    print(
        "XGBoost model was already saved successfully."
    )


# =============================================================================
# 9. FINAL
# =============================================================================

print("\n========================================")
print("XGBoost training complete.")
print("========================================")
print(f"Model:   models/xgb_model.json")
print(f"Features: models/xgb_feature_names.json")
print(f"Metadata: models/xgb_metadata.json")

if os.path.exists(
    "models/shap_summary_plot.png"
):
    print(
        "SHAP:    models/shap_summary_plot.png"
    )
else:
    print(
        "SHAP:    not generated"
    )