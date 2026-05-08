from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Azure SQL Connection
SQLALCHEMY_DATABASE_URL = (
    "mssql+pymssql://retailadmin:Sravani%4001@smartretailsql123.database.windows.net/smartretaildb"
)

# Create engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()