# Voice Integration (AWS Polly)

## Overview

The ghost speaks using Amazon Polly text-to-speech with emotion support.

## Features

- ✅ Automatic narration when ghost messages appear
- ✅ Click ghost for random encouraging messages
- ✅ Three emotion modes: neutral, excited, encouraging
- ✅ Audio cached in S3 for performance
- ✅ Volume control (0-100%)
- ✅ Enable/disable toggle in settings

## Quick Setup

1. **Deploy infrastructure:**
   ```bash
   cd infrastructure
   npm run deploy:full
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add API endpoint from deployment output
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

## Architecture

```
Frontend → API Gateway → Lambda → Polly
                            ↓
                        S3 Cache
```

### Lambda Function
- **Runtime:** Node.js 20.x (TypeScript)
- **Location:** `infrastructure/lambda/polly/`
- **Endpoint:** `POST /voice`
- **Caching:** 1-year TTL in S3

### Request Format
```typescript
{
  text: string;
  emotion?: 'neutral' | 'excited' | 'encouraging';
}
```

### Response Format
```typescript
{
  audioUrl: string;
  cached: boolean;
  text: string;
}
```

## Emotion Modes

Implemented using SSML prosody tags:

### Excited
```xml
<prosody rate="fast" pitch="+10%">
  Great job! You're doing amazing!
</prosody>
```

### Encouraging
```xml
<prosody pitch="+5%">
  Keep going, you can do it!
</prosody>
```

### Neutral
```xml
Let me help you with this challenge.
```

## Voice Settings

Persisted in LocalStorage:
- **Ghost Voice Enabled** - Boolean toggle
- **Volume** - 0-100 (default: 80)

Access via settings modal in game.

## Customization

### Change Voice

Edit `infrastructure/lib/ghost-in-the-code-stack.ts`:

```typescript
environment: {
  VOICE_ID: 'Matthew', // or Joanna, Salli, Kendra, Joey, Justin
}
```

Available voices: https://docs.aws.amazon.com/polly/latest/dg/voicelist.html

### Adjust Emotions

Edit `infrastructure/lambda/polly/index.ts`:

```typescript
const prosodyMap = {
  excited: { rate: 'fast', pitch: '+10%' },
  encouraging: { pitch: '+5%' },
  neutral: {}
};
```

## Cost Considerations

- **Polly:** ~$4 per 1 million characters
- **S3 Storage:** Minimal (audio files cached)
- **API Gateway:** ~$3.50 per million requests
- **Lambda:** Minimal (fast execution)

**Caching significantly reduces costs** - repeated phrases are served from S3.

## Troubleshooting

### "API endpoint not configured"
- Ensure `.env` file exists in project root
- Verify `VITE_POLLY_API_URL` is set
- Restart dev server after creating `.env`

### No sound playing
- Check browser console for errors
- Verify API endpoint URL ends with `/`
- Check browser autoplay policies (some browsers block autoplay)
- Verify volume is not at 0

### Audio not caching
- Check S3 bucket permissions (public read required)
- Verify Lambda has S3 write permissions
- Check CloudWatch logs for errors

### CORS errors
- API Gateway CORS is configured in CDK stack
- Verify `Access-Control-Allow-Origin: *` in response headers

## Development

### Local Testing

Test Lambda function locally:

```bash
cd infrastructure/lambda/polly
npm install
npm test
```

### Logs

View Lambda logs:

```bash
aws logs tail /aws/lambda/GhostInTheCode-PollyFunction --follow
```

## Future Enhancements

- Multiple voice options (let users choose)
- Speech rate control
- Pitch control
- Language support (multilingual)
- Custom pronunciation dictionary
- Neural engine support (higher quality, higher cost)
