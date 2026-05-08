import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_anomaly_endpoint():
    """Test the /anomaly endpoint."""
    response = client.get("/anomaly")
    assert response.status_code == 200
    
    data = response.json()
    
    # Depending on whether the DB is populated, we might get a message or a success status
    if "message" in data:
        assert data["message"] == "Database is empty. Please run /ingest first to load data."
    else:
        assert "status" in data
        assert data["status"] == "success"
        assert "total_records_evaluated" in data
        assert "anomaly_count" in data
        assert "anomalies" in data
        assert isinstance(data["anomalies"], list)
