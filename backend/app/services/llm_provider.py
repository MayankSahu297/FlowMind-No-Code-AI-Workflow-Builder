import os
import google.generativeai as genai
from typing import Optional

# Setup Gemini API client from environment variables
if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_text(provider: str, model: str, query: str, context: Optional[str] = "") -> str:
    """
    Unified interface to call Google Gemini.
    It structures the prompt to include any retrieved context for RAG.
    """
    
    # We build a standard prompt that instructs the AI how to use the provided context
    prompt_template = f"""
    Use the following background information to help answer the user query accurately.
    
    Background Context:
    {context if context else "No additional context provided."}
    
    User Question: {query}
    
    Answer:
    """
    
    try:
        provider_name = provider.lower()
        
        if provider_name == "gemini":
            # Using Google's generative AI SDK
            ai_model = genai.GenerativeModel(model)
            generation = ai_model.generate_content(prompt_template)
            return generation.text
            
        else:
            return f"Developer Note: Configuration error. Only Google Gemini is supported at this time."
            
    except Exception as api_error:
        # We catch and return the error message so the user sees what went wrong with the API call
        return f"AI Service Error: {str(api_error)}"
