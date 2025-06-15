
import { Button } from "@/components/ui/button";
import { Plus, Headphones, Library, Star, Sparkles, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface Manifestation {
  id: string;
  title: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);

  useEffect(() => {
    const fetchManifestations = async () => {
      if (user) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("manifestations")
          .select("id,title,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching manifestations:", error);
          setManifestations([]);
        } else {
          setManifestations(data || []);
        }
      }
    };
    fetchManifestations();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const recentAffirmations = manifestations.slice(0, 3);

  const quickActions = [
    {
      title: "Create New Affirmation",
      description: "Start manifesting your desires",
      icon: Plus,
      action: () => navigate('/goals'),
      color: "from-yellow-400 to-orange-400"
    },
    {
      title: "My Library",
      description: "Browse your saved affirmations",
      icon: Library,
      action: () => navigate('/library'),
      color: "from-purple-400 to-indigo-400"
    },
    {
      title: "Continue Playing",
      description: "Resume your last session",
      icon: Headphones,
      action: () => manifestations.length > 0 ? navigate(`/now-playing?id=${manifestations[0].id}`) : navigate('/library'),
      color: "from-green-400 to-teal-400"
    }
  ];

  return (
    <div className="min-h-screen cosmic-bg floating-particles relative">
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-purple-700 hover:text-purple-800 hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 font-mulish">
              Welcome Back, Manifestor ✨
            </h2>
            <p className="text-lg text-gray-700 font-light">
              Ready to continue your manifestation journey?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.title}
                  className="goal-card cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={action.action}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 font-inter">{action.title}</h3>
                  <p className="text-gray-600 font-light font-inter">{action.description}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Affirmations */}
          {recentAffirmations.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 font-inter">Recent Affirmations</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/library')}
                  className="text-purple-600 hover:text-purple-700 hover:bg-white/20 font-inter"
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAffirmations.map((affirmation, index) => (
                  <div
                    key={affirmation.id}
                    className="goal-card cursor-pointer"
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                    onClick={() => navigate(`/now-playing?id=${affirmation.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Star className="w-5 h-5 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2 font-inter">{affirmation.title}</h4>
                    <p className="text-gray-600 text-sm font-inter">Created: {new Date(affirmation.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspiration Quote */}
          <div className="text-center">
            <div className="goal-card max-w-2xl mx-auto">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <p className="text-lg font-light text-gray-700 italic mb-2 font-inter">
                "Your thoughts become things. Choose the good ones."
              </p>
              <p className="text-sm text-gray-500 font-inter">— Mike Dooley</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
