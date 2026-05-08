import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_ask_analyst():
    """Test the /ask endpoint routing to the analyst agent."""
    payload = {"query": "Which store had the highest sales performance?"}
    response = client.post("/ask", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "agent" in data
    assert "response" in data
    assert data["agent"] == "analyst_agent"

def test_ask_rag():
    """Test the /ask endpoint routing to the RAG agent."""
    payload = {"query": "Tell me about dairy products like milk."}
    response = client.post("/ask", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "agent" in data
    assert "response" in data
    assert data["agent"] == "rag_agent"

def test_ask_ml():
    """Test the /ask endpoint routing to the ML agent."""
    payload = {"query": "Predict weekly sales for store 2"}
    response = client.post("/ask", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "agent" in data
    assert "response" in data
    assert data["agent"] == "ml_agent"

def test_ask_validation_error():
    """Test the /ask endpoint with an invalid payload."""
    payload = {"wrong_key": "Hello"}
    response = client.post("/ask", json=payload)
    
    # Should fail pydantic validation for missing 'query'
    assert response.status_code == 422
