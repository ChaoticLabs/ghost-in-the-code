# Ghost in The Code - Infrastructure

AWS CDK infrastructure for deploying the Ghost in The Code game.

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Deployment

### Option 1: Full Deployment (Recommended)

This will build the Vite app and deploy everything in one command:

```bash
npm run deploy:full
```

### Option 2: Manual Steps

If you prefer to run steps separately:

```bash
# 1. Build the Vite app (from project root)
cd ..
npm install
npm run build

# 2. Deploy the CDK stack
cd infrastructure
npm run deploy
```

### Option 3: Using Deployment Scripts

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Other Commands

- `npm run synth` - Synthesize CloudFormation template
- `npm run diff` - Compare deployed stack with current state
- `npm run destroy` - Delete all AWS resources

## Architecture

The infrastructure includes:

- **S3 Bucket**: Static website hosting for the Vite app
- **CloudFront**: CDN for fast global delivery
- **API Gateway**: REST API for AI and voice features
- **Lambda Functions**: 
  - Bedrock function for AI-powered hints
  - Polly function for text-to-speech
- **S3 Bucket**: Audio cache for Polly-generated speech

## Notes

- No Docker required - uses local bundling for the Vite app
- The `dist` folder must exist before deployment
- CloudFront cache is automatically invalidated on deployment
