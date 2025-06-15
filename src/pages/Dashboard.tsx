
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

const inspirationalQuotes = [
  {
    text: "Your thoughts become things. Choose the good ones.",
    author: "Mike Dooley"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "The universe is not only stranger than we imagine, it is stranger than we can imagine.",
    author: "J.B.S. Haldane"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    text: "Everything you need is inside you – you just need to access it.",
    author: "Buddha"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);

  useEffect(() => {
    // Set random quote on page load
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    setCurrentQuote(inspirationalQuotes[randomIndex]);
  }, []);

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
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "My Library",
      description: "Browse your saved affirmations",
      icon: Library,
      action: () => navigate('/library'),
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Continue Playing",
      description: "Resume your last session",
      icon: Headphones,
      action: () => manifestations.length > 0 ? navigate(`/now-playing?id=${manifestations[0].id}`) : navigate('/library'),
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen cosmic-bg floating-particles">
      {/* Header */}
      <header className="p-6">
        <div className="flex justify-end items-center max-w-6xl mx-auto">
          {/* Logo removed from here */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-purple-600 hover:text-purple-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Centered Logo above Welcome */}
          <div className="flex flex-col items-center mb-6">
            <h1
              className="text-4xl md:text-5xl font-dancing"
              style={{ color: '#5A4291', letterSpacing: '1px' }}
            >
              iManifest
            </h1>
          </div>

          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mulish" style={{ color: '#5A4291' }}>
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
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: '#5A4291' }}
                  >
                    {action.title}
                  </h3>
                  <p className="text-gray-600 font-light">{action.description}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Affirmations */}
          {recentAffirmations.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-sans" style={{ color: '#5A4291' }}>Recent Affirmations</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/library')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAffirmations.map((affirmation, index) => (
                  <div
                    key={affirmation.id}
                    className="goal-card cursor-pointer bg-purple-50/60"
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                    onClick={() => navigate(`/now-playing?id=${affirmation.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Star className="w-5 h-5 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{affirmation.title}</h4>
                    <p className="text-gray-600 text-sm">Created: {new Date(affirmation.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspiration Quote */}
          <div className="goal-card text-center py-4 px-6">
            <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-3" />
            <p className="text-sm font-light text-gray-700 italic mb-2">
              "{currentQuote.text}"
            </p>
            <p className="text-xs text-gray-500">— {currentQuote.author}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

