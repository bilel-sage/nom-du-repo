"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

export interface PodcastFeed {
  id: string;
  name: string;
  rssUrl: string;
  category: string;
  language: "fr" | "en";
  description: string;
}

export interface Episode {
  guid: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  pubDate: string;
  feedId: string;
  feedName: string;
}

export const FR_PODCAST_CATEGORIES = [
  "Tous",
  "Éloquence/Bien parler",
  "Informatique/Dev",
  "Marketing/Vente",
  "Islam",
];
export const EN_PODCAST_CATEGORIES = [
  "Tous",
  "Public Speaking",
  "Informatics/Dev",
  "Marketing/Sales",
];

// Alias conservé pour les imports existants
export const PODCAST_CATEGORIES = FR_PODCAST_CATEGORIES;

export const PODCAST_FEEDS: PodcastFeed[] = [
  // ── FR — Éloquence/Bien parler ──────────────────────────────────────────
  {
    id: "le-precepteur",
    name: "Le Précepteur",
    rssUrl: "https://feeds.acast.com/public/shows/le-precepteur",
    category: "Éloquence/Bien parler",
    language: "fr",
    description: "Rhétorique, éloquence et art de convaincre.",
  },
  {
    id: "grand-bien-vous-fasse",
    name: "Grand bien vous fasse",
    rssUrl: "https://radiofrance-podcast.net/podcast09/rss_19777.xml",
    category: "Éloquence/Bien parler",
    language: "fr",
    description: "France Inter — bien-être, communication et psychologie.",
  },

  // ── FR — Informatique/Dev ────────────────────────────────────────────────
  {
    id: "les-cast-codeurs",
    name: "Les Cast Codeurs",
    rssUrl: "https://lescastcodeurs.com/feed.xml",
    category: "Informatique/Dev",
    language: "fr",
    description: "Le podcast Java et tech en français.",
  },
  {
    id: "artisan-dev",
    name: "Artisan Développeur",
    rssUrl: "https://feeds.buzzsprout.com/1558979.rss",
    category: "Informatique/Dev",
    language: "fr",
    description: "Développement web, pratiques agiles et craft.",
  },

  // ── FR — Marketing/Vente ─────────────────────────────────────────────────
  {
    id: "marketing-mania",
    name: "Marketing Mania",
    rssUrl: "https://marketing-mania.fr/feed/podcast",
    category: "Marketing/Vente",
    language: "fr",
    description: "Marketing digital et growth hacking en français.",
  },
  {
    id: "le-podcast-du-marketing",
    name: "Le Podcast du Marketing",
    rssUrl: "https://feeds.acast.com/public/shows/le-podcast-du-marketing",
    category: "Marketing/Vente",
    language: "fr",
    description: "Stratégie, branding et vente pour entrepreneurs.",
  },

  // ── FR — Islam ────────────────────────────────────────────────────────────
  {
    id: "rappel-benefique",
    name: "Rappel Bénéfique",
    rssUrl: "https://feeds.buzzsprout.com/2082523.rss",
    category: "Islam",
    language: "fr",
    description: "Cours et rappels islamiques en français.",
  },
  {
    id: "salam-podcast",
    name: "Le Musulman Francophone",
    rssUrl: "https://anchor.fm/s/d2c9f234/podcast/rss",
    category: "Islam",
    language: "fr",
    description: "Conférences et réflexions islamiques en français.",
  },

  // ── EN — Public Speaking ──────────────────────────────────────────────────
  {
    id: "ted-talks-daily",
    name: "TED Talks Daily",
    rssUrl: "https://feeds.feedburner.com/TedTalks_audio",
    category: "Public Speaking",
    language: "en",
    description: "A new TED Talk every weekday — ideas worth spreading.",
  },
  {
    id: "bbc-6min",
    name: "BBC 6 Minute English",
    rssUrl: "https://downloads.bbc.co.uk/learningenglish/features/6min/rss.xml",
    category: "Public Speaking",
    language: "en",
    description: "Short BBC episodes to sharpen your English and communication.",
  },

  // ── EN — Informatics/Dev ─────────────────────────────────────────────────
  {
    id: "syntax-fm",
    name: "Syntax.fm",
    rssUrl: "https://feed.syntax.fm/rss",
    category: "Informatics/Dev",
    language: "en",
    description: "A tasty treats podcast for web developers.",
  },
  {
    id: "changelog",
    name: "Changelog Podcast",
    rssUrl: "https://changelog.com/podcast.rss",
    category: "Informatics/Dev",
    language: "en",
    description: "Weekly conversations about software development.",
  },
  {
    id: "talk-python",
    name: "Talk Python To Me",
    rssUrl: "https://talkpython.fm/episodes/rss",
    category: "Informatics/Dev",
    language: "en",
    description: "A podcast on Python and related technologies.",
  },

  // ── EN — Marketing/Sales ──────────────────────────────────────────────────
  {
    id: "my-first-million",
    name: "My First Million",
    rssUrl: "https://feeds.megaphone.fm/HSW7835889991",
    category: "Marketing/Sales",
    language: "en",
    description: "Business ideas, entrepreneurship and side hustles.",
  },
  {
    id: "lennys-podcast",
    name: "Lenny's Podcast",
    rssUrl: "https://www.lennysnewsletter.com/feed/podcast",
    category: "Marketing/Sales",
    language: "en",
    description: "Product, growth, and career advice from top practitioners.",
  },
];

interface PodcastsState {
  feeds: PodcastFeed[];
  episodes: Record<string, Episode[]>;
  loadingFeedId: string | null;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  progress: number;
  favorites: string[];
  history: string[];
  activeCategory: string;
  activeLanguage: "all" | "fr" | "en";
  selectedLanguage: "fr" | "en" | null;

  loadEpisodes: (feedId: string) => Promise<void>;
  setCurrentEpisode: (episode: Episode | null) => void;
  setIsPlaying: (val: boolean) => void;
  setProgress: (seconds: number) => void;
  toggleFavorite: (episode: Episode) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  setActiveCategory: (cat: string) => void;
  setActiveLanguage: (lang: "all" | "fr" | "en") => void;
  setLanguage: (lang: "fr" | "en") => void;
  resetLanguage: () => void;
}

export const usePodcastsStore = create<PodcastsState>()(
  persist(
    (set, get) => ({
      feeds: PODCAST_FEEDS,
      episodes: {},
      loadingFeedId: null,
      currentEpisode: null,
      isPlaying: false,
      progress: 0,
      favorites: [],
      history: [],
      activeCategory: "Tous",
      activeLanguage: "all",
      selectedLanguage: null,

      loadEpisodes: async (feedId) => {
        if (get().episodes[feedId]) return; // cached
        const feed = PODCAST_FEEDS.find((f) => f.id === feedId);
        if (!feed) return;

        set({ loadingFeedId: feedId });
        try {
          const params = new URLSearchParams({
            url: feed.rssUrl,
            feedId,
            feedName: feed.name,
          });
          const res = await fetch(`/api/rss?${params.toString()}`);
          const data = await res.json();
          set((s) => ({
            episodes: { ...s.episodes, [feedId]: data.episodes ?? [] },
            loadingFeedId: null,
          }));
        } catch {
          set({ loadingFeedId: null });
        }
      },

      setCurrentEpisode: (episode) => {
        set({ currentEpisode: episode, isPlaying: !!episode, progress: 0 });
        if (episode) {
          set((s) => ({
            history: s.history.includes(episode.guid)
              ? s.history
              : [episode.guid, ...s.history],
          }));
        }
      },

      setIsPlaying: (val) => set({ isPlaying: val }),
      setProgress: (seconds) => set({ progress: seconds }),

      toggleFavorite: async (episode) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isFav = get().favorites.includes(episode.guid);
        if (isFav) {
          await supabase
            .from("media_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("media_type", "podcast")
            .eq("item_id", episode.guid);
          set((s) => ({ favorites: s.favorites.filter((g) => g !== episode.guid) }));
        } else {
          await supabase.from("media_favorites").upsert({
            user_id: user.id,
            media_type: "podcast",
            item_id: episode.guid,
            title: episode.title,
            description: episode.description,
            media_url: episode.audioUrl,
            channel_name: episode.feedName,
          } as any);
          set((s) => ({ favorites: [episode.guid, ...s.favorites] }));
        }
      },

      fetchFavorites: async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("media_favorites")
          .select("item_id")
          .eq("media_type", "podcast");
        if (data) set({ favorites: data.map((r: any) => r.item_id) });
      },

      fetchHistory: async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("media_history")
          .select("item_id")
          .eq("media_type", "podcast")
          .order("last_played_at", { ascending: false });
        if (data) set({ history: data.map((r: any) => r.item_id) });
      },

      setActiveCategory: (cat) => set({ activeCategory: cat }),
      setActiveLanguage: (lang) => set({ activeLanguage: lang }),
      setLanguage: (lang) => set({ selectedLanguage: lang, activeCategory: "Tous" }),
      resetLanguage: () => set({ selectedLanguage: null, activeCategory: "Tous" }),
    }),
    {
      name: "biproductive-podcasts",
      partialize: (state) => ({ selectedLanguage: state.selectedLanguage }),
    }
  )
);
