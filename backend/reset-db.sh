#!/bin/bash
# Reset database for testing purposes

echo "🔄 Resetting EbizSimple Platform database for testing..."

# Generate a fresh Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Reset the database (this will delete all data but keep the schema)
echo "🧹 Clearing all data from database..."
npx prisma db push --force-reset

echo "✅ Database has been reset successfully!"
echo "🚀 You can now start the application with a clean database."
echo "💡 Run 'npm run start:dev' to start the server." 