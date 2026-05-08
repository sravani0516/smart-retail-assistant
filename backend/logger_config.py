import os
import logging
from pathlib import Path

# Define log directory relative to the project root
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "app.log"

# Automatically create logs/ directory if it doesn't exist
os.makedirs(LOG_DIR, exist_ok=True)

def setup_logger(name: str) -> logging.Logger:
    """
    Sets up a centralized logger with consistent formatting.
    Outputs to both terminal and logs/app.log.
    """
    logger = logging.getLogger(name)
    
    # Only configure if not already configured to avoid duplicate handlers
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Consistent formatter: timestamp - module - level - message
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Terminal handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # File handler
        file_handler = logging.FileHandler(LOG_FILE)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # Prevent propagation to the root logger to avoid duplicate prints
        logger.propagate = False
        
    return logger
