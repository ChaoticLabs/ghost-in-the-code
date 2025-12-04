#!/bin/bash

# Health Check Script for Ghost in The Code
# Checks deployment status and service health

set -e

echo "🔍 Ghost in The Code - Health Check"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
  echo "   Voice features may not be available"
  echo ""
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
  echo -e "${GREEN}✓${NC} Node.js $(node -v) (required: >=20.x)"
else
  echo -e "${RED}✗${NC} Node.js $(node -v) (required: >=20.x)"
  exit 1
fi
echo ""

# Check npm dependencies
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} Dependencies installed"
else
  echo -e "${RED}✗${NC} Dependencies not installed"
  echo "   Run: npm install"
  exit 1
fi
echo ""

# Check if build exists
echo "🏗️  Checking build..."
if [ -d "dist" ]; then
  echo -e "${GREEN}✓${NC} Build directory exists"
else
  echo -e "${YELLOW}⚠️  Warning: Build directory not found${NC}"
  echo "   Run: npm run build"
fi
echo ""

# Check AWS credentials (if deploying)
echo "☁️  Checking AWS configuration..."
if command -v aws &> /dev/null; then
  if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✓${NC} AWS credentials configured (Account: $ACCOUNT_ID)"
  else
    echo -e "${YELLOW}⚠️  Warning: AWS credentials not configured${NC}"
    echo "   Required for deployment only"
  fi
else
  echo -e "${YELLOW}⚠️  Warning: AWS CLI not installed${NC}"
  echo "   Required for deployment only"
fi
echo ""

# Check API endpoint (if configured)
if [ -f .env ]; then
  API_ENDPOINT=$(grep VITE_API_ENDPOINT .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  
  if [ -n "$API_ENDPOINT" ]; then
    echo "🌐 Checking API endpoint..."
    echo "   Endpoint: $API_ENDPOINT"
    
    # Try to ping the API
    if command -v curl &> /dev/null; then
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_ENDPOINT}voice" -X POST \
        -H "Content-Type: application/json" \
        -d '{"text":"test"}' 2>/dev/null || echo "000")
      
      if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
        echo -e "${GREEN}✓${NC} API endpoint is reachable (HTTP $HTTP_CODE)"
      else
        echo -e "${YELLOW}⚠️  Warning: API endpoint returned HTTP $HTTP_CODE${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  Warning: curl not installed, cannot check API${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Warning: API endpoint not configured in .env${NC}"
    echo "   Voice features will not work"
  fi
fi
echo ""

# Check infrastructure deployment (if CDK is available)
if [ -d "infrastructure" ]; then
  echo "🏗️  Checking infrastructure..."
  if [ -f "infrastructure/cdk.out/manifest.json" ]; then
    echo -e "${GREEN}✓${NC} CDK synthesis output exists"
  else
    echo -e "${YELLOW}⚠️  Warning: CDK not synthesized${NC}"
    echo "   Run: cd infrastructure && npm run synth"
  fi
fi
echo ""

# Summary
echo "===================================="
echo -e "${GREEN}✓${NC} Health check complete!"
echo ""
echo "Next steps:"
echo "  • Local dev: npm run dev"
echo "  • Build: npm run build"
echo "  • Deploy: cd infrastructure && npm run deploy:full"
echo ""
