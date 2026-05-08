from pathlib import Path

from .analyst_agent import AnalystAgent
from .rag_agent import RAGAgent
from .ml_agent import MLAgent
from .router import QueryRouter
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class AgentOrchestrator:
    """
    Central orchestrator that receives queries, routes them to the appropriate agent,
    and returns a standardized JSON response.
    """
    def __init__(self, base_dir: str = None):
        if base_dir is None:
            self.base_dir = Path(__file__).resolve().parent.parent
        else:
            self.base_dir = Path(base_dir)
            
        self.data_path = str(self.base_dir / "data" / "processed" / "cleaned_walmart.csv")
        self.vector_store_path = str(self.base_dir / "rag" / "faiss_index")
        self.models_dir = str(self.base_dir / "ml" / "models")
        
        logger.info("Initializing Agent Orchestrator and sub-agents...")
        
        self.router = QueryRouter()
        
        try:
            self.analyst_agent = AnalystAgent(data_path=self.data_path)
            self.rag_agent = RAGAgent(data_path=self.data_path, vector_store_path=self.vector_store_path)
            self.ml_agent = MLAgent(models_dir=self.models_dir)
            logger.info("All agents initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize one or more agents: {e}")
            # We don't raise here so the API can still start, but agents might fail gracefully
            
    def process_query(self, query: str) -> dict:
        """
        Routes the user query to the appropriate agent and formats the response.
        """
        logger.info(f"Orchestrator received query: {query}")
        
        if not query or not query.strip():
            return {
                "agent": "none",
                "response": "Empty query received."
            }
            
        # Route query
        agent_name = self.router.route_query(query)
        logger.info(f"Query routed to: {agent_name}")
        
        response_data = None
        
        # Execute agent
        if agent_name == "analyst_agent":
            response_data = self.analyst_agent.process_query(query)
        elif agent_name == "rag_agent":
            response_data = self.rag_agent.process_query(query)
        elif agent_name == "ml_agent":
            response_data = self.ml_agent.process_query(query)
        else:
            agent_name = "unknown"
            response_data = {
                "status": "error",
                "response": "Could not route query to a valid agent."
            }
            
        # Standardize return format expected by FastAPI endpoint
        return {
            "agent": agent_name,
            "response": response_data.get("response", "No response generated.")
        }
