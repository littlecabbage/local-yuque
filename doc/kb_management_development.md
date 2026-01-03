# 知识库管理功能开发文档

## 概述

本项目实现了完整的知识库管理功能，支持知识库的增加、删除、重命名和搜索操作，使用SQLite数据库进行持久化存储。

## 技术架构

- **后端**: FastAPI + SQLModel + SQLite
- **前端**: React + TypeScript + Vite
- **数据库**: SQLite (通过SQLModel ORM)

## 数据模型

### Node模型

```python
class Node(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    title: str
    type: str  # 'kb', 'folder', 'doc'
    parent_id: Optional[str] = Field(default=None, index=True)
    content: Optional[str] = Field(default=None)
    created_at: float = Field(default_factory=lambda: datetime.now().timestamp() * 1000)
```

### 节点类型说明

- **kb**: 知识库根节点
- **folder**: 文件夹节点
- **doc**: 文档节点

## API端点

### 1. 获取知识库树形结构

**GET** `/api/kb`

返回整个知识库的层次结构。

**响应示例**:
```json
[
  {
    "id": "uuid-1",
    "parentId": null,
    "title": "我的知识库",
    "type": "kb",
    "createdAt": 1640995200000,
    "children": [
      {
        "id": "uuid-2",
        "parentId": "uuid-1",
        "title": "技术文档",
        "type": "folder",
        "createdAt": 1640995300000,
        "children": [...]
      }
    ]
  }
]
```

### 2. 创建新节点

**POST** `/api/create`

**请求体**:
```json
{
  "parentId": "uuid-parent",  // 可选，null表示顶级节点
  "title": "新文档",
  "type": "doc"  // 'kb', 'folder', 'doc'
}
```

**响应**:
```json
{
  "success": true,
  "node": {
    "id": "uuid-new",
    "title": "新文档",
    "type": "doc",
    "parent_id": "uuid-parent",
    "content": "",
    "created_at": 1640995400000
  }
}
```

### 3. 删除节点

**POST** `/api/delete/{node_id}`

删除指定节点及其所有子节点（级联删除）。

**响应**:
```json
{"success": true}
```

### 4. 重命名节点

**POST** `/api/rename/{node_id}`

**请求体**:
```json
{
  "title": "新名称"
}
```

**响应**:
```json
{
  "success": true,
  "node": {
    "id": "uuid",
    "title": "新名称",
    ...
  }
}
```

### 5. 搜索节点

**GET** `/api/search?q=搜索关键词`

在节点标题和内容中搜索匹配的节点。

**响应示例**:
```json
[
  {
    "id": "uuid-1",
    "title": "包含关键词的文档",
    "type": "doc",
    "parent_id": "uuid-parent",
    "content": "文档内容包含关键词...",
    "created_at": 1640995500000
  }
]
```

### 6. 获取文件内容

**GET** `/api/files/{node_id}`

获取文档节点的内容。

**响应**:
```json
{
  "content": "文档内容..."
}
```

### 7. 保存文件内容

**POST** `/api/files/{node_id}`

**请求体**:
```json
{
  "content": "新的文档内容..."
}
```

**响应**:
```json
{"success": true}
```

## 数据库设计

### 表结构

```sql
CREATE TABLE node (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('kb', 'folder', 'doc')),
    parent_id VARCHAR,
    content TEXT,
    created_at REAL NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES node(id)
);
```

### 索引设计

- `parent_id` 索引：加速父子关系查询
- `title` 和 `content` 的文本搜索：通过SQLModel的`contains`方法实现

## 核心功能实现

### 1. 级联删除

删除节点时会递归删除所有子节点，确保数据完整性。

### 2. 树形结构构建

通过递归查询构建层次化的树形结构，支持无限层级嵌套。

### 3. 全文搜索

支持在节点标题和内容中进行模糊搜索。

## 前端集成

前端通过以下方式与后端API交互：

1. **获取树形结构**: 用于渲染知识库导航
2. **创建节点**: 支持创建知识库、文件夹和文档
3. **删除节点**: 支持删除任意节点及其子节点
4. **重命名**: 支持修改节点名称
5. **搜索**: 支持实时搜索功能

## 使用示例

### 创建知识库
```bash
curl -X POST http://localhost:8000/api/create \
  -H "Content-Type: application/json" \
  -d '{"title":"技术文档","type":"kb","parentId":null}'
```

### 创建文件夹
```bash
curl -X POST http://localhost:8000/api/create \
  -H "Content-Type: application/json" \
  -d '{"title":"前端开发","type":"folder","parentId":"kb-uuid"}'
```

### 创建文档
```bash
curl -X POST http://localhost:8000/api/create \
  -H "Content-Type: application/json" \
  -d '{"title":"React入门","type":"doc","parentId":"folder-uuid"}'
```

### 搜索文档
```bash
curl "http://localhost:8000/api/search?q=React"
```

## 部署和运行

### 启动后端
```bash
cd backend
python -m main
```

### 启动前端
```bash
cd frontend
npm install
npm run dev
```

## 扩展建议

1. **权限管理**: 添加用户权限控制
2. **版本控制**: 实现文档版本历史
3. **标签系统**: 支持文档标签分类
4. **导入导出**: 支持知识库导入导出
5. **协作功能**: 支持多人协作编辑
6. **全文索引**: 使用SQLite FTS5提升搜索性能

## 注意事项

1. 数据库文件存储在`data/local_yuque.db`
2. 所有ID使用UUID v4格式
3. 时间戳使用毫秒级Unix时间戳
4. 支持跨域请求（CORS已配置）