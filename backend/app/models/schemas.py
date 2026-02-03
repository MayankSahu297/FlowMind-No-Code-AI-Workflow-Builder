from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class NodeData(BaseModel):
    label: str
    files: Optional[List[str]] = None
    model: Optional[str] = None
    provider: Optional[str] = None

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str

class WorkflowGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class WorkflowCreate(BaseModel):
    name: str
    graph: WorkflowGraph

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    workflow_id: Optional[str]
    graph: Optional[WorkflowGraph] # Execute transient graph
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None
