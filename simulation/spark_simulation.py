"""
Apache Spark Simulation Script for Cybercrime Telemetry & Fraud Transaction Streams.
Simulates real-time processing of high-volume financial cybercrime complaints across Indian Banking Channels.
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, current_timestamp, lit

def init_spark():
    return SparkSession.builder \
        .appName("SIH_Cybercrime_Complaint_Stream_Simulation") \
        .config("spark.master", "local[*]") \
        .getOrCreate()

def process_cybercrime_telemetry():
    spark = init_spark()
    print("=== Apache Spark Engine Initialized for Cybercrime Telemetry Processing ===")

    # Simulated incoming batch of digital fraud telemetry reports
    raw_data = [
        ("2026MHA999001", "OTP Phishing", 125000.00, "State Bank of India", "28.6289", "77.2065", "Delhi NCR"),
        ("2026MHA999002", "Digital Arrest", 450000.00, "HDFC Bank", "28.6100", "77.2300", "Delhi NCR"),
        ("2026MHA999003", "Loan App Fraud", 35000.00, "ICICI Bank", "19.0760", "72.8777", "Mumbai"),
        ("2026MHA999004", "Investment Fraud", 890000.00, "Axis Bank", "12.9716", "77.5946", "Bengaluru")
    ]

    columns = ["acknowledgement_no", "fraud_category", "fraud_amount", "mule_bank_name", "latitude", "longitude", "city"]
    df = spark.createDataFrame(raw_data, schema=columns)

    # Apply Spark transformations & high-value fraud classification flag
    df_transformed = df.withColumn("fraud_amount", col("fraud_amount").cast("double")) \
                       .withColumn("is_high_value", when(col("fraud_amount") >= 200000.0, True).otherwise(False)) \
                       .withColumn("processed_at", current_timestamp())

    print("=== Filtered High-Risk Cybercrime Incidents ===")
    df_transformed.show()

    spark.stop()

if __name__ == "__main__":
    process_cybercrime_telemetry()
