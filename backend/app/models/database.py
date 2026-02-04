from sqlalchemy import create_engine, Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/flowmind")

try:
    engine = create_engine(DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    print("PostgreSQL connection failed. Falling back to SQLite for local development.")
    DATABASE_URL = "sqlite:///./flowmind.db"
    # For SQLite, we need connect_args={"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DocumentMetadata(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    collection = Column(String)
    chunks_count = Column(Integer)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

class SavedWorkflow(Base):
    __tablename__ = "workflows"
    
    id = Column(String, primary_key=True, index=True) # UI generated ID or name
    name = Column(String, unique=True)
    graph_data = Column(JSON) # Stores nodes and edges
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
