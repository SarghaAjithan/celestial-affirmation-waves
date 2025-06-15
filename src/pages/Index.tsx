
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen cosmic-bg floating-particles flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold gradient-text font-playfair">iManifest</h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-purple-600 hover:text-purple-700"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 mb-6">
              <Star className="w-6 h-6 text-purple-500 animate-pulse" />
              <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Star className="w-4 h-4 text-indigo-500 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 gradient-text font-playfair leading-tight">
              Turn Your Dreams
              <br />
              Into Reality
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light leading-relaxed">
              Create personalized voice affirmations that resonate with your soul.
              <br />
              Manifest your deepest desires through the power of spoken intention.
            </p>
          </div>

          <div className="animate-fade-in-delay space-y-4">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Personalized</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Transformative</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-pink-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-indigo-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '6s' }}></div>
    </div>
  );
};

export default Index;
