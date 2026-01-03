#!/bin/bash

# Health Check Script for HVPE Cloud Portal
# Checks the health of the application and its dependencies

set -e

echo "🏥 Running Health Checks..."
echo "============================"

# Check if Node.js is available
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js: Not found"
    exit 1
fi

# Check if npm is available
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm: Not found"
    exit 1
fi

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✅ package.json: Found"
else
    echo "❌ package.json: Not found"
    exit 1
fi

# Run TypeScript check if available
if [ -f "tsconfig.json" ]; then
    echo "🔍 Running TypeScript check..."
    npx tsc --noEmit || echo "⚠️  TypeScript errors found"
fi

# Check if .env or environment variables are set
if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo "✅ Environment file: Found"
else
    echo "⚠️  Environment file: Not found (using defaults)"
fi

# Test API health endpoint if server is running
if command -v curl &> /dev/null; then
    if [ ! -z "$HEALTH_CHECK_URL" ]; then
        echo "🌐 Testing health endpoint: $HEALTH_CHECK_URL"
        if curl -f -s "$HEALTH_CHECK_URL/api/health" > /dev/null 2>&1; then
            echo "✅ API Health: OK"
        else
            echo "⚠️  API Health: Endpoint not reachable (server may not be running)"
        fi
    fi
fi

echo ""
echo "✅ Health check completed!"
exit 0
