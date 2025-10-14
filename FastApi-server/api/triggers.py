from fastapi import APIRouter, BackgroundTasks
from models.agent_models import NewsTrigger
from services.agent_orchestrator import trigger_all_agents_with_news

router = APIRouter(prefix="/trigger", tags=["Agent Triggers"])

@router.post("/news")
async def trigger_by_news(news_data: NewsTrigger, background_tasks: BackgroundTasks):
    """
    Receives a news event and triggers all agents to react.
    This runs as a background task so the API returns a response immediately.
    """
    news_string = f"Headline: {news_data.news_headline}. Details: {news_data.news_content}"
    background_tasks.add_task(trigger_all_agents_with_news, news_string)
    
    return {"message": "News trigger received. Agents are now processing the information."}