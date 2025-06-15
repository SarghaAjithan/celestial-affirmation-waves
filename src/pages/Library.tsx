
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Play, Heart, Download, Star, Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Library = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const savedManifestations = [
    {
      id: 1,
      title: "Morning Confidence Boost",
      goal: "confidence",
      duration: "3:45",
      emoji: "⚡",
      lastPlayed: "Today",
      isLiked: true
    },
    {
      id: 2,
      title: "Abundance Affirmations",
      goal: "wealth",
      duration: "5:20",
      emoji: "💰",
      lastPlayed: "Yesterday",
      isLiked: false
    },
    {
      id: 3,
      title: "Self-Love Journey",
      goal: "love",
      duration: "4:15",
      emoji: "💖",
      lastPlayed: "2 days ago",
      isLiked: true
    },
    {
      id: 4,
      title: "Career Success Mantras",
      goal: "career",
      duration: "6:00",
      emoji: "🚀",
      lastPlayed: "1 week ago",
      isLiked: false
    }
  ];

  const recentlyPlayed = savedManifestations.slice(0, 2);
  const favorites = savedManifestations.filter(m => m.isLiked);

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <h1 className="text-2xl font-bold gradient-text font-playfair">My Rituals</h1>
          <Button 
            onClick={() => navigate('/goals')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Search */}
          <div className="mb-8 animate-fade-in">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search your manifestations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">12</div>
              <p className="text-gray-600">Manifestations Created</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">47</div>
              <p className="text-gray-600">Hours Manifested</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">7</div>
              <p className="text-gray-600">Day Streak</p>
            </div>
          </div>

          {/* Recently Played */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text font-playfair">Recently Played</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentlyPlayed.map((item) => (
                <div key={item.id} className="goal-card group">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.duration} • {item.lastPlayed}</p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="rounded-full w-10 h-10">
                        <Heart className={`w-4 h-4 ${item.isLiked ? 'text-pink-500 fill-current' : ''}`} />
                      </Button>
                      <Button size="sm" className="rounded-full w-10 h-10 bg-purple-600 hover:bg-purple-700">
                        <Play className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Favorites */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text font-playfair">Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => (
                <div key={item.id} className="goal-card group">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl mx-auto mb-4">
                      {item.emoji}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.duration}</p>
                    <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="rounded-full">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="rounded-full bg-purple-600 hover:bg-purple-700">
                        <Play className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Manifestations */}
          <section>
            <h2 className="text-2xl font-bold mb-6 gradient-text font-playfair">All Manifestations</h2>
            <div className="space-y-4">
              {savedManifestations.map((item) => (
                <div key={item.id} className="glass-card p-6 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.duration} • Last played {item.lastPlayed}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="rounded-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Set Reminder
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full">
                        <Heart className={`w-4 h-4 ${item.isLiked ? 'text-pink-500 fill-current' : ''}`} />
                      </Button>
                      <Button size="sm" className="rounded-full bg-purple-600 hover:bg-purple-700">
                        <Play className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Library;
