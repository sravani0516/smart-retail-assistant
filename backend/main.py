from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.api import router
from .routes.auth import router as auth_router
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Retail Assistant API",
    description="Backend API for managing retail data, forecasting demand, and detecting anomalies.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://orange-coast-07bf7a100.7.azurestaticapps.net",
        # Keep existing local dev origin
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(router)
app.include_router(auth_router)

@app.get("/")
def root():
    """Root endpoint to verify the API is running."""
    return {"message": "Welcome to the Smart Retail Assistant API"}
