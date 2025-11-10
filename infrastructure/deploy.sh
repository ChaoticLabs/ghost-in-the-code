#!/bin/bash
# Deployment script for Ghost in The Code

set -e

echo "Building Vite application..."
cd ..
npm install
npm run build
cd infrastructure

echo "Deploying CDK stack..."
npm run deploy

echo "Deployment complete!"
