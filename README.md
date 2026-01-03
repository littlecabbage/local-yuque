# Yueque Local - 本地知识库

这是一个本地运行的知识库应用，包含 React 前端和 Python FastAPI 后端。

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
```

服务器将在 `http://localhost:8000` 运行。

### 3. 启动前端

打开新的终端，进入 `frontend` 目录并运行：

```bash
cd frontend
# 首次运行安装依赖
npm install
# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:3000` (或类似端口) 运行。

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
