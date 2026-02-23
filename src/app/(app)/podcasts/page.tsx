"use client";

import { useEffect, useState } from "react";
import {
  usePodcastsStore,
  FR_PODCAST_CATEGORIES,
  EN_PODCAST_CATEGORIES,
  PodcastFeed,
} from "@/stores/use-podcasts-store";
import { EpisodeCard } from "@/components/podcasts/episode-card";
import { AudioPlayer } from "@/components/podcasts/audio-player";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Mic,
  Globe,
  Heart,
  History,
  List,
} from "lucide-react";

type Tab = "tous" | "favoris" | "historique";

function FeedAccordion({ feed }: { feed: PodcastFeed }) {
  const { episodes, loadEpisodes, loadingFeedId } = usePodcastsStore();
  const [open, setOpen] = useState(false);

  const isLoading = loadingFeedId === feed.id;
  const feedEpisodes = episodes[feed.id] ?? [];

  const handleToggle = () => {
    if (!open && !episodes[feed.id]) {
      loadEpisodes(feed.id);
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
          <span className="font-medium text-sm">{feed.name}</span>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{feed.description}</p>
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
          <div className="px-3 pb-3 pt-2 space-y-2 border-t border-border bg-background/50">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des épisodes…</span>
              </div>
            )}
            {!isLoading && feedEpisodes.length === 0 && episodes[feed.id] !== undefined && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun épisode disponible.
              </p>
            )}
            {feedEpisodes.map((ep) => (
              <EpisodeCard key={ep.guid} episode={ep} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PodcastsPage() {
  const {
    feeds,
    activeCategory,
    setActiveCategory,
    fetchFavorites,
    fetchHistory,
    favorites,
    history,
    episodes,
    selectedLanguage,
    setLanguage,
    resetLanguage,
  } = usePodcastsStore();

  const [activeTab, setActiveTab] = useState<Tab>("tous");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchFavorites();
    fetchHistory();
  }, []);

  // Évite le flash SSR
  if (!hydrated) return null;

  // ── Écran de sélection de langue ─────────────────────────────────────────
  if (selectedLanguage === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
          <Mic className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Podcasts</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">
          Choisissez votre langue pour accéder aux podcasts curatés.
        </p>
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

  // ── Interface principale ─────────────────────────────────────────────────
  const categories =
    selectedLanguage === "fr" ? FR_PODCAST_CATEGORIES : EN_PODCAST_CATEGORIES;

  const langFeeds = feeds.filter((f) => f.language === selectedLanguage);
  const filteredFeeds =
    activeCategory === "Tous"
      ? langFeeds
      : langFeeds.filter((f) => f.category === activeCategory);

  const categoriesWithFeeds = categories
    .filter((c) => c !== "Tous")
    .filter((cat) => langFeeds.some((f) => f.category === cat));

  const allEpisodes = Object.values(episodes).flat();
  const favEpisodes = allEpisodes.filter((ep) => favorites.includes(ep.guid));
  const historyEpisodes = allEpisodes
    .filter((ep) => history.includes(ep.guid))
    .sort((a, b) => history.indexOf(a.guid) - history.indexOf(b.guid));

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold flex-1">Podcasts</h1>
            <button
              onClick={resetLanguage}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{selectedLanguage === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}</span>
              <span className="opacity-60">· Changer</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {(
              [
                { id: "tous", label: "Tous", icon: List },
                { id: "favoris", label: "Favoris", icon: Heart },
                { id: "historique", label: "Historique", icon: History },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
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

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {activeTab === "tous" && (
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

            {/* Accordéons groupés par catégorie */}
            {activeCategory === "Tous" ? (
              <div className="space-y-6">
                {categoriesWithFeeds.map((cat) => (
                  <div key={cat} className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {cat}
                    </h2>
                    {langFeeds
                      .filter((f) => f.category === cat)
                      .map((feed) => (
                        <FeedAccordion key={feed.id} feed={feed} />
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFeeds.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Aucun podcast pour cette catégorie.
                  </p>
                ) : (
                  filteredFeeds.map((feed) => (
                    <FeedAccordion key={feed.id} feed={feed} />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "favoris" && (
          <div className="space-y-2">
            {favEpisodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Heart className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Aucun épisode en favori.</p>
                <p className="text-xs">Cliquez sur le ♡ d'un épisode pour l'ajouter.</p>
              </div>
            ) : (
              favEpisodes.map((ep) => <EpisodeCard key={ep.guid} episode={ep} />)
            )}
          </div>
        )}

        {activeTab === "historique" && (
          <div className="space-y-2">
            {historyEpisodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <History className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Aucun épisode écouté.</p>
              </div>
            ) : (
              historyEpisodes.map((ep) => <EpisodeCard key={ep.guid} episode={ep} />)
            )}
          </div>
        )}
      </div>

      <AudioPlayer />
    </div>
  );
}
