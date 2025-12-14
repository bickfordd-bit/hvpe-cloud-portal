#!/bin/bash

# Bickford App Deployment Script
# This script deploys the Bickford app to production

echo "🚀 Deploying Bickford - Intent to Reality Instantly"
echo "=================================================="

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ] && [ -z "$HVPE_OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY or HVPE_OPENAI_API_KEY must be set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running lint checks..."
npm run lint

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check deployment target
if [ "$1" = "vercel" ]; then
    echo "🌐 Deploying to Vercel..."
    npx vercel --prod
elif [ "$1" = "docker" ]; then
    echo "🐳 Building Docker image..."
    docker build -t bickford-app .
    echo "🚀 Running Docker container..."
    docker run -p 3000:3000 -e OPENAI_API_KEY=$OPENAI_API_KEY bickford-app
elif [ "$1" = "local" ]; then
    echo "🏠 Starting local production server..."
    npm start
else
    echo "🌐 Starting development server..."
    echo "Access Bickford at: http://localhost:3000/bickford"
    npm run dev
fi

echo ""
echo "🎉 Bickford is now live!"
echo "Visit: http://localhost:3000/bickford"
echo ""
echo "Remember: The proprietary Bickford Formula is protected and cannot be stolen."