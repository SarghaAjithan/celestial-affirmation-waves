
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

  // Themed modern gradient & cleaning up UI
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_-4px_32px_0_rgba(160,95,225,0.12)] px-3 sm:px-5",
        "flex items-center gap-4 min-h-[70px] cursor-pointer select-none border-t border-white/10 transition-all duration-300 group"
      )}
      onClick={onBarClick}
      style={{ maxWidth: "100vw" }}
    >
      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/80 text-white font-bold text-lg shadow ring-2 ring-primary/10 overflow-hidden">
        <span>{current.title[0]}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <span className="text-base font-semibold text-foreground truncate max-w-[160px] sm:max-w-[230px]">
            {current.title}
          </span>
          <span className="text-xs text-muted-foreground font-mono tracking-tight select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        {/* Lyrics line */}
        <span
          className="text-xs text-foreground/80 truncate pt-1 max-w-[85vw] sm:max-w-full"
          title={lyricsLine}
        >
          {lyricsLine || <span className="italic text-muted-foreground/60">Instrumental</span>}
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

      {/* Controls (just Play/Pause and Loop) */}
      <div className="flex items-center gap-2 flex-shrink-0 pr-1 sm:pr-2">
        <button
          className="rounded-full bg-primary/80 p-2 hover:bg-primary transition"
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          className={cn(
            "rounded-full p-2 transition ml-0.5",
            isLooping
              ? "bg-accent/85 hover:bg-accent"
              : "bg-muted hover:bg-primary/10"
          )}
          onClick={onLoopToggle}
          title={isLooping ? "Looping enabled" : "Loop this track"}
        >
          <Repeat className={cn("w-5 h-5", isLooping ? "text-primary" : "text-foreground/60")} />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayerBand;

