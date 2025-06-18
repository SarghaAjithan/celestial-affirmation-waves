
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ArrowLeft, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

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
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const {
    current,
    isPlaying,
    play,
    pause,
    resume,
    currentTime,
    duration,
    setCurrentTime
  } = usePlayer();

  useEffect(() => {
    if (manifestationId) {
      fetchManifestation(manifestationId);
    }
  }, [manifestationId]);

  useEffect(() => {
    if (!current) return;
    
    const audios = Array.from(document.getElementsByTagName('audio'));
    for (const audio of audios) {
      if ((audio as HTMLAudioElement).src === current.audio_url) {
        setAudioRef(audio as HTMLAudioElement);
        return;
      }
    }
    setAudioRef(null);
  }, [current]);

  useEffect(() => {
    if (audioRef) {
      audioRef.loop = isLooping;
      audioRef.playbackRate = playbackSpeed;
    }
  }, [isLooping, playbackSpeed, audioRef]);

  useEffect(() => {
    if (!manifestation || !duration) return;
    
    const lines = manifestation.text.split('.').filter(line => line.trim());
    if (lines.length === 0) return;
    
    const lineIndex = Math.floor((currentTime / duration) * lines.length);
    setCurrentLineIndex(Math.min(lineIndex, lines.length - 1));
  }, [currentTime, manifestation, duration]);

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

    if (current?.id === manifestation.id) {
      isPlaying ? pause() : resume();
    } else {
      play(manifestation);
    }
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  const speedOptions = [0.75, 1, 1.25, 1.5];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-800/20 to-indigo-900/30"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/library')}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <p className="text-white/60 text-sm uppercase tracking-wider">NOW PLAYING</p>
            <p className="text-white font-medium">{manifestation.title}</p>
          </div>
          
          <div className="w-10"></div>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Animated Waveform */}
            <div className="flex items-center space-x-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 bg-white/70 rounded-full transition-all duration-300 ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: `${Math.random() * 60 + 20}px`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: isPlaying ? 0.9 : 0.4
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lyrics Section */}
        <div className="mb-8 text-center">
          <div className="max-h-32 overflow-y-auto">
            {lines.slice(Math.max(0, currentLineIndex - 1), currentLineIndex + 3).map((line, index) => {
              const actualIndex = Math.max(0, currentLineIndex - 1) + index;
              return (
                <p
                  key={actualIndex}
                  className={`text-lg leading-relaxed transition-all duration-500 mb-2 ${
                    actualIndex === currentLineIndex
                      ? 'text-white font-medium text-xl'
                      : actualIndex < currentLineIndex
                      ? 'text-white/50 text-base'
                      : 'text-white/30 text-base'
                  }`}
                >
                  {line.trim()}.
                </p>
              );
            })}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg truncate">{manifestation.title}</h3>
            <p className="text-white/60 text-sm">Personal Manifestation</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={1}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-white/60 text-sm mr-2">Speed:</span>
            {speedOptions.map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSpeedChange(speed)}
                className={`text-xs px-3 py-1 ${
                  playbackSpeed === speed 
                    ? "bg-white text-black" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-8 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 p-2"
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 p-2"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            className="bg-white text-black hover:bg-white/90 rounded-full w-16 h-16 p-0 shadow-lg"
          >
            {isPlaying && current?.id === manifestation.id ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 p-2"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLoop}
            className={`p-2 ${
              isLooping 
                ? "text-yellow-400 hover:text-yellow-300" 
                : "text-white/60 hover:text-white"
            } hover:bg-white/10`}
          >
            <Repeat className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
