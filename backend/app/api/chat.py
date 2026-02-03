from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.workflow_engine import WorkflowExecutor

# This router handles all chat and workflow execution related endpoints
workflow_router = APIRouter()

@workflow_router.post("/execute", response_model=ChatResponse)
async def process_workflow_chat(payload: ChatRequest):
    """
    Receives a workflow graph and a user message, then executes the graph
    to generate an AI response.
    """
    
    # Basic validation: We can't run a workflow without the node structure
    if not payload.graph:
        raise HTTPException(
            status_code=400, 
            detail="Instruction error: A workflow graph must be provided for execution."
        )
    
    try:
        # Initialize the engine with the provided visual graph
        runner = WorkflowExecutor(payload.graph)
        
        # Step through the logic defined in the graph
        ai_generated_response = await runner.execute(
            query_text=payload.message, 
            chat_history=payload.history
        )
        
        return ChatResponse(response=ai_generated_response)
        
    except Exception as execution_error:
        # Log and return server-side errors to the client
        raise HTTPException(
            status_code=500, 
            detail=f"Workflow execution failed: {str(execution_error)}"
        )
