import React, { createContext, useContext, useState, useRef } from "react";

export interface ManifestationPlayer {
  id: string;
  title: string;
  text: string;
  audio_url: string;
  created_at: string;
  voice?: string;
  background_music?: string;
  mood?: number;
  content_type?: string;
  description?: string;
  duration?: number;
  category?: string;
  narrator?: string;
  thumbnail_url?: string;
  is_premium?: boolean;
}

interface PlayerContextProps {
  current: ManifestationPlayer | null;
  isPlaying: boolean;
  play: (manifestation: ManifestationPlayer) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setCurrentTime: (t: number) => void;
  currentTime: number;
  duration: number;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [current, setCurrent] = useState<ManifestationPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (manifestation: ManifestationPlayer) => {
    if (
      current?.id !== manifestation.id ||
      !audioRef.current
    ) {
      // If it's a new audio, create new player
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrent(manifestation);
      const audio = new Audio(manifestation.audio_url);
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const seek = (t: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        current,
        isPlaying,
        play,
        pause,
        resume,
        stop,
        setCurrentTime: seek,
        currentTime,
        duration,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer used outside PlayerProvider");
  return ctx;
};
