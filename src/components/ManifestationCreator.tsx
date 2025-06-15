import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Save, Share, Heart, Volume2, Edit, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "@/hooks/useTTS";
import { useLocation } from "react-router-dom";

interface ManifestationFormData {
  name: string;
  goal: string;
  customAffirmations: string;
  voice: string;
  backgroundMusic: string;
}

const ManifestationCreator = () => {
  const { toast } = useToast();
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
  const [isEditingText, setIsEditingText] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [voicePreviewAudios, setVoicePreviewAudios] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [voicePreviews, setVoicePreviews] = useState<{ [voice: string]: string }>({});
  const [isRegeneratingPreviews, setIsRegeneratingPreviews] = useState(false);
  const manifestationPreviewRef = useRef<HTMLDivElement | null>(null);

  // OpenAI voice options with preview text
  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Warm)' },
    { value: 'fable', label: 'Fable (Expressive)' },
    { value: 'onyx', label: 'Onyx (Deep)' },
    { value: 'nova', label: 'Nova (Bright)' },
    { value: 'shimmer', label: 'Shimmer (Gentle)' }
  ];

  const musicOptions = [
    { value: 'ocean', label: 'Ocean Waves' },
    { value: 'forest', label: 'Forest Sounds' },
    { value: 'piano', label: 'Gentle Piano' },
    { value: 'lofi', label: 'Lo-fi Beats' },
    { value: 'bells', label: 'Temple Bells' }
  ];

  // Mood tracker state (now part of the form)
  const [mood, setMood] = useState<number | null>(null);

  // Get goal text based on selection from Goals page
  function getGoalText(goalId: string): string {
    const goalTexts = {
      wealth: 'I want to manifest financial abundance and prosperity in my life',
      love: 'I want to attract meaningful love and deep connections',
      confidence: 'I want to build unshakeable confidence and self-worth',
      peace: 'I want to cultivate inner peace and emotional balance',
      health: 'I want to manifest vibrant health and vitality',
      career: 'I want to achieve career growth and professional fulfillment',
      custom: 'I want to create my own unique manifestation'
    };
    return goalTexts[goalId as keyof typeof goalTexts] || '';
  }

  const handleInputChange = (field: keyof ManifestationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (step !== 'input') setStep('input');
  };

  // Enhanced affirmation text creation with personalization
  const createPersonalizedAffirmationText = (
    name: string,
    goal: string,
    customAffirmations: string,
    goalType: string
  ): string => {
    // Personalized greetings based on goal type
    const personalizedGreetings = {
      wealth: `${name}, you are a magnet for abundance and prosperity`,
      love: `${name}, you are worthy of deep, meaningful love`,
      confidence: `${name}, you radiate confidence and inner strength`,
      peace: `${name}, you are a beacon of calm and tranquility`,
      health: `${name}, your body is vibrant and full of life`,
      career: `${name}, you are destined for professional success`,
      custom: `${name}, you are a powerful creator of your reality`
    };

    // Goal-specific affirmations
    const goalSpecificAffirmations = {
      wealth: [
        'Money flows to me easily and effortlessly',
        'I am open to receiving abundance from multiple sources',
        'My financial situation improves every day',
        'I make wise decisions that increase my wealth'
      ],
      love: [
        'I attract loving, supportive relationships into my life',
        'I am open to giving and receiving love freely',
        'The perfect partner is drawn to my authentic self',
        'I radiate love and attract love in return'
      ],
      confidence: [
        'I trust my abilities and believe in myself completely',
        'I speak my truth with courage and conviction',
        'I am comfortable being my authentic self',
        'My confidence grows stronger each day'
      ],
      peace: [
        'I am calm and centered in all situations',
        'Peace flows through every aspect of my life',
        'I release stress and embrace tranquility',
        'I find serenity in the present moment'
      ],
      health: [
        'My body heals and regenerates perfectly',
        'I make choices that support my optimal health',
        'Energy and vitality flow through every cell',
        'I am grateful for my strong, healthy body'
      ],
      career: [
        'Opportunities for growth come to me naturally',
        'I excel in my chosen field and am recognized for my talents',
        'My career brings me fulfillment and financial reward',
        'I am a valuable contributor to my workplace'
      ],
      custom: [
        'I have the power to create any reality I desire',
        'The universe supports my highest good',
        'I am aligned with my true purpose',
        'Miracles happen in my life regularly'
      ]
    };

    const greeting = personalizedGreetings[goalType as keyof typeof personalizedGreetings] || personalizedGreetings.custom;
    const specificAffirmations = goalSpecificAffirmations[goalType as keyof typeof goalSpecificAffirmations] || goalSpecificAffirmations.custom;

    // Create personalized goal statement
    const goalStatement = goal.toLowerCase().replace('i want to', 'I am').replace('i', 'I');

    const allAffirmations = [
      goalStatement,
      ...specificAffirmations
    ];

    if (customAffirmations) {
      allAffirmations.push(...customAffirmations.split('\n').filter(a => a.trim()));
    }

    return `${greeting}. ${allAffirmations.join('. ')}. Take a deep breath and feel these truths resonating within your soul.`;
  };

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

  // Step 1: Generate manifestation text only
  const handleGenerateText = () => {
    if (!formData.name || !formData.goal) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and goal to generate your manifestation.",
        variant: "destructive"
      });
      return;
    }

    const affirmationText = createPersonalizedAffirmationText(
      formData.name,
      formData.goal,
      formData.customAffirmations,
      selectedGoalFromRoute
    );
    
    setGeneratedText(affirmationText);
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
    }, 200); // Give fade-in animation a moment before scroll.
  };

  // Step 2: Generate audio from the manifestation text
  const handleGenerateAudio = async () => {
    if (!generatedText || !formData.voice) {
      toast({
        title: "Missing Information",
        description: "Please ensure you have generated text and selected a voice.",
        variant: "destructive"
      });
      return;
    }
    setStep('audio'); // track we're at the audio generation step
    setIsGeneratingAudio(true);
    
    try {
      // Use the *latest* generatedText so the audio matches the preview/edit exactly
      await generateAffirmations(
        formData.name || "",     // Keep this in case your affirmation logic needs it (can be removed if unused)
        formData.goal || "",
        "",                      // Don't use prior affirmation text (customAffirmations is blank since we use generatedText)
        "",                      // Tone param, not needed for audio gen—can be left blank unless you need it
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
    } finally {
      setIsGeneratingAudio(false);
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
    toast({
      title: "Saved to Library",
      description: "Your manifestation has been added to your personal collection."
    });
  };

  const handleEditText = () => setIsEditingText(true);
  const handleSaveEdit = () => {
    setIsEditingText(false);
    toast({
      title: "Text Updated",
      description: "Generate audio again to hear your updated manifestation."
    });
  };

  // Mood emoji options
  const moodEmojis = ['😔', '😐', '🙂', '😊', '✨'];

  const [step, setStep] = useState<'input' | 'text' | 'voice' | 'audio'>('input');

  // We use a single-step progressive box flow.
  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-5">
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

        {/* Step 1: Name, Mood, Goal, Affirmations */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Name input */}
          <div className="flex flex-col flex-shrink-0" style={{ minWidth: 105, maxWidth: 160 }}>
            <Label htmlFor="name" className="text-xs mb-1">Name</Label>
            <Input
              id="name"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-0 h-8 px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-full"
              style={{ minWidth: 90, maxWidth: 150 }}
            />
          </div>
          {/* Mood selector */}
          <div className="flex flex-col flex-1 min-w-[180px]">
            <Label className="text-xs font-medium mb-1 whitespace-nowrap" htmlFor="mood-options">
              How are you feeling?
            </Label>
            <div id="mood-options" className="flex flex-row gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  type="button"
                  key={index}
                  aria-label={emoji}
                  onClick={() => setMood(index)}
                  className={`flex items-center justify-center h-8 w-10 rounded-lg border
                    text-lg font-medium transition-all
                    ${mood === index 
                      ? "bg-gradient-to-tr from-pink-100 to-purple-100 border-purple-400 scale-105"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400`}
                  tabIndex={0}
                  style={{ fontSize: 20 }}
                >
                  {emoji}
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
              placeholder="I want to manifest abundance..."
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
            ${(!formData.name || !formData.goal) ? "opacity-70" : ""}
          `}
          style={{
            boxShadow: undefined
          }}
          disabled={!formData.name || !formData.goal || !!generatedText}
          data-testid="generate-manifestation-text"
        >
          <span className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Manifestation Text
          </span>
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
                      disabled={isGenerating || isGeneratingAudio || isRegeneratingPreviews}
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
              <Button
                type="button"
                onClick={handleGenerateAudio}
                disabled={!formData.voice || isGeneratingAudio}
                className={`
                  w-full text-base
                  transition-all duration-300
                  bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700
                  ${formData.voice ? "animate-pulse ring-2 ring-pink-300 font-semibold shadow-lg scale-[1.03]" : "opacity-60"}
                `}
              >
                {isGeneratingAudio ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                    Creating Audio...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Generate Audio
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Audio Player and controls, appears after audio is generated */}
        {audioUrl ? (
          <div className="space-y-4 animate-fade-in">
            {/* Visualizer */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-8 text-center">
              <div className="w-full h-24 bg-gradient-to-r from-purple-300 to-pink-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isSpeaking ? (
                  <>
                    <div className="flex space-x-1 z-10">
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
                ) : (
                  <Play className="w-12 h-12 text-white" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4 font-medium">
                {isSpeaking ? 'Playing your manifestation...' : 'AI voice ready!'}
              </p>
              <div className="mt-2">
                <a
                  href={audioUrl}
                  download
                  className="text-xs underline text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download raw audio file (for troubleshooting)
                </a>
              </div>
            </div>
            {/* Player Controls */}
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="flex-1 border-purple-200 hover:bg-purple-50"
                onClick={handlePlayFullManifestation}
                disabled={!audioUrl}
              >
                {isSpeaking ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play Voice
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default ManifestationCreator;

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
