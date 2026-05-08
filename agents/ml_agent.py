import json
from ml.predict import SmartRetailPredictor
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class MLAgent:
    """
    ML Agent for handling demand forecasting and anomaly detection queries.
    Uses LLM to extract parameters and SmartRetailPredictor to run models.
    """
    def __init__(self, models_dir: str):
        logger.info(f"MLAgent loading models from {models_dir}")
        try:
            self.predictor = SmartRetailPredictor(models_dir)
        except Exception as e:
            logger.error(f"Failed to initialize ML Predictor: {e}")
            self.predictor = None
            
        try:
            self.llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGroq in MLAgent: {e}")
            self.llm = None
            
    def process_query(self, query: str) -> dict:
        """Processes ML-related queries."""
        if not self.predictor:
            return {
                "status": "error",
                "response": "ML Predictor is not available. Please ensure models are trained."
            }
        if not self.llm:
            return {
                "status": "error",
                "response": "LLM is not initialized. Ensure GROQ_API_KEY is set."
            }
            
        try:
            # 1. Extract parameters using LLM
            extract_prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an ML Agent assistant. Extract the following features from the user's query to run a prediction model. 
                Output a JSON object with these exact keys: 'Store', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment', 'Year', 'Month', 'Week'. 
                If a value is not mentioned, use these reasonable defaults: 
                Store: 1, Temperature: 65.0, Fuel_Price: 3.0, CPI: 200.0, Unemployment: 7.0, Year: 2011, Month: 1, Week: 1.
                Only output the JSON object, absolutely no markdown formatting, no code blocks, no other text."""),
                ("user", "{query}")
            ])
            
            chain = extract_prompt | self.llm
            response = chain.invoke({"query": query})
            
            # Parse JSON safely
            json_str = response.content.replace("```json", "").replace("```", "").strip()
            try:
                input_data = json.loads(json_str)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse LLM JSON output '{json_str}', using defaults.")
                input_data = {
                    'Store': 1, 'Temperature': 65.0, 'Fuel_Price': 3.0, 'CPI': 200.0, 
                    'Unemployment': 7.0, 'Year': 2011, 'Month': 1, 'Week': 1
                }
                
            # 2. Run prediction
            prediction = self.predictor.predict(input_data)
            
            # 3. Format response into natural language
            nl_prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a helpful retail assistant. Explain the following machine learning prediction result to the user clearly and concisely in natural language."),
                ("user", "User Query: {query}\nPrediction Result: Weekly Sales = ${sales}, Is Anomaly = {anomaly}")
            ])
            nl_chain = nl_prompt | self.llm
            nl_response = nl_chain.invoke({
                "query": query, 
                "sales": prediction['predicted_weekly_sales'],
                "anomaly": "Yes" if prediction['is_anomaly'] else "No"
            })
            
            return {
                "status": "success",
                "response": nl_response.content,
                "data": prediction
            }
            
        except Exception as e:
            logger.error(f"ML Agent error processing query: {e}")
            return {
                "status": "error",
                "response": "An error occurred while running the ML models."
            }
