import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN

def perform_spatial_dbscan_clustering(df_complaints, eps_km=3.0, min_samples=2):
    """
    Performs Spatial-only Haversine DBSCAN clustering on cybercrime complaint coordinates.
    
    Parameters:
    - df_complaints: DataFrame containing 'id', 'latitude', 'longitude', 'fraud_amount', 'incident_timestamp'
    - eps_km: Spatial Epsilon radius threshold in kilometers (default 3.0 km)
    - min_samples: Minimum complaints to form a spatial hotspot cluster

    Returns:
    - List of cluster dictionaries containing centroid, radius, complaint IDs, total fraud volume, and temporal deltas.
    """
    if df_complaints.empty or len(df_complaints) < min_samples:
        return []

    # Convert lat/lon degrees to radians for Haversine distance metric
    coords_rad = np.radians(df_complaints[['latitude', 'longitude']].values)

    # Earth radius ~ 6371.0088 km
    kms_per_radian = 6371.0088
    epsilon_rad = eps_km / kms_per_radian

    db = DBSCAN(eps=epsilon_rad, min_samples=min_samples, metric='haversine')
    df_complaints['cluster_id'] = db.fit_predict(coords_rad)

    clusters = []
    # Filter out noise (-1)
    clustered_df = df_complaints[df_complaints['cluster_id'] != -1]

    for cluster_id, group in clustered_df.groupby('cluster_id'):
        center_lat = float(group['latitude'].mean())
        center_lon = float(group['longitude'].mean())
        total_amount = float(group['fraud_amount'].sum())
        total_complaints = len(group)

        # Estimate cluster spatial radius in meters
        lat_diff_m = (group['latitude'] - center_lat) * 111000.0
        lon_diff_m = (group['longitude'] - center_lon) * 111000.0 * np.cos(np.radians(center_lat))
        distances = np.sqrt(lat_diff_m**2 + lon_diff_m**2)
        max_radius = float(distances.max()) if len(distances) > 0 else 500.0

        clusters.append({
            "cluster_id": int(cluster_id),
            "center_lat": center_lat,
            "center_lon": center_lon,
            "radius_meters": max(max_radius, 500.0),
            "total_complaints": int(total_complaints),
            "total_fraud_volume": total_amount,
            "complaint_ids": group['id'].tolist()
        })

    return clusters
