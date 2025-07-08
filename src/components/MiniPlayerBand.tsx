
import React, { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Repeat, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Full-width pastel band at the bottom, flush to the edge
const MiniPlayerBand = () => {
  const {
    current,
    isPlaying,
    play,
    pause,
    resume,
    setCurrentTime,
    stop,
    currentTime,
    duration,
  } = usePlayer();
  const navigate = useNavigate();
  const [isLooping, setIsLooping] = useState(false);
  const [lyricsLine, setLyricsLine] = useState("");
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Show band when audio is playing, hide when no current track
  useEffect(() => {
    if (current && isPlaying) {
      setIsVisible(true); // Show band when audio starts playing
    }
    if (!current) {
      setIsVisible(false); // Hide band when no track
    }
  }, [current, isPlaying]);

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

  if (!current || !isVisible) return null;

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

  const onClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop(); // This will stop audio and clear current track
    setIsVisible(false);
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // The actual player band, edge to edge, pastel background
  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 px-0"
      style={{
        minHeight: 100,
        background: "linear-gradient(99deg, #dbbcfa 0%, #f4bbf2 100%)",
        padding: "30px 0",
        left: 0,
        right: 0,
        borderRadius: 0,
        margin: 0,
        boxShadow: "none"
      }}
      onClick={onBarClick}
    >
      {/* Close button (top right, absolute) */}
      <button
        className="absolute top-3 right-5 bg-white/70 hover:bg-white text-purple-700 rounded-full w-8 h-8 flex items-center justify-center shadow transition"
        title="Close"
        onClick={onClose}
        style={{ zIndex: 10 }}
      >
        <X className="w-5 h-5" />
      </button>
      <div className={cn(
        "flex items-center gap-4 w-full",
        "max-w-full mx-auto px-8"
      )}>

        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-[#dfc9fa] text-primary font-bold text-lg shadow ring-1 ring-white/30 overflow-hidden" style={{
          minWidth: 64,
        }}>
          <span className="text-2xl font-mulish">{current.title[0]}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            {/* Title with bold font, no highlight */}
            <span className="text-base md:text-lg font-extrabold text-black/85 truncate max-w-[140px] sm:max-w-[200px] drop-shadow-none">
              {current.title}
            </span>
            <span className="text-xs text-black/60 font-mono tracking-tight select-none min-w-[70px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          {/* Lyrics preview line */}
          <span
            className="text-[1rem] text-black/85 truncate pt-1 max-w-[70vw] sm:max-w-full"
            style={{ lineHeight: "1.4" }}
            title={lyricsLine}
          >
            {lyricsLine || <span className="italic text-black/30">Instrumental</span>}
          </span>
          {/* The progress bar */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            onValueChange={onSeek}
            step={1}
            className="w-full my-[10px] group-hover:opacity-100 opacity-95"
            style={{
              background: "white",
              height: 9,
              borderRadius: 99,
              marginTop: 7,
              boxShadow: "0 2px 8px #dbb5ff35",
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0 pr-3">
          <button
            className="rounded-full transition p-0.5 bg-[#e0d1fb] hover:bg-[#deccfd] shadow"
            onClick={onPlayPause}
            title={isPlaying ? "Pause" : "Play"}
            style={{
              width: 48, height: 48,
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px #e0ccfd60, 0 1px 0 #ede6f886",
            }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-purple-600" />
            ) : (
              <Play className="w-7 h-7 text-purple-600" />
            )}
          </button>
          <button
            className={cn("rounded-full transition shadow ml-1")}
            onClick={onLoopToggle}
            title={isLooping ? "Looping enabled" : "Loop this track"}
            style={{
              background: isLooping
                ? "#ffe86b"
                : "#f6efd6",
              width: 48, height: 48,
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isLooping
                ? "0 2px 8px #ffe48660, 0 2px 8px #f0e9cf40"
                : "0 2px 8px #e7dbb760",
            }}
          >
            <Repeat className={cn("w-6 h-6 transition", isLooping ? "text-yellow-700" : "text-purple-400")} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayerBand;

