from fastapi import APIRouter, HTTPException
from models.agent_models import AgentCreate
from services.node_api_service import node_api_service

router = APIRouter(prefix="/agents", tags=["Agent Management"])

@router.post("/")
async def create_agent(agent_data: AgentCreate):
    """
    Creates a new agent, now including the selected model.
    """
    # --- MODIFIED LINE ---
    # Pass all three arguments to the service
    result = await node_api_service.create_agent(
        agent_data.name, 
        agent_data.persona, 
        agent_data.model
    )
    # --- END MODIFIED LINE ---
    
    if result.get("status") != "success":
        # Get more specific error message from the service
        error_detail = result.get("message", "Failed to create agent in Node.js backend.")
        raise HTTPException(status_code=400, detail=error_detail)
    return result

@router.get("/")
async def get_all_agents():
    agents = await node_api_service.get_all_agents()
    return agents