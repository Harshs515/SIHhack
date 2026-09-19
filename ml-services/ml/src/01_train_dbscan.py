"""
01_train_dbscan.py
Fits spatial clustering on historical cashout events.
Assigns every ATM a cluster_id and cluster-level risk score.
Runtime: ~2 minutes on your CPU.
"""
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import joblib, json

# ── 1. BUILD CASHOUT POINT CLOUD ─────────────────────────────────────────────
transactions = pd.read_csv('data/raw/synthetic_mule_transactions.csv',
                            parse_dates=['txn_timestamp'])
cashouts = transactions[transactions['is_cashout'] == True].dropna(
    subset=['atm_lat', 'atm_lon']).copy()

# Add temporal features for ST component
cashouts['hour_of_day'] = cashouts['txn_timestamp'].dt.hour
cashouts['day_of_week'] = cashouts['txn_timestamp'].dt.dayofweek

# ── 2. SPATIAL-ONLY DBSCAN (PRIMARY MODEL) ───────────────────────────────────
# Convert lat/lon to metres for meaningful eps
# ~111km per degree latitude; scale longitude by cos(mean_lat)
mean_lat = cashouts['atm_lat'].mean()          # ~23°N for India
lat_scale = 111_000                            # metres per degree lat
lon_scale = 111_000 * np.cos(np.radians(mean_lat))  # ~102,000 m/deg at 23°N

cashouts['x_m'] = cashouts['atm_lon'] * lon_scale
cashouts['y_m'] = cashouts['atm_lat'] * lat_scale

spatial_features = cashouts[['x_m', 'y_m']].values

# eps = 5000m (5km radius); min_samples = 15 (dense zone)
# These are calibrated for your 280 ATMs across 5 states
# Run a sensitivity sweep to verify:
for eps_km in [3, 5, 8]:
    db_test = DBSCAN(eps=eps_km * 1000, min_samples=10, algorithm='ball_tree',
                     metric='euclidean', n_jobs=-1)
    labels_test = db_test.fit_predict(spatial_features)
    n_clusters = len(set(labels_test)) - (1 if -1 in labels_test else 0)
    noise_pct = (labels_test == -1).sum() / len(labels_test) * 100
    print(f"eps={eps_km}km → {n_clusters} clusters | {noise_pct:.1f}% noise")
# Choose eps that gives 8–15 meaningful clusters. Likely eps=5km.

# Final fit with chosen parameters
db = DBSCAN(eps=5000, min_samples=15, algorithm='ball_tree',
            metric='euclidean', n_jobs=-1)
cashouts['spatial_cluster'] = db.fit_predict(spatial_features)

# ── 3. ST-DBSCAN (TEMPORAL LAYER) ────────────────────────────────────────────
# Spatial-temporal: scale time so 1 hour ≈ 1km in ST space
# This makes clusters time-of-day aware
TIME_SCALE = 1000  # 1 hour = 1000m in ST space

cashouts['t_scaled'] = cashouts['hour_of_day'] * TIME_SCALE
st_features = cashouts[['x_m', 'y_m', 't_scaled']].values

db_st = DBSCAN(eps=5500, min_samples=8, algorithm='ball_tree',
               metric='euclidean', n_jobs=-1)
cashouts['st_cluster'] = db_st.fit_predict(st_features)

n_st_clusters = len(set(cashouts['st_cluster'])) - (1 if -1 in cashouts['st_cluster'].values else 0)
print(f"ST-DBSCAN: {n_st_clusters} spatio-temporal clusters")

# ── 4. COMPUTE CLUSTER RISK SCORES ───────────────────────────────────────────
# Risk score formula: frequency × recency_weight × avg_amount_norm
master = pd.read_parquet('data/processed/master_features.parquet')
cashout_with_chain = cashouts.merge(
    master[['complaint_id', 'amount_defrauded']], on='complaint_id', how='left')

def compute_cluster_risk(group):
    freq = len(group)
    # Recency weight: more recent cashouts count more
    max_ts = cashouts['txn_timestamp'].max()
    days_old = (max_ts - group['txn_timestamp']).dt.total_seconds() / 86400
    recency_weight = np.exp(-0.01 * days_old.mean())  # 1% decay per day
    avg_amount = group['amount_defrauded'].mean() if 'amount_defrauded' in group else 50000
    return freq * recency_weight * (avg_amount / 100000)

cluster_risk = cashout_with_chain.groupby('spatial_cluster').apply(
    compute_cluster_risk).reset_index()
cluster_risk.columns = ['spatial_cluster', 'raw_risk']

# Normalize to 0-1
cluster_risk['risk_score'] = (
    (cluster_risk['raw_risk'] - cluster_risk['raw_risk'].min()) /
    (cluster_risk['raw_risk'].max() - cluster_risk['raw_risk'].min())
)
cluster_risk.loc[cluster_risk['spatial_cluster'] == -1, 'risk_score'] = 0.1  # noise = low risk

# Peak hour per cluster (for alert scheduling)
cluster_peak_hour = cashout_with_chain.groupby('spatial_cluster')['hour_of_day'].agg(
    lambda x: x.mode()[0] if len(x) > 0 else 12
).reset_index().rename(columns={'hour_of_day': 'peak_hour'})
cluster_risk = cluster_risk.merge(cluster_peak_hour, on='spatial_cluster')

print("Cluster risk distribution:")
print(cluster_risk[['spatial_cluster','risk_score','peak_hour']].sort_values(
    'risk_score', ascending=False).head(10))

# ── 5. ASSIGN CLUSTERS TO ATM MASTER ─────────────────────────────────────────
atm = pd.read_csv('data/raw/synthetic_atm_master.csv')
atm['x_m'] = atm['lon'] * lon_scale
atm['y_m'] = atm['lat'] * lat_scale

# For each ATM, find which DBSCAN cluster it falls into
# Use the fitted model's core sample indices to predict
# Since DBSCAN doesn't natively predict new points, use nearest core sample
from sklearn.neighbors import BallTree

# Get core sample coordinates
core_mask = db.core_sample_indices_
core_coords = spatial_features[core_mask]
core_labels = cashouts['spatial_cluster'].values[core_mask]

tree = BallTree(core_coords, metric='euclidean')
atm_coords = atm[['x_m', 'y_m']].values
distances, indices = tree.query(atm_coords, k=1)

# ATMs more than 5km from any core point → cluster -1 (noise)
atm['spatial_cluster'] = core_labels[indices.flatten()]
atm.loc[distances.flatten() > 5000, 'spatial_cluster'] = -1

# Merge risk scores
atm = atm.merge(cluster_risk[['spatial_cluster', 'risk_score', 'peak_hour']],
                on='spatial_cluster', how='left')
atm['risk_score'].fillna(0.05, inplace=True)

# ── 6. SAVE ARTIFACTS ────────────────────────────────────────────────────────
joblib.dump(db, 'models/dbscan_model.pkl')
joblib.dump(db_st, 'models/dbscan_st_model.pkl')
joblib.dump(tree, 'models/dbscan_ball_tree.pkl')
joblib.dump(core_labels, 'models/dbscan_core_labels.pkl')

atm.to_csv('data/processed/atm_cluster_assignments.csv', index=False)
cluster_risk.to_csv('data/processed/cluster_risk_meta.csv', index=False)

with open('models/dbscan_config.json', 'w') as f:
    json.dump({
        'eps_metres': 5000,
        'min_samples': 15,
        'lat_scale': lat_scale,
        'lon_scale': lon_scale,
        'time_scale': TIME_SCALE,
        'vom_max_calibration': float(pd.read_parquet(
            'data/processed/master_features.parquet')['velocity_per_min'].quantile(0.95))
    }, f)

print("DBSCAN complete. ATM cluster assignments saved.")
print(f"ATM risk score preview:\n{atm[['atm_id','district','spatial_cluster','risk_score']].head(10)}")