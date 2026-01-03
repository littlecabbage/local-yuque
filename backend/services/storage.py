from typing import List, Optional, Dict
from sqlmodel import Session, select
from models import Node, NodeCreate
from database import engine
import uuid

class StorageService:
    def __init__(self):
        pass

    def get_tree(self) -> List[Dict]:
        with Session(engine) as session:
            # Fetch all nodes
            statement = select(Node)
            results = session.exec(statement).all()
            
            # Build tree
            nodes_by_id = {node.id: node for node in results}
            tree = []
            
            # Map for children lookups if needed, but here we can just do a pass
            # Since strict stricture requires nested children in return type
            
            # Helper to recursively build structure
            def build_node_dict(node: Node) -> Dict:
                node_dict = {
                    "id": node.id,
                    "parentId": node.parent_id,
                    "title": node.title,
                    "type": node.type,
                    "createdAt": node.created_at,
                }
                
                if node.type in ['kb', 'folder']:
                    children = [
                        build_node_dict(n) 
                        for n in results 
                        if n.parent_id == node.id
                    ]
                    node_dict["children"] = children
                    
                return node_dict

            # Top level items (parent_id is None)
            for node in results:
                if node.parent_id is None:
                    tree.append(build_node_dict(node))
            
            return tree

    def read_node(self, node_id: str) -> Optional[str]:
        with Session(engine) as session:
            node = session.get(Node, node_id)
            if not node:
                raise ValueError("Node not found")
            return node.content or ""

    def save_node_content(self, node_id: str, content: str) -> None:
        with Session(engine) as session:
            node = session.get(Node, node_id)
            if not node:
                raise ValueError("Node not found")
            node.content = content
            session.add(node)
            session.commit()

    def create_node(self, parent_id: Optional[str], type: str, title: str = "New Node") -> Node:
        # Determine title based on type and existing count if needed, 
        # or simplified logic from frontend request
        
        # NOTE: Frontend currently sends 'path' (relative path) for FS. 
        # We need to adapt API to send parent_id and title instead, 
        # OR infer it if possible.
        # But wait, frontend logic: 
        # `createNode(path, type)` -> path was like "kb/folder"
        # Since we are moving to DB, we really need the Parent ID.
        # The current Frontend 'createNode' sends 'path' which is the ID in the FS version.
        # In DB version, ID is UUID.
        
        with Session(engine) as session:
            new_node = Node(
                id=str(uuid.uuid4()),
                title=title,
                type=type,
                parent_id=parent_id,
                content="" if type == 'doc' else None
            )
            session.add(new_node)
            session.commit()
            session.refresh(new_node)
            return new_node

    def delete_node(self, node_id: str) -> None:
        with Session(engine) as session:
            # Recursive delete
            # 1. Get all nodes
            # 2. Find descendants
            # 3. Delete all
            
            # Optimization: for sqlite with correct FK, ON DELETE CASCADE works if configured.
            # But here we didn't configure explicit relationships in models.py (just parent_id field).
            # So manual cascade is safer.
            
            nodes = session.exec(select(Node)).all()
            
            to_delete = {node_id}
            # Simple iterative expansion
            added = True
            while added:
                added = False
                for node in nodes:
                    if node.parent_id in to_delete and node.id not in to_delete:
                        to_delete.add(node.id)
                        added = True
            
            for nid in to_delete:
                n = session.get(Node, nid)
                if n:
                    session.delete(n)
            
            session.commit()

    def rename_node(self, node_id: str, new_title: str) -> Node:
        with Session(engine) as session:
            node = session.get(Node, node_id)
            if not node:
                raise ValueError("Node not found")
            node.title = new_title
            session.add(node)
            session.commit()
            session.refresh(node)
            return node

    def search_nodes(self, query: str) -> List[Node]:
        with Session(engine) as session:
            # Search title or content
            statement = select(Node).where(
                (Node.title.contains(query)) | 
                (Node.content.contains(query))
            )
            results = session.exec(statement).all()
            return results
