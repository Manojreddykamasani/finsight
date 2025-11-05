import httpx
from core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NodeAPIService:
    def __init__(self):
        self.base_url = settings.NODE_BASE_URL
        if not self.base_url:
            logger.critical("NODE_BASE_URL is not set! The API service cannot start.")
            raise ValueError("NODE_BASE_URL is not set in environment.")
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_all_agents(self):
        """Fetches all agents from the Node.js server."""
        try:
            response = await self.client.get(f"{self.base_url}/agents")
            response.raise_for_status()
            return response.json().get('data', [])
        except httpx.HTTPStatusError as e:
            logger.error(f"Error fetching agents: {e.response.text}")
            return []
    
    async def get_all_stocks(self):
        """Fetches all stocks from the Node.js server."""
        try:
            response = await self.client.get(f"{self.base_url}/stocks") 
            response.raise_for_status()
            return response.json().get('data', [])
        except httpx.HTTPStatusError as e:
            logger.error(f"Error fetching stocks: {e.response.text}")
            return []

    # --- THIS IS THE CORRECTED FUNCTION ---
    async def create_agent(self, name: str, persona: str, model: str):
        """Creates a new agent via the Node.js API, now including the model."""
        try:
            # The 'model' is now included in the payload
            payload = {"name": name, "persona": persona, "model": model}
            response = await self.client.post(f"{self.base_url}/agents", json=payload)
            response.raise_for_status()
            logger.info(f"Successfully created agent: {name} with model {model}")
            return response.json()
        except httpx.HTTPStatusError as e:
            # Try to parse the error message from Node.js
            try:
                error_message = e.response.json().get("message", e.response.text)
            except:
                error_message = e.response.text
            logger.error(f"Error creating agent '{name}': {error_message}")
            return {"status": "fail", "message": error_message}
    # --- END CORRECTION ---


    async def get_agent_details(self, agent_id: str):
        """Fetches detailed portfolio, balance, and loan info for a specific agent."""
        try:
            response = await self.client.get(f"{self.base_url}/agents/{agent_id}")
            response.raise_for_status()
            return response.json().get('data')
        except httpx.HTTPStatusError as e:
            logger.error(f"Error fetching details for agent {agent_id}: {e.response.text}")
            return None

    async def agent_action(self, endpoint: str, payload: dict):
        """Generic function to handle buy, sell, log, or loan actions."""
        try:
            url = f"{self.base_url}/agents/{endpoint}"
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Agent action '{endpoint}' successful for agent {payload.get('agentId')}")
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Agent action '{endpoint}' failed: {e.response.text}")
            return None

    async def create_news_event(self, headline: str, content: str) -> dict | None:
        """
        Creates a new news event in the Node.js database and returns the event data.
        """
        payload = {
            "news_headline": headline,
            "news_content": content
        }
        try:
            url = f"{self.base_url}/news"
            response = await self.client.post(url, json=payload) 
            response.raise_for_status()
            logger.info(f"Successfully created news event: {headline}")
            return response.json().get('data') # Return the new event object
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating news event: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            logger.error(f"Error creating news event: {e}", exc_info=True)
        return None

node_api_service = NodeAPIService()