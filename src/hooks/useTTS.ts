
import { useState, useCallback } from 'react';
import { ttsService, TTSOptions } from '@/services/ttsService';

export const useTTS = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
      
      // For now, we'll create a mock audio URL since we're using direct speech synthesis
      // In a real implementation, this would generate an actual audio file
      setAudioUrl('generated-audio-' + Date.now());
      
      return affirmationText;
    } catch (error) {
      console.error('Error generating affirmations:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const playAffirmations = useCallback(async (text: string, voiceStyle: string) => {
    if (isSpeaking) {
      ttsService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    
    try {
      await ttsService.speakText({
        text,
        voice: voiceStyle,
        rate: 0.8,
        pitch: 1
      });
    } catch (error) {
      console.error('Error playing affirmations:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const stopAffirmations = useCallback(() => {
    ttsService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

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
