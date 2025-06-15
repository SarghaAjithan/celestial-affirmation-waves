
import React, { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Full-width pastel band at the bottom
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

  // The actual player card to mimic the reference
  return (
    // Pastel full-width band
    <div
      className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-r from-[#fae1ff] via-[#ecd9ff] to-[#ffe7f0] px-0 py-6 flex justify-center items-end"
      style={{
        minHeight: 108, // matches reference
        boxShadow: "0 0 64px 0 rgba(162,120,233,0.14)",
        transition: "padding 0.2s",
      }}
    >
      {/* Centered player card */}
      <div
        className={cn(
          "flex items-center gap-3 md:gap-4 w-full max-w-[720px]",
          "rounded-2xl bg-gradient-to-r from-[#d4b1ff] to-[#ffbbea]",
          "px-5 md:px-10 py-5",
          "shadow-xl",
          "backdrop-blur-xl bg-opacity-80",
          "cursor-pointer select-none transition-all duration-300 group"
        )}
        style={{
          boxShadow: "0 6px 32px 0 rgba(160,95,225,0.10)",
        }}
        onClick={onBarClick}
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/30 text-primary font-bold text-lg shadow ring-1 ring-white/30 overflow-hidden">
          <span className="text-2xl font-mulish">{current.title[0]}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-base font-bold text-black/80 truncate max-w-[120px] sm:max-w-[180px] drop-shadow-sm">
              <span className="bg-yellow-200 px-2 py-0.5 rounded text-black text-base font-bold">{current.title}</span>
            </span>
            <span className="text-xs text-black/60 font-mono tracking-tight select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          {/* Lyrics preview line */}
          <span
            className="text-sm text-black/80 truncate pt-1 max-w-[60vw] sm:max-w-full"
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
            className="w-full my-[8px] group-hover:opacity-100 opacity-95"
            style={{
              background: "white",
              height: 8,
              borderRadius: 99,
              boxShadow: "0 2px 8px #dbb5ff35",
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>

        {/* Controls (rounded, pastel soft as in ref) */}
        <div className="flex items-center gap-2 flex-shrink-0 pr-0.5 md:pr-2">
          <button
            className="rounded-full shadow transition p-0.5"
            onClick={onPlayPause}
            title={isPlaying ? "Pause" : "Play"}
            style={{
              background: "radial-gradient(circle, #e8d7ff 70%, #fcdcfc 100%)",
              width: 52, height: 52,
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px #d6b3fc60, 0 1px 0 #ffecfe86",
            }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-purple-600" />
            ) : (
              <Play className="w-7 h-7 text-purple-600" />
            )}
          </button>
          <button
            className={cn(
              "rounded-full ml-2 transition shadow",
            )}
            onClick={onLoopToggle}
            title={isLooping ? "Looping enabled" : "Loop this track"}
            style={{
              background: isLooping
                ? "radial-gradient(circle, #ffe86b 60%, #fff7ae 100%)"
                : "radial-gradient(circle, #f3f1f9 70%, #e0e3ee 100%)",
              width: 52, height: 52,
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isLooping
                ? "0 2px 8px #ffe48660, 0 2px 8px #f0e9cf40"
                : "0 2px 8px #d7cef760",
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
