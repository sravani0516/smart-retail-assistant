import pandas as pd
import joblib
from pathlib import Path
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class SmartRetailPredictor:
    def __init__(self, models_dir: str):
        self.models_dir = Path(models_dir)
        self.demand_model = None
        self.anomaly_model = None
        self.feature_names = None
        self._load_models()
        
    def _load_models(self):
        """Loads the saved models from the specified directory."""
        logger.info("Loading trained models...")
        demand_path = self.models_dir / "demand_model.pkl"
        anomaly_path = self.models_dir / "anomaly_model.pkl"
        features_path = self.models_dir / "features.pkl"
        
        if not (demand_path.exists() and anomaly_path.exists()):
            raise FileNotFoundError(
                f"Model files not found in {self.models_dir}. "
                "Please run train.py first to generate the models."
            )
            
        self.demand_model = joblib.load(demand_path)
        self.anomaly_model = joblib.load(anomaly_path)
        
        # Try loading feature names if saved, otherwise use defaults
        if features_path.exists():
            self.feature_names = joblib.load(features_path)
        else:
            self.feature_names = [
                'Store', 'Temperature', 'Fuel_Price', 'CPI', 
                'Unemployment', 'Year', 'Month', 'Week'
            ]
            
        logger.info("Models loaded successfully.")

    def predict(self, input_data: dict) -> dict:
        """
        Takes an input dictionary of features and returns both 
        demand forecasting and anomaly detection predictions.
        """
        logger.info("Processing prediction request...")
        
        # Convert input dictionary to DataFrame
        df_input = pd.DataFrame([input_data])
        
        # Ensure all required features are present
        for col in self.feature_names:
            if col not in df_input.columns:
                raise ValueError(f"Missing required feature in input data: {col}")
                
        # Reorder columns to match training feature order exactly
        X = df_input[self.feature_names]
        
        # 1. Predict Demand (Weekly Sales)
        demand_pred = self.demand_model.predict(X)[0]
        
        # 2. Predict Anomaly (-1 for anomaly, 1 for normal)
        anomaly_score = self.anomaly_model.predict(X)[0]
        is_anomaly = bool(anomaly_score == -1)
        
        result = {
            "predicted_weekly_sales": round(float(demand_pred), 2),
            "is_anomaly": is_anomaly
        }
        
        logger.info(f"Prediction Result: {result}")
        return result

def main():
    """Example usage of the SmartRetailPredictor."""
    project_root = Path(__file__).resolve().parent.parent
    models_directory = project_root / "ml" / "models"
    
    try:
        # Initialize predictor
        predictor = SmartRetailPredictor(str(models_directory))
        
        # Sample input payload simulating an incoming request
        sample_input = {
            'Store': 1,
            'Temperature': 68.5,
            'Fuel_Price': 2.7,
            'CPI': 211.5,
            'Unemployment': 7.5,
            'Year': 2011,
            'Month': 5,
            'Week': 20
        }
        
        print("\n--- Running Prediction ---")
        prediction = predictor.predict(sample_input)
        
        print(f"\nFinal Output:")
        print(f"Predicted Sales: ${prediction['predicted_weekly_sales']}")
        print(f"Is Anomaly?: {'Yes' if prediction['is_anomaly'] else 'No'}")
        
    except Exception as e:
        logger.error(f"Prediction flow failed: {e}")

if __name__ == "__main__":
    main()
