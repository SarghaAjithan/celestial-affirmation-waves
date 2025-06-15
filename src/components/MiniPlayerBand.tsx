
import React from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Heart, SkipBack, SkipForward } from "lucide-react";
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

  // Simple background music preview for now; could add album art in the future!
  // Optionally use gradient or static image.
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 shadow-[0_-2px_24px_0_rgba(80,25,135,0.18)] px-3 py-3",
        "flex items-center gap-4 min-h-[70px] cursor-pointer transition-all"
      )}
      onClick={onBarClick}
      style={{ maxWidth: "100vw" }}
    >
      {/* Visual thumbnail or colored dot */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700/60 to-pink-700/30 flex items-center justify-center font-bold text-white text-lg overflow-hidden">
        {/* Could show voice initials or icon for more polish */}
        <span>{current.title[0]}</span>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-base font-semibold text-white truncate">{current.title}</span>
        <span className="text-xs text-white/70 truncate">
          {current.voice ? `${current.voice}` : ""}
        </span>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          onValueChange={onSeek}
          step={1}
          className="w-full my-0"
          onClick={e => e.stopPropagation()}
        />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pr-2">
        <button
          className="rounded-full bg-white/5 p-2 hover:bg-white/15 transition"
          onClick={e => { e.stopPropagation(); /* skip functionality? */ }}
        >
          <SkipBack className="w-5 h-5 text-white/60" />
        </button>
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
        </button>
        <button
          className="rounded-full bg-white/5 p-2 hover:bg-white/15 transition"
          onClick={e => { e.stopPropagation(); /* skip functionality? */ }}
        >
          <SkipForward className="w-5 h-5 text-white/60" />
        </button>
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
          onClick={e => e.stopPropagation()}
        >
          <Heart className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayerBand;
