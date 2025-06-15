import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  // Function to regenerate all voice previews
  const handleRegenerateVoicePreviews = async () => {
    setIsRegeneratingPreviews(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      toast({
        title: "Regenerating Voice Previews",
        description: "This may take a moment..."
      });

      const { data, error } = await supabase.functions.invoke('trigger-prebuild-voices');
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Voice Previews Regenerated!",
          description: "All voice previews have been updated. Refreshing..."
        });
        
        // Refresh the preview URLs
        window.location.reload();
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Failed to regenerate voice previews:', error);
      toast({
        title: "Regeneration Failed",
        description: "Could not regenerate voice previews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegeneratingPreviews(false);
    }
  };

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
    
    toast({
      title: "Manifestation Text Generated! ✨",
      description: "Review and edit your affirmation, then generate the audio."
    });
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

  const handleEditText = () => {
    setIsEditingText(true);
  };

  const handleSaveEdit = () => {
    setIsEditingText(false);
    // Clear existing audio since text changed
    setFullManifestationAudio(null);
    if (fullManifestationAudio) {
      toast({
        title: "Text Updated",
        description: "Generate audio again to hear your updated manifestation."
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text font-playfair mb-2">
          Manifestation Creator
        </h1>
        <p className="text-gray-600 font-light">
          Create your personalized affirmations step by step
        </p>
        {selectedGoalFromRoute && (
          <p className="text-sm text-purple-600 mt-2">
            Creating manifestation for: {selectedGoalFromRoute.charAt(0).toUpperCase() + selectedGoalFromRoute.slice(1)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="goal-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-purple-500" />
              <span>Your Manifestation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-700 mb-3 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="goal">What's your heart's desire?</Label>
                  <Textarea
                    id="goal"
                    placeholder="I want to manifest abundance and financial freedom..."
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="mt-2 min-h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="affirmations">Custom Affirmations (Optional)</Label>
                  <Textarea
                    id="affirmations"
                    placeholder="Add your own personal affirmations here..."
                    value={formData.customAffirmations}
                    onChange={(e) => handleInputChange('customAffirmations', e.target.value)}
                    className="mt-2 min-h-16"
                  />
                </div>

                <Button 
                  type="button"
                  onClick={handleGenerateText}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Manifestation Text
                </Button>
              </div>
            </div>

            {/* Step 2: Audio Settings (only show if text is generated) */}
            {generatedText && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-pink-700 flex items-center">
                    <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                    Audio Settings
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateVoicePreviews}
                    disabled={isRegeneratingPreviews}
                    className="text-xs"
                  >
                    {isRegeneratingPreviews ? 'Fixing...' : 'Fix Voices'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Voice Style</Label>
                    <div className="space-y-2 mt-2">
                      {voiceOptions.map(option => (
                        <div key={option.value} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`voice-${option.value}`}
                                name="voice"
                                value={option.value}
                                checked={formData.voice === option.value}
                                onChange={(e) => handleInputChange('voice', e.target.value)}
                                className="text-purple-600"
                              />
                              <label htmlFor={`voice-${option.value}`} className="font-medium cursor-pointer">
                                {option.label}
                              </label>
                              {!voicePreviews[option.value] && (
                                <span className="text-xs text-orange-500 ml-2">⚠ Preview missing</span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleVoicePreview(option.value)}
                            disabled={isGenerating || isGeneratingAudio || isRegeneratingPreviews}
                            className="ml-2"
                          >
                            {previewingVoice === option.value ? (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Preview
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio || !formData.voice}
                  className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  size="lg"
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
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="goal-card">
          <CardHeader>
            <CardTitle>Manifestation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedText ? (
              <div className="space-y-6">
                {/* Text Preview and Editor */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-purple-700">Your Manifestation</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isEditingText ? handleSaveEdit : handleEditText}
                      className="border-purple-200 hover:bg-purple-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {isEditingText ? 'Save' : 'Edit'}
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

                {/* Audio Player Section */}
                {audioUrl ? (
                  <div className="space-y-4">
                    {/* Enhanced Audio Visualizer */}
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
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 animate-pulse" />
                          </>
                        ) : (
                          <Play className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-4 font-medium">
                        {isSpeaking ? 'Playing your manifestation...' : 'AI voice ready!'}
                      </p>
                      {/* Download raw audio (diagnostic) */}
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

                    {/* Enhanced Player Controls */}
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

                    {/* Mood Tracker */}
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">How are you feeling?</Label>
                      <div className="flex space-x-2 mt-2">
                        {['😔', '😐', '🙂', '😊', '✨'].map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="text-2xl hover:scale-110 transition-transform"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : generatedText && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <Volume2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Ready to generate audio</p>
                    <p className="text-sm">Complete the audio settings above to create your voice manifestation</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Start by generating your manifestation text</p>
                <p className="text-sm">Fill in your details on the left and click "Generate Manifestation Text"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManifestationCreator;
