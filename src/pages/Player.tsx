
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw, Download, Share2, Heart, Star, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Player = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, selectedGoal } = location.state || {};
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180); // 3 minutes
  const [isLiked, setIsLiked] = useState(false);

  const goalIcons = {
    wealth: "💰",
    love: "💖",
    confidence: "⚡",
    peace: "🕯️",
    health: "🌟",
    career: "🚀",
    custom: "✨"
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/builder')}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold gradient-text font-playfair">Manifest</h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/library')}
            className="text-purple-600 hover:text-purple-700"
          >
            Library
          </Button>
        </div>
      </header>

      {/* Player Content */}
      <main className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Artwork */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{goalIcons[selectedGoal] || "✨"}</div>
                    <h3 className="text-2xl font-bold text-gray-800 font-playfair">
                      {formData?.name}'s Manifestation
                    </h3>
                    <p className="text-gray-600 capitalize">{selectedGoal} Journey</p>
                  </div>
                </div>
              </div>
              
              {/* Floating particles around artwork */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 gradient-text font-playfair">
              Your Personal Affirmations
            </h2>
            <p className="text-gray-700">
              {formData?.tone} • {formData?.voiceStyle} • {formData?.backgroundMusic}
            </p>
          </div>

          {/* Player Controls */}
          <div className="glass-card p-8 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14 border-purple-200 hover:border-purple-400"
                onClick={() => setCurrentTime(0)}
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
              
              <Button
                size="lg"
                className="rounded-full w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className={`rounded-full w-14 h-14 border-purple-200 hover:border-purple-400 ${isLiked ? 'bg-pink-50 border-pink-300' : ''}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'text-pink-500 fill-current' : ''}`} />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="rounded-xl px-6">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="rounded-xl px-6">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl px-6"
                onClick={() => {
                  // Save to library logic here
                  navigate('/library');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Save to Library
              </Button>
            </div>
          </div>

          {/* Mood Playlists */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center gradient-text font-playfair">
              Explore More Manifestations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Confidence Boosters", emoji: "⚡", description: "Daily power affirmations" },
                { title: "Night Manifestations", emoji: "🌙", description: "Peaceful evening rituals" },
                { title: "Success Mindset", emoji: "🎯", description: "Achievement-focused affirmations" },
                { title: "Self-Love Journey", emoji: "💝", description: "Nurturing inner wisdom" }
              ].map((playlist) => (
                <div key={playlist.title} className="goal-card text-center">
                  <div className="text-4xl mb-2">{playlist.emoji}</div>
                  <h4 className="font-semibold text-gray-800">{playlist.title}</h4>
                  <p className="text-sm text-gray-600">{playlist.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Player;
