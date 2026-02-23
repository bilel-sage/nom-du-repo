"use client";

import { useYoutubeStore } from "@/stores/use-youtube-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideoPlayerModal() {
  const { currentVideo, setCurrentVideo, toggleFavorite, favorites } = useYoutubeStore();

  if (!currentVideo) return null;

  const isFav = favorites.includes(currentVideo.id);

  return (
    <Dialog open={!!currentVideo} onOpenChange={(open) => { if (!open) setCurrentVideo(null); }}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base leading-snug line-clamp-2">
                {currentVideo.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{currentVideo.channelTitle}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0"
              onClick={() => toggleFavorite(currentVideo)}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
              />
            </Button>
          </div>
        </DialogHeader>

        {/* 16:9 responsive iframe */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&rel=0&playsinline=1`}
            title={currentVideo.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
