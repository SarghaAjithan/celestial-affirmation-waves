
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
    <div className="min-h-screen bg-[#FFF7EF] floating-particles">
      {/* Hero Section */}
      <div
        className="relative w-full shadow-none"
        style={{
          background: "linear-gradient(180deg, #EDDFFB 0%, #FCF6FF 90%)",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          minHeight: 300,
          marginBottom: 0,
          overflow: "hidden",
          paddingBottom: 24,
        }}
      >
        {/* Illustration Background - updated image */}
        <img
          src="/lovable-uploads/95d7f521-a8e3-4594-a826-e75e34b45b4a.png"
          alt="pastel hands holding light"
          className="absolute left-1/2 top-0 -translate-x-1/2 w-full md:w-full max-w-[100vw] min-w-[300px] h-auto object-cover pointer-events-none select-none z-0"
          style={{
            opacity: 1,
            filter: "none",
            maxHeight: 375,
          }}
        />
        {/* Header: logo (left), user (right) */}
        <header className="flex justify-between items-center px-8 pt-8 z-10 relative">
          <span className="font-dancing text-[2rem] font-bold text-[#5A4291] tracking-wide select-none">iManifest</span>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSignOut}
              className="text-purple-600 hover:text-purple-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>
        {/* Hero content: Welcome, subtitle */}
        <div className="flex flex-col items-center justify-center text-center z-10 relative pt-16 md:pt-20" style={{ minHeight: 140 }}>
          <h1 className="text-[2.8rem] md:text-[3.2rem] font-extrabold font-playfair mb-3 text-[#F2C661] drop-shadow-sm leading-tight">
            Welcome Back, Manifestor <span className="inline-block" role="img" aria-label="sparkles">✨</span>
          </h1>
          <p className="text-xl font-light text-gray-700 mb-6">Ready to continue your manifestation journey?</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-6 pb-20 max-w-5xl mx-auto mt-0 relative">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="rounded-2xl shadow-sm group bg-white/70 hover:bg-white/90 border-[0.5px] border-[#f2e7fa] cursor-pointer flex flex-col items-center px-6 py-7 transition-all duration-200"
                style={{ animationDelay: `${index * 0.11}s` }}
                onClick={action.action}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-700">{action.title}</h3>
                <p className="text-gray-600 text-base font-light">{action.description}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Affirmations */}
        {recentAffirmations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Recent Played</h3>
              <Button
                variant="ghost"
                onClick={() => navigate('/library')}
                className="text-purple-600 hover:text-purple-700"
              >
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentAffirmations.map((affirmation, index) => (
                <div
                  key={affirmation.id}
                  className="flex items-center rounded-2xl bg-[#EDE3F7] px-5 py-5 mb-2 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/now-playing?id=${affirmation.id}`)}
                  style={{ minHeight: 72, animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b38ffa] to-[#dcbafa] flex items-center justify-center mr-4 font-mulish text-white text-xl font-bold">
                    {affirmation.title[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{affirmation.title}</h4>
                    <div className="text-gray-600 text-sm truncate">{/* show preview line if available (stub) */}Created: {new Date(affirmation.created_at).toLocaleDateString()}</div>
                  </div>
                  <Star className="w-5 h-5 text-purple-400 ml-3 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspiration Quote */}
        <div className="rounded-2xl bg-white/50 shadow px-6 py-4 text-center max-w-2xl mx-auto mb-4">
          <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-base font-light text-gray-700 italic mb-1">
            "{currentQuote.text}"
          </p>
          <p className="text-xs text-gray-500">— {currentQuote.author}</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

