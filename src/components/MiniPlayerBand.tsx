import React, { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Heart, SkipBack, SkipForward, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const MiniPlayerBand = () => {
  const {
    current,
    isPlaying,
    play,
    pause,
    resume,
    setCurrentTime,
    currentTime,
    duration,
  } = usePlayer();
  const navigate = useNavigate();
  const [isLooping, setIsLooping] = useState(false);
  const [lyricsLine, setLyricsLine] = useState("");
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Attach to the audio element if possible for looping
  useEffect(() => {
    if (!current) {
      setAudioRef(null);
      return;
    }
    // Grabs the audio, needs to match the context instance
    // Note: We rely on PlayerContext to ensure only a single playing instance!
    // Unfortunately, PlayerContext didn't expose audioRef so we sync here
    // We'll look for global Audio with matching url, fallback disables loop state
    const audios = Array.from(document.getElementsByTagName('audio'));
    for (const audio of audios) {
      if ((audio as HTMLAudioElement).src === current.audio_url) {
        setAudioRef(audio as HTMLAudioElement);
        return;
      }
    }
    setAudioRef(null);
  }, [current]);

  // Keep loop state in sync with ref
  useEffect(() => {
    if (audioRef) {
      audioRef.loop = isLooping;
    }
  }, [isLooping, audioRef]);

  // Update current lyrics line according to the time
  useEffect(() => {
    if (!current) {
      setLyricsLine("");
      return;
    }
    const lines = current.text
      .split(".")
      .map((l) => l.trim())
      .filter(Boolean);

    // Default: evenly assign time per line
    if (!duration || lines.length === 0) {
      setLyricsLine("");
      return;
    }
    const lineIndex = Math.floor((currentTime / duration) * lines.length);
    setLyricsLine(lines[Math.min(lineIndex, lines.length - 1)] || "");
  }, [currentTime, current, duration]);

  if (!current) return null;

  const onBarClick = () => {
    navigate(`/now-playing?id=${current.id}`);
  };

  const onPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    isPlaying ? pause() : resume();
  };

  const onSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const onLoopToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLooping((prev) => !prev);
    // audioRef update handled by useEffect
  };

  // Helper formatting
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Visuals: appear on all screens, hover shows slightly higher
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#5433FF]/95 via-[#20BDFF]/90 to-[#A5FECB]/95 shadow-2xl px-4",
        "flex items-center gap-4 min-h-[74px] cursor-pointer select-none",
        "border-t border-white/10 transition-all group"
      )}
      onClick={onBarClick}
      style={{ maxWidth: "100vw" }}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700/70 to-pink-700/50 flex items-center justify-center font-bold text-white text-lg overflow-hidden shadow-lg">
        <span>{current.title[0]}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <span className="text-base font-semibold text-white truncate max-w-[180px] sm:max-w-[260px]">
            {current.title}
          </span>
          <span className="text-xs text-white/80 font-mono tracking-tight select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        {/* Lyrics as subtitle */}
        <span className="text-xs text-white/90 truncate pt-0.5 max-w-[94vw] sm:max-w-full" title={lyricsLine}>
          {lyricsLine || <span className="italic text-white/60">Instrumental</span>}
        </span>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          onValueChange={onSeek}
          step={1}
          className="w-full my-[2px] group-hover:opacity-100 opacity-80"
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
          onClick={e => { e.stopPropagation(); /* Implement skipBack if needed */ }}
          title="Back"
        >
          <SkipBack className="w-5 h-5 text-white/70" />
        </button>
        <button
          className="rounded-full bg-white/20 shadow-md p-2 hover:bg-white/30 transition"
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6 text-white"/> : <Play className="w-6 h-6 text-white"/>}
        </button>
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
          onClick={e => { e.stopPropagation(); /* Implement skipForward if needed */ }}
          title="Forward"
        >
          <SkipForward className="w-5 h-5 text-white/70" />
        </button>
        <button
          className={cn(
            "rounded-full p-2 transition",
            isLooping 
              ? "bg-blue-500/60 hover:bg-blue-500/90"
              : "bg-white/10 hover:bg-white/20"
          )}
          onClick={onLoopToggle}
          title={isLooping ? "Looping enabled" : "Loop this track"}
        >
          <Repeat className={cn("w-5 h-5", isLooping ? "text-white" : "text-white/60")} />
        </button>
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
          onClick={e => e.stopPropagation()}
          title="Favorite"
        >
          <Heart className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayerBand;
