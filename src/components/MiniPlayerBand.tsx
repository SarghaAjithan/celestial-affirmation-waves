
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

  // Soft glassy purple-pink gradient and more rounded UI
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-2 w-[95vw] sm:w-[540px] max-w-[98vw]",
        "rounded-2xl shadow-xl border-0 bg-[linear-gradient(90deg,#9f73f8_0%,#e1aeee_50%,#ffaed2_100%)] bg-opacity-90",
        "flex items-center gap-4 min-h-[64px] cursor-pointer select-none transition-all duration-300 group"
      )}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 10px 32px 0 rgba(160,95,225,0.18)",
      }}
      onClick={onBarClick}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/40 text-primary font-bold text-lg shadow ring-2 ring-white/20 overflow-hidden mr-2">
        <span className="text-2xl font-mulish">{current.title[0]}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-0.5">
          <span className="text-base font-semibold text-white truncate max-w-[120px] sm:max-w-[160px] drop-shadow-sm">
            {current.title}
          </span>
          <span className="text-xs text-white/70 font-mono tracking-tight select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        {/* Lyrics line */}
        <span
          className="text-xs text-white/90 truncate pt-0.5 max-w-[72vw] sm:max-w-full"
          title={lyricsLine}
        >
          {lyricsLine || <span className="italic text-white/50">Instrumental</span>}
        </span>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          onValueChange={onSeek}
          step={1}
          className="w-full my-[2px] group-hover:opacity-100 opacity-85"
          style={{
            background:
              "linear-gradient(90deg, #fff8fb 0%, #e5cffb 40%, #f3b6e5 100%)",
            height: 8,
            borderRadius: 10,
          }}
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Controls (just Play/Pause and Loop) */}
      <div className="flex items-center gap-1.5 flex-shrink-0 pr-0.5 sm:pr-2">
        <button
          className="rounded-full bg-white/80 hover:bg-white/90 p-2 shadow transition"
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-primary" />
          ) : (
            <Play className="w-6 h-6 text-primary" />
          )}
        </button>
        <button
          className={cn(
            "rounded-full p-2 ml-0.5 transition shadow",
            isLooping
              ? "bg-pink-300/80 hover:bg-pink-400"
              : "bg-white/40 hover:bg-white/60"
          )}
          onClick={onLoopToggle}
          title={isLooping ? "Looping enabled" : "Loop this track"}
        >
          <Repeat className={cn("w-5 h-5", isLooping ? "text-pink-600" : "text-white/80")} />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayerBand;
