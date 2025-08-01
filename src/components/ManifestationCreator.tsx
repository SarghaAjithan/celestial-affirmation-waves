import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Save, Share, Heart, Volume2, Edit, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import SaveManifestationModal from "./SaveManifestationModal";
import { getGoalText } from "@/utils/affirmationHelpers";
import { getGoalPlaceholder } from "@/utils/goalPlaceholders";
import { useSaveManifestation } from "@/hooks/useSaveManifestation";
import { voiceOptions, musicOptions, moodEmojis } from "@/constants/manifestationOptions";
import AudioGenerationButton from "./AudioGenerationButton";
import { Library } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ManifestationFormData {
  name: string;
  goal: string;
  customAffirmations: string;
  voice: string;
  backgroundMusic: string;
}

const ManifestationCreator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const selectedGoalFromRoute = location.state?.goal || '';
  
  const { 
    isGenerating, 
    isSpeaking, 
    audioUrl, 
    generateAffirmations, 
    playAffirmations, 
    stopAffirmations 
  } = useTTS();
  
  const [formData, setFormData] = useState<ManifestationFormData>({
    name: '',
    goal: selectedGoalFromRoute ? getGoalText(selectedGoalFromRoute) : '',
    customAffirmations: '',
    voice: '',
    backgroundMusic: ''
  });
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [voicePreviewAudios, setVoicePreviewAudios] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [voicePreviews, setVoicePreviews] = useState<{ [voice: string]: string }>({});
  const [isRegeneratingPreviews, setIsRegeneratingPreviews] = useState(false);
  const manifestationPreviewRef = useRef<HTMLDivElement | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  // Mood tracker state (now part of the form)
  const [mood, setMood] = useState<number | null>(null);

  // Fetch all static voice previews from storage on mount
  useEffect(() => {
    const fetchVoicePreviews = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const supportedVoices = [
          'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
        ];

        console.log('Fetching voice previews from storage...');
        const previews: { [key: string]: string } = {};
        
        for (const voice of supportedVoices) {
          const { data } = supabase.storage
            .from('voice-previews')
            .getPublicUrl(`${voice}-preview.mp3`);
          
          if (data.publicUrl) {
            // Test if the URL actually works by trying to load it
            try {
              const testResponse = await fetch(data.publicUrl, { method: 'HEAD' });
              if (testResponse.ok) {
                previews[voice] = data.publicUrl;
                console.log(`✓ Voice preview found for ${voice}:`, data.publicUrl);
              } else {
                console.warn(`✗ Voice preview URL not accessible for ${voice}:`, testResponse.status);
              }
            } catch (err) {
              console.warn(`✗ Voice preview URL test failed for ${voice}:`, err);
            }
          }
        }
        
        setVoicePreviews(previews);
        console.log('Voice previews loaded:', Object.keys(previews));
      } catch (err) {
        console.error('Failed to load voice previews:', err);
      }
    };
    fetchVoicePreviews();
  }, []);

  // Preview voice functionality - use static previews if available
  const handleVoicePreview = async (voice: string) => {
    if (previewingVoice === voice) {
      // Stop current preview
      if (voicePreviewAudios[voice]) {
        voicePreviewAudios[voice].pause();
      }
      setPreviewingVoice(null);
      return;
    }

    try {
      setPreviewingVoice(voice);

      // Play from cache if already loaded in audio state
      if (voicePreviewAudios[voice]) {
        voicePreviewAudios[voice].currentTime = 0;
        await voicePreviewAudios[voice].play();
        return;
      }

      // Try the pre-generated static preview URL
      if (voicePreviews[voice]) {
        console.log(`Playing voice preview for ${voice}:`, voicePreviews[voice]);
        const audio = new Audio(voicePreviews[voice]);
        setVoicePreviewAudios(prev => ({ ...prev, [voice]: audio }));

        audio.onended = () => setPreviewingVoice(null);
        audio.onerror = (e) => {
          console.error(`Audio error for ${voice}:`, e);
          setPreviewingVoice(null);
          toast({
            title: "Preview Failed",
            description: `Unable to play ${voice} voice preview. The audio file may be corrupted.`,
            variant: "destructive"
          });
        };
        await audio.play();
        return;
      }

      // Fall back to on-demand generation if static preview not available
      console.log(`No static preview found for ${voice}, generating on-demand...`);
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('generate-voice-previews', {
        body: { voice }
      });

      if (error) throw new Error(error.message);
      if (data?.url) {
        const audio = new Audio(data.url);
        setVoicePreviewAudios(prev => ({ ...prev, [voice]: audio }));

        audio.onended = () => setPreviewingVoice(null);
        audio.onerror = () => {
          setPreviewingVoice(null);
          toast({
            title: "Preview Failed",
            description: "Unable to play this voice preview.",
            variant: "destructive"
          });
        };
        await audio.play();
        // Update cache for future use
        setVoicePreviews(prev => ({ ...prev, [voice]: data.url }));
      }
    } catch (error) {
      console.error('Preview failed:', error);
      setPreviewingVoice(null);
      toast({
        title: "Preview Failed",
        description: "Unable to preview this voice. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Step 1: Generate manifestation text only, now with AI
  const handleGenerateText = async () => {
    if (!formData.name || !formData.goal) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and goal to generate your manifestation.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingText(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const moodMap = ['feeling a bit down', 'feeling neutral', 'feeling positive', 'feeling happy', 'feeling wonderful and aligned'];
      const moodText = mood !== null ? moodMap[mood] : 'not specified';
      
      const { data, error } = await supabase.functions.invoke('generate-ai-affirmation', {
        body: {
          name: formData.name,
          goal: formData.goal,
          customAffirmations: formData.customAffirmations,
          mood: moodText
        }
      });

      if (error || !data?.generatedText) {
        throw new Error(error?.message || "No text returned from AI");
      }
      
      setGeneratedText(data.generatedText);
      setStep('text'); // advance step

      toast({
        title: "Manifestation Text Generated! ✨",
        description: "Review and edit your affirmation, then generate the audio."
      });

      setTimeout(() => {
        manifestationPreviewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 200);
    } catch (error) {
      console.error('AI text generation failed:', error);
      toast({
        title: "Text Generation Failed",
        description: "There was an error creating your text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  // Step 2: Generate audio from the manifestation text
  const handleGenerateAudio = async () => {
    if (!generatedText || !formData.voice || !!audioUrl) {
      toast({
        title: "Missing Information",
        description: "Please ensure you have generated text and selected a voice.",
        variant: "destructive"
      });
      return;
    }
    setStep('audio'); // track we're at the audio generation step
    
    try {
      await generateAffirmations(
        generatedText,
        formData.voice
      );

      // The audioUrl from useTTS hook contains the actual audio file URL
      toast({
        title: "Audio Generated! 🎵",
        description: "Your manifestation audio is ready to play."
      });
    } catch (error) {
      toast({
        title: "Audio Generation Failed",
        description: "There was an error creating your audio. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Play/Pause for the full manifestation audio
  const handlePlayFullManifestation = () => {
    if (!audioUrl) {
      toast({
        title: "No Audio Available",
        description: "Please generate audio first.",
        variant: "destructive",
      });
      return;
    }
    if (isSpeaking) {
      stopAffirmations();
    } else {
      playAffirmations(audioUrl);
    }
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const { isSaving, saveManifestation } = useSaveManifestation(
    generatedText, audioUrl, mood, formData.voice, formData.backgroundMusic
  );

  const handleSaveManifestation = async (title: string) => {
    setShowSaveModal(false);
    await saveManifestation(title, () => setIsSaved(true)); // Mark as saved after success
  };

  // Mood emoji options with labels
  const moodOptions = [
    { emoji: '😔', label: 'Uncertain' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '🙂', label: 'Hopeful' },
    { emoji: '😊', label: 'Happy' },
    { emoji: '✨', label: 'Aligned' }
  ];

  const [step, setStep] = useState<'input' | 'text' | 'voice' | 'audio'>('input');

  const handleEditText = () => setIsEditingText(true);
  const handleSaveEdit = () => setIsEditingText(false);

  // Get dynamic placeholder based on selected goal and mood
  const getPlaceholder = () => {
    return getGoalPlaceholder(selectedGoalFromRoute, mood);
  };

  // Input change handler
  const handleInputChange = (field: keyof ManifestationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (user) {
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        if (userName) {
            handleInputChange('name', userName);
        }
    }
  }, [user]);

  // We use a single-step progressive box flow.
  return (
    <div className="flex flex-col gap-5">
      <Card className="bg-white bg-opacity-90 border border-gray-200 rounded-2xl shadow-none p-6 space-y-6">
        <div className="mb-1 pb-2 pt-1 flex flex-col gap-1 border-b border-gray-100">
          <h1 className="text-xl font-bold gradient-text font-playfair">Manifestation Creator</h1>
          <p className="text-xs font-light text-gray-500">
            Create your personalized affirmations step by step
          </p>
          {selectedGoalFromRoute && (
            <p className="text-xs text-purple-600">
              Creating manifestation for: {selectedGoalFromRoute.charAt(0).toUpperCase() + selectedGoalFromRoute.slice(1)}
            </p>
          )}
        </div>

        {/* Step 1: Mood, Goal, Affirmations (Name is now automatic) */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Mood selector */}
          <div className="flex flex-col flex-1 min-w-[180px]">
            <Label className="text-xs font-medium mb-1 whitespace-nowrap" htmlFor="mood-options">
              What is your current feeling about the manifestation desire?
            </Label>
            <div id="mood-options" className="flex flex-wrap gap-2">
              {moodOptions.map((option, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setMood(index)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs
                    transition-all
                    ${mood === index 
                      ? "bg-gradient-to-tr from-pink-100 to-purple-100 border-purple-400 scale-105"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400`}
                  tabIndex={0}
                >
                  <span className="text-base">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal and (optional) custom affirmations */}
        <div className="flex flex-col gap-2">
          <div>
            <Label htmlFor="goal" className="text-xs mb-0">Goal</Label>
            <Textarea
              id="goal"
              placeholder={getPlaceholder()}
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="mt-1 min-h-10 text-sm border-gray-200 rounded-lg bg-gray-50"
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <Label htmlFor="affirmations" className="text-xs mb-0">Custom Affirmations <span className="text-gray-400">(optional)</span></Label>
            <Textarea
              id="affirmations"
              placeholder="Add your own affirmations..."
              value={formData.customAffirmations}
              onChange={(e) => handleInputChange('customAffirmations', e.target.value)}
              className="mt-1 min-h-8 text-sm border-gray-200 rounded-lg bg-gray-50"
              style={{ fontSize: 14 }}
            />
          </div>
        </div>

        {/* Action button: now conditionally highlighted based on generatedText */}
        <Button
          type="button"
          onClick={handleGenerateText}
          className={`
            w-full text-base mt-2
            transition-all duration-300
            ${
              !generatedText && formData.name && formData.goal
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                : "bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-full cursor-default"
            }
            ${(!formData.name || !formData.goal || isGeneratingText) ? "opacity-70" : ""}
          `}
          style={{
            boxShadow: undefined
          }}
          disabled={!formData.name || !formData.goal || !!generatedText || isGeneratingText}
          data-testid="generate-manifestation-text"
        >
          {isGeneratingText ? (
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Manifestation Text
            </span>
          )}
        </Button>

        {/* Animated, conditional render: Manifestation Preview + Voice Style, after text */}
        {generatedText && (step === 'text' || step === 'voice' || step === 'audio') && (
          <div
            ref={manifestationPreviewRef}
            className={`
              mt-6
              animate-fade-in
              transition-all duration-700
            `}
            style={{ transitionProperty: 'opacity,transform' }}
          >
            <div className="bg-purple-50 rounded-lg p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-purple-700">Your Manifestation</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isEditingText ? handleSaveEdit : handleEditText}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isEditingText ? "Save" : "Edit"}
                </Button>
              </div>
              {isEditingText ? (
                <Textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="min-h-32 border-purple-200 focus:border-purple-400"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed italic">
                  {generatedText}
                </p>
              )}
            </div>

            {/* Step 2: Voice Style Selection comes immediately below preview */}
            <div className="mb-3">
              <Label className="text-xs font-medium mr-1 mb-0">Voice Style:</Label>
              <div className="flex flex-wrap gap-1">
                {voiceOptions.map(option => (
                  <div
                    key={option.value}
                    className={`flex items-center px-1 py-0.5 rounded border text-xs bg-white
                      ${formData.voice === option.value ? 'border-purple-500' : 'border-gray-200 hover:border-purple-300'}
                      transition-all`}
                  >
                    <input
                      type="radio"
                      id={`voice-${option.value}`}
                      name="voice"
                      value={option.value}
                      checked={formData.voice === option.value}
                      onChange={(e) => {
                        handleInputChange('voice', e.target.value);
                        if (step !== "audio") setStep('voice');
                      }}
                      className="accent-purple-500 mr-1"
                    />
                    <label htmlFor={`voice-${option.value}`} className="font-medium cursor-pointer text-xs">{option.label}</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVoicePreview(option.value)}
                      disabled={isGenerating || isRegeneratingPreviews}
                      className="ml-1 p-1"
                      aria-label={`Preview ${option.label}`}
                    >
                      {previewingVoice === option.value
                        ? <Pause className="w-4 h-4 text-purple-500" />
                        : <Play className="w-4 h-4 text-gray-500" />
                      }
                    </Button>
                    {!voicePreviews[option.value] && (
                      <span className="text-[10px] text-orange-400 ml-1">⚠</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Generate Audio Button: Only appears and is highlighted after a voice is selected */}
            <div className="mb-2">
              <AudioGenerationButton
                isGenerating={isGenerating}
                disabled={!!audioUrl || !formData.voice || isGenerating}
                onClick={handleGenerateAudio}
                showPlayIcon={!audioUrl && formData.voice && !isGenerating}
              />
            </div>
          </div>
        )}

        {/* Audio Player and controls, appears after audio is generated */}
        {audioUrl ? (
          <div className="space-y-4 animate-fade-in">
            {/* Visualizer */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-8 text-center">
              <div className="w-full h-24 bg-gradient-to-r from-purple-300 to-pink-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                <button
                  type="button"
                  onClick={handlePlayFullManifestation}
                  aria-label={isSpeaking ? 'Pause voice' : 'Play voice'}
                  className={`
                    z-20 relative w-12 h-12 flex items-center justify-center
                    bg-transparent border-none outline-none cursor-pointer
                    rounded-full focus-visible:ring-2 focus-visible:ring-purple-400
                    transition-all hover:scale-110 active:scale-105
                  `}
                  tabIndex={0}
                >
                  {isSpeaking ? (
                    <Pause className="w-12 h-12 text-white drop-shadow" />
                  ) : (
                    <Play className="w-12 h-12 text-white drop-shadow" />
                  )}
                </button>
                {isSpeaking && (
                  <>
                    <div className="flex space-x-1 z-10 absolute left-0 right-0 top-0 bottom-0 items-center justify-center">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 bg-white rounded-full animate-bounce"
                          style={{ 
                            height: `${Math.random() * 40 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1s'
                          }}
                        />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 animate-pulse" />
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4 font-medium">
                {isSpeaking ? 'Playing your manifestation...' : 'AI voice ready!'}
              </p>
            </div>
            {/* --- REMOVED the bottom Play Voice button --- */}
            <div className="grid grid-cols-3 gap-3">
              {/* If saved, change button to View in Library, else show Save */}
              {isSaved ? (
                <Button
                  variant="secondary"
                  className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 font-semibold border-2 border-gray-300 cursor-pointer"
                  onClick={() => navigate('/library')}
                  disabled={false}
                >
                  <Library className="w-4 h-4 mr-2" />
                  View in Library
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold ring-2 ring-pink-200"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save to Library"}
                </Button>
              )}
              <Button variant="outline" disabled>
                <Edit className="w-4 h-4 mr-2" />
                Share (coming soon)
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = audioUrl;
                  link.download = 'manifestation-audio.mp3';
                  link.click();
                }}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Download raw audio
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <SaveManifestationModal
        open={showSaveModal}
        onSave={handleSaveManifestation}
        onCancel={() => setShowSaveModal(false)}
      />
    </div>
  );
};

export default ManifestationCreator;
