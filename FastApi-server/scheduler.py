from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.agent_orchestrator import trigger_daily_market_review
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

def start_scheduler():
    # Schedule the daily review to run every day at 10:00 AM IST
    scheduler.add_job(trigger_daily_market_review, 'cron', hour=10, minute=0)
    scheduler.start()
    logger.info("Scheduler started. Daily agent review scheduled for 10:00 AM IST.")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shut down.")