# Source Code Documentation: FlowMind

## 1. Project Overview
FlowMind is a full-stack AI orchestration platform. It allows users to build "stacks" of AI logic visually.

## 2. Key Components & Roles

### 2.1 Frontend (React + React Flow)
- **`App.jsx`**: Global state management. orchestrates the canvas, sidebar, and config panels.
- **`Sidebar.jsx`**: The component library. Handles drag-and-drop initialization.
- **`WorkflowArea.jsx`**: The interactive canvas. Manages node placements and handle-to-handle connections.
- **`NodeTemplates`**: Modular components (`LLMNode.jsx`, `KnowledgeNode.jsx`, etc.) that define the UI of each node type.
- **`ChatPanel.jsx`**: The execution interface. Captures user input and triggers the backend "run" sequence.

### 2.2 Backend (FastAPI + Python)
- **`app/main.py`**: Entry point. Configures CORS and registers sub-routers.
- **`app/services/workflow_engine.py`**: The logic "brain". It understands how to follow the arrows on the canvas to produce a result.
- **`app/services/vector_service.py`**: Interfaces with ChromaDB for RAG functionality.
- **`app/api/upload.py`**: Handles PDF processing, text extraction (PyMuPDF), and vector ingestion.
- **`app/api/workflows.py`**: Manages the saving/loading of canvas states to PostgreSQL.

## 3. Interactions & Flow
1. The user drags nodes and connects them.
2. When "Chat" is triggered, the **Frontend** sends a JSON representation of the graph to the `/execute` endpoint.
3. The **Backend** initializes the `WorkflowExecutor`.
4. The executor loops through each node. If it hits a `KnowledgeNode`, it queries the database. If it hits an `LLMNode`, it calls the AI.
5. The final string is returned to the frontend and displayed in the **ChatPanel**.

## 4. Setup & Installation
Refer to the `README.md` for detailed Docker and Local setup instructions.
