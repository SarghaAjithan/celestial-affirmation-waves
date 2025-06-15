import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Save, Share, Heart, Volume2, Key } from "lucide-react";
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

  const handleGenerate = async () => {
    if (!formData.name || !formData.goal || !formData.tone || !formData.voiceStyle || !formData.backgroundMusic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to generate your manifestation.",
        variant: "destructive"
      });
      return;
    }

    try {
      const affirmationText = await generateAffirmations(
        formData.name,
        formData.goal,
        formData.customAffirmations,
        formData.tone,
        formData.voiceStyle
      );
      
      setGeneratedText(affirmationText);
      
      toast({
        title: "Manifestation Created! ✨",
        description: apiKey ? "Your personalized affirmation is ready with high-quality AI voice." : "Your personalized affirmation is ready with browser voice. Add ElevenLabs API key for premium voices."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error creating your manifestation. Using browser voice as fallback.",
        variant: "destructive"
      });
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text font-playfair mb-2">
          Manifestation Creator
        </h1>
        <p className="text-gray-600 font-light">
          Transform your intentions into powerful spoken affirmations with AI voices
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
            {/* ElevenLabs API Key Input */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Label htmlFor="apiKey" className="flex items-center space-x-2 text-blue-700 font-medium">
                <Key className="w-4 h-4" />
                <span>ElevenLabs API Key (Optional)</span>
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2 border-blue-200 focus:border-blue-400"
              />
              <p className="text-xs text-blue-600 mt-1">
                Add your ElevenLabs API key for premium AI voices. Leave empty to use browser voice.
              </p>
            </div>

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

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                  Creating AI Audio...
                </>
              ) : (
                'Generate Manifestation'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="goal-card">
          <CardHeader>
            <CardTitle>Audio Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {audioUrl ? (
              <div className="space-y-6">
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
                    {isSpeaking ? 'Playing your manifestation...' : (apiKey ? 'High-quality AI voice ready!' : 'Browser voice ready!')}
                  </p>
                </div>

                {/* Generated Text Preview */}
                {generatedText && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="font-medium mb-2 flex items-center">
                      <Volume2 className="w-4 h-4 mr-2 text-purple-500" />
                      Affirmation Preview:
                    </p>
                    <p className="italic">{generatedText}</p>
                  </div>
                )}

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
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Generate your manifestation</p>
                <p className="text-sm">AI-powered voice synthesis ready to bring your affirmations to life</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManifestationCreator;
