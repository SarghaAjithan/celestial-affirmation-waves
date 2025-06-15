
import React, { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Repeat } from "lucide-react";
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

  useEffect(() => {
    if (!current) {
      setAudioRef(null);
      return;
    }
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
    }
  }, [isLooping, audioRef]);

  useEffect(() => {
    if (!current) {
      setLyricsLine("");
      return;
    }
    const lines = current.text
      .split(".")
      .map((l) => l.trim())
      .filter(Boolean);
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
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Responsive padding: px-3 on mobile, px-6 on md+, taller, larger controls
  return (
    <div
      className={cn(
        // Responsive: max-w fits page, px matches dashboard widgets, min-h taller, vertical center for controls
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 sm:px-6 w-[95vw] sm:w-[540px] max-w-[98vw]",
        "rounded-2xl shadow-xl border-0",
        "bg-gradient-to-r from-[#cda8fa] via-[#e7bbf1] to-[#f6c1de]",
        "bg-opacity-95 flex items-center gap-4 min-h-[88px] py-3",
        "cursor-pointer select-none transition-all duration-300 group"
      )}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 10px 32px 0 rgba(160,95,225,0.16)",
      }}
      onClick={onBarClick}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/40 text-primary font-bold text-lg shadow ring-2 ring-white/20 overflow-hidden mr-2">
        <span className="text-2xl font-mulish">{current.title[0]}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex items-center justify-between gap-4 mb-0.5">
          <span className="text-base font-bold text-black/90 truncate max-w-[120px] sm:max-w-[180px] drop-shadow-sm">
            {/* Pastel background text, bold highlight (simulate yellow mark for demo) */}
            <span className="bg-yellow-200 px-1 rounded text-black">{current.title}</span>
          </span>
          <span className="text-xs text-black/50 font-mono tracking-tight select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        {/* Lyrics line */}
        <span
          className="text-xs text-black/80 truncate pt-0.5 max-w-[72vw] sm:max-w-full"
          title={lyricsLine}
        >
          {lyricsLine || <span className="italic text-black/30">Instrumental</span>}
        </span>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          onValueChange={onSeek}
          step={1}
          className="w-full my-[6px] group-hover:opacity-100 opacity-95"
          style={{
            background:
              "linear-gradient(90deg, #ffffff 0%, #f8def8 70%, #f7cbe7 100%)",
            height: 7,
            borderRadius: 10,
          }}
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Controls (just Play/Pause and Loop) */}
      <div className="flex items-center gap-2 flex-shrink-0 pr-0.5 sm:pr-2">
        <button
          className="rounded-full bg-pink-200/90 hover:bg-pink-300/90 p-3 shadow transition disabled:opacity-60"
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-purple-600" />
          ) : (
            <Play className="w-7 h-7 text-purple-600" />
          )}
        </button>
        <button
          className={cn(
            "rounded-full p-3 ml-1 transition shadow",
            isLooping
              ? "bg-yellow-200/80 hover:bg-yellow-300"
              : "bg-white/60 hover:bg-white/80"
          )}
          onClick={onLoopToggle}
          title={isLooping ? "Looping enabled" : "Loop this track"}
        >
          <Repeat className={cn("w-6 h-6", isLooping ? "text-yellow-700" : "text-purple-400")} />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayerBand;
