
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isOnboardingComplete } = useOnboarding();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg floating-particles flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen cosmic-bg floating-particles flex flex-col relative">
      {/* Decorative Elements */}
      <div className="decorative-leaf top-20 left-16">
        <svg width="60" height="80" viewBox="0 0 60 80" className="text-yellow-300 opacity-60">
          <path d="M30 10C20 15 10 25 15 45C20 65 30 70 30 70C30 70 40 65 45 45C50 25 40 15 30 10Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div className="decorative-leaf top-1/3 right-20">
        <svg width="70" height="90" viewBox="0 0 70 90" className="text-purple-300 opacity-50">
          <path d="M35 5C25 10 15 20 20 40C25 60 35 65 35 65C35 65 45 60 50 40C55 20 45 10 35 5Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="decorative-star top-32 right-1/3">
        <Sparkles className="w-6 h-6 text-yellow-400" />
      </div>
      
      <div className="decorative-star top-2/3 left-1/4">
        <Star className="w-5 h-5 text-yellow-300" />
      </div>

      <div className="decorative-star bottom-1/3 right-1/4">
        <Sparkles className="w-4 h-4 text-yellow-400" />
      </div>

      {/* Header */}
      <header className="p-6 relative z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold gradient-text font-inter">iManifest</h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-purple-700 hover:text-purple-800 hover:bg-white/20 font-inter"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 mb-6">
              <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Star className="w-4 h-4 text-yellow-500 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800 font-inter leading-tight">
              Turn Your Dreams
              <br />
              Into Reality
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light leading-relaxed font-inter">
              Create personalized voice affirmations that resonate with your soul.
              <br />
              Manifest your deepest desires through the power of spoken intention.
            </p>
          </div>

          <div className="animate-fade-in-delay space-y-4">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-inter"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 font-inter">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Personalized</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Transformative</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-300 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '6s' }}></div>
    </div>
  );
};

export default Index;
