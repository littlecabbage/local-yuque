# Yueque Local - 本地知识库

这是一个本地运行的知识库应用，包含 React 前端和 Python FastAPI 后端。

<<<<<<< HEAD
## 目录结构

- `frontend/`: React 前端代码
- `backend/`: Python FastAPI 后端代码
- `data/`: 知识库数据存储目录（自动创建）

## 如何运行

### 1. 准备环境

确保已安装：
- Node.js
- Python 3.8+

### 2. 启动后端

进入 `backend` 目录并运行：

```bash
cd backend
# 使用 uv 同步依赖
uv sync

# 启动服务器
uv run uvicorn main:app --reload
=======
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
>>>>>>> 56a0bc77a6e27f764cf8c49aef764db8ee95c3d1
```

服务器将在 `http://localhost:8000` 运行。

<<<<<<< HEAD
### 3. 启动前端

打开新的终端，进入 `frontend` 目录并运行：

```bash
cd frontend
# 首次运行安装依赖
npm install
# 启动开发服务器
=======
### 2. 启动前端

```bash
cd frontend
npm install
>>>>>>> 56a0bc77a6e27f764cf8c49aef764db8ee95c3d1
npm run dev
```

前端将在 `http://localhost:3000` (或类似端口) 运行。

<<<<<<< HEAD
### 4. 一键启动

在 `Scripts` 目录下提供了方便的启动脚本：

- **Windows**: 运行 `Scripts/start.ps1`
- **Linux/Mac**: 运行 `Scripts/start.sh`

```powershell
# Windows
.\Scripts\start.ps1
```

```bash
# Linux/Mac
chmod +x Scripts/start.sh
./Scripts/start.sh
```
=======
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
>>>>>>> 56a0bc77a6e27f764cf8c49aef764db8ee95c3d1
