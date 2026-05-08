import pandas as pd
import numpy as np
import logging
import os
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.metrics import mean_squared_error

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def load_data(file_path: str) -> pd.DataFrame:
    """Loads the processed dataset."""
    logger.info(f"Loading data from {file_path}")
    try:
        df = pd.read_csv(file_path)
        logger.info(f"Data loaded successfully. Shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        raise

def prepare_data(df: pd.DataFrame):
    """Selects features and target, and splits into train/test sets."""
    logger.info("Preparing data for modeling...")
    
    features = ['Store', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment', 'Year', 'Month', 'Week']
    target = 'Weekly_Sales'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    logger.info(f"Data split into train ({X_train.shape[0]} samples) and test ({X_test.shape[0]} samples)")
    
    return X_train, X_test, y_train, y_test, features

def train_demand_model(X_train, y_train):
    """Trains a Random Forest Regressor for demand forecasting."""
    logger.info("Training Demand Forecasting Model (RandomForestRegressor)...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    return model

def train_anomaly_model(X_train):
    """Trains an Isolation Forest for anomaly detection."""
    logger.info("Training Anomaly Detection Model (IsolationForest)...")
    # Contamination is the expected proportion of outliers
    model = IsolationForest(random_state=42, contamination=0.05)
    model.fit(X_train)
    return model

def evaluate_demand_model(model, X_test, y_test):
    """Evaluates the demand forecasting model using RMSE."""
    logger.info("Evaluating Demand Model...")
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    rmse = np.sqrt(mse)
    logger.info(f"Demand Model Evaluation -> RMSE: {rmse:.2f}")
    return rmse

def save_model(model, file_path: str):
    """Saves the trained model to the specified path."""
    logger.info(f"Saving model to {file_path}")
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    joblib.dump(model, file_path)
    logger.info("Model saved successfully.")

def main():
    logger.info("=== Starting Model Training Pipeline ===")
    
    project_root = Path(__file__).resolve().parent.parent
    data_path = project_root / "data" / "processed" / "cleaned_walmart.csv"
    models_dir = project_root / "ml" / "models"
    
    demand_model_path = models_dir / "demand_model.pkl"
    anomaly_model_path = models_dir / "anomaly_model.pkl"
    features_path = models_dir / "features.pkl"
    
    try:
        # Step 1: Load Data
        df = load_data(str(data_path))
        
        # Step 2, 3, 4: Select features, target and split
        X_train, X_test, y_train, y_test, feature_names = prepare_data(df)
        
        # Step 5a: Train demand forecasting model
        demand_model = train_demand_model(X_train, y_train)
        
        # Step 6: Evaluate model
        evaluate_demand_model(demand_model, X_test, y_test)
        
        # Step 5b: Train anomaly detection model
        anomaly_model = train_anomaly_model(X_train)
        
        # Step 7: Save models
        save_model(demand_model, str(demand_model_path))
        save_model(anomaly_model, str(anomaly_model_path))
        
        # Save feature names for future prediction consistency
        save_model(feature_names, str(features_path))
        
        logger.info("=== Model Training Pipeline Completed Successfully ===")
        
    except Exception as e:
        logger.error(f"Pipeline execution stopped due to an error: {e}")

if __name__ == "__main__":
    main()
