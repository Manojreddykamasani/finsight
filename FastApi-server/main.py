from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import agents, triggers
from scheduler import start_scheduler, shutdown_scheduler
import uvicorn

app = FastAPI(
    title="Finsight AI Agent Orchestrator",
    description="This server manages AI agents for a stock market simulation.",
    version="1.0.0"
)


origins = [
    "http://localhost",
    "http://localhost:3000", 
    "http://localhost:8080",
    "http://localhost:5173",
    "https://finsight-jade.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True, 
    allow_methods=["*"],    
    allow_headers=["*"],   
)


@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    shutdown_scheduler()

app.include_router(agents.router, prefix="/api")
app.include_router(triggers.router, prefix="/api")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "AI Agent Orchestrator is running."}
@app.get("/health")
def health():
    return {"status": "ok"}
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
