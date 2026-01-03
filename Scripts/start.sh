#!/bin/bash

# Get the directory where this script resides
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get project root
PROJECT_ROOT="$DIR/.."

echo "Starting Local Yuque from $PROJECT_ROOT"

# Trap Ctrl+C to kill child processes
trap 'kill 0' INT

# Start Backend
echo "Starting Backend..."
cd "$PROJECT_ROOT/backend"
uv run uvicorn main:app --reload &

# Start Frontend
echo "Starting Frontend..."
cd "$PROJECT_ROOT/frontend"
npm run dev &

wait
