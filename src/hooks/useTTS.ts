
import { useState, useCallback } from 'react';
import { elevenLabsTTS, chatterboxTTS, simpleTTS } from '@/services/ttsService';

export const useTTS = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const generateAffirmations = useCallback(async (
    name: string,
    goal: string,
    customAffirmations: string,
    tone: string,
    voiceStyle: string
  ) => {
    setIsGenerating(true);
    
    try {
      // Generate affirmation text
      const affirmationText = createAffirmationText(name, goal, customAffirmations, tone);
      console.log('Generated affirmation text:', affirmationText);
      
      let audioBlob: Blob;
      
      try {
        // Try Chatterbox first (free and reliable)
        console.log('Using Chatterbox TTS');
        audioBlob = await chatterboxTTS.generateSpeech(affirmationText, voiceStyle);
      } catch (error) {
        console.error('Chatterbox TTS failed, trying ElevenLabs:', error);
        
        try {
          // Try ElevenLabs if API key is provided
          if (apiKey.trim()) {
            elevenLabsTTS.setApiKey(apiKey);
            const voiceMap: { [key: string]: string } = {
              'female': '9BWtsMINqrJLrRacOk9x', // Aria
              'male': 'TX3LPaxmHKxFdv7VOQHJ', // Liam
              'neutral': 'EXAVITQu4vr4xnSDxMaL', // Sarah
              'whisper': 'XB0fDUnXU5powFXDhCwa' // Charlotte
            };
            
            const selectedVoiceId = voiceMap[voiceStyle] || '9BWtsMINqrJLrRacOk9x';
            console.log('Using ElevenLabs with voice:', selectedVoiceId);
            audioBlob = await elevenLabsTTS.generateSpeech(affirmationText, selectedVoiceId);
          } else {
            throw new Error('No ElevenLabs API key provided');
          }
        } catch (error) {
          console.error('ElevenLabs TTS failed, using browser TTS:', error);
          // Final fallback to browser TTS
          audioBlob = await simpleTTS.generateSpeech(affirmationText, voiceStyle);
        }
      }
      
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);
      
      return affirmationText;
    } catch (error) {
      console.error('Error generating affirmations:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const playAffirmations = useCallback(async (audioUrl: string) => {
    if (isSpeaking && currentAudio) {
      currentAudio.pause();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    
    try {
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        console.error('Error playing audio');
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing affirmations:', error);
      setIsSpeaking(false);
      setCurrentAudio(null);
    }
  }, [isSpeaking, currentAudio]);

  const stopAffirmations = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  }, [currentAudio]);

  return {
    isGenerating,
    isSpeaking,
    audioUrl,
    apiKey,
    setApiKey,
    generateAffirmations,
    playAffirmations,
    stopAffirmations
  };
};

// Helper function to create affirmation text
function createAffirmationText(
  name: string,
  goal: string,
  customAffirmations: string,
  tone: string
): string {
  const greetings = {
    empowering: `${name}, you are a powerful creator`,
    soothing: `${name}, breathe deeply and feel the peace within`,
    motivational: `${name}, today is your day to shine`,
    spiritual: `${name}, connect with your divine essence`
  };

  const affirmations = [
    `I, ${name}, ${goal.toLowerCase().replace('i want to', '').replace('i', '')}`,
    `Every day, I move closer to my dreams`,
    `I am worthy of all the good things life has to offer`,
    `My positive thoughts create positive outcomes`,
    `I trust in my ability to create the life I desire`
  ];

  if (customAffirmations) {
    affirmations.push(...customAffirmations.split('\n').filter(a => a.trim()));
  }

  const greeting = greetings[tone as keyof typeof greetings] || greetings.empowering;
  
  return `${greeting}. ${affirmations.join('. ')}. Take a deep breath and feel these truths resonating within you.`;
}
