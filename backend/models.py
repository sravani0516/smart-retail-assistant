from sqlalchemy import Column, Integer, Float, String
from .database import Base

class WalmartData(Base):
    __tablename__ = "walmart_data"

    id = Column(Integer, primary_key=True, index=True)
    Store = Column(Integer, index=True)
    Date = Column(String)
    Weekly_Sales = Column(Float)
    Holiday_Flag = Column(Integer)
    Temperature = Column(Float)
    Fuel_Price = Column(Float)
    CPI = Column(Float)
    Unemployment = Column(Float)
    Year = Column(Integer)
    Month = Column(Integer)
    Week = Column(Integer)
    product_name = Column(String)
    category = Column(String)
    description = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
