"""
00_data_prep.py
Loads all 4 CSVs, builds master feature table, creates temporal splits,
and writes processed data. Run this ONCE before any model training.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib, json, os

# ── 1. LOAD ──────────────────────────────────────────────────────────────────
complaints = pd.read_csv('data/raw/synthetic_ncrp_complaints.csv',
                         parse_dates=['fraud_timestamp', 'filed_at'])
transactions = pd.read_csv('data/raw/synthetic_mule_transactions.csv',
                            parse_dates=['txn_timestamp'])
atm = pd.read_csv('data/raw/synthetic_atm_master.csv')
priors = pd.read_csv('data/raw/ncrb_state_priors_used.csv')

print(f"Loaded: {len(complaints)} complaints, {len(transactions)} transactions")

# ── 2. BUILD CHAIN-LEVEL AGGREGATES (one row per complaint) ─────────────────
cashouts = transactions[transactions['is_cashout'] == True].copy()
non_cashouts = transactions[transactions['is_cashout'] == False].copy()

chain_stats = transactions.groupby('complaint_id').agg(
    num_hops            = ('hop_number', 'max'),
    chain_start_ts      = ('txn_timestamp', 'min'),
    chain_end_ts        = ('txn_timestamp', 'max'),
    cashout_district    = ('to_district', 'last'),      # last hop = cashout
    cashout_atm_id      = ('atm_id', 'last'),
    cashout_lat         = ('atm_lat', 'last'),
    cashout_lon         = ('atm_lon', 'last'),
    unique_banks        = ('to_bank', 'nunique'),
    unique_districts    = ('to_district', 'nunique'),
    amount_start        = ('amount', 'first'),
    amount_end          = ('amount', 'last'),
    intra_bank_hops     = ('from_bank', lambda x:
                           (x == transactions.loc[x.index, 'to_bank']).sum()),
).reset_index()

chain_stats['chain_duration_min'] = (
    (chain_stats['chain_end_ts'] - chain_stats['chain_start_ts'])
    .dt.total_seconds() / 60
).clip(lower=1)

chain_stats['amount_retention_pct'] = (
    chain_stats['amount_end'] / chain_stats['amount_start']
).clip(0, 1)

chain_stats['velocity_per_min'] = (
    chain_stats['amount_end'] / chain_stats['chain_duration_min']
)

chain_stats['intra_bank_ratio'] = (
    chain_stats['intra_bank_hops'] / chain_stats['num_hops']
)

# ── 3. MERGE COMPLAINT FEATURES ──────────────────────────────────────────────
master = complaints.merge(chain_stats, on='complaint_id', how='inner')

# Temporal features
master['hour_of_fraud']     = master['fraud_timestamp'].dt.hour
master['day_of_week']       = master['fraud_timestamp'].dt.dayofweek
master['month']             = master['fraud_timestamp'].dt.month
master['is_weekend']        = master['day_of_week'].isin([5, 6]).astype(int)
master['is_night']          = master['hour_of_fraud'].between(22, 6).astype(int)
master['filing_lag_min']    = (
    (master['filed_at'] - master['fraud_timestamp'])
    .dt.total_seconds() / 60
).clip(lower=0)

# Amount features
master['amount_log']        = np.log1p(master['amount_defrauded'])
master['amount_band']       = pd.cut(master['amount_defrauded'],
    bins=[0, 10000, 50000, 200000, 1000000, np.inf],
    labels=[0, 1, 2, 3, 4]).astype(int)

# Round-number flag (fraudsters often transfer round amounts)
master['is_round_amount']   = (master['amount_defrauded'] % 1000 < 50).astype(int)

# Velocity-of-Money score (calibrated to your data's distribution)
VOM_MAX = master['velocity_per_min'].quantile(0.95)  # ~₹14k/min at p95
master['vom_score'] = (
    (master['velocity_per_min'] / VOM_MAX) * master['amount_retention_pct']
).clip(0, 1)

master['is_hot_chain']      = (
    (master['vom_score'] > 0.7) & (master['chain_duration_min'] < 30)
).astype(int)

# ── 4. MERGE NCRB PRIORS ─────────────────────────────────────────────────────
# Use exactly the 4 engineered columns from ncrb_state_priors_used.csv
prior_cols = ['state', 'state_weight', 'crime_rate_norm',
              'cyber_activity', 'historical_activity']
priors_slim = priors[prior_cols].rename(columns={'state': 'victim_state'})
master = master.merge(priors_slim, on='victim_state', how='left')

# Fill any states not in priors with median (e.g. UTs)
for col in ['state_weight', 'crime_rate_norm', 'cyber_activity', 'historical_activity']:
    master[col].fillna(master[col].median(), inplace=True)

# ── 5. ENCODE CATEGORICALS ───────────────────────────────────────────────────
fraud_type_enc = LabelEncoder()
bank_enc = LabelEncoder()
state_enc = LabelEncoder()
district_target_enc = LabelEncoder()  # THIS IS THE TARGET ENCODER

master['fraud_type_enc']   = fraud_type_enc.fit_transform(master['fraud_type'])
master['bank_enc']         = bank_enc.fit_transform(master['bank_mentioned'])
master['victim_state_enc'] = state_enc.fit_transform(master['victim_state'])
master['target']           = district_target_enc.fit_transform(master['cashout_district'])

# Save encoders — critical for serving layer
os.makedirs('models', exist_ok=True)
joblib.dump(fraud_type_enc,    'models/fraud_type_enc.pkl')
joblib.dump(bank_enc,          'models/bank_enc.pkl')
joblib.dump(state_enc,         'models/state_enc.pkl')
joblib.dump(district_target_enc, 'models/district_target_enc.pkl')

with open('models/district_classes.json', 'w') as f:
    json.dump(district_target_enc.classes_.tolist(), f)

print(f"Target classes: {district_target_enc.classes_.tolist()}")  # 35 districts

# ── 6. TEMPORAL TRAIN/VAL/TEST SPLIT ─────────────────────────────────────────
# Rule: NEVER shuffle. Split by time to prevent data leakage.
# Train: Jan–Aug | Val: Sep–Oct | Test: Nov–Dec
train_mask = master['month'] <= 8
val_mask   = master['month'].between(9, 10)
test_mask  = master['month'] >= 11

train_ids = master.loc[train_mask, 'complaint_id'].values
val_ids   = master.loc[val_mask,   'complaint_id'].values
test_ids  = master.loc[test_mask,  'complaint_id'].values

print(f"Split — Train: {len(train_ids)} | Val: {len(val_ids)} | Test: {len(test_ids)}")
# Expected: ~33,249 | ~8,300 | ~8,451

os.makedirs('data/splits', exist_ok=True)
pd.Series(train_ids).to_csv('data/splits/train_ids.txt', index=False, header=False)
pd.Series(val_ids).to_csv('data/splits/val_ids.txt',     index=False, header=False)
pd.Series(test_ids).to_csv('data/splits/test_ids.txt',   index=False, header=False)

# ── 7. SAVE MASTER TABLE ─────────────────────────────────────────────────────
os.makedirs('data/processed', exist_ok=True)
master.to_parquet('data/processed/master_features.parquet', index=False)
print(f"Master table saved: {master.shape}")
print("Phase 1 complete. Run 01_train_dbscan.py next.")