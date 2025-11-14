import google.generativeai as genai
from core.config import settings
import json
import logging
import httpx

logger = logging.getLogger(__name__)

# 1. Configure Google Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# 2. Configure Local Ollama API Client
# We create a separate client for local requests.
OLLAMA_API_URL = "http://host.docker.internal:11434/api/generate"
ollama_client = httpx.AsyncClient(timeout=60.0) # Longer timeout for local models

# 3. Define the common JSON schema
JSON_RESPONSE_SCHEMA = """
{
    "emotion": "A single word describing your current sentiment (e.g., Cautious, Optimistic, Anxious, Greedy)",
    "reasoning": "A brief, one-sentence explanation for your decision.",
    "decision": "Your action: one of 'BUY', 'SELL', or 'HOLD'.",
    "symbol": "The stock symbol for your action. Provide null if HOLD.",
    "quantity": "The number of shares to trade. Provide 0 if HOLD."
}
"""

async def generate_agent_decision(prompt: str, model_name: str = "gemini-2.5-pro"):
    """
    Generates a structured JSON decision from the appropriate LLM.
    Routes to Google Gemini API or a local Ollama API based on model_name.
    """
    
    full_prompt = f"{prompt}\n\nRespond ONLY with a valid JSON object matching this schema:\n{JSON_RESPONSE_SCHEMA}"
    logger.info(f"Routing decision for model: {model_name}")
    
    text_response = ""
    try:
        # --- ROUTE 1: Google Gemini API ---
        if model_name.startswith("gemini-"):
            model = genai.GenerativeModel(model_name)
            response = await model.generate_content_async(full_prompt)
            text_response = response.text

        # --- ROUTE 2: Local Ollama API ---
        elif model_name.startswith("ollama/"):
            # Extract model name after prefix (e.g., "ollama/tinyllama" -> "tinyllama")
            local_model_name = model_name.split('/', 1)[1]
            
            ollama_payload = {
                "model": local_model_name,
                "prompt": full_prompt,
                "format": "json",  # Request JSON output from Ollama
                "stream": False
            }
            response = await ollama_client.post(OLLAMA_API_URL, json=ollama_payload)
            response.raise_for_status() # Check for HTTP errors
            
            # Ollama (with format:json) returns the JSON string in the 'response' field
            text_response = response.json().get("response", "{}")

        # --- Unknown Model ---
        else:
            logger.error(f"Unknown model provider for: {model_name}")
            return None

        # --- Common Parsing Step ---
        # Clean the response to extract only the JSON part
        clean_text = text_response.strip().replace("```json", "").replace("```", "").strip()
        logger.info(f"AI raw response from {model_name}: {clean_text}")
        return json.loads(clean_text)

    except httpx.ConnectError as e:
        logger.error(f"Failed to connect to local Ollama API at {OLLAMA_API_URL}.")
        logger.error("Please ensure Ollama is running on your local machine.")
        return None
    except Exception as e:
        logger.error(f"Error generating or parsing LLM response from {model_name}: {e}", exc_info=True)
        return None