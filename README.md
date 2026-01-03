# Yueque Local - 本地知识库

这是一个本地运行的知识库应用，包含 React 前端和 Python FastAPI 后端。

## 功能特性

- 📚 知识库管理 - 创建、删除、重命名知识库
- 📁 文件夹支持 - 多级目录结构
- 📝 文档编辑 - Markdown编辑器
- 🔍 全文搜索 - 快速查找内容
- 🤖 AI集成 - 智能助手面板
- 💾 本地存储 - SQLite数据库持久化

## 技术栈

- **前端**: React + TypeScript + Vite + TailwindCSS
- **后端**: FastAPI + SQLModel + SQLite
- **数据库**: SQLite

## 快速开始

### 1. 启动后端

```bash
cd backend
uv sync
uv run python -m main
```

服务器将在 `http://localhost:8000` 运行。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 `http://localhost:3000` (或类似端口) 运行。

## 项目结构

```
local_yuque/
├── backend/           # FastAPI 后端
│   ├── main.py       # 主应用入口
│   ├── models.py     # 数据模型
│   ├── database.py   # 数据库配置
│   └── services/     # 业务逻辑
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/  # UI组件
│   │   ├── services/    # API服务
│   │   └── types.ts     # 类型定义
│   └── ...
├── doc/               # 文档
├── data/              # 数据库存储
└── Scripts/           # 启动脚本
```

## 许可证

MIT