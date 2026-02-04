import os
import google.generativeai as genai
from typing import Optional
from dotenv import load_dotenv

# Load env vars to ensure API key is available
load_dotenv()

async def generate_text(provider: str, model: str, query: str, context: Optional[str] = "") -> str:
    """
    Unified interface to call Google Gemini.
    It structures the prompt to include any retrieved context for RAG.
    """
    
    # Ensure Gemini is configured
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        print(f"DEBUG: Configuring GenAI with key starting with: {api_key[:10]}...")
        genai.configure(api_key=api_key)
    else:
        return "AI Service Error: GEMINI_API_KEY not found in environment."
    
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
            # 'gemini-1.5-flash' is not available in all regions/keys yet
            # Falling back to standard 'gemini-pro' which is widely available
            target_model = "gemini-pro" 
            
            try:
                print(f"DEBUG: Calling Gemini with model: {target_model}")
                # Initialize the model with the latest standards
                ai_model = genai.GenerativeModel(model_name=target_model)
                generation = ai_model.generate_content(prompt_template)
                
                if generation and generation.text:
                    return generation.text
                return "AI Error: Received an empty response from Gemini."
                
            except Exception as e:
                print(f"CRITICAL: Gemini Request Failed: {str(e)}")
                # Provide a more helpful message for 404s
                if "404" in str(e):
                    return f"AI Service error (404): The model '{target_model}' was not found. Please ensure your API key is valid."
                raise e
            
        else:
            return f"Developer Note: Configuration error. Only Google Gemini is supported at this time."
            
    except Exception as api_error:
        # We catch and return the error message so the user sees what went wrong
        return f"AI Service Error: {str(api_error)}"
