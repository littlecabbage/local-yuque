from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class NodeBase(SQLModel):
    title: str
    type: str # 'kb', 'folder', 'doc'
    parent_id: Optional[str] = Field(default=None, index=True)
    content: Optional[str] = Field(default=None)

class Node(NodeBase, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    created_at: float = Field(default_factory=lambda: datetime.now().timestamp() * 1000)

class NodeCreate(NodeBase):
    pass

class NodeRead(NodeBase):
    id: str
    created_at: float
