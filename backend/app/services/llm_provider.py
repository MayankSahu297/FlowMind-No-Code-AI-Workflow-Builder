import os
import openai
import google.generativeai as genai
from typing import Optional

# Setup API clients from environment variables
# Note: These are initialized once when the module loads
openai.api_key = os.getenv("OPENAI_API_KEY")

if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_text(provider: str, model: str, query: str, context: Optional[str] = "") -> str:
    """
    Unified interface to call different AI providers (OpenAI or Google Gemini).
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
        
        if provider_name == "openai":
            # Direct call to OpenAI Chat Completion
            chat_completion = openai.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a professional AI assistant providing concise and accurate answers."},
                    {"role": "user", "content": prompt_template}
                ]
            )
            return chat_completion.choices[0].message.content
            
        elif provider_name == "gemini":
            # Using Google's generative AI SDK
            ai_model = genai.GenerativeModel(model)
            generation = ai_model.generate_content(prompt_template)
            return generation.text
            
        else:
            return f"Developer Note: Configuration error. Unknown LLM provider specified: {provider}"
            
    except Exception as api_error:
        # We catch and return the error message so the user sees what went wrong with the API call
        return f"AI Service Error: {str(api_error)}"
