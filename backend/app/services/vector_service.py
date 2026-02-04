import chromadb
from chromadb.config import Settings
import logging

logger = logging.getLogger(__name__)

import os

# Initialize ChromaDB Client
chroma_host = os.getenv("CHROMA_HOST")
chroma_port = os.getenv("CHROMA_PORT")

if chroma_host and chroma_port:
    try:
        logger.info(f"Connecting to ChromaDB at {chroma_host}:{chroma_port}")
        client = chromadb.HttpClient(host=chroma_host, port=int(chroma_port))
        # Test connection
        client.heartbeat()
    except Exception as e:
        logger.error(f"Failed to connect to remote ChromaDB: {e}. Falling back to local storage.")
        client = chromadb.PersistentClient(path="./chroma_db")
else:
    logger.info("Using local embedded ChromaDB")
    client = chromadb.PersistentClient(path="./chroma_db")

class VectorService:
    @staticmethod
    def get_or_create_collection(collection_name: str):
        try:
            return client.get_or_create_collection(name=collection_name)
        except Exception as e:
            logger.error(f"Error creating collection {collection_name}: {e}")
            raise e

    @staticmethod
    def add_documents(collection_name: str, documents: list[str], metadatas: list[dict] = None, ids: list[str] = None):
        try:
            collection = VectorService.get_or_create_collection(collection_name)
            
            # If no IDs provided, generate them
            if ids is None:
                ids = [f"doc_{str(hash(doc))}" for doc in documents]
                
            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            return len(documents)
        except Exception as e:
            logger.error(f"Error adding documents to {collection_name}: {e}")
            raise e

    @staticmethod
    def query(collection_name: str, query_text: str, n_results: int = 3):
        try:
            collection = client.get_collection(name=collection_name)
            results = collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            
            # results is a dict with 'documents', 'metadatas', etc.
            # Flattening for easier consumption
            retrieved = []
            if results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    meta = results['metadatas'][0][i] if results['metadatas'] else {}
                    retrieved.append({
                        "content": doc,
                        "metadata": meta
                    })
            return retrieved
        except Exception as e:
            # Collection might not exist
            logger.warning(f"Error querying {collection_name} (might not exist): {e}")
            return []

    @staticmethod
    def list_collections():
        return [c.name for c in client.list_collections()]
