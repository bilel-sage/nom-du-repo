"use client";

import { useState } from "react";
import { Episode, usePodcastsStore } from "@/stores/use-podcasts-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, Pause, Heart, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  episode: Episode;
}

function formatDate(str: string): string {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

export function EpisodeCard({ episode }: Props) {
  const { currentEpisode, isPlaying, setCurrentEpisode, setIsPlaying, toggleFavorite, favorites } =
    usePodcastsStore();

  const [expanded, setExpanded] = useState(false);

  const isActive = currentEpisode?.guid === episode.guid;
  const isFav = favorites.includes(episode.guid);

  const handlePlay = () => {
    if (isActive) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2 transition-colors",
        isActive ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-accent/30"
      )}
    >
      <div className="flex items-start gap-2">
        <Button
          size="icon"
          variant={isActive ? "default" : "outline"}
          className="h-9 w-9 shrink-0"
          onClick={handlePlay}
        >
          {isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium leading-snug line-clamp-2", isActive && "text-primary")}>
            {episode.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {episode.feedName}
            </Badge>
            {episode.duration && (
              <span className="text-xs text-muted-foreground">{episode.duration}</span>
            )}
            {episode.pubDate && (
              <span className="text-xs text-muted-foreground">{formatDate(episode.pubDate)}</span>
            )}
            {isActive && (
              <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">
                En cours
              </Badge>
            )}
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={() => toggleFavorite(episode)}
        >
          <Heart
            className={cn("w-4 h-4 transition-colors", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")}
          />
        </Button>
      </div>

      {episode.description && (
        <div>
          <p className={cn("text-xs text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>
            {episode.description.replace(/<[^>]+>/g, "")}
          </p>
          {episode.description.length > 150 && (
            <button
              className="text-xs text-primary mt-1 flex items-center gap-0.5 hover:underline"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>Réduire <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Lire plus <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
