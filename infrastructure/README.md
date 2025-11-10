# Ghost in The Code - Infrastructure

AWS CDK infrastructure for the Ghost in The Code game.

## Prerequisites

- Node.js 18+ installed
- AWS CLI configured with credentials
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Setup

1. Install dependencies:
```bash
cd infrastructure
npm install
```

2. Bootstrap CDK (first time only):
```bash
npm run cdk bootstrap
```

## Available Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run cdk synth` - Synthesize CloudFormation template
- `npm run cdk diff` - Compare deployed stack with current state
- `npm run deploy` - Deploy the stack to AWS
- `npm run destroy` - Remove all resources from AWS

## Deployment

To deploy the infrastructure:

```bash
npm run deploy
```

The stack will output important values like CloudFront distribution URL and API endpoints.

## Environment Variables

The following environment variables can be set:

- `CDK_DEFAULT_ACCOUNT` - AWS account ID (defaults to current AWS CLI account)
- `CDK_DEFAULT_REGION` - AWS region (defaults to us-east-1)

## Stack Resources

The infrastructure includes:
- S3 buckets for static hosting and audio cache
- CloudFront distribution for content delivery
- Lambda functions for AI and voice services
- API Gateway for backend endpoints
