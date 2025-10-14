from fastapi import APIRouter, HTTPException
from models.agent_models import AgentCreate
from services.node_api_service import node_api_service

router = APIRouter(prefix="/agents", tags=["Agent Management"])

@router.post("/")
async def create_agent(agent_data: AgentCreate):
    result = await node_api_service.create_agent(agent_data.name, agent_data.persona)
    if result.get("status") != "success":
        raise HTTPException(status_code=400, detail="Failed to create agent in Node.js backend.")
    return result

@router.get("/")
async def get_all_agents():
    agents = await node_api_service.get_all_agents()
    return agents

