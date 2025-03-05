#!/bin/bash
# Main orchestration script for starting the e2e test environment

set -e  # Exit immediately if a command exits with a non-zero status

# Create logs directory if it doesn't exist
mkdir -p ./logs

echo "🚀 Starting E2E test environment..."

# Function to check if a port is in use
is_port_in_use() {
  if lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null ; then
    return 0
  else
    return 1
  fi
}

# Check if test services are already running
if is_port_in_use 5433 || is_port_in_use 9002 || is_port_in_use 3002 || is_port_in_use 3003; then
  echo "⚠️ Test environment services already running on required ports."
  echo "   If you want to restart, run './scripts/stop-test-env.sh' first."
  exit 1
fi

# Start Docker containers for test environment
echo "🐳 Starting Docker containers for test environment..."
cd ../
docker compose -f docker-compose.test.yml up -d
cd e2e-tests/

# Wait for containers to be ready
echo "⏳ Waiting for database to be ready..."
timeout=60
elapsed=0
while ! docker exec $(docker ps -q -f name=postgres_test) pg_isready -U ebiz_test -d ebiz_test -h localhost > /dev/null 2>&1; do
  sleep 1
  elapsed=$((elapsed+1))
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "❌ Timed out waiting for database to be ready"
    exit 1
  fi
done

# Reset and seed the test database
echo "🔄 Preparing test database..."
chmod +x ./scripts/reset-test-db.sh
./scripts/reset-test-db.sh

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the backend server for tests
echo "🚀 Starting backend server for tests..."
cd ../backend
PORT=3002 DATABASE_URL=postgresql://ebiz_test:ebiz_test_pwd@localhost:5433/ebiz_test \
FRONTEND_URL=http://localhost:3003 \
npm run start:dev > ../e2e-tests/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../e2e-tests/logs/backend.pid
cd ../e2e-tests

# Start the frontend server for tests
echo "🚀 Starting frontend server for tests..."
cd ../frontend
PORT=3003 NEXT_PUBLIC_API_URL=http://localhost:3002 \
npm run dev > ../e2e-tests/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../e2e-tests/logs/frontend.pid
cd ../e2e-tests

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout=60
elapsed=0
while ! curl -s http://localhost:3002/api > /dev/null; do
  sleep 1
  elapsed=$((elapsed+1))
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "⚠️ Warning: Backend not responding, but continuing anyway"
    break
  fi
done

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
timeout=60
elapsed=0
while ! curl -s http://localhost:3003 > /dev/null; do
  sleep 1
  elapsed=$((elapsed+1))
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "⚠️ Warning: Frontend not responding, but continuing anyway"
    break
  fi
done

echo "✅ Test environment is ready!"
echo "🌐 Backend running at: http://localhost:3002"
echo "🌐 Frontend running at: http://localhost:3003"
echo "🗄️ Database running on port 5433"
echo "📂 MinIO storage running on port 9002 (console: 9003)"
echo ""
echo "Use 'npm run test' to run all tests"
echo "Or 'npm run test:auth' to run only authentication tests"
echo ""
echo "To stop the test environment, run: './scripts/stop-test-env.sh'"