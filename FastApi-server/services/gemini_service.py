import google.generativeai as genai
from core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)

# Define the expected JSON structure for the AI's response
JSON_RESPONSE_SCHEMA = """
{
    "emotion": "A single word describing your current sentiment (e.g., Cautious, Optimistic, Anxious, Greedy)",
    "reasoning": "A brief, one-sentence explanation for your decision.",
    "decision": "Your action: one of 'BUY', 'SELL', or 'HOLD'.",
    "symbol": "The stock symbol for your action. Provide null if HOLD.",
    "quantity": "The number of shares to trade. Provide 0 if HOLD."
}
"""

async def generate_agent_decision(prompt: str):
    """
    Sends a prompt to the Gemini API and expects a structured JSON response.
    """
    model = genai.GenerativeModel('gemini-2.5-pro')
    print(prompt)
    try:
        full_prompt = f"{prompt}\n\nRespond ONLY with a valid JSON object matching this schema:\n{JSON_RESPONSE_SCHEMA}"
        response = await model.generate_content_async(full_prompt)
        
        # Clean the response to extract only the JSON part
        text_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        logger.info(f"Gemini raw response: {text_response}")
        return json.loads(text_response)
    except Exception as e:
        logger.error(f"Error generating or parsing Gemini response: {e}")
        return None