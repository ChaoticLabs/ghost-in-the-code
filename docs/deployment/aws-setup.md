# AWS Deployment

## Overview

Deploy Ghost in The Code to AWS using CDK for infrastructure as code.

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Quick Deployment

### Option 1: Full Deployment (Recommended)

Builds Vite app and deploys everything in one command:

```bash
cd infrastructure
npm install
npm run deploy:full
```

### Option 2: Deployment Scripts

**Windows (PowerShell):**
```powershell
cd infrastructure
.\deploy.ps1
```

**Linux/Mac (Bash):**
```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Steps

```bash
# 1. Build the Vite app (from project root)
npm install
npm run build

# 2. Deploy CDK stack
cd infrastructure
npm install
npm run deploy
```

## Infrastructure Components

### Static Hosting
- **S3 Bucket** - Hosts built Vite application
- **CloudFront** - CDN for fast global delivery
- **Automatic invalidation** - Cache cleared on deployment

### API Services
- **API Gateway** - REST API for backend services
- **Lambda Functions** - Serverless compute
  - Polly function (text-to-speech)
  - TypeScript, auto-compiled with esbuild

### Storage
- **S3 Audio Cache** - Stores Polly-generated audio files
- **Public read access** - Audio files accessible via URL
- **1-year TTL** - Automatic cleanup of old files

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
cp .env.example .env
```

Add your API endpoint (from deployment output):
```
VITE_POLLY_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/
```

### CDK Configuration

Edit `infrastructure/lib/ghost-in-the-code-stack.ts`:

```typescript
// Change AWS region
const stack = new GhostInTheCodeStack(app, 'GhostInTheCodeStack', {
  env: {
    region: 'us-west-2', // Change region here
  }
});

// Change Polly voice
environment: {
  VOICE_ID: 'Matthew', // or Joanna, Salli, Kendra, etc.
}
```

## Deployment Commands

```bash
# Synthesize CloudFormation template
npm run synth

# Show differences from deployed stack
npm run diff

# Deploy stack
npm run deploy

# Deploy with auto-approval (CI/CD)
npm run deploy -- --require-approval never

# Destroy all resources
npm run destroy
```

## Post-Deployment

### Get CloudFront URL

After deployment, CDK outputs the CloudFront URL:

```
Outputs:
GhostInTheCodeStack.CloudFrontURL = https://d1234567890.cloudfront.net
GhostInTheCodeStack.ApiEndpoint = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```

### Update Environment

Add API endpoint to `.env`:
```
VITE_POLLY_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```

### Rebuild and Redeploy

After updating `.env`:
```bash
npm run build
cd infrastructure
npm run deploy
```

## Cost Estimates

### Monthly Costs (Low Traffic)

- **S3 Storage:** ~$0.50 (static files + audio cache)
- **CloudFront:** ~$1.00 (first 10TB free tier)
- **API Gateway:** ~$3.50 per million requests
- **Lambda:** ~$0.20 per million requests
- **Polly:** ~$4.00 per million characters

**Total:** ~$5-10/month for low traffic

### Cost Optimization

1. **Audio caching** - Reduces Polly API calls significantly
2. **CloudFront caching** - Reduces S3 requests
3. **Lambda optimization** - Fast execution = lower costs
4. **Free tier** - Many services have generous free tiers

## Troubleshooting

### Deployment Fails

**"dist folder not found"**
```bash
# Build Vite app first
npm run build
```

**"CDK not bootstrapped"**
```bash
# Bootstrap CDK in your account
cdk bootstrap aws://ACCOUNT-ID/REGION
```

**"Insufficient permissions"**
- Ensure AWS credentials have admin access
- Check IAM policies

### CloudFront Not Updating

CloudFront caching can delay updates:

```bash
# Invalidate CloudFront cache manually
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

Or wait 5-10 minutes for automatic invalidation.

### Lambda Function Errors

View logs:
```bash
# Tail Polly function logs
aws logs tail /aws/lambda/GhostInTheCode-PollyFunction --follow

# Get recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/GhostInTheCode-PollyFunction \
  --filter-pattern "ERROR"
```

### API Gateway CORS Issues

CORS is configured in CDK stack. If issues persist:
1. Check API Gateway console
2. Verify CORS headers in Lambda response
3. Test with curl to isolate browser issues

## CI/CD with GitHub Actions

See [GitHub Actions Setup](github-actions.md) for automated deployments.

## Cleanup

To delete all AWS resources:

```bash
cd infrastructure
npm run destroy
```

**Warning:** This deletes:
- S3 buckets (including audio cache)
- CloudFront distribution
- Lambda functions
- API Gateway
- All associated resources

Backup any important data before destroying.

## Security Best Practices

1. **No credentials in code** - Use environment variables
2. **IAM least privilege** - Grant minimal required permissions
3. **Enable CloudTrail** - Log all API calls
4. **Use HTTPS only** - CloudFront enforces HTTPS
5. **Regular updates** - Keep dependencies updated

## Advanced Configuration

### Custom Domain

Add custom domain to CloudFront:

1. Create ACM certificate in `us-east-1`
2. Update CDK stack with domain configuration
3. Add CNAME record in DNS

### Multiple Environments

Deploy separate stacks for dev/staging/prod:

```bash
# Deploy to staging
cdk deploy GhostInTheCodeStack-Staging

# Deploy to production
cdk deploy GhostInTheCodeStack-Production
```

### Monitoring

Add CloudWatch alarms:
- Lambda errors
- API Gateway 4xx/5xx errors
- CloudFront error rate
- S3 bucket size

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Polly Documentation](https://docs.aws.amazon.com/polly/)
