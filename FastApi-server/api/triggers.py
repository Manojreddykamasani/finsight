import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services.agent_orchestrator import trigger_all_agents_with_news, trigger_daily_market_review
from services.node_api_service import node_api_service 

logger = logging.getLogger(__name__)
router = APIRouter()

class NewsTrigger(BaseModel):
    news_headline: str
    news_content: str

@router.post("/trigger/news")
async def trigger_news_event(trigger: NewsTrigger, background_tasks: BackgroundTasks):
    """
    Trigger all agents to react to a new news event.
    This now creates the event in the DB first.
    """
    try:
        new_event = await node_api_service.create_news_event(
            headline=trigger.news_headline,
            content=trigger.news_content
        )
        
        if not new_event or '_id' not in new_event:
            logger.error("Failed to create news event in Node.js, aborting agent trigger.")
            raise HTTPException(status_code=500, detail="Failed to create news event in database.")
            
        event_id = new_event['_id']
        logger.info(f"News event created with ID: {event_id}. Triggering agents...")

        background_tasks.add_task(
            trigger_all_agents_with_news, 
            news_string=trigger.news_headline, 
            event_id=event_id                 
        )
        
        return {"message": "News event trigger accepted. Agents are processing in the background."}

    except Exception as e:
        logger.error(f"Error in trigger_news_event endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trigger/daily-review")
async def trigger_daily_review(background_tasks: BackgroundTasks):
    """
    Triggers the daily market review for all agents.
    """
    logger.info("Daily review trigger accepted. Agents are processing in the background.")
    background_tasks.add_task(trigger_daily_market_review)
    return {"message": "Daily review trigger accepted. Agents are processing in the background."}