import os
import aiofiles
import asyncio
from typing import List, Optional, Dict, Literal

class FileSystemService:
    def __init__(self, root_dir: str):
        self.root_dir = root_dir

    async def initialize(self):
        if not os.path.exists(self.root_dir):
            os.makedirs(self.root_dir)

    async def get_tree(self) -> List[Dict]:
        return await self._scan_directory(self.root_dir, None)

    async def _scan_directory(self, dir_path: str, parent_id: Optional[str]) -> List[Dict]:
        nodes = []
        try:
            entries = os.scandir(dir_path)
            for entry in entries:
                if entry.name.startswith('.'):
                    continue

                full_path = entry.path
                relative_path = os.path.relpath(full_path, self.root_dir).replace("\\", "/")
                # Use relative path as ID
                node_id = relative_path
                
                stats = entry.stat()
                created_at = stats.st_ctime * 1000 # JS uses milliseconds

                node = {
                    "id": node_id,
                    "parentId": parent_id,
                    "title": entry.name.replace('.md', '') if entry.name.endswith('.md') else entry.name,
                    "type": "doc" if entry.is_file() and entry.name.endswith('.md') else ("folder" if entry.is_dir() else None),
                    "createdAt": created_at
                }

                if node["type"] == "doc":
                    nodes.append(node)
                elif entry.is_dir():
                    # Top level folders are considered KBs if parent is root
                    if parent_id is None:
                        node["type"] = "kb"
                    else:
                        node["type"] = "folder"
                    
                    node["children"] = await self._scan_directory(full_path, node_id)
                    nodes.append(node)
        except Exception as e:
            print(f"Error scanning {dir_path}: {e}")
            
        return nodes

    async def read_file(self, relative_path: str) -> str:
        full_path = os.path.join(self.root_dir, relative_path)
        self._check_path_security(full_path)
        
        async with aiofiles.open(full_path, mode='r', encoding='utf-8') as f:
            return await f.read()

    async def write_file(self, relative_path: str, content: str) -> None:
        full_path = os.path.join(self.root_dir, relative_path)
        self._check_path_security(full_path)
        
        async with aiofiles.open(full_path, mode='w', encoding='utf-8') as f:
            await f.write(content)

    async def create_node(self, relative_path: str, node_type: str) -> None:
        full_path = os.path.join(self.root_dir, relative_path)
        self._check_path_security(full_path)
        
        if node_type == 'doc':
            # Ensure .md extension
            if not full_path.endswith('.md'):
                full_path += '.md'
            # Create empty file
            async with aiofiles.open(full_path, mode='w', encoding='utf-8') as f:
                await f.write("")
        else:
            os.makedirs(full_path, exist_ok=True)

    def _check_path_security(self, full_path: str):
        # Basic security check to prevent directory traversal
        if not os.path.abspath(full_path).startswith(os.path.abspath(self.root_dir)):
            raise ValueError("Access denied")
