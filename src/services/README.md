# Services

This directory contains frontend services for external integrations.

## Polly Service

Text-to-speech integration using AWS Polly.

### Quick Start

```typescript
import { usePolly } from './services';

function MyComponent() {
  const { speak, isLoading, error } = usePolly();
  
  const handleSpeak = async () => {
    await speak("Hello world!", "excited");
  };
  
  return (
    <button onClick={handleSpeak} disabled={isLoading}>
      {isLoading ? "Speaking..." : "Speak"}
    </button>
  );
}
```

### API

**`usePolly()`** - React hook for text-to-speech

Returns:
- `speak(text, emotion?)` - Synthesize and play speech
- `isLoading` - Boolean indicating if speech is being generated/played
- `error` - Error message if synthesis fails
- `clearError()` - Clear error state

**Emotions:**
- `neutral` - Normal speaking voice
- `excited` - Faster, higher pitch
- `encouraging` - Slightly higher pitch

### Direct Service Usage

```typescript
import { pollyService } from './services';

// Get audio URL only (doesn't play)
const audioUrl = await pollyService.synthesizeSpeech("Hello!", "neutral");

// Synthesize and play
await pollyService.speak("Hello!", "excited");

// Play existing audio URL
await pollyService.playAudio(audioUrl);
```

### Configuration

Set `VITE_API_ENDPOINT` in `.env`:

```env
VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/
```

See `POLLY_SETUP.md` in project root for full setup instructions.
