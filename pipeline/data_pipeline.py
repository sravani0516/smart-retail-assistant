import pandas as pd
import numpy as np
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def load_data(file_path: str) -> pd.DataFrame:
    """Loads the dataset from the specified CSV file path."""
    logger.info(f"Attempting to load data from {file_path}")
    try:
        df = pd.read_csv(file_path)
        logger.info(f"Data loaded successfully. Initial shape: {df.shape}")
        return df
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        raise
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        raise

def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Handles missing values in the dataset."""
    logger.info("Handling missing values...")
    missing_before = df.isnull().sum().sum()
    if missing_before > 0:
        # Example strategy: drop rows with any missing values
        df = df.dropna()
        logger.info(f"Dropped {missing_before} missing values. Shape after dropping: {df.shape}")
    else:
        logger.info("No missing values found.")
    return df

def clean_and_format_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans the dataset by formatting dates, sorting, and removing invalid/duplicate rows."""
    logger.info("Starting data cleaning and formatting...")
    
    # 3. Convert Date to datetime format
    logger.info("Converting 'Date' column to datetime format...")
    # Using format='mixed' or dayfirst=True depending on typical Walmart dataset
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    
    # Drop rows where Date could not be parsed
    df = df.dropna(subset=['Date'])
    
    # 4. Sort data by Date
    logger.info("Sorting data by 'Date'...")
    df = df.sort_values(by='Date').reset_index(drop=True)
    
    # 5. Remove duplicates
    initial_rows = len(df)
    df = df.drop_duplicates()
    logger.info(f"Removed {initial_rows - len(df)} duplicate rows. Current shape: {df.shape}")
    
    # 6. Remove rows where Weekly_Sales <= 0
    initial_rows = len(df)
    df = df[df['Weekly_Sales'] > 0]
    logger.info(f"Removed {initial_rows - len(df)} rows where Weekly_Sales <= 0. Current shape: {df.shape}")
    
    return df

def create_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Creates Year, Month, and Week features from the Date column."""
    logger.info("Creating time-based features (Year, Month, Week)...")
    
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Week'] = df['Date'].dt.isocalendar().week
    
    logger.info("Time features added successfully.")
    return df

def append_product_catalog(df: pd.DataFrame) -> pd.DataFrame:
    """Adds realistic product catalog data (product_name, category, description) to the dataset."""
    logger.info("Appending product catalog details...")
    
    # Realistic product catalog
    catalog = [
        {"product_name": "Organic Whole Milk", "category": "Dairy", "description": "1 Gallon Organic Whole Milk"},
        {"product_name": "Whole Wheat Bread", "category": "Bakery", "description": "Freshly baked 100% whole wheat bread"},
        {"product_name": "Large Brown Eggs", "category": "Dairy", "description": "1 Dozen Farm Fresh Large Brown Eggs"},
        {"product_name": "Basmati Rice", "category": "Pantry", "description": "5 lbs Long Grain Aromatic Basmati Rice"},
        {"product_name": "Antibacterial Hand Soap", "category": "Personal Care", "description": "Liquid antibacterial hand soap pump"},
        {"product_name": "Orange Juice", "category": "Beverages", "description": "100% pure orange juice, no pulp"},
        {"product_name": "Boneless Chicken Breast", "category": "Meat", "description": "Fresh boneless skinless chicken breasts"},
        {"product_name": "Premium Toilet Paper", "category": "Household", "description": "Ultra soft 2-ply bath tissue, 12 rolls"},
        {"product_name": "Honey Nut Cereal", "category": "Pantry", "description": "Crispy toasted oat cereal with real honey"},
        {"product_name": "Fuji Apples", "category": "Produce", "description": "Fresh crisp sweet Fuji apples"}
    ]
    
    # Randomly assign products to rows (as Walmart dataset doesn't explicitly map items in this view)
    np.random.seed(42) # Set seed for reproducibility
    random_indices = np.random.randint(0, len(catalog), size=len(df))
    
    product_df = pd.DataFrame([catalog[i] for i in random_indices])
    
    # Reset indices to safely concatenate columns
    df = df.reset_index(drop=True)
    product_df = product_df.reset_index(drop=True)
    
    df = pd.concat([df, product_df], axis=1)
    logger.info("Product catalog details appended.")
    
    return df

def save_processed_data(df: pd.DataFrame, file_path: str):
    """Saves the cleaned and transformed DataFrame to the specified path."""
    logger.info(f"Saving processed data to {file_path}")
    
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        df.to_csv(file_path, index=False)
        logger.info("Processed data saved successfully!")
    except Exception as e:
        logger.error(f"Failed to save processed data: {e}")
        raise

def main():
    """Main function orchestrating the data pipeline."""
    logger.info("=== Starting Data Pipeline ===")
    
    # Define file paths based on the project structure
    project_root = Path(__file__).resolve().parent.parent
    input_file = project_root / "data" / "raw" / "Walmart.csv"
    output_file = project_root / "data" / "processed" / "cleaned_walmart.csv"
    
    try:
        # Step 1: Load the dataset
        df = load_data(str(input_file))
        
        # Step 2: Handle missing values
        df = handle_missing_values(df)
        
        # Step 3, 4, 5, 6: Clean and format data
        df = clean_and_format_data(df)
        
        # Step 7: Create new features
        df = create_time_features(df)
        
        # Step 8: Add new columns for product catalog
        df = append_product_catalog(df)
        
        # Step 9: Save cleaned dataset
        save_processed_data(df, str(output_file))
        
        logger.info("=== Data Pipeline Completed Successfully ===")
        
    except Exception as e:
        logger.error(f"Pipeline execution stopped due to an error: {e}")

if __name__ == "__main__":
    main()
