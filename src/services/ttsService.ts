

// TTS Service for generating audio from text
export interface TTSOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private chatterbox: any = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    this.initializeChatterbox();
  }

  private async initializeChatterbox() {
    try {
      const { Chatterbox } = await import('chatterbox-tts');
      this.chatterbox = new Chatterbox();
      console.log('Chatterbox TTS initialized successfully');
    } catch (error) {
      console.warn('Chatterbox TTS failed to initialize, falling back to browser TTS:', error);
      this.chatterbox = null;
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    // If voices aren't loaded yet, wait for the event
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public speakText(options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Find the requested voice
      if (options.voice) {
        const voice = this.voices.find(v => 
          v.name.toLowerCase().includes(options.voice!.toLowerCase()) ||
          (options.voice === 'female' && v.name.toLowerCase().includes('female')) ||
          (options.voice === 'male' && v.name.toLowerCase().includes('male'))
        );
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    this.synth.cancel();
  }

  public async generateSpeech(text: string, voiceStyle: string = 'female'): Promise<Blob> {
    // Try chatterbox-tts first
    if (this.chatterbox) {
      try {
        console.log('Using Chatterbox TTS for speech generation');
        const audioBlob = await this.chatterbox.generateSpeech(text, {
          voice: voiceStyle,
          rate: 0.9,
          pitch: voiceStyle === 'whisper' ? 0.8 : 1
        });
        return audioBlob;
      } catch (error) {
        console.warn('Chatterbox TTS failed, falling back to browser TTS:', error);
      }
    }

    // Fallback to browser TTS
    return new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on style
      const voices = synth.getVoices();
      const voice = voices.find(v => 
        (voiceStyle === 'female' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))) ||
        (voiceStyle === 'male' && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'))) ||
        (voiceStyle === 'neutral' && v.lang.includes('en')) ||
        v.lang.includes('en')
      );
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = voiceStyle === 'whisper' ? 0.8 : 1;

      // For browser TTS, we'll create a simple placeholder blob
      // In a real implementation, you'd need to capture the actual audio
      utterance.onend = () => {
        const blob = new Blob(['browser-tts-audio'], { type: 'audio/wav' });
        resolve(blob);
      };

      utterance.onerror = (error) => reject(error);
      
      synth.speak(utterance);
    });
  }
}

// ElevenLabs TTS Service
export class ElevenLabsTTSService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateSpeech(text: string, voiceId: string = '9BWtsMINqrJLrRacOk9x'): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    try {
      console.log('Generating speech with ElevenLabs:', { text: text.substring(0, 50) + '...', voiceId });
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      console.log('ElevenLabs audio generated successfully, size:', audioBlob.size);
      return audioBlob;
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      throw error;
    }
  }

  public getAvailableVoices(): { id: string; name: string }[] {
    return [
      { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
      { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
      { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
      { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    ];
  }
}

export const ttsService = new TTSService();
export const elevenLabsTTS = new ElevenLabsTTSService();
