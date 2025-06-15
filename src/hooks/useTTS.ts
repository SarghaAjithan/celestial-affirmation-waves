
import { useState, useCallback } from 'react';
import { huggingFaceTTS } from '@/services/ttsService';

export const useTTS = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

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
      
      // Generate audio using Hugging Face TTS
      const voiceMap: { [key: string]: string } = {
        'female': 'en-US-AriaNeural',
        'male': 'en-US-GuyNeural',
        'neutral': 'en-US-JennyNeural',
        'whisper': 'en-GB-SoniaNeural'
      };
      
      const selectedVoice = voiceMap[voiceStyle] || 'en-US-AriaNeural';
      console.log('Generating audio with voice:', selectedVoice);
      
      const audioBlob = await huggingFaceTTS.generateSpeech(affirmationText, selectedVoice);
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);
      
      return affirmationText;
    } catch (error) {
      console.error('Error generating affirmations:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

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
