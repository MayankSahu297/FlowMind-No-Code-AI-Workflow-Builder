import os
import google.generativeai as genai
from typing import Optional

async def generate_text(provider: str, model: str, query: str, context: Optional[str] = "") -> str:
    """
    Unified interface to call Google Gemini.
    It structures the prompt to include any retrieved context for RAG.
    """
    
    # Ensure Gemini is configured
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
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
            try:
                print(f"DEBUG: Calling Gemini with model: {model}")
                ai_model = genai.GenerativeModel(model_name=model)
                generation = ai_model.generate_content(prompt_template)
                return generation.text
            except Exception as e:
                if "404" in str(e) and model != "gemini-pro":
                    print(f"DEBUG: {model} failed with 404, falling back to gemini-pro")
                    ai_model = genai.GenerativeModel(model_name="gemini-pro")
                    generation = ai_model.generate_content(prompt_template)
                    return generation.text
                raise e
            
        else:
            return f"Developer Note: Configuration error. Only Google Gemini is supported at this time."
            
    except Exception as api_error:
        # We catch and return the error message so the user sees what went wrong with the API call
        return f"AI Service Error: {str(api_error)}"
