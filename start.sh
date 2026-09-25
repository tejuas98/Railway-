#!/usr/bin/env bash
# GATI-SETU Railway ETA Engine - Startup Orchestrator
# Runs PyTorch Geometric ST-GAT Microservice + Vite React Cockpit concurrently

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "   🚆 GATI-SETU: Dynamic Train ETA Prediction System (SIH PS 26028)    "
echo "======================================================================"

# Check Python environment
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed or not in PATH."
    exit 1
fi

# Check Node environment
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH."
    exit 1
fi

# Trap SIGINT and SIGTERM to kill child processes cleanly
cleanup() {
    echo ""
    echo "🛑 Shutting down GATI-SETU services..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✅ All services stopped safely."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "⚙️  1. Starting PyTorch Geometric ST-GAT Microservice on port 8000..."
export PYTHONPATH="$DIR:$PYTHONPATH"
python3 -m uvicorn server.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend health check
echo -n "⏳ Waiting for backend to initialize..."
for i in {1..15}; do
    if curl -s http://127.0.0.1:8000/api/v1/health >/dev/null 2>&1; then
        echo " Ready! [PID $BACKEND_PID]"
        break
    fi
    sleep 0.5
    echo -n "."
done

echo "⚡ 2. Starting Vite React Frontend Cockpit on port 5173..."
npm run dev &
FRONTEND_PID=$!

sleep 2

echo "======================================================================"
echo "   🚀 GATI-SETU SYSTEM IS FULLY OPERATIONAL AND RUNNING LIVE!         "
echo "======================================================================"
echo "   🖥️  Frontend Application: http://localhost:5173/                   "
echo "   📊 Swagger API Docs:      http://localhost:8000/docs               "
echo "   🔌 OpenAPI Spec:          http://localhost:8000/openapi.json       "
echo "   🩺 Backend Health Check:  http://localhost:8000/api/v1/health      "
echo "   📈 Train ETA Live Query:  http://localhost:8000/api/v1/eta/12302   "
echo "======================================================================"
echo "Press CTRL+C at any time to gracefully terminate both services."
echo ""

wait
