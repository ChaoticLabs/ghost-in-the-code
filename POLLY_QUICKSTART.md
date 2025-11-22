# AWS Polly Quick Start

Get voice working in 3 steps:

## 1. Deploy Infrastructure

```bash
cd infrastructure
npm run deploy:full
```

Copy the `ApiEndpoint` from the output (looks like `https://abc123.execute-api.us-east-1.amazonaws.com/prod/`)

## 2. Configure Environment

```bash
# In project root
cp .env.example .env
```

Edit `.env` and paste your API endpoint:

```env
VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/
```

## 3. Run the App

```bash
npm run dev
```

## Test It

1. Start the game
2. Click the ghost character - it will speak!
3. Click the speaker icon (🔈) in speech bubbles to hear messages

## What's Integrated

- ✅ Ghost character speaks when clicked
- ✅ Speech bubbles have speaker buttons
- ✅ Hints trigger ghost voice
- ✅ Audio is cached in S3 for performance
- ✅ Three emotion modes (neutral, excited, encouraging)

## Troubleshooting

**"API endpoint not configured"**
- Make sure `.env` file exists in project root
- Restart dev server after creating `.env`

**No sound**
- Check browser console for errors
- Verify API endpoint is correct
- Make sure URL ends with `/`

See `POLLY_SETUP.md` for detailed documentation.
