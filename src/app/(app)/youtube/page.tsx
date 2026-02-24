"use client";

import { useEffect, useState } from "react";
import {
  useYoutubeStore,
  FR_CATEGORIES,
  EN_CATEGORIES,
  YoutubeChannel,
} from "@/stores/use-youtube-store";
import { VideoCard } from "@/components/youtube/video-card";
import { VideoPlayerModal } from "@/components/youtube/video-player-modal";
import { cn } from "@/lib/utils";
import {
  Youtube,
  ChevronDown,
  ChevronUp,
  Loader2,
  Heart,
  History,
  Compass,
  Globe,
  Rss,
} from "lucide-react";

type Tab = "decouvrir" | "favoris" | "historique";

function ChannelAccordion({ channel }: { channel: YoutubeChannel }) {
  const { videos, loadVideos, loadingChannelId } = useYoutubeStore();
  const [open, setOpen] = useState(false);

  const isLoading = loadingChannelId === channel.channelId;
  const channelVideos = videos[channel.channelId] ?? [];
  const alreadyLoaded = videos[channel.channelId] !== undefined;

  const handleToggle = () => {
    if (!open && !alreadyLoaded) {
      loadVideos(channel.channelId);
    }
    setOpen(!open);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-accent/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm">{channel.name}</span>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{channel.description}</p>
        </div>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
        ) : open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-2 border-t border-border bg-background/50">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des vidéos…</span>
              </div>
            )}
            {!isLoading && alreadyLoaded && channelVideos.length === 0 && (
              <div className="text-center py-6 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Contenu temporairement indisponible.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Le flux RSS sera mis à jour automatiquement.
                </p>
              </div>
            )}
            {channelVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-1">
                {channelVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YoutubePage() {
  const {
    channels,
    activeCategory,
    setActiveCategory,
    fetchFavorites,
    fetchHistory,
    favorites,
    history,
    videos,
    selectedLanguage,
    setLanguage,
    resetLanguage,
  } = useYoutubeStore();

  const [activeTab, setActiveTab] = useState<Tab>("decouvrir");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchFavorites();
    fetchHistory();
  }, []);

  if (!hydrated) return null;

  // ── Sélection langue ──────────────────────────────────────────────────────
  if (selectedLanguage === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-6">
          <Youtube className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">YouTube Productivité</h1>
        <p className="text-muted-foreground text-sm mb-2 text-center">
          Choisissez votre langue pour accéder aux chaînes curatées.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Rss className="w-3.5 h-3.5" />
          <span>Flux RSS officiel · Sans quota · Sans clé API</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button
            onClick={() => setLanguage("fr")}
            className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-4xl">🇫🇷</span>
            <span className="font-semibold text-lg">Français</span>
            <span className="text-xs text-muted-foreground text-center">
              Éloquence, Dev, Marketing, Islam
            </span>
          </button>
          <button
            onClick={() => setLanguage("en")}
            className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-4xl">🇬🇧</span>
            <span className="font-semibold text-lg">English</span>
            <span className="text-xs text-muted-foreground text-center">
              Public Speaking, Dev, Marketing
            </span>
          </button>
        </div>
      </div>
    );
  }

  const categories = selectedLanguage === "fr" ? FR_CATEGORIES : EN_CATEGORIES;
  const langChannels = channels.filter((c) => c.language === selectedLanguage);
  const filteredChannels =
    activeCategory === "Tous"
      ? langChannels
      : langChannels.filter((c) => c.category === activeCategory);

  const categoriesWithChannels = categories
    .filter((c) => c !== "Tous")
    .filter((cat) => langChannels.some((c) => c.category === cat));

  const allVideos = Object.values(videos).flat();
  const favVideos = allVideos.filter((v) => favorites.includes(v.id));
  const historyVideos = allVideos
    .filter((v) => history.includes(v.id))
    .sort((a, b) => history.indexOf(a.id) - history.indexOf(b.id));

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Header sticky */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 shrink-0">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            <h1 className="text-xl font-bold flex-1 truncate">YouTube Productivité</h1>
            <button
              onClick={resetLanguage}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{selectedLanguage === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}</span>
              <span className="opacity-60 hidden sm:inline">· Changer</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "decouvrir", label: "Découvrir", icon: Compass },
                { id: "favoris", label: "Favoris", icon: Heart },
                { id: "historique", label: "Historique", icon: History },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* ── Onglet Découvrir ── */}
        {activeTab === "decouvrir" && (
          <>
            {/* Filtres catégorie */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordéons chaînes groupées par catégorie */}
            {activeCategory === "Tous" ? (
              <div className="space-y-6">
                {categoriesWithChannels.map((cat) => (
                  <div key={cat} className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {cat}
                    </h2>
                    {langChannels
                      .filter((c) => c.category === cat)
                      .map((ch) => (
                        <ChannelAccordion key={ch.id} channel={ch} />
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredChannels.map((ch) => (
                  <ChannelAccordion key={ch.id} channel={ch} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Onglet Favoris ── */}
        {activeTab === "favoris" && (
          <div>
            {favVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Heart className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Aucune vidéo en favori.</p>
                <p className="text-xs">Cliquez sur le ♡ d'une vidéo pour l'ajouter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {favVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Onglet Historique ── */}
        {activeTab === "historique" && (
          <div>
            {historyVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <History className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Aucune vidéo regardée.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {historyVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <VideoPlayerModal />
    </div>
  );
}
