from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class QueryRouter:
    """
    Keyword-based router to classify queries to the appropriate specialized agent.
    """
    def __init__(self):
        # Keywords for Data Analyst Agent
        self.analyst_keywords = [
            'sales', 'trend', 'store', 'performance', 'highest', 
            'average', 'month', 'monthly', 'insight', 'top'
        ]
        
        # Keywords for RAG Agent
        self.rag_keywords = [
            'product', 'category', 'description', 'milk', 'rice', 
            'catalog', 'recommend', 'items', 'brands'
        ]
        
        # Keywords for ML Agent
        self.ml_keywords = [
            'prediction', 'anomaly', 'forecast', 'predict', 'future',
            'detect', 'outlier'
        ]
        
    def route_query(self, query: str) -> str:
        """
        Routes a query to 'analyst_agent', 'rag_agent', or 'ml_agent' based on keywords.
        """
        query_lower = query.lower()
        
        # Check ML first as it's typically very specific
        for kw in self.ml_keywords:
            if kw in query_lower:
                return "ml_agent"
                
        # Check RAG for product queries
        for kw in self.rag_keywords:
            if kw in query_lower:
                return "rag_agent"
                
        # Check Analyst for sales queries
        for kw in self.analyst_keywords:
            if kw in query_lower:
                return "analyst_agent"
                
        # Default fallback
        logger.info(f"No specific keywords matched for query: '{query}'. Defaulting to Analyst Agent.")
        return "analyst_agent"
