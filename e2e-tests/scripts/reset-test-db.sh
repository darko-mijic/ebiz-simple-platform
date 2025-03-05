#!/bin/bash
# Reset test database for E2E testing

set -e  # Exit immediately if a command exits with a non-zero status

# Load test environment variables
if [ -f ".env.test" ]; then
  export $(grep -v '^#' .env.test | xargs)
elif [ -f "../.env.test" ]; then
  export $(grep -v '^#' ../.env.test | xargs)
else
  echo "❌ Error: .env.test file not found"
  exit 1
fi

echo "🔄 Resetting test database..."

# Generate a fresh Prisma client for the test database
echo "🔧 Generating Prisma client..."
cd ../backend
DATABASE_URL=$DATABASE_URL npx prisma generate

# Reset the database schema
echo "🧹 Resetting database schema..."
DATABASE_URL=$DATABASE_URL npx prisma db push --force-reset

# Apply schema without migrations
# We're using db push instead of migrate deploy to avoid baseline issues
echo "✅ Schema successfully applied using db push"

echo "✅ Test database has been reset successfully!"