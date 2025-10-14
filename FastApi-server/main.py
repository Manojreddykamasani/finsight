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

# --- CORS (Cross-Origin Resource Sharing) Middleware ---
# This allows your frontend application (e.g., running on http://localhost:3000)
# to make requests to this FastAPI backend.

origins = [
    "http://localhost",
    "http://localhost:3000", # Default for Next.js/React
    "http://localhost:8080",
    "http://localhost:5173", # Default for Vite
    # Add the URL of your deployed frontend application here
    # e.g., "https://your-app-name.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # The list of origins that are allowed to make cross-origin requests.
    allow_credentials=True, # Support cookies for cross-origin requests.
    allow_methods=["*"],    # Allow all methods (GET, POST, etc.).
    allow_headers=["*"],    # Allow all headers.
)


# --- Scheduler Events ---
@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    shutdown_scheduler()

# --- API Routers ---
app.include_router(agents.router, prefix="/api")
app.include_router(triggers.router, prefix="/api")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "AI Agent Orchestrator is running."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
