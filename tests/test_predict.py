import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_predict_success():
    """Test the /predict endpoint with valid query parameters."""
    response = client.get(
        "/predict",
        params={
            "Store": 1,
            "Temperature": 68.5,
            "Fuel_Price": 2.7,
            "CPI": 211.5,
            "Unemployment": 7.5,
            "Year": 2011,
            "Month": 5,
            "Week": 20
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "success"
    assert "predicted_weekly_sales" in data
    assert isinstance(data["predicted_weekly_sales"], (float, int))

def test_predict_missing_params():
    """Test the /predict endpoint with missing parameters to ensure 422 validation error."""
    response = client.get("/predict", params={"Store": 1})
    
    # FastAPI automatically returns 422 Unprocessable Entity for missing required query params
    assert response.status_code == 422
