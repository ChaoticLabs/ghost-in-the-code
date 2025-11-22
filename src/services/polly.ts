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

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '';
  }

  async synthesizeSpeech(
    text: string,
    emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral'
  ): Promise<string> {
    const cacheKey = `${text}-${emotion}`;
    
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    if (!this.apiEndpoint) {
      throw new Error('API endpoint not configured. Set VITE_API_ENDPOINT in .env');
    }

    const request: VoiceRequest = { text, emotion };

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

  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Failed to play audio'));
      
      audio.play().catch(reject);
    });
  }

  async speak(
    text: string,
    emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral'
  ): Promise<void> {
    const audioUrl = await this.synthesizeSpeech(text, emotion);
    await this.playAudio(audioUrl);
  }
}

export const pollyService = new PollyService();
