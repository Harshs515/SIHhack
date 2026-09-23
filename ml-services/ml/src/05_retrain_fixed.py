"""
05_retrain_fixed.py
Fixes class imbalance and retrains XGBoost for 90%+ top-1 accuracy.
Run from ml/ directory: python src/05_retrain_fixed.py
"""

import pandas as pd
import numpy  as np
import json, os, joblib
from pathlib import Path
import xgboost as xgb
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing   import LabelEncoder
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.metrics import classification_report, top_k_accuracy_score

DATA_DIR   = Path("data/processed")
MODELS_DIR = Path("models")

# ── 1. Load master features ───────────────────────────────────
print("Loading master_features.parquet...")
df = pd.read_parquet(DATA_DIR / "master_features.parquet")
print(f"Shape: {df.shape}")
print(f"Target distribution:\n{df['target'].value_counts().head(20)}")

# ── 2. Load the feature names your model expects ──────────────
with open(MODELS_DIR / "xgb_feature_names.json") as f:
    FEATURE_NAMES = json.load(f)
print(f"\nFeatures ({len(FEATURE_NAMES)}): {FEATURE_NAMES[:5]}...")

# ── 3. Check for class imbalance ──────────────────────────────
target_col = "target"
class_counts = df[target_col].value_counts()
print(f"\nClass count stats:")
print(f"  Min class size: {class_counts.min()}")
print(f"  Max class size: {class_counts.max()}")
print(f"  Imbalance ratio: {class_counts.max()/class_counts.min():.1f}x")

# ── 4. Remove classes with < 5 samples (can't stratify) ───────
min_samples = 5
valid_classes = class_counts[class_counts >= min_samples].index
df = df[df[target_col].isin(valid_classes)].copy()
print(f"\nAfter removing rare classes: {df.shape[0]} rows, {len(valid_classes)} classes")

# ── 5. Re-encode target to be contiguous 0..N ─────────────────
le = LabelEncoder()
df["y"] = le.fit_transform(df[target_col])
n_classes = len(le.classes_)
print(f"Final n_classes: {n_classes}")

# ── 6. Build X, y ────────────────────────────────────────────
# Only use columns that exist in the dataframe
available = [c for c in FEATURE_NAMES if c in df.columns]
missing   = [c for c in FEATURE_NAMES if c not in df.columns]
if missing:
    print(f"⚠️  Missing features (will be zero-filled): {missing}")
    for c in missing:
        df[c] = 0.0

X = df[FEATURE_NAMES].fillna(0).values
y = df["y"].values

# ── 7. Compute sample weights to handle class imbalance ───────
sample_weights = compute_sample_weight("balanced", y)

# ── 8. Train/val split (stratified) ───────────────────────────
from sklearn.model_selection import train_test_split
X_train, X_val, y_train, y_val, sw_train, _ = train_test_split(
    X, y, sample_weights,
    test_size=0.2,
    random_state=42,
    stratify=y
)
print(f"\nTrain: {X_train.shape[0]}, Val: {X_val.shape[0]}")

# ── 9. XGBoost with proper class-balance config ───────────────
model = xgb.XGBClassifier(
    n_estimators      = 500,
    max_depth         = 6,
    learning_rate     = 0.05,
    subsample         = 0.8,
    colsample_bytree  = 0.8,
    min_child_weight  = 3,
    gamma             = 0.1,
    reg_alpha         = 0.1,
    reg_lambda        = 1.0,
    objective         = "multi:softprob",
    num_class         = n_classes,
    eval_metric       = ["mlogloss", "merror"],
    device            = "cuda",    # remove if no GPU
    random_state      = 42,
    early_stopping_rounds = 30,
)

print("\nTraining XGBoost...")
model.fit(
    X_train, y_train,
    sample_weight        = sw_train,
    eval_set             = [(X_val, y_val)],
    verbose              = 50,
)

# ── 10. Evaluate ─────────────────────────────────────────────
y_prob = model.predict_proba(X_val)
y_pred = np.argmax(y_prob, axis=1)

top1 = np.mean(y_pred == y_val)
top3 = top_k_accuracy_score(y_val, y_prob, k=min(3, n_classes))
top5 = top_k_accuracy_score(y_val, y_prob, k=min(5, n_classes))

print(f"\n{'='*40}")
print(f"RETRAINED MODEL METRICS")
print(f"{'='*40}")
print(f"Top-1 Accuracy: {top1:.4f} ({top1*100:.1f}%)")
print(f"Top-3 Accuracy: {top3:.4f} ({top3*100:.1f}%)")
print(f"Top-5 Accuracy: {top5:.4f} ({top5*100:.1f}%)")

# Alert distribution check
p1 = np.sum(y_prob.max(axis=1) >= 0.80)
p2 = np.sum((y_prob.max(axis=1) >= 0.55) & (y_prob.max(axis=1) < 0.80))
p3 = np.sum(y_prob.max(axis=1) < 0.55)
print(f"\nAlert distribution (val set):")
print(f"  P1 (conf≥0.80): {p1} ({p1/len(y_val)*100:.1f}%)")
print(f"  P2 (conf≥0.55): {p2} ({p2/len(y_val)*100:.1f}%)")
print(f"  P3 (conf<0.55): {p3} ({p3/len(y_val)*100:.1f}%)")

# ── 11. Fix alert thresholds based on actual distribution ─────
# If model is well-calibrated but percentile-based thresholds work better:
confidences = y_prob.max(axis=1)
p75 = np.percentile(confidences, 75)
p40 = np.percentile(confidences, 40)
print(f"\nSuggested adaptive thresholds:")
print(f"  P1 threshold (top 25%): {p75:.3f}")
print(f"  P2 threshold (top 60%): {p40:.3f}")
print(f"  → Set P1_THRESHOLD={p75:.3f}, P2_THRESHOLD={p40:.3f} in your ML service")

# ── 12. Save retrained model and updated label encoder ────────
model.save_model(str(MODELS_DIR / "xgb_model.json"))
joblib.dump(le, MODELS_DIR / "district_label_encoder.pkl")

# Save thresholds
thresholds = {
    "p1_threshold": float(round(p75, 3)),
    "p2_threshold": float(round(p40, 3)),
    "n_classes":    n_classes,
    "top1_val":     float(round(top1, 4)),
    "top3_val":     float(round(top3, 4)),
}
with open(MODELS_DIR / "xgb_metadata.json", "w") as f:
    json.dump(thresholds, f, indent=2)

print(f"\n✅ Saved: models/xgb_model.json")
print(f"✅ Saved: models/district_label_encoder.pkl")
print(f"✅ Saved: models/xgb_metadata.json (with adaptive thresholds)")
print("\nRe-run 04_validate_ensemble.py to confirm improvement.")