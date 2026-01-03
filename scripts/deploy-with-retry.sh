#!/bin/bash

# deploy-with-retry.sh - Smart Vercel deployment with automatic retry logic
# Handles transient failures with exponential backoff

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_RETRIES=3
INITIAL_BACKOFF=5
DEPLOYMENT_TIMEOUT=600  # 10 minutes

# Parse arguments
PRODUCTION_FLAG=""
if [ "$1" = "production" ] || [ "$1" = "--prod" ]; then
  PRODUCTION_FLAG="--prod"
  echo -e "${BLUE}🚀 Production Deployment Mode${NC}"
else
  echo -e "${BLUE}🔍 Preview Deployment Mode${NC}"
fi

# Verify Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo "Installing Vercel CLI..."
  npm install -g vercel@latest
fi

# Verify required environment variables
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${RED}❌ VERCEL_TOKEN not set${NC}"
  exit 1
fi

echo "========================================"
echo -e "${BLUE}Starting deployment with retry logic${NC}"
echo "Max retries: $MAX_RETRIES"
echo "Initial backoff: ${INITIAL_BACKOFF}s"
echo "Timeout: ${DEPLOYMENT_TIMEOUT}s"
echo "========================================"
echo ""

# Function to detect transient errors
is_transient_error() {
  local error_output="$1"
  
  # Common transient error patterns
  if echo "$error_output" | grep -iq "rate limit\|too many requests\|429"; then
    return 0
  elif echo "$error_output" | grep -iq "timeout\|timed out\|ETIMEDOUT\|ECONNRESET"; then
    return 0
  elif echo "$error_output" | grep -iq "network error\|connection refused\|ENOTFOUND"; then
    return 0
  elif echo "$error_output" | grep -iq "service unavailable\|502\|503\|504"; then
    return 0
  elif echo "$error_output" | grep -iq "internal server error\|500"; then
    return 0
  fi
  
  return 1
}

# Deployment function
attempt_deployment() {
  local attempt=$1
  local backoff=$2
  
  echo -e "${BLUE}📦 Deployment attempt $attempt of $MAX_RETRIES${NC}"
  
  # Create a temporary file to capture output
  local output_file=$(mktemp)
  local exit_code=0
  
  # Pull Vercel environment
  echo "Pulling Vercel environment..."
  if [ -n "$PRODUCTION_FLAG" ]; then
    vercel pull --yes --environment=production --token="$VERCEL_TOKEN" 2>&1 | tee "$output_file" || exit_code=$?
  else
    vercel pull --yes --environment=preview --token="$VERCEL_TOKEN" 2>&1 | tee "$output_file" || exit_code=$?
  fi
  
  if [ $exit_code -ne 0 ]; then
    local error_output=$(cat "$output_file")
    rm "$output_file"
    
    if is_transient_error "$error_output"; then
      echo -e "${YELLOW}⚠️  Transient error detected in pull step${NC}"
      return 1
    else
      echo -e "${RED}❌ Non-transient error in pull step${NC}"
      echo "$error_output"
      return 2
    fi
  fi
  
  # Build project
  echo "Building project..."
  if [ -n "$PRODUCTION_FLAG" ]; then
    vercel build --prod --token="$VERCEL_TOKEN" 2>&1 | tee "$output_file" || exit_code=$?
  else
    vercel build --token="$VERCEL_TOKEN" 2>&1 | tee "$output_file" || exit_code=$?
  fi
  
  if [ $exit_code -ne 0 ]; then
    local error_output=$(cat "$output_file")
    rm "$output_file"
    
    if is_transient_error "$error_output"; then
      echo -e "${YELLOW}⚠️  Transient error detected in build step${NC}"
      return 1
    else
      echo -e "${RED}❌ Non-transient error in build step${NC}"
      echo "$error_output"
      return 2
    fi
  fi
  
  # Deploy prebuilt project
  echo "Deploying to Vercel..."
  local deploy_output=""
  if [ -n "$PRODUCTION_FLAG" ]; then
    deploy_output=$(vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN" 2>&1) || exit_code=$?
  else
    deploy_output=$(vercel deploy --prebuilt --token="$VERCEL_TOKEN" 2>&1) || exit_code=$?
  fi
  
  echo "$deploy_output" | tee "$output_file"
  
  if [ $exit_code -ne 0 ]; then
    local error_output=$(cat "$output_file")
    rm "$output_file"
    
    if is_transient_error "$error_output"; then
      echo -e "${YELLOW}⚠️  Transient error detected in deploy step${NC}"
      return 1
    else
      echo -e "${RED}❌ Non-transient error in deploy step${NC}"
      echo "$error_output"
      return 2
    fi
  fi
  
  # Extract deployment URL (last line typically contains the URL)
  local deployment_url=$(echo "$deploy_output" | tail -1 | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app')
  
  rm "$output_file"
  
  if [ -n "$deployment_url" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 URL: $deployment_url${NC}"
    
    # Save to output file for GitHub Actions
    if [ -n "$GITHUB_OUTPUT" ]; then
      echo "url=$deployment_url" >> "$GITHUB_OUTPUT"
      echo "success=true" >> "$GITHUB_OUTPUT"
    fi
    
    # Export for scripts
    export DEPLOYMENT_URL="$deployment_url"
    echo "$deployment_url" > /tmp/deployment-url.txt
    
    return 0
  else
    echo -e "${YELLOW}⚠️  Could not extract deployment URL${NC}"
    return 1
  fi
}

# Main retry loop
current_attempt=1
backoff=$INITIAL_BACKOFF

while [ $current_attempt -le $MAX_RETRIES ]; do
  if attempt_deployment $current_attempt $backoff; then
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ Deployment completed successfully${NC}"
    echo "========================================"
    exit 0
  else
    exit_code=$?
    
    # If non-transient error (exit code 2), don't retry
    if [ $exit_code -eq 2 ]; then
      echo ""
      echo "========================================"
      echo -e "${RED}❌ Deployment failed with non-transient error${NC}"
      echo "Cannot retry - please fix the issue and try again"
      echo "========================================"
      exit 1
    fi
    
    # Check if we have more retries
    if [ $current_attempt -lt $MAX_RETRIES ]; then
      echo ""
      echo -e "${YELLOW}⏳ Waiting ${backoff}s before retry...${NC}"
      sleep $backoff
      
      # Exponential backoff: 5s, 15s, 30s
      backoff=$((backoff * 3))
      current_attempt=$((current_attempt + 1))
      
      echo ""
      echo "========================================"
    else
      echo ""
      echo "========================================"
      echo -e "${RED}❌ All $MAX_RETRIES deployment attempts failed${NC}"
      echo "Please check the errors above and:"
      echo "  1. Verify Vercel service status"
      echo "  2. Check your Vercel token permissions"
      echo "  3. Ensure project configuration is correct"
      echo "  4. Try deploying manually: vercel deploy"
      echo "========================================"
      exit 1
    fi
  fi
done
