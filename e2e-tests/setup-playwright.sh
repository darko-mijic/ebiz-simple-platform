#!/bin/bash

# This script installs all necessary Playwright dependencies
# Run it when setting up a new development machine

# Make script exit if any command fails
set -e

echo "🎭 Setting up Playwright for EBIZ Platform E2E tests..."

# Install Playwright browsers and dependencies
echo "📦 Installing browsers and dependencies..."
npx playwright install --with-deps

# Verify installation
echo "✅ Verifying installation..."
npx playwright --version

echo "🚀 Playwright setup complete! You can now run tests with:"
echo "   npm run test        # Headless mode"
echo "   npm run test:ui     # With browser visible"
echo "   npm run test:debug  # Debug mode (slower with DevTools)"

echo "📚 For more information, see e2e-tests/README.md"