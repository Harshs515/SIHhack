from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
import requests

default_args = {
    'owner': 'MHA_Cybercrime_Analytics',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

def trigger_ml_predictive_pipeline():
    """Triggers the ML DBSCAN + XGBoost microservice pipeline via HTTP REST call."""
    ml_service_url = "http://ml-service:8000/api/ml/process-pipeline"
    print(f"Triggering ML microservice at {ml_service_url}")
    response = requests.post(ml_service_url, timeout=60)
    print(f"ML Pipeline Response: {response.status_code} - {response.text}")
    response.raise_for_status()

with DAG(
    'cybercrime_predictive_withdrawal_pipeline',
    default_args=default_args,
    description='Automated pipeline for DBSCAN spatial clustering and XGBoost cash withdrawal prediction',
    schedule_interval=timedelta(minutes=15),
    catchup=False,
) as dag:

    run_ml_clustering_and_prediction = PythonOperator(
        task_id='run_spatial_clustering_and_xgboost_forecast',
        python_callable=trigger_ml_predictive_pipeline,
    )
