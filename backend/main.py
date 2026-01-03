from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from services.storage import StorageService
from database import create_db_and_tables
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Storage
storage = StorageService()

# Models for Requests
class CreateNodeRequest(BaseModel):
    # Frontend logic previously sent 'path', but now we need parentId + type
    # We'll adapt: if 'path' is sent (legacy), we might need to handle it or expect frontend update.
    # For now, let's update frontend to send parentId.
    parentId: Optional[str] = None
    title: str
    type: str

class SaveFileRequest(BaseModel):
    content: str

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/api/kb")
async def get_tree():
    try:
        return storage.get_tree()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/{node_id}")
async def get_file(node_id: str):
    try:
        content = storage.read_node(node_id)
        return {"content": content}
    except ValueError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/files/{node_id}")
async def save_file(node_id: str, request: SaveFileRequest):
    try:
        storage.save_node_content(node_id, request.content)
        return {"success": True}
    except ValueError:
        raise HTTPException(status_code=404, detail="Node not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create")
async def create_node(request: CreateNodeRequest):
    try:
        new_node = storage.create_node(request.parentId, request.type, request.title)
        return {"success": True, "node": new_node}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

class RenameRequest(BaseModel):
    title: str

@app.post("/api/delete/{node_id}")
async def delete_node(node_id: str):
    try:
        storage.delete_node(node_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rename/{node_id}")
async def rename_node(node_id: str, request: RenameRequest):
    try:
        node = storage.rename_node(node_id, request.title)
        return {"success": True, "node": node}
    except ValueError:
        raise HTTPException(status_code=404, detail="Node not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search")
async def search_nodes(q: str):
    try:
        results = storage.search_nodes(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
