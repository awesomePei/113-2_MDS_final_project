# services/prediction.py
import pandas as pd
import os

def delay_days_prediction(id):
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        filepath = os.path.join(base_dir, 'regression_results.csv')
        df = pd.read_csv(filepath)
        result = df[df['ID'].astype(str).str.strip() == id.strip()]["Predicted_Delay_Days"]
        if result.empty:
            return None
        return float(result.iloc[0])
    except Exception as e:
        print(f"Error in prediction: {e}")
        return None

