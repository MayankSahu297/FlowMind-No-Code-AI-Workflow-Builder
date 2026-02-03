from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, SavedWorkflow
from app.models.schemas import WorkflowGraph
import uuid

router = APIRouter()

@router.post("/save")
async def save_workflow(name: str, graph: WorkflowGraph, db: Session = Depends(get_db)):
    """Saves or updates a workflow graph in PostgreSQL (Requirement #3)."""
    try:
        existing = db.query(SavedWorkflow).filter(SavedWorkflow.name == name).first()
        
        if existing:
            existing.graph_data = graph.dict()
            db.commit()
            return {"message": "Workflow updated successfully", "id": existing.id}
        
        new_workflow = SavedWorkflow(
            id=str(uuid.uuid4()),
            name=name,
            graph_data=graph.dict()
        )
        db.add(new_workflow)
        db.commit()
        return {"message": "Workflow saved successfully", "id": new_workflow.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_workflows(db: Session = Depends(get_db)):
    """Returns all saved workflows."""
    workflows = db.query(SavedWorkflow).all()
    return [{"id": w.id, "name": w.name, "created_at": w.created_at} for w in workflows]

@router.get("/{name}")
async def get_workflow(name: str, db: Session = Depends(get_db)):
    """Retrieves a specific workflow by name."""
    workflow = db.query(SavedWorkflow).filter(SavedWorkflow.name == name).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow.graph_data
