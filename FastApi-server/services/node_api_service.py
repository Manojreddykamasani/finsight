import httpx
from core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NodeAPIService:
    def __init__(self):
        self.base_url = settings.NODE_BASE_URL
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

    async def create_agent(self, name: str, persona: str):
        """Creates a new agent via the Node.js API."""
        try:
            payload = {"name": name, "persona": persona}
            response = await self.client.post(f"{self.base_url}/agents", json=payload)
            response.raise_for_status()
            logger.info(f"Successfully created agent: {name}")
            return response.json()
        except httpx.HTTPStatusError as e:
            error_message = e.response.json().get("message", e.response.text)
            logger.error(f"Error creating agent '{name}': {error_message}")
            return {"status": "fail", "message": error_message}


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

node_api_service = NodeAPIService()
