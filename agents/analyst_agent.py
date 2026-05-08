import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class AnalystAgent:
    def __init__(self, data_path: str):
        self.data_path = data_path
        logger.info(f"AnalystAgent loading data from {self.data_path}")
        self.df = pd.read_csv(self.data_path)
        
        # Initialize Groq LLM
        try:
            self.llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGroq in AnalystAgent: {e}")
            self.llm = None
            
    def _compute_analytics_context(self) -> str:
        """Computes key analytics using pandas to feed as context to the LLM."""
        try:
            # Basic aggregations
            top_store = self.df.groupby('Store')['Weekly_Sales'].sum().idxmax()
            top_store_sales = self.df.groupby('Store')['Weekly_Sales'].sum().max()
            
            avg_weekly = self.df['Weekly_Sales'].mean()
            
            # Top 3 performing stores
            top_3_stores = self.df.groupby('Store')['Weekly_Sales'].sum().nlargest(3).to_dict()
            
            # Monthly sales trend
            if 'Date' in self.df.columns:
                temp_df = self.df.copy()
                temp_df['Date'] = pd.to_datetime(temp_df['Date'])
                monthly = temp_df.groupby(temp_df['Date'].dt.month)['Weekly_Sales'].sum().to_dict()
            else:
                monthly = self.df.groupby('Month')['Weekly_Sales'].sum().to_dict()
                
            # Formatting the context string
            context = f"""
            Data Summary:
            - Store with highest total sales: Store {top_store} (${top_store_sales:,.2f})
            - Top 3 performing stores by total sales: {top_3_stores}
            - Average weekly sales across all records: ${avg_weekly:,.2f}
            - Monthly sales trends (Month Number: Total Sales): {monthly}
            """
            
            # Optional: Category insights if category exists
            if 'category' in self.df.columns:
                top_cats = self.df['category'].value_counts().head(5).to_dict()
                context += f"\n- Top 5 product categories by count: {top_cats}"
                
            return context
        except Exception as e:
            logger.error(f"Error computing pandas analytics: {e}")
            return "Analytics context could not be generated due to an error."

    def process_query(self, query: str) -> dict:
        """Processes the query using computed pandas analytics and LLM."""
        if not self.llm:
            return {
                "status": "error",
                "response": "LLM is not initialized. Ensure GROQ_API_KEY is set."
            }
            
        try:
            context = self._compute_analytics_context()
            
            system_prompt = (
                "You are a Data Analyst Agent for a Smart Retail Assistant. "
                "Use the following pandas-computed dataset summary to answer the user's question accurately.\n"
                "If the answer cannot be determined from the summary, politely state that you don't have enough information.\n"
                "Keep the answer concise, business-friendly, and formatted nicely.\n\n"
                "Context:\n{context}"
            )
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "Question: {query}")
            ])
            
            chain = prompt | self.llm
            response = chain.invoke({"context": context, "query": query})
            
            return {
                "status": "success",
                "response": response.content
            }
        except Exception as e:
            logger.error(f"Analyst Agent error processing query: {e}")
            return {
                "status": "error",
                "response": "An error occurred while analyzing the data."
            }
