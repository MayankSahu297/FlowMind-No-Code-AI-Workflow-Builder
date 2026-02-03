from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file immediately upon startup
load_dotenv()

# Initialize the FastAPI application
flowmind_app = FastAPI(
    title="FlowMind API", 
    version="1.0.0",
    description="Backend API for the FlowMind No-Code AI Workflow Builder"
)

# Middleware configuration for Cross-Origin Resource Sharing (CORS)
# This allows our React frontend to communicate with this API
flowmind_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, this should be restricted to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@flowmind_app.get("/")
def health_check():
    """Simple status check to verify the API is online."""
    return {
        "status": "online",
        "service": "FlowMind API",
        "version": "1.0.0"
    }

# Import and register API route modules
from app.api import chat
from app.api import upload

# Workflow execution and chat routes
flowmind_app.include_router(
    chat.workflow_router, 
    prefix="/api/v1/chat", 
    tags=["Execution"]
)

# Workflow persistence routes (Requirement #3)
from app.api import workflows
flowmind_app.include_router(
    workflows.router,
    prefix="/api/v1/workflows",
    tags=["Workflows"]
)

# File upload and Knowledge Base management routes
flowmind_app.include_router(
    upload.router, 
    prefix="/api/v1/upload", 
    tags=["Knowledge Base"]
)

# Export the app instance for Uvicorn
app = flowmind_app
