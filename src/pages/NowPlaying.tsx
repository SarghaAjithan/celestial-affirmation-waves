
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ArrowLeft, Heart, Share, Download } from "lucide-react";

interface Manifestation {
  id: string;
  title: string;
  text: string;
  audio_url: string;
  created_at: string;
  voice?: string;
  background_music?: string;
  mood?: number;
}

const NowPlaying = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const manifestationId = searchParams.get('id');
  
  const [manifestation, setManifestation] = useState<Manifestation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([0]);
  const [duration, setDuration] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isLoved, setIsLoved] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (manifestationId) {
      fetchManifestation(manifestationId);
    }
  }, [manifestationId]);

  const fetchManifestation = async (id: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("manifestations")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      setManifestation(data);
    } catch (error) {
      console.error('Error fetching manifestation:', error);
      navigate('/library');
    }
  };

  const togglePlayPause = () => {
    if (!manifestation) return;

    if (isPlaying && audioPlayer) {
      audioPlayer.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioPlayer) {
      const audio = new Audio(manifestation.audio_url);
      setAudioPlayer(audio);
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.ontimeupdate = () => {
        setCurrentTime([audio.currentTime]);
        // Update current line based on time (rough estimate)
        const lines = manifestation.text.split('.').filter(line => line.trim());
        const lineIndex = Math.floor((audio.currentTime / audio.duration) * lines.length);
        setCurrentLineIndex(Math.min(lineIndex, lines.length - 1));
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime([0]);
        setCurrentLineIndex(0);
      };
      
      audio.play();
      setIsPlaying(true);
    } else {
      audioPlayer.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioPlayer) {
      audioPlayer.currentTime = value[0];
      setCurrentTime(value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleLove = () => {
    setIsLoved(!isLoved);
    // Here you could save to favorites in the database
  };

  if (!manifestation) {
    return (
      <div className="min-h-screen cosmic-bg floating-particles flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your manifestation...</p>
        </div>
      </div>
    );
  }

  const lines = manifestation.text.split('.').filter(line => line.trim());

  return (
    <div className="min-h-screen cosmic-bg floating-particles overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-800/15 to-indigo-900/20 animate-pulse"></div>
      
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/library')}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Library
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLove}
              className={`text-white/80 hover:text-white hover:bg-white/10 ${isLoved ? 'text-pink-400' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLoved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Share className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Lyrical Display */}
          <div className="space-y-8">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-playfair">
                {manifestation.title}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {manifestation.voice && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {manifestation.voice}
                  </Badge>
                )}
                {manifestation.background_music && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {manifestation.background_music}
                  </Badge>
                )}
              </div>
            </div>

            {/* Lyrical Text Display */}
            <Card className="glass-card border-white/20">
              <CardContent className="p-8">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className={`text-lg lg:text-xl leading-relaxed transition-all duration-500 ${
                        index === currentLineIndex
                          ? 'text-white font-medium scale-105 glow'
                          : index < currentLineIndex
                          ? 'text-white/60'
                          : 'text-white/40'
                      }`}
                    >
                      {line.trim()}.
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Player Controls */}
          <div className="space-y-8">
            {/* Visualization/Cover Art */}
            <Card className="glass-card border-white/20 aspect-square">
              <CardContent className="p-8 h-full flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Animated Waveform */}
                  <div className="flex items-center space-x-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-white rounded-full transition-all duration-300 ${
                          isPlaying ? 'animate-pulse' : ''
                        }`}
                        style={{
                          height: `${Math.random() * 80 + 20}px`,
                          animationDelay: `${i * 0.1}s`,
                          opacity: isPlaying ? 0.8 : 0.4
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Floating Heart */}
                  {isLoved && (
                    <div className="absolute top-4 right-4 text-pink-400 animate-bounce">
                      <Heart className="w-6 h-6 fill-current" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Player Controls */}
            <Card className="glass-card border-white/20">
              <CardContent className="p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <Slider
                    value={currentTime}
                    onValueChange={handleSeek}
                    max={duration || 100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/60 mt-2">
                    <span>{formatTime(currentTime[0])}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Play Controls */}
                <div className="flex items-center justify-center">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glow {
          text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default NowPlaying;
