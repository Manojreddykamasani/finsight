from pydantic import BaseModel
from typing import Literal

class AgentCreate(BaseModel):
    name: str
    persona: str 
    model: str = "gemini-pro"

class NewsTrigger(BaseModel):
    news_headline: str
    news_content: str