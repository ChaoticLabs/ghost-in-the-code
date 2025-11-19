# Lambda Functions

This directory contains the Lambda functions for the Ghost in The Code game's AI and voice services. All functions are written in TypeScript for type safety and better developer experience.

## Polly Function

Located in `polly/` - Synthesizes speech using Amazon Polly and caches audio files in S3.

### API Endpoint
`POST /voice`

### Request Body
```json
{
  "text": "Great job fixing that bug!",
  "emotion": "excited"
}
```

### Response
```json
{
  "audioUrl": "https://ghost-audio-cache-xxx.s3.amazonaws.com/audio/abc123.mp3",
  "cached": false,
  "text": "Great job fixing that bug!"
}
```

### Environment Variables
- `AUDIO_BUCKET`: S3 bucket name for audio cache
- `VOICE_ID`: Polly voice ID (default: `Joanna`)

### Emotion Options
- `neutral`: Normal speaking pace and pitch
- `excited`: Faster pace, higher pitch
- `encouraging`: Medium pace, slightly higher pitch

## Development

### Installing Dependencies

```bash
# Bedrock function
cd lambda/bedrock
npm install

# Polly function
cd lambda/polly
npm install
```

### No Build Step Required

Both Lambda functions are written in TypeScript. **You don't need to manually build them** - the CDK's `NodejsFunction` construct automatically compiles and bundles them during deployment using esbuild.

Just write TypeScript and deploy!

### Local Testing

You can test the Lambda functions locally using the AWS SAM CLI. The CDK will handle compilation automatically during deployment.

## Deployment

The Lambda functions are automatically deployed as part of the CDK stack using `NodejsFunction`. The CDK will:
1. Automatically compile TypeScript to JavaScript using esbuild
2. Bundle the Lambda code and dependencies with tree-shaking
3. Minify the code for smaller bundle sizes
4. Generate source maps for debugging
5. Upload to S3
6. Create the Lambda functions with appropriate IAM permissions
7. Wire them to API Gateway endpoints

**Benefits of NodejsFunction:**
- No manual build step required before deploying
- Automatic TypeScript compilation
- Fast bundling with esbuild
- Tree-shaking removes unused code
- Smaller bundle sizes (typically 2-3kb minified)
- Source maps for production debugging

## Cost Optimization

Both functions implement caching strategies:
- **Bedrock**: Hints can be cached in the frontend session storage
- **Polly**: Audio files are cached in S3 with a 1-year cache control header

This minimizes API calls and reduces costs during the hackathon demo.
