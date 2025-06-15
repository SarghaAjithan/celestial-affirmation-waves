

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

  public async generateSpeech(text: string, voiceStyle: string = 'female'): Promise<Blob> {
    // Use browser TTS to generate speech
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

// OpenAI TTS Service using Supabase Edge Function
export class OpenAITTSService {
  public async generateSpeech(text: string, voice: string = 'alloy'): Promise<string> {
    try {
      console.log('Generating speech with OpenAI via Supabase function:', { text: text.substring(0, 50) + '...', voice });
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('generate-manifestation-audio', {
        body: {
          text: text,
          voice: voice
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data?.url) {
        throw new Error('No URL returned from function');
      }

      console.log('OpenAI audio generated successfully, URL:', data.url);
      return data.url;
    } catch (error) {
      console.error('Error generating speech with OpenAI:', error);
      throw error;
    }
  }

  public getAvailableVoices(): { id: string; name: string }[] {
    return [
      { id: 'alloy', name: 'Alloy' },
      { id: 'echo', name: 'Echo' },
      { id: 'fable', name: 'Fable' },
      { id: 'onyx', name: 'Onyx' },
      { id: 'nova', name: 'Nova' },
      { id: 'shimmer', name: 'Shimmer' },
    ];
  }
}

export const ttsService = new TTSService();
export const elevenLabsTTS = new ElevenLabsTTSService();
export const openAITTS = new OpenAITTSService();
