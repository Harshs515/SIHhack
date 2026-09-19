import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker('en_IN')

# Real distributions from NCRP 2024 Annual Report
FRAUD_TYPES = {
    'UPI_FRAUD': 0.32,      # 32% of complaints
    'KYC_SCAM': 0.18,
    'JOB_SCAM': 0.14,
    'OTP_FRAUD': 0.11,
    'LOAN_SCAM': 0.09,
    'INVESTMENT_FRAUD': 0.08,
    'OTHER': 0.08
}

# Real state-wise cybercrime distribution (from MHA data)
STATE_WEIGHTS = {
    'Uttar Pradesh': 0.18, 'Maharashtra': 0.14,
    'Telangana': 0.10, 'Karnataka': 0.09,
    'Rajasthan': 0.08, 'Gujarat': 0.07,
    'Delhi': 0.07, 'West Bengal': 0.06,
    'Tamil Nadu': 0.05, 'Haryana': 0.04,
    'Others': 0.12
}

# Amount distribution by fraud type (log-normal params)
AMOUNT_PARAMS = {
    'UPI_FRAUD':         {'mu': 9.5,  'sigma': 1.2},  # ~₹13k median
    'INVESTMENT_FRAUD':  {'mu': 12.0, 'sigma': 1.5},  # ~₹1.6L median
    'LOAN_SCAM':         {'mu': 10.5, 'sigma': 1.1},  # ~₹36k median
    'KYC_SCAM':          {'mu': 9.8,  'sigma': 1.0},
    'JOB_SCAM':          {'mu': 9.2,  'sigma': 0.9},
    'OTP_FRAUD':         {'mu': 9.0,  'sigma': 1.3},
    'OTHER':             {'mu': 9.5,  'sigma': 1.4},
}

# Mule chain velocity in minutes (time between hops)
HOP_VELOCITY = {
    1: {'min': 2,   'max': 15},   # First transfer: very fast
    2: {'min': 5,   'max': 30},
    3: {'min': 10,  'max': 60},
    4: {'min': 15,  'max': 120},  # Cash-out: 15 min to 2 hrs
}

def generate_complaint(complaint_id, fraud_time):
    fraud_type = random.choices(
        list(FRAUD_TYPES.keys()),
        weights=list(FRAUD_TYPES.values())
    )[0]
    
    state = random.choices(
        list(STATE_WEIGHTS.keys()),
        weights=list(STATE_WEIGHTS.values())
    )[0]
    
    params = AMOUNT_PARAMS[fraud_type]
    amount = round(np.random.lognormal(params['mu'], params['sigma']), 2)
    amount = max(500, min(amount, 5_000_000))  # clip to ₹500 – ₹50L
    
    return {
        'complaint_id': complaint_id,
        'filed_at': fraud_time + timedelta(minutes=random.randint(5, 480)),
        'victim_state': state,
        'fraud_type': fraud_type,
        'amount_defrauded': amount,
        'complaint_text': generate_complaint_text(fraud_type, amount)
    }

def generate_mule_chain(complaint_id, fraud_time, amount, origin_district):
    hops = random.choices([2, 3, 4], weights=[0.25, 0.55, 0.20])[0]
    chain = []
    current_time = fraud_time
    current_amt = amount
    prev_account = f"ACC{random.randint(1000000, 9999999)}"
    
    for hop in range(1, hops + 1):
        velocity = HOP_VELOCITY[hop]
        delay = random.randint(velocity['min'], velocity['max'])
        current_time += timedelta(minutes=delay)
        next_account = f"ACC{random.randint(1000000, 9999999)}"
        
        # Amount slightly decreases per hop (fee/skimming)
        current_amt *= random.uniform(0.92, 0.99)
        
        is_cashout = (hop == hops)
        district = origin_district if hop <= 1 else pick_nearby_district(origin_district)
        
        chain.append({
            'complaint_id': complaint_id,
            'from_account': prev_account,
            'to_account': next_account,
            'amount': round(current_amt, 2),
            'txn_timestamp': current_time,
            'hop_number': hop,
            'is_cashout': is_cashout,
            'to_district': district,
        })
        prev_account = next_account
    
    return chain

# Generate 50,000 complaints + chains
complaints, transactions = [], []
for i in range(50_000):
    fraud_time = datetime(2024, 1, 1) + timedelta(
        days=random.randint(0, 365),
        hours=random.choice([8,9,10,11,14,15,16,17,18,19,20,21,22])  # peak hours
    )
    c = generate_complaint(f"COMP-2024-{i:05d}", fraud_time)
    complaints.append(c)
    chain = generate_mule_chain(c['complaint_id'], fraud_time,
                                 c['amount_defrauded'], c.get('victim_district','Delhi'))
    transactions.extend(chain)

df_complaints = pd.DataFrame(complaints)
df_txn = pd.DataFrame(transactions)
df_complaints.to_csv('synthetic_ncrp_complaints.csv', index=False)
df_txn.to_csv('synthetic_mule_transactions.csv', index=False)