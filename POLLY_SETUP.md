# AWS Polly Voice Integration Setup

This guide explains how to set up and use the AWS Polly text-to-speech integration in Ghost in The Code.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured
- Node.js 20.x or later
- CDK infrastructure already deployed

## Setup Steps

### 1. Deploy the Infrastructure

The Polly Lambda function and API Gateway are already configured in the CDK stack. Deploy it:

```bash
cd infrastructure
npm install
npm run deploy:full
```

### 2. Get the API Endpoint

After deployment, look for the `ApiEndpoint` output value. It will look like:

```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API endpoint:

```env
VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/
```

**Important:** Make sure the URL ends with a trailing slash `/`

### 4. Run the Application

```bash
npm install
npm run dev
```

## How It Works

### Architecture

1. **Frontend Service** (`src/services/polly.ts`): Handles API calls to synthesize speech
2. **React Hook** (`src/services/usePolly.ts`): Provides easy-to-use interface for components
3. **Lambda Function** (`infrastructure/lambda/polly/index.ts`): Calls AWS Polly and caches audio in S3
4. **API Gateway**: Exposes the Lambda function as a REST API

### Usage in Components

The `GhostCharacter` component already has Polly integrated:

```typescript
import { usePolly } from '../services';

const { speak, isLoading, error } = usePolly();

// Speak with different emotions
await speak("Hello!", "excited");
await speak("Let me think...", "neutral");
await speak("Great job!", "encouraging");
```

### Features

- **Audio Caching**: Generated audio is cached in S3 to reduce costs and improve performance
- **Emotion Support**: Three emotion modes (neutral, excited, encouraging)
- **Speaker Button**: Click the speaker icon in speech bubbles to hear the ghost speak
- **Interactive Ghost**: Click the ghost character to hear random messages

## Customization

### Change Voice

Edit `infrastructure/lib/ghost-in-the-code-stack.ts`:

```typescript
environment: {
  VOICE_ID: 'Matthew', // Change to any AWS Polly voice
}
```

Available voices: Joanna, Matthew, Salli, Kendra, Joey, Justin, and more.

### Adjust Speech Parameters

Edit `infrastructure/lambda/polly/index.ts` to modify rate, pitch, or other parameters.

## Troubleshooting

### "API endpoint not configured" Error

Make sure:
1. `.env` file exists in project root
2. `VITE_API_ENDPOINT` is set correctly
3. URL ends with trailing slash
4. Restart dev server after changing `.env`

### CORS Errors

The API Gateway is configured with CORS enabled. If you still see CORS errors:
1. Check that the API endpoint URL is correct
2. Verify the Lambda function has proper CORS headers
3. Redeploy the infrastructure

### Audio Not Playing

1. Check browser console for errors
2. Verify S3 bucket has proper CORS configuration
3. Ensure audio files are publicly readable
4. Check browser autoplay policies (user interaction required)

## Cost Considerations

- **Polly**: ~$4 per 1 million characters
- **S3 Storage**: Minimal (audio files are small)
- **API Gateway**: ~$3.50 per million requests
- **Lambda**: Minimal (fast execution)

Audio caching significantly reduces costs by avoiding repeated synthesis of the same text.

## Security Notes

- API endpoint is public but rate-limited
- No authentication required (suitable for hackathon/demo)
- For production, consider adding API keys or authentication
- S3 bucket has CORS configured for public read access
