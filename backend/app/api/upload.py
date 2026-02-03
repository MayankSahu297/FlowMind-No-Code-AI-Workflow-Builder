from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.vector_service import VectorService
import fitz  # PyMuPDF
import os
import shutil

router = APIRouter()

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    collection_name: str = Form("knowledge_base")
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Save temp file
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract text using PyMuPDF
        doc = fitz.open(temp_filename)
        texts = []
        metadatas = []
        
        for i, page in enumerate(doc):
            text = page.get_text()
            if text.strip():
                texts.append(text)
                metadatas.append({
                    "source": file.filename,
                    "page": i + 1
                })
        
        doc.close()
        os.remove(temp_filename)
        
        if not texts:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
            
        # Add to Vector DB
        count = VectorService.add_documents(collection_name, texts, metadatas)
        
        # Save Metadata to PostgreSQL (Requirement #1)
        from app.models.database import SessionLocal, DocumentMetadata
        db = SessionLocal()
        try:
            db_doc = DocumentMetadata(
                filename=file.filename,
                collection=collection_name,
                chunks_count=count
            )
            db.add(db_doc)
            db.commit()
        except Exception as db_err:
            print(f"Postgres Logging Error: {db_err}")
        finally:
            db.close()
        
        return {
            "message": f"Successfully processed {file.filename}",
            "chunks_added": count,
            "collection": collection_name
        }
        
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/collections")
def list_collections():
    return {"collections": VectorService.list_collections()}
