import os
import requests
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class SearchService:
    @staticmethod
    async def search(query: str, max_results: int = 3) -> str:
        api_key = os.getenv("SERPAPI_KEY")
        
        if not api_key:
            logger.warning("SERPAPI_KEY not found. Returning mock search results.")
            return f"Mock Search Result for '{query}': FlowMind is a visual AI workflow builder that uses nodes like User Query, LLM Engine, and Knowledge Base."

        try:
            # Using SerpAPI as mentioned in README
            url = f"https://serpapi.com/search.json?q={query}&api_key={api_key}"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            results = data.get("organic_results", [])[:max_results]
            formatted_results = []
            for r in results:
                formatted_results.append(f"Title: {r.get('title')}\nSnippet: {r.get('snippet')}\nSource: {r.get('link')}")
            
            return "\n\n".join(formatted_results)
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return f"Search Error: {str(e)}"
