from pydantic import BaseModel
from typing import Literal

class AgentCreate(BaseModel):
    name: str
    persona: str # e.g., "Aggressive Growth Investor", "Cautious Value Investor"
    model: str = "gemini-pro"

class NewsTrigger(BaseModel):
    news_headline: str
    news_content: str