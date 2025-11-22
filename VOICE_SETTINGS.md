# Voice Settings Integration

The Ghost voice now respects user preferences from the Settings panel.

## Features

### Settings Panel Controls

**Ghost Voice Toggle**
- Enable/disable voice narration completely
- When disabled, speaker buttons are hidden
- Ghost still shows messages but won't speak

**Volume Slider**
- Adjust volume from 0-100%
- Only active when voice is enabled
- Volume is applied to all speech synthesis

### How It Works

1. **Preferences Context** - Stores `voiceEnabled` and `volume` settings
2. **usePolly Hook** - Checks preferences before speaking
3. **GhostCharacter** - Hides speaker button when voice is disabled
4. **Audio Playback** - Applies volume setting to all audio

## User Experience

### When Voice is Enabled (Default)
- Ghost speaks automatically when messages appear
- Ghost speaks when clicked with random messages
- Volume can be adjusted 0-100%
- Default volume: 80%

### When Voice is Disabled
- No audio playback
- Messages still display normally
- Ghost animations work as usual

## Technical Details

### Polly Service Updates
```typescript
// Volume parameter added (0.0 to 1.0)
await pollyService.speak(text, emotion, volume);
```

### usePolly Hook
```typescript
const { speak, isLoading, isEnabled } = usePolly();

// Automatically checks preferences.voiceEnabled
// Converts volume from 0-100 to 0.0-1.0
await speak("Hello!", "excited");
```

### Settings Integration
- Preferences saved to localStorage
- Persists across sessions
- Changes apply immediately
- No page reload required

## Testing

1. Open Settings (⚙️ icon)
2. Toggle "Ghost Voice" off
   - Ghost won't speak automatically
   - Ghost won't speak when clicked
3. Toggle "Ghost Voice" on
4. Adjust volume slider
   - Messages will speak automatically at new volume
   - Click ghost to test volume with random messages
5. Settings persist after refresh

## Default Settings

```typescript
{
  voiceEnabled: true,
  volume: 80
}
```

All voice features work seamlessly with the existing accessibility settings (reduced motion, high contrast, font size).
