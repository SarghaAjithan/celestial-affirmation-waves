
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, TrendingUp, Sparkles, Shield, Leaf, Briefcase, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Goals = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string>("");

  const goals = [
    {
      id: "wealth",
      title: "Wealth & Abundance",
      description: "Attract financial prosperity and abundance",
      icon: TrendingUp,
      color: "from-green-400 to-emerald-600"
    },
    {
      id: "love",
      title: "Love & Relationships",
      description: "Manifest meaningful connections and romance",
      icon: Heart,
      color: "from-pink-400 to-rose-600"
    },
    {
      id: "confidence",
      title: "Confidence & Self-Worth",
      description: "Build unshakeable inner strength",
      icon: Shield,
      color: "from-orange-400 to-amber-600"
    },
    {
      id: "peace",
      title: "Inner Peace",
      description: "Find tranquility and emotional balance",
      icon: Leaf,
      color: "from-teal-400 to-cyan-600"
    },
    {
      id: "health",
      title: "Health & Vitality",
      description: "Cultivate vibrant physical wellbeing",
      icon: Sparkles,
      color: "from-violet-400 to-purple-600"
    },
    {
      id: "career",
      title: "Career Growth",
      description: "Achieve professional success and fulfillment",
      icon: Briefcase,
      color: "from-blue-400 to-indigo-600"
    }
  ];

  const handleContinue = () => {
    if (selectedGoal) {
      navigate('/builder', { state: { goal: selectedGoal } });
    }
  };

  return (
    <div className="min-h-screen cosmic-bg floating-particles">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
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
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text font-playfair">
              What's Your Heart's Desire?
            </h2>
            <p className="text-lg text-gray-700 font-light">
              Choose the area of your life you'd like to transform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <div
                  key={goal.id}
                  className={`goal-card cursor-pointer transition-all duration-300 ${
                    selectedGoal === goal.id 
                      ? 'ring-2 ring-purple-500 scale-105 shadow-2xl' 
                      : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${goal.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{goal.title}</h3>
                  <p className="text-gray-600 font-light">{goal.description}</p>
                </div>
              );
            })}
          </div>

          {/* Custom Goal Option */}
          <div className="text-center mb-8">
            <div 
              className={`goal-card cursor-pointer inline-block max-w-md ${
                selectedGoal === 'custom' 
                  ? 'ring-2 ring-purple-500 scale-105 shadow-2xl' 
                  : ''
              }`}
              onClick={() => setSelectedGoal('custom')}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center mb-4 mx-auto">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Custom Goal</h3>
              <p className="text-gray-600 font-light">Create your own unique manifestation</p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={!selectedGoal}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue Your Journey
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
