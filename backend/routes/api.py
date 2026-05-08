from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import pandas as pd
import joblib
from pathlib import Path
from pydantic import BaseModel

from ..database import get_db, engine
from ..models import WalmartData, Base
from backend.logger_config import setup_logger

# Import the new Agent Orchestrator
import sys
import os
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from agents.orchestrator import AgentOrchestrator

logger = setup_logger(__name__)
router = APIRouter()

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Load Models
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "ml" / "models"
try:
    demand_model = joblib.load(MODELS_DIR / "demand_model.pkl")
    anomaly_model = joblib.load(MODELS_DIR / "anomaly_model.pkl")
    
    features_path = MODELS_DIR / "features.pkl"
    if features_path.exists():
        feature_names = joblib.load(features_path)
    else:
        feature_names = ['Store', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment', 'Year', 'Month', 'Week']
        
    logger.info("ML Models loaded successfully in API routes.")
except Exception as e:
    logger.error(f"Error loading ML models: {e}")
    demand_model = None
    anomaly_model = None
    feature_names = ['Store', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment', 'Year', 'Month', 'Week']

# Initialize Orchestrator
try:
    orchestrator = AgentOrchestrator(base_dir=str(BASE_DIR))
    logger.info("Agent Orchestrator initialized in API routes.")
except Exception as e:
    logger.error(f"Error initializing Agent Orchestrator: {e}")
    orchestrator = None

class AskRequest(BaseModel):
    query: str

@router.post("/ingest")
def ingest_data(db: Session = Depends(get_db)):
    """Loads cleaned dataset into the SQLite database."""
    try:
        csv_path = BASE_DIR / "data" / "processed" / "cleaned_walmart.csv"
        if not csv_path.exists():
            raise HTTPException(status_code=404, detail="Cleaned CSV file not found.")
        
        # Read the cleaned data
        df = pd.read_csv(csv_path)
        
        # Handle NaN values mapping them to None (NULL in DB) if any slipped through
        df = df.where(pd.notnull(df), None)
        records = df.to_dict(orient="records")
        
        # Clear existing data to avoid duplicates on re-ingestion
        db.query(WalmartData).delete()
        
        # Bulk insert
        db.bulk_insert_mappings(WalmartData, records)
        db.commit()
        
        return {
            "status": "success", 
            "message": f"Successfully ingested {len(records)} records into the database."
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error during data ingestion: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to ingest data: {str(e)}")

@router.get("/predict")
def predict_sales(
    Store: int = Query(...), 
    Temperature: float = Query(...), 
    Fuel_Price: float = Query(...), 
    CPI: float = Query(...), 
    Unemployment: float = Query(...), 
    Year: int = Query(...), 
    Month: int = Query(...), 
    Week: int = Query(...)
):
    """Predict weekly sales using the trained demand_model.pkl"""
    try:
        if demand_model is None:
            raise HTTPException(status_code=500, detail="Demand model is not available.")
            
        input_data = {
            'Store': Store, 'Temperature': Temperature, 'Fuel_Price': Fuel_Price,
            'CPI': CPI, 'Unemployment': Unemployment, 'Year': Year, 'Month': Month, 'Week': Week
        }
        
        # Order columns identically to training
        df_input = pd.DataFrame([input_data])[feature_names]
        
        pred = demand_model.predict(df_input)[0]
        logger.info(f"API called: /predict - Prediction generated: {pred}")
        
        return {
            "status": "success",
            "predicted_weekly_sales": round(float(pred), 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during prediction.")

@router.get("/anomaly")
def detect_anomalies(db: Session = Depends(get_db)):
    """Detect anomalies using anomaly_model.pkl based on the ingested database records."""
    try:
        if anomaly_model is None:
            raise HTTPException(status_code=500, detail="Anomaly model is not available.")
        
        # Fetch data from DB
        records = db.query(WalmartData).all()
        if not records:
            return {"message": "Database is empty. Please run /ingest first to load data."}
            
        # Convert DB records to DataFrame for model
        data = [
            {
                "id": r.id, "Store": r.Store, "Temperature": r.Temperature,
                "Fuel_Price": r.Fuel_Price, "CPI": r.CPI, "Unemployment": r.Unemployment,
                "Year": r.Year, "Month": r.Month, "Week": r.Week,
                "Weekly_Sales": r.Weekly_Sales, "Date": r.Date
            }
            for r in records
        ]
        df = pd.DataFrame(data)
        
        # Select required features exactly as trained
        X = df[feature_names]
        
        # IsolationForest returns -1 for anomalies
        preds = anomaly_model.predict(X)
        df['is_anomaly'] = preds == -1
        
        # Filter and prepare response
        anomalies_df = df[df['is_anomaly'] == True]
        anomalies_list = anomalies_df.drop(columns=['is_anomaly']).to_dict(orient="records")
        logger.info(f"API called: /anomaly - Anomaly detection executed. Found {len(anomalies_list)} anomalies.")
        
        return {
            "status": "success",
            "total_records_evaluated": len(df),
            "anomaly_count": len(anomalies_list),
            "anomalies": anomalies_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while detecting anomalies.")

@router.post("/ask")
def ask_agent(request: AskRequest):
    """Endpoint for AI agent natural language queries."""
    try:
        logger.info(f"API called: /ask - Received query: '{request.query}'")
        if orchestrator is None:
            raise HTTPException(status_code=500, detail="Agent Orchestrator is not available.")
            
        result = orchestrator.process_query(request.query)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ask endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to process query.")

@router.get("/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Aggregate endpoint to provide high-level metrics for the React dashboard."""
    try:
        # Defaults
        total_sales = 0.0
        forecast_sales = 0.0
        anomaly_count = 0
        active_agents = 3
        
        records = db.query(WalmartData).all()
        
        if records:
            # Prepare dataframe for total sales and anomaly checking
            data = [
                {
                    "Store": r.Store, "Temperature": r.Temperature,
                    "Fuel_Price": r.Fuel_Price, "CPI": r.CPI, "Unemployment": r.Unemployment,
                    "Year": r.Year, "Month": r.Month, "Week": r.Week,
                    "Weekly_Sales": r.Weekly_Sales
                }
                for r in records
            ]
            df = pd.DataFrame(data)
            
            # 1. Total Sales
            total_sales = float(df['Weekly_Sales'].sum())
            
            # Temporal split for realistic trend calculations
            max_year = df['Year'].max()
            df_recent = df[df['Year'] == max_year]
            df_prev = df[df['Year'] == max_year - 1]
            
            if len(df_prev) == 0:
                # Fallback if only one year of data
                mid = len(df) // 2
                df_prev = df.iloc[:mid]
                df_recent = df.iloc[mid:]

            # Sales Change
            recent_sales = float(df_recent['Weekly_Sales'].sum())
            prev_sales = float(df_prev['Weekly_Sales'].sum())
            sales_change_percent = ((recent_sales - prev_sales) / prev_sales * 100) if prev_sales else 0.0
            
            # 2. Anomaly Count and Change
            if anomaly_model is not None:
                X = df[feature_names]
                preds = anomaly_model.predict(X)
                anomaly_count = int(sum(preds == -1))
                
                recent_preds = anomaly_model.predict(df_recent[feature_names])
                prev_preds = anomaly_model.predict(df_prev[feature_names])
                
                recent_anomalies = int(sum(recent_preds == -1))
                prev_anomalies = int(sum(prev_preds == -1))
                anomaly_change_percent = ((recent_anomalies - prev_anomalies) / prev_anomalies * 100) if prev_anomalies else 0.0
            
            # 3. Forecast Sales and Change
            if demand_model is not None:
                X_recent = df_recent[feature_names]
                sample_input_recent = X_recent.mean().to_frame().T
                forecast_sales = float(demand_model.predict(sample_input_recent)[0])
                
                X_prev = df_prev[feature_names]
                sample_input_prev = X_prev.mean().to_frame().T
                prev_forecast = float(demand_model.predict(sample_input_prev)[0])
                
                forecast_change_percent = ((forecast_sales - prev_forecast) / prev_forecast * 100) if prev_forecast else 0.0

        return {
            "total_sales": total_sales,
            "sales_change_percent": round(sales_change_percent, 2),
            "forecast_sales": forecast_sales,
            "forecast_change_percent": round(forecast_change_percent, 2),
            "anomaly_count": anomaly_count,
            "anomaly_change_percent": round(anomaly_change_percent, 2),
            "active_agents": active_agents
        }
        
    except Exception as e:
        logger.error(f"Error generating dashboard summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard metrics.")
