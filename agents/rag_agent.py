from rag.rag_pipeline import SmartRetailRAG
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class RAGAgent:
    """
    RAG Agent for answering product and catalog questions.
    Wraps the existing SmartRetailRAG pipeline.
    """
    def __init__(self, data_path: str, vector_store_path: str):
        logger.info("Initializing RAG Agent...")
        try:
            self.rag = SmartRetailRAG(data_path=data_path, vector_store_path=vector_store_path)
            self.rag.initialize_system()
        except Exception as e:
            logger.error(f"Failed to initialize RAG system: {e}")
            self.rag = None
            
    def process_query(self, query: str) -> dict:
        """Processes product/catalog queries."""
        if not self.rag:
            return {
                "status": "error",
                "response": "RAG system is not initialized."
            }
            
        try:
            answer = self.rag.query_rag_system(query)
            return {
                "status": "success",
                "response": answer
            }
        except Exception as e:
            logger.error(f"RAG Agent error processing query: {e}")
            return {
                "status": "error",
                "response": "An error occurred while searching the product catalog."
            }
