from typing import List, Dict, Any
from app.models.schemas import WorkflowGraph, ChatMessage
from app.services.llm_provider import generate_text
from app.services.vector_service import VectorService
from app.services.search_service import SearchService
import logging

# We use logging to track the execution flow for debugging
logger = logging.getLogger(__name__)

class WorkflowExecutor:
    """
    Handles the execution of a visual workflow graph.
    It traverses the nodes starting from the user query and processes each step.
    """
    def __init__(self, workflow_graph: WorkflowGraph):
        # Store nodes by ID for quick O(1) lookup during traversal
        self.node_map = {node.id: node for node in workflow_graph.nodes}
        self.edges = workflow_graph.edges
        self.execution_path = self._map_connections()

    def _map_connections(self) -> Dict[str, List[str]]:
        """
        Creates an adjacency list representing the flow from source to target nodes.
        """
        connections = {node_id: [] for node_id in self.node_map}
        for edge in self.edges:
            if edge.source in connections:
                connections[edge.source].append(edge.target)
        return connections

    async def execute(self, query_text: str, chat_history: List[ChatMessage]) -> str:
        """
        Main entry point to run the workflow. It manages the conversation state
        and walks through the graph nodes.
        """
        # 1. Identify where we start (the Query Node)
        entry_node = next((n for n in self.node_map.values() if n.type == 'queryNode'), None)
        
        if not entry_node:
            raise ValueError("Workflow configuration error: No 'User Query' node found.")

        # This state object acts as a shared 'blackboard' for data between nodes
        workflow_state = {
            "query": query_text,
            "history": chat_history,
            "knowledge_context": "",
            "search_results": "",
            "final_answer": ""
        }

        active_node_id = entry_node.id
        
        # Traverse the graph. Currently supports linear flows (one path at a time).
        while active_node_id:
            node = self.node_map[active_node_id]
            logger.info(f"Processing node activity: {node.type} ({node.id})")

            # Execute logic based on what the node is supposed to do
            if node.type == 'queryNode':
                # Entry point - query is already in our state
                pass
            
            elif node.type == 'knowledgeNode':
                # Fetch snippets from the vector database (PDFs/Docs)
                db_collection = node.data.collection or "knowledge_base"
                matches = VectorService.query(db_collection, workflow_state['query'])
                
                # Append found content to our running context
                workflow_state['knowledge_context'] += "\n\n".join([
                    f"From {match['metadata'].get('source', 'Document')}:\n{match['content']}" 
                    for match in matches
                ])

            elif node.type == 'searchNode':
                # Real-time search from the web
                web_context = await SearchService.search(workflow_state['query'])
                workflow_state['search_results'] += f"\n\nLatest Web Info:\n{web_context}"

            elif node.type == 'llmNode':
                # The 'brain' of the workflow. We pack all gathered context here.
                ai_model = node.data.model or "gpt-3.5-turbo"
                ai_provider = node.data.provider or "openai"
                
                all_context = (workflow_state.get('knowledge_context', "") + 
                              "\n" + 
                              workflow_state.get('search_results', "")).strip()
                
                workflow_state['final_answer'] = await generate_text(
                    provider=ai_provider,
                    model=ai_model,
                    query=workflow_state['query'],
                    context=all_context
                )

            elif node.type == 'outputNode':
                # Reached the end - return what the LLM produced
                return workflow_state['final_answer']

            # Move to the next connected node
            connections_out = self.execution_path.get(active_node_id, [])
            if not connections_out:
                break
            
            # Simple assumption: Follow the first outgoing connection
            active_node_id = connections_out[0]
        
        return workflow_state['final_answer']
