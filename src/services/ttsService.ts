
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

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
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

  public async generateSpeechBlob(options: TTSOptions): Promise<Blob> {
    // For browser TTS, we'll create a simple blob with the text
    // This is a fallback when other services fail
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    
    // Create a simple tone as placeholder - in real implementation you'd capture the speech
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate) * 0.1;
    }
    
    // Convert to WAV blob
    const wavBlob = new Blob(['placeholder audio'], { type: 'audio/wav' });
    return wavBlob;
  }
}

// Chatterbox TTS Service
export class ChatterboxTTSService {
  private chatterbox: any = null;

  constructor() {
    this.initializeChatterbox();
  }

  private async initializeChatterbox() {
    try {
      const { Chatterbox } = await import('chatterbox-tts');
      this.chatterbox = new Chatterbox();
      console.log('Chatterbox TTS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Chatterbox:', error);
    }
  }

  public async generateSpeech(text: string, voiceStyle: string = 'female'): Promise<Blob> {
    if (!this.chatterbox) {
      throw new Error('Chatterbox not initialized');
    }

    try {
      console.log('Generating speech with Chatterbox:', { text: text.substring(0, 50) + '...', voiceStyle });
      
      const audioData = await this.chatterbox.speak(text, {
        voice: voiceStyle,
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0
      });

      const audioBlob = new Blob([audioData], { type: 'audio/wav' });
      console.log('Chatterbox audio generated successfully, size:', audioBlob.size);
      return audioBlob;
    } catch (error) {
      console.error('Error generating speech with Chatterbox:', error);
      throw error;
    }
  }

  public getAvailableVoices(): { id: string; name: string }[] {
    return [
      { id: 'female', name: 'Female Voice' },
      { id: 'male', name: 'Male Voice' },
      { id: 'neutral', name: 'Neutral Voice' },
      { id: 'child', name: 'Child Voice' }
    ];
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

// Simple TTS Service using browser speech synthesis
export class SimpleTTSService {
  public async generateSpeech(text: string, voiceStyle: string = 'female'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on style
      const voices = synth.getVoices();
      const voice = voices.find(v => 
        (voiceStyle === 'female' && v.name.toLowerCase().includes('female')) ||
        (voiceStyle === 'male' && v.name.toLowerCase().includes('male')) ||
        v.lang.includes('en')
      );
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Create a simple audio blob (placeholder)
      utterance.onend = () => {
        // In a real implementation, you'd capture the audio
        const blob = new Blob(['audio-placeholder'], { type: 'audio/wav' });
        resolve(blob);
      };

      utterance.onerror = (error) => reject(error);
      
      synth.speak(utterance);
    });
  }
}

export const ttsService = new TTSService();
export const elevenLabsTTS = new ElevenLabsTTSService();
export const chatterboxTTS = new ChatterboxTTSService();
export const simpleTTS = new SimpleTTSService();
