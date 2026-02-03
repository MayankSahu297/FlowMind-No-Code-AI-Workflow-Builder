# HLD/LLD Design Approach: FlowMind

## 1. High-Level Design (HLD)

### 1.1 Objective
To provide a visual, no-code platform for building AI-driven workflows that integrate Large Language Models (LLMs), Vector Databases (RAG), and Real-time Web Search.

### 1.2 System Architecture
FlowMind follows a modular client-server architecture:
- **Frontend**: A React single-page application (SPA) using React Flow for the visual canvas. It manages the graph state (nodes/edges) and communicates with the backend via REST APIs.
- **Backend**: A FastAPI (Python) server that acts as the orchestration engine. It parses the workflow graph and executes each node in sequence.
- **Vector Database**: ChromaDB is used to store and retrieve document embeddings for Retrieval-Augmented Generation (RAG).
- **Relational Database**: PostgreSQL stores workflow definitions and document metadata.
- **AI Services**: Integration with Google Gemini and OpenAI for text generation, and SerpAPI for live web results.

### 1.3 Data Flow
1. **Input**: User submits a query via the "User Query" node.
2. **Context Retrieval**: If a "Knowledge Base" node is connected, relevant snippets are fetched from ChromaDB.
3. **Information Augmentation**: If a "Web Search" node is connected, real-time data is fetched via SerpAPI.
4. **Processing**: The "LLM Engine" node aggregates the query + context + search results into a prompt and calls the selected model.
5. **Output**: The "Output" node displays the final response in the chat interface.

---

## 2. Low-Level Design (LLD)

### 2.1 Component Specifications
- **WorkflowExecutor (Class)**: The core engine.
  - `_map_connections()`: Converts the graph into an adjacency list.
  - `execute()`: An asynchronous function that iterates through the node map, maintaining a `workflow_state` object.
- **VectorService (Static Utility)**: 
  - `add_documents()`: Chunks PDF text using PyMuPDF and generates embeddings.
  - `query()`: Performs similarity search.
- **LLM Provider (Module)**: A unified interface for different AI providers, ensuring consistent prompt formatting across OpenAI and Gemini.

### 2.2 Database Schema
- **Workflows Table**: `id (UUID)`, `name (String)`, `graph_data (JSONB)`.
- **Documents Table**: `id (Serial)`, `filename (String)`, `chunks_count (Int)`, `upload_date (DateTime)`.

### 2.3 Error Handling
- **API Rate Limits**: Handled via try-except blocks with descriptive error returns (e.g., 429 Quota Exceeded).
- **Validation**: Frontend validates that a workflow must have a "User Query" and "Output" node before execution.
