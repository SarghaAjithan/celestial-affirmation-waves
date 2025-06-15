
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Play, User, Target, Volume2, Music, Wand2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Builder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedGoal = location.state?.goal || "custom";
  
  const [formData, setFormData] = useState({
    name: "",
    specificGoal: "",
    tone: "",
    affirmationType: "",
    customAffirmations: "",
    backgroundMusic: "",
    voiceStyle: ""
  });

  const tones = [
    { id: "empowering", label: "Empowering", description: "Strong and confident" },
    { id: "soothing", label: "Soothing", description: "Calm and peaceful" },
    { id: "motivational", label: "Motivational", description: "Energetic and uplifting" },
    { id: "spiritual", label: "Spiritual", description: "Sacred and transcendent" }
  ];

  const backgroundMusic = [
    { id: "ocean", label: "Ocean Waves" },
    { id: "forest", label: "Forest Sounds" },
    { id: "piano", label: "Gentle Piano" },
    { id: "lofi", label: "Lo-fi Beats" },
    { id: "bells", label: "Temple Bells" },
    { id: "none", label: "No Background" }
  ];

  const voiceStyles = [
    { id: "female", label: "Female Voice" },
    { id: "male", label: "Male Voice" },
    { id: "neutral", label: "Neutral Voice" },
    { id: "whisper", label: "Whisper" },
    { id: "ai-stylized", label: "AI Stylized" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = () => {
    return formData.name && formData.specificGoal && formData.tone && 
           formData.affirmationType && formData.backgroundMusic && formData.voiceStyle;
  };

  const handleGenerate = () => {
    if (isFormComplete()) {
      navigate('/player', { state: { formData, selectedGoal } });
    }
  };

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold gradient-text font-playfair">Manifest</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text font-playfair">
              Create Your Manifestation
            </h2>
            <p className="text-lg text-gray-700 font-light">
              Let's personalize your affirmation experience
            </p>
          </div>

          <div className="glass-card p-8 space-y-8">
            {/* Name Input */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <Label htmlFor="name" className="text-lg font-medium">What should we call you?</Label>
              </div>
              <Input
                id="name"
                placeholder="Enter your preferred name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-lg p-4 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            {/* Specific Goal */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <Label htmlFor="goal" className="text-lg font-medium">What specific goal do you want to manifest?</Label>
              </div>
              <Textarea
                id="goal"
                placeholder="Describe your goal in detail (e.g., 'I want to attract my dream job as a creative director')"
                value={formData.specificGoal}
                onChange={(e) => handleInputChange('specificGoal', e.target.value)}
                className="text-lg p-4 rounded-xl border-purple-200 focus:border-purple-500 min-h-24"
              />
            </div>

            {/* Tone Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <Label className="text-lg font-medium">Choose your affirmation tone</Label>
              </div>
              <RadioGroup 
                value={formData.tone} 
                onValueChange={(value) => handleInputChange('tone', value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {tones.map((tone) => (
                  <div key={tone.id} className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all">
                    <RadioGroupItem value={tone.id} id={tone.id} />
                    <div>
                      <Label htmlFor={tone.id} className="font-medium cursor-pointer">{tone.label}</Label>
                      <p className="text-sm text-gray-600">{tone.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Affirmation Type */}
            <div className="space-y-3">
              <Label className="text-lg font-medium">Affirmation preference</Label>
              <RadioGroup 
                value={formData.affirmationType} 
                onValueChange={(value) => handleInputChange('affirmationType', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all">
                  <RadioGroupItem value="prewritten" id="prewritten" />
                  <Label htmlFor="prewritten" className="cursor-pointer">Use pre-written affirmations</Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer">I'll write my own affirmations</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Custom Affirmations */}
            {formData.affirmationType === 'custom' && (
              <div className="space-y-3">
                <Label htmlFor="customAffirmations" className="text-lg font-medium">Your personal affirmations</Label>
                <Textarea
                  id="customAffirmations"
                  placeholder="Write your affirmations here (one per line)"
                  value={formData.customAffirmations}
                  onChange={(e) => handleInputChange('customAffirmations', e.target.value)}
                  className="text-lg p-4 rounded-xl border-purple-200 focus:border-purple-500 min-h-32"
                />
              </div>
            )}

            {/* Background Music */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-purple-600" />
                <Label className="text-lg font-medium">Background ambiance</Label>
              </div>
              <Select value={formData.backgroundMusic} onValueChange={(value) => handleInputChange('backgroundMusic', value)}>
                <SelectTrigger className="text-lg p-4 rounded-xl border-purple-200">
                  <SelectValue placeholder="Choose your background music" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundMusic.map((music) => (
                    <SelectItem key={music.id} value={music.id}>{music.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Style */}
            <div className="space-y-3">
              <Label className="text-lg font-medium">Voice style</Label>
              <Select value={formData.voiceStyle} onValueChange={(value) => handleInputChange('voiceStyle', value)}>
                <SelectTrigger className="text-lg p-4 rounded-xl border-purple-200">
                  <SelectValue placeholder="Choose your preferred voice" />
                </SelectTrigger>
                <SelectContent>
                  {voiceStyles.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>{voice.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="text-center pt-6">
              <Button 
                onClick={handleGenerate}
                disabled={!isFormComplete()}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Generate My Manifestation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Builder;
