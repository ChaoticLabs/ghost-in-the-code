#!/bin/bash
# Deployment script for Ghost in The Code

set -e

# Check for domain configuration
if [ -n "$DOMAIN_NAME" ] && [ -n "$HOSTED_ZONE_NAME" ]; then
    echo "✓ Custom domain configuration detected:"
    echo "  Domain: $DOMAIN_NAME"
    echo "  Hosted Zone: $HOSTED_ZONE_NAME"
    echo ""
elif [ -n "$DOMAIN_NAME" ] || [ -n "$HOSTED_ZONE_NAME" ]; then
    echo "⚠ Warning: Incomplete domain configuration detected"
    echo "  Required variables: DOMAIN_NAME, HOSTED_ZONE_NAME"
    echo "  Deploying without custom domain..."
    echo ""
else
    echo "ℹ No custom domain configuration found"
    echo "  Deploying with default CloudFront domain"
    echo "  To use a custom domain, set: DOMAIN_NAME, HOSTED_ZONE_NAME"
    echo ""
fi

echo "Building Vite application..."
cd ..
npm install
npm run build
cd infrastructure

echo "Deploying CDK stack..."
npm run deploy

echo "Deployment complete!"
