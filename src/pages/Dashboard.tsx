import { Button } from "@/components/ui/button";
import { Plus, Headphones, Library, Star, Sparkles, LogOut, View, Play } from "lucide-react";
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
  const [libraryManifestations, setLibraryManifestations] = useState<Manifestation[]>([]);

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

  useEffect(() => {
    const fetchLibraryManifestations = async () => {
      if (user) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("manifestations")
          .select("id,title,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error) {
          setLibraryManifestations(data || []);
        }
      }
    };
    fetchLibraryManifestations();
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
    <div className="min-h-screen bg-[#FFF7EF] floating-particles">
      {/* Hero Section with Banner Image */}
      <div
        className="relative w-full shadow-none pb-2 sm:pb-4"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          minHeight: 200,
          marginBottom: 0,
          overflow: "visible",
          paddingBottom: 0,
        }}
      >
        {/* Header bar: logo (left), email (right) */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8 z-10 relative">
          <span className="font-playfair text-[1.3rem] sm:text-[1.5rem] lg:text-[2rem] font-bold text-[#43236B] tracking-wide select-none">iManifest</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-700 font-inter hidden sm:inline">{user?.email}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSignOut}
              className="text-purple-600 hover:text-purple-800 h-8 w-8 sm:h-10 sm:w-10"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </header>

        <img
          src="/lovable-uploads/95d7f521-a8e3-4594-a826-e75e34b45b4a.png"
          alt="pastel hands holding light"
          className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-[100vw] min-w-[300px] h-auto object-cover pointer-events-none select-none z-0"
          style={{
            opacity: 1,
            filter: "none",
            maxHeight: 200,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        />
      </div>

      {/* Hero headline content - reduced padding and margin */}
      <div
        className="mx-auto flex flex-col items-center text-center px-4 sm:px-6 pt-1 sm:pt-2 pb-2 sm:pb-4"
        style={{ maxWidth: 700 }}
      >
        <h1
          className="text-[1.5rem] sm:text-[1.8rem] md:text-[2.15rem] lg:text-[2.5rem] xl:text-[3rem] font-playfair font-bold mb-2 sm:mb-3"
          style={{
            color: "#F2C661",
            letterSpacing: "-0.03em",
            fontWeight: 700,
            lineHeight: 1.1,
            textShadow: "0 4px 30px rgba(80,40,130,0.20)",
          }}
        >
          Welcome Back, Manifestor <span className="inline" role="img" aria-label="sparkles">✨</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-inter text-gray-700 font-normal mb-4 sm:mb-6 lg:mb-8">
          Ready to continue your manifestation journey?
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4 pb-20">
        {/* Quick Actions: Reduced spacing */}
        <div className="flex flex-col items-center justify-center w-full mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row w-full lg:justify-center gap-3 sm:gap-4 lg:gap-6 px-0 sm:px-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.title}
                  className="w-full lg:w-[320px] rounded-2xl bg-white shadow-sm hover:shadow-md border border-gray-100 cursor-pointer flex flex-row lg:flex-col items-center lg:items-start px-4 sm:px-5 py-4 sm:py-5 lg:py-6 transition-all duration-150"
                  style={{ minWidth: 210, maxWidth: 340 }}
                  onClick={action.action}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-0 lg:mb-4 mr-3 sm:mr-4 lg:mr-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold mb-1 text-gray-800">{action.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 font-inter font-normal leading-tight">{action.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Affirmations - reduced spacing */}
        {recentAffirmations.length > 0 && (
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-5 text-left px-1">Recent Played</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              {recentAffirmations.map((affirmation) => (
                <div
                  key={affirmation.id}
                  className="flex items-center rounded-2xl bg-[#EDE3F7] px-4 sm:px-5 py-3 sm:py-4 lg:py-5 mb-2 shadow-sm hover:shadow-md transition cursor-pointer group"
                  onClick={() => navigate(`/now-playing?id=${affirmation.id}`)}
                  style={{ minHeight: 64 }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#b38ffa] to-[#dcbafa] flex items-center justify-center mr-3 sm:mr-4 font-mulish text-white text-lg sm:text-xl font-bold">
                    {affirmation.title[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate text-sm sm:text-base">{affirmation.title}</h4>
                    <div className="text-gray-600 text-xs sm:text-sm">Created: {new Date(affirmation.created_at).toLocaleDateString()}</div>
                  </div>
                  {/* Play Button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="ml-2 sm:ml-3 text-purple-700 bg-white border border-purple-200 shadow-none group-hover:bg-purple-50 group-hover:border-purple-400 h-8 w-8 sm:h-10 sm:w-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/now-playing?id=${affirmation.id}`);
                    }}
                    title="Play"
                  >
                    <Play className="w-3 h-3 sm:w-5 sm:h-5" />
                  </Button>
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 ml-2 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspiration Quote */}
        <div className="rounded-2xl bg-white/50 shadow px-4 sm:px-6 py-4 text-center mx-auto mb-4">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-sm sm:text-base font-light text-gray-700 italic mb-1">
            "{currentQuote.text}"
          </p>
          <p className="text-xs text-gray-500">— {currentQuote.author}</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
