
import { ArrowLeft, Heart, TrendingUp, Sparkles, Shield, Leaf, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";

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

const Goals = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  // Immediately go to builder with the selected goal
  const handleSelectGoal = (goalId: string) => {
    completeOnboarding();
    navigate('/builder', { state: { goal: goalId } });
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
      <main className="px-2 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-2 gradient-text font-playfair">
              What's Your Heart's Desire?
            </h2>
            <p className="text-lg text-gray-700 font-light">
              Choose the area of your life you'd like to transform
            </p>
          </div>

          {/* 3x3 grid, clean cards, responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <button
                  key={goal.id}
                  className={`
                    group
                    rounded-2xl
                    bg-white/90
                    border
                    border-gray-200
                    p-7
                    flex flex-col items-start
                    justify-start
                    shadow
                    transition
                    duration-200
                    hover:shadow-xl
                    hover:border-purple-400
                    focus:outline-none
                    active:scale-98
                  `}
                  style={{
                    animationDelay: `${index * 0.07}s`,
                    minHeight: 165
                  }}
                  onClick={() => handleSelectGoal(goal.id)}
                  tabIndex={0}
                >
                  <span className={`w-12 h-12 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </span>
                  <span className="text-lg md:text-xl font-bold text-gray-900 mb-1">{goal.title}</span>
                  <span className="text-[15px] text-gray-600 font-light text-left">{goal.description}</span>
                </button>
              );
            })}
            {/* Custom Goal always last row, centered */}
            <button
              className={`
                group
                rounded-2xl
                bg-white/90
                border
                border-gray-200
                p-7
                flex flex-col items-start
                justify-start
                shadow
                transition
                duration-200
                hover:shadow-xl
                hover:border-purple-400
                focus:outline-none
                active:scale-98
              `}
              style={{ minHeight: 165 }}
              onClick={() => handleSelectGoal('custom')}
              tabIndex={0}
            >
              <span className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </span>
              <span className="text-lg md:text-xl font-bold text-gray-900 mb-1">Custom Goal</span>
              <span className="text-[15px] text-gray-600 font-light text-left">Create your own unique manifestation</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
