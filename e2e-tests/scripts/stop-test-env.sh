#!/bin/bash
# Script to stop the e2e test environment

echo "🛑 Stopping E2E test environment..."

# Function to check if a port is in use
is_port_in_use() {
  if lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null ; then
    return 0
  else
    return 1
  fi
}

# Kill backend process
if [ -f "./logs/backend.pid" ]; then
  BACKEND_PID=$(cat ./logs/backend.pid)
  if ps -p $BACKEND_PID > /dev/null; then
    echo "🔄 Stopping backend server (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID
  else
    echo "ℹ️ Backend server already stopped"
  fi
  rm ./logs/backend.pid
fi

# Kill frontend process
if [ -f "./logs/frontend.pid" ]; then
  FRONTEND_PID=$(cat ./logs/frontend.pid)
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "🔄 Stopping frontend server (PID: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID
  else
    echo "ℹ️ Frontend server already stopped"
  fi
  rm ./logs/frontend.pid
fi

# Check for any remaining processes on test ports and kill them
for PORT in 3002 3003 5433 9002 9003; do
  if is_port_in_use $PORT; then
    echo "🔄 Force killing process on port $PORT..."
    # Get PID of process using the port and kill it
    PID=$(lsof -t -i:$PORT)
    if [ ! -z "$PID" ]; then
      echo "   Found process with PID $PID, killing..."
      kill -9 $PID 2>/dev/null || true
    fi
  fi
done

# Stop Docker containers
echo "🐳 Stopping Docker containers..."
cd ../
docker compose -f docker-compose.test.yml down
cd e2e-tests/

# Sleep to ensure all processes are terminated
sleep 2

# Final verification
for PORT in 3002 3003 5433 9002 9003; do
  if is_port_in_use $PORT; then
    echo "⚠️ Warning: Port $PORT is still in use after cleanup"
  fi
done

echo "✅ Test environment stopped successfully!"