
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

  public async generateSpeech(options: TTSOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Find the requested voice
      if (options.voice) {
        const voice = this.voices.find(v => 
          v.name.toLowerCase().includes(options.voice!.toLowerCase()) ||
          v.gender === options.voice
        );
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;

      // Create audio recording
      const mediaRecorder = this.setupRecording();
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };

      utterance.onstart = () => {
        mediaRecorder.start();
      };

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      this.synth.speak(utterance);
    });
  }

  private setupRecording(): MediaRecorder {
    // For now, we'll use a simpler approach without recording
    // Just return the speech synthesis directly
    throw new Error("Recording not implemented - using direct speech synthesis");
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
}

export const ttsService = new TTSService();
