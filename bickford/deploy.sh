#!/bin/bash

# Bickford Live Filing - VPS Deployment Script

set -e

echo "🚀 Starting Bickford Live Filing deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "✅ Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Using default values."
fi

# Pull latest images (if using registry)
# echo "📦 Pulling latest images..."
# docker compose -f docker-compose.prod.yml pull

# Build images
echo "🔨 Building Docker images..."
docker compose -f docker-compose.prod.yml build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Start services
echo "▶️  Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Initialize database
echo "📊 Initializing database..."
docker compose -f docker-compose.prod.yml exec -T postgres psql -U bickford -d bickford < init.sql || true

# Check service status
echo "🔍 Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
echo ""
echo "Services are available at:"
echo "  - Web UI: http://localhost:80"
echo "  - API: http://localhost:3001"
echo "  - WebSocket: ws://localhost:3002"
echo ""
echo "To view logs: docker compose -f docker-compose.prod.yml logs -f"
echo "To stop services: docker compose -f docker-compose.prod.yml down"
