import { useState } from 'react';
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

interface ManifestationFormData {
  name: string;
  goal: string;
  customAffirmations: string;
  tone: string;
  voiceStyle: string;
  backgroundMusic: string;
}

const ManifestationCreator = () => {
  const { toast } = useToast();
  const { 
    isGenerating, 
    isSpeaking, 
    audioUrl, 
    apiKey, 
    setApiKey, 
    generateAffirmations, 
    playAffirmations, 
    stopAffirmations 
  } = useTTS();
  
  const [formData, setFormData] = useState<ManifestationFormData>({
    name: '',
    goal: '',
    customAffirmations: '',
    tone: '',
    voiceStyle: '',
    backgroundMusic: ''
  });
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const toneOptions = [
    { value: 'empowering', label: 'Empowering' },
    { value: 'soothing', label: 'Soothing' },
    { value: 'motivational', label: 'Motivational' },
    { value: 'spiritual', label: 'Spiritual' }
  ];

  const voiceOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'whisper', label: 'Whisper' }
  ];

  const musicOptions = [
    { value: 'ocean', label: 'Ocean Waves' },
    { value: 'forest', label: 'Forest Sounds' },
    { value: 'piano', label: 'Gentle Piano' },
    { value: 'lofi', label: 'Lo-fi Beats' },
    { value: 'bells', label: 'Temple Bells' }
  ];

  const handleInputChange = (field: keyof ManifestationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to create affirmation text (moved from useTTS hook)
  const createAffirmationText = (
    name: string,
    goal: string,
    customAffirmations: string,
    tone: string
  ): string => {
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
  };

  // Step 1: Generate manifestation text only
  const handleGenerateText = () => {
    if (!formData.name || !formData.goal || !formData.tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, goal, and tone to generate your manifestation.",
        variant: "destructive"
      });
      return;
    }

    const affirmationText = createAffirmationText(
      formData.name,
      formData.goal,
      formData.customAffirmations,
      formData.tone
    );
    
    setGeneratedText(affirmationText);
    
    toast({
      title: "Manifestation Text Generated! ✨",
      description: "Review and edit your affirmation, then generate the audio."
    });
  };

  // Step 2: Generate audio from the text
  const handleGenerateAudio = async () => {
    if (!generatedText || !formData.voiceStyle || !formData.backgroundMusic) {
      toast({
        title: "Missing Information",
        description: "Please ensure you have generated text and selected voice style and background music.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAudio(true);
    
    try {
      await generateAffirmations(
        formData.name,
        formData.goal,
        generatedText, // Use the generated/edited text
        formData.tone,
        formData.voiceStyle
      );
      
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

  const handlePlay = () => {
    if (!audioUrl) return;
    
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
    if (audioUrl) {
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

                <div>
                  <Label>Affirmation Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose tone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <h3 className="font-semibold text-pink-700 mb-3 flex items-center">
                  <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                  Audio Settings
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Voice Style</Label>
                    <Select value={formData.voiceStyle} onValueChange={(value) => handleInputChange('voiceStyle', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose voice..." />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Background Music</Label>
                    <Select value={formData.backgroundMusic} onValueChange={(value) => handleInputChange('backgroundMusic', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose ambiance..." />
                      </SelectTrigger>
                      <SelectContent>
                        {musicOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
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
                    </div>

                    {/* Enhanced Player Controls */}
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-purple-200 hover:bg-purple-50"
                        onClick={handlePlay}
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
