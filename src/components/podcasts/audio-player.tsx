"use client";

import { useEffect, useRef, useState } from "react";
import { usePodcastsStore } from "@/stores/use-podcasts-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const { currentEpisode, isPlaying, progress, setIsPlaying, setProgress, setCurrentEpisode } =
    usePodcastsStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Create / sync audio element
  useEffect(() => {
    if (!currentEpisode) return;

    const audio = new Audio(currentEpisode.audioUrl);
    audioRef.current = audio;
    audio.volume = volume;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setProgress(audio.currentTime));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
    });

    if (isPlaying) audio.play().catch(() => {});

    // MediaSession API
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentEpisode.title,
        artist: currentEpisode.feedName,
      });
      navigator.mediaSession.setActionHandler("play", () => {
        audio.play();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audio.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        audio.currentTime = Math.max(0, audio.currentTime - 15);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpisode?.guid]);

  // Play/pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  // Volume sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, setIsPlaying]);

  if (!currentEpisode) return null;

  const seek = (val: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = val;
    setProgress(val);
  };

  const skip = (secs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + secs));
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50",
        "bottom-16 lg:bottom-0", // above mobile nav on small screens
        "bg-card/95 backdrop-blur-xl border-t border-border shadow-lg"
      )}
    >
      {/* Progress bar */}
      <div
        className="h-1 bg-muted cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(pct * duration);
        }}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2">
        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentEpisode.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentEpisode.feedName}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => skip(-15)}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => skip(15)}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Time */}
        <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
          {formatTime(progress)} / {formatTime(duration)}
        </span>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMuted(!muted)}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setMuted(false);
            }}
            className="w-20 accent-primary"
          />
        </div>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setCurrentEpisode(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
