"use client";

import { Video, useYoutubeStore } from "@/stores/use-youtube-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Heart, Eye } from "lucide-react";
import Image from "next/image";

interface Props {
  video: Video;
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

export function VideoCard({ video }: Props) {
  const { setCurrentVideo, toggleFavorite, favorites, history } = useYoutubeStore();

  const isFav = favorites.includes(video.id);
  const isWatched = history.includes(video.id);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-muted cursor-pointer overflow-hidden"
        onClick={() => setCurrentVideo(video)}
      >
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="rounded-full bg-white/90 p-3">
            <Play className="w-5 h-5 text-black fill-black" />
          </div>
        </div>
        {isWatched && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-white rounded px-1.5 py-0.5">
            <Eye className="w-3 h-3" />
            <span className="text-[10px]">Regardé</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p
          className="text-sm font-medium leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => setCurrentVideo(video)}
        >
          {video.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{video.channelTitle}</p>
            {video.publishedAt && (
              <p className="text-xs text-muted-foreground">{formatDate(video.publishedAt)}</p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => toggleFavorite(video)}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
