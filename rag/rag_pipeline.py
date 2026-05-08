import os
import pandas as pd
from pathlib import Path

from langchain_community.document_loaders import DataFrameLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from backend.logger_config import setup_logger

logger = setup_logger(__name__)

class SmartRetailRAG:
    """
    RAG Pipeline for Smart Retail Assistant.
    Handles data ingestion, vector database management, and query generation.
    """
    def __init__(self, data_path: str, vector_store_path: str = None):
        self.data_path = data_path
        self.vector_store_path = vector_store_path
        
        # Use an open-source local embedding model
        logger.info("Initializing HuggingFace Embeddings (all-MiniLM-L6-v2)...")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        self.vector_store = None
        
        # Use Groq for LLM. Requires GROQ_API_KEY environment variable.
        # You can easily swap this out for HuggingFacePipeline or another local LLM if preferred.
        try:
            self.llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
        except Exception as e:
            logger.warning(f"Could not initialize ChatGroq. Ensure GROQ_API_KEY is set. Error: {e}")
            self.llm = None
            
    def load_documents(self):
        """Loads dataset and converts the 'description' column into documents."""
        logger.info(f"Loading CSV data from {self.data_path}")
        try:
            df = pd.read_csv(self.data_path)
            
            # Ensure the necessary columns exist
            required_cols = {'product_name', 'category', 'description'}
            if not required_cols.issubset(df.columns):
                logger.warning(f"Dataset missing one or more expected columns: {required_cols}")
                
            # Drop duplicates based on description to avoid storing redundant vectors
            df_unique = df.drop_duplicates(subset=['description']).dropna(subset=['description'])
            logger.info(f"Found {len(df_unique)} unique product descriptions out of {len(df)} total rows.")
            
            # Load into Langchain Documents, mapping 'description' to content and others to metadata
            loader = DataFrameLoader(df_unique, page_content_column="description")
            docs = loader.load()
            logger.info("Successfully converted rows to Langchain Documents.")
            return docs
            
        except Exception as e:
            logger.error(f"Failed to load documents: {e}")
            raise

    def build_vector_store(self, docs):
        """Embeds documents and stores them in a FAISS vector database."""
        logger.info("Building FAISS vector store...")
        self.vector_store = FAISS.from_documents(docs, self.embeddings)
        
        if self.vector_store_path:
            os.makedirs(os.path.dirname(self.vector_store_path), exist_ok=True)
            self.vector_store.save_local(self.vector_store_path)
            logger.info(f"Vector store saved to {self.vector_store_path}")

    def load_vector_store(self):
        """Loads a pre-existing FAISS vector database from disk."""
        logger.info(f"Loading FAISS vector store from {self.vector_store_path}")
        self.vector_store = FAISS.load_local(
            self.vector_store_path, 
            self.embeddings, 
            allow_dangerous_deserialization=True # Required by recent LangChain FAISS versions
        )

    def initialize_system(self):
        """Bootstraps the RAG system by either loading an existing vector store or building a new one."""
        if self.vector_store_path and os.path.exists(os.path.join(self.vector_store_path, "index.faiss")):
            self.load_vector_store()
        else:
            docs = self.load_documents()
            self.build_vector_store(docs)

    def query_rag_system(self, query: str) -> str:
        """
        Retrieves relevant documents based on the query and generates an answer using the LLM.
        """
        if not self.vector_store:
            logger.info("Vector store not loaded. Initializing system...")
            self.initialize_system()
            
        if not self.llm:
            return "Error: LLM is not initialized. Please configure your API key."
            
        logger.info(f"Processing query: '{query}'")
        
        # 1. Retrieve top 3 relevant documents
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
        
        # 2. Setup the prompt
        system_prompt = (
            "You are a helpful Smart Retail Assistant. Use the following pieces of retrieved "
            "product catalog context to answer the user's question accurately.\n"
            "If the answer is not contained in the context, say that you don't know.\n"
            "Keep the answer concise.\n\n"
            "Context:\n{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        # 3. Create the chains
        question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        # 4. Generate the response
        try:
            response = rag_chain.invoke({"input": query})
            
            # Optional: Log the retrieved contexts for debugging
            retrieved_docs = response.get("context", [])
            logger.info(f"Retrieved {len(retrieved_docs)} relevant documents for context.")
            
            return response["answer"]
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return "An error occurred while attempting to answer the query."

def main():
    """Example usage of the SmartRetailRAG pipeline."""
    # Setup paths
    project_root = Path(__file__).resolve().parent.parent
    data_path = project_root / "data" / "processed" / "cleaned_walmart.csv"
    vector_store_path = project_root / "rag" / "faiss_index"
    
    # Initialize RAG Pipeline
    rag = SmartRetailRAG(
        data_path=str(data_path), 
        vector_store_path=str(vector_store_path)
    )
    
    # Build or load the vector database
    rag.initialize_system()
    
    # Run a test query (Note: This will require GROQ_API_KEY to be set in your terminal)
    test_query = "What kind of milk products do you have available?"
    print(f"\n--- Testing RAG System ---")
    print(f"Query: {test_query}")
    answer = rag.query_rag_system(test_query)
    print(f"Answer: {answer}\n")

if __name__ == "__main__":
    main()
