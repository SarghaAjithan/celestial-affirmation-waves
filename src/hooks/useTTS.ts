
import { useState, useCallback } from 'react';
import { openAITTS } from '@/services/ttsService';

export const useTTS = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const generateAffirmations = useCallback(async (
    affirmationText: string,
    voiceStyle: string
  ) => {
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      console.log('Using OpenAI TTS with voice:', voiceStyle);
      const generatedAudioUrl = await openAITTS.generateSpeech(affirmationText, voiceStyle);
      setAudioUrl(generatedAudioUrl);
    } catch (error) {
      console.error('Error generating affirmations audio:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const playAffirmations = useCallback(async (audioUrlToPlay: string) => {
    if (isSpeaking && currentAudio) {
      currentAudio.pause();
      setIsSpeaking(false);
      return;
    }

    if (!audioUrlToPlay) return;

    setIsSpeaking(true);
    
    try {
      const audio = new Audio(audioUrlToPlay);
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
