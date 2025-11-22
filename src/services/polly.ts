interface VoiceRequest {
  text: string;
  emotion?: 'neutral' | 'excited' | 'encouraging';
}

interface VoiceResponse {
  audioUrl: string;
  cached: boolean;
  text: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

class PollyService {
  private apiEndpoint: string;
  private audioCache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '';
  }

  private stripEmojis(text: string): string {
    // Remove all emojis and emoji-like characters
    return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  async synthesizeSpeech(
    text: string,
    emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral'
  ): Promise<string> {
    // Strip emojis before synthesizing
    const cleanText = this.stripEmojis(text);
    
    if (!cleanText) {
      throw new Error('No text to synthesize after removing emojis');
    }

    const cacheKey = `${cleanText}-${emotion}`;
    
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    if (!this.apiEndpoint) {
      throw new Error('API endpoint not configured. Set VITE_API_ENDPOINT in .env');
    }

    const request: VoiceRequest = { text: cleanText, emotion };

    try {
      const response = await fetch(`${this.apiEndpoint}voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to synthesize speech');
      }

      const data: VoiceResponse = await response.json();
      
      this.audioCache.set(cacheKey, data.audioUrl);
      
      return data.audioUrl;
    } catch (error) {
      console.error('Error calling Polly service:', error);
      throw error;
    }
  }

  async playAudio(audioUrl: string, volume: number = 0.8): Promise<void> {
    // Stop any currently playing audio
    this.stopCurrentAudio();

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      this.currentAudio = audio;
      
      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        this.currentAudio = null;
        reject(new Error('Failed to play audio'));
      };
      
      audio.play().catch((err) => {
        this.currentAudio = null;
        reject(err);
      });
    });
  }

  async speak(
    text: string,
    emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral',
    volume: number = 0.8
  ): Promise<void> {
    const audioUrl = await this.synthesizeSpeech(text, emotion);
    await this.playAudio(audioUrl, volume);
  }
}

export const pollyService = new PollyService();
