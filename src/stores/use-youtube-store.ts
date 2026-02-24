"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

export interface YoutubeChannel {
  id: string;
  channelId: string;
  name: string;
  category: string;
  language: "fr" | "en";
  description: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  channelId: string;
}

export const FR_CATEGORIES = ["Tous", "Éloquence/Bien parler", "Informatique/Dev", "Marketing/Vente", "Islam"];
export const EN_CATEGORIES = ["Tous", "Public Speaking", "Informatics/Dev", "Marketing/Sales"];

// ── Chaînes curatées — flux RSS officiel YouTube ──────────────────────────────
// Format RSS : https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
// Minimum 3 chaînes par catégorie pour garantir du contenu (anti-vide)
export const YOUTUBE_CHANNELS: YoutubeChannel[] = [
  // ── FR — Éloquence/Bien parler ────────────────────────────────────────────
  {
    id: "arte",
    channelId: "UCwI-JbGNsojunnHbFAc0M4Q",
    name: "Arte",
    category: "Éloquence/Bien parler",
    language: "fr",
    description: "Culture, documentaires et débats de qualité.",
  },
  {
    id: "ted-fr",
    channelId: "UCUnem-K4HqlgQrOSch0_-Jw",
    name: "TED en Français",
    category: "Éloquence/Bien parler",
    language: "fr",
    description: "Conférences TED traduites et doublées en français.",
  },
  {
    id: "heu-reka",
    channelId: "UC7sXGI8p8PvKosLWagkK9wQ",
    name: "Heu?reka",
    category: "Éloquence/Bien parler",
    language: "fr",
    description: "Économie et rhétorique vulgarisées avec clarté.",
  },

  // ── FR — Informatique/Dev ─────────────────────────────────────────────────
  {
    id: "grafikart",
    channelId: "UCj_iGliGCkLcHSZ8eqVNPDQ",
    name: "Grafikart",
    category: "Informatique/Dev",
    language: "fr",
    description: "Tutoriels développement web en français.",
  },
  {
    id: "underscore",
    channelId: "UCWedHS9qKebauVIK2J7383g",
    name: "Underscore_",
    category: "Informatique/Dev",
    language: "fr",
    description: "Développement web et culture tech en français.",
  },
  {
    id: "benjamin-code",
    channelId: "UCLOAPb7ATQUs_nDs9ViLcMw",
    name: "Benjamin Code",
    category: "Informatique/Dev",
    language: "fr",
    description: "Apprendre à coder de manière pragmatique.",
  },
  {
    id: "cocadmin",
    channelId: "UCVRJ6D343dX-x730MRP8tNw",
    name: "cocadmin",
    category: "Informatique/Dev",
    language: "fr",
    description: "Linux, DevOps et administration système.",
  },

  // ── FR — Marketing/Vente ──────────────────────────────────────────────────
  {
    id: "yomi-denzel",
    channelId: "UChgE6R4QauGAJAlYiJOcCGw",
    name: "Yomi Denzel",
    category: "Marketing/Vente",
    language: "fr",
    description: "Business en ligne, marketing et entrepreneuriat.",
  },
  {
    id: "olivier-roland",
    channelId: "UCvq4sennWMM5hxDKfxIoojg",
    name: "Olivier Roland",
    category: "Marketing/Vente",
    language: "fr",
    description: "Entrepreneuriat intelligent et business en ligne.",
  },

  // ── FR — Islam ────────────────────────────────────────────────────────────
  {
    id: "bilal-tv",
    channelId: "UCQL7lZQGpy014xJfgx3w3Wg",
    name: "Bilal TV",
    category: "Islam",
    language: "fr",
    description: "Contenu islamique éducatif en français.",
  },

  // ── EN — Public Speaking ──────────────────────────────────────────────────
  {
    id: "ted",
    channelId: "UCAuUUnT6oDeKwE6v1NGQxug",
    name: "TED",
    category: "Public Speaking",
    language: "en",
    description: "Ideas worth spreading — talks from world-class thinkers.",
  },
  {
    id: "tedx-talks",
    channelId: "UCsT0YIqwnpJCM-mx7-gSA4Q",
    name: "TEDx Talks",
    category: "Public Speaking",
    language: "en",
    description: "Locally organised TED-style events from around the world.",
  },
  {
    id: "charisma-on-command",
    channelId: "UCU_W0oE_ock8bWKjALiGs8Q",
    name: "Charisma on Command",
    category: "Public Speaking",
    language: "en",
    description: "Science-backed charisma and communication skills.",
  },
  {
    id: "improvement-pill",
    channelId: "UCBIt1VN5j37PVM8LLSuTTlw",
    name: "Improvement Pill",
    category: "Public Speaking",
    language: "en",
    description: "Self-improvement, habits and personal growth.",
  },

  // ── EN — Informatics/Dev ──────────────────────────────────────────────────
  {
    id: "fireship",
    channelId: "UCsBjURrPoezykLs9EqgamOA",
    name: "Fireship",
    category: "Informatics/Dev",
    language: "en",
    description: "High-intensity code tutorials and tech news.",
  },
  {
    id: "traversy-media",
    channelId: "UC29ju8bIPH5as8OGnQzwJyA",
    name: "Traversy Media",
    category: "Informatics/Dev",
    language: "en",
    description: "Web development tutorials from beginner to advanced.",
  },
  {
    id: "web-dev-simplified",
    channelId: "UCFbNIlppjAuEX4znoulh0Cw",
    name: "Web Dev Simplified",
    category: "Informatics/Dev",
    language: "en",
    description: "Simplifying web development one video at a time.",
  },
  {
    id: "theo-t3",
    channelId: "UCbRP3c757lWg9M-U7TyEkXA",
    name: "Theo – t3.gg",
    category: "Informatics/Dev",
    language: "en",
    description: "TypeScript, web dev, and startup insights.",
  },
  {
    id: "kevin-powell",
    channelId: "UCJZv4d5rbIKd4QHMPkcABCw",
    name: "Kevin Powell",
    category: "Informatics/Dev",
    language: "en",
    description: "CSS tips, layouts and frontend mastery.",
  },

  // ── EN — Marketing/Sales ──────────────────────────────────────────────────
  {
    id: "garyvee",
    channelId: "UCctXZhXmG-kf3tlIXgVZUlw",
    name: "GaryVee",
    category: "Marketing/Sales",
    language: "en",
    description: "Entrepreneurship, marketing, and social media strategy.",
  },
  {
    id: "alex-hormozi",
    channelId: "UCUyDOdBWhC1MCxEjC46d-zw",
    name: "Alex Hormozi",
    category: "Marketing/Sales",
    language: "en",
    description: "Business scaling, offers, and sales strategies.",
  },
  {
    id: "neil-patel",
    channelId: "UCl-Zrl0QhF66lu1aGXaTbfw",
    name: "Neil Patel",
    category: "Marketing/Sales",
    language: "en",
    description: "SEO, digital marketing, and growth hacking.",
  },
];

// ── Store ─────────────────────────────────────────────────────────────────────
interface YoutubeState {
  channels: YoutubeChannel[];
  videos: Record<string, Video[]>;
  loadingChannelId: string | null;
  currentVideo: Video | null;
  favorites: string[];
  history: string[];
  activeCategory: string;
  selectedLanguage: "fr" | "en" | null;

  loadVideos: (channelId: string) => Promise<void>;
  setCurrentVideo: (video: Video | null) => void;
  toggleFavorite: (video: Video) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  setActiveCategory: (cat: string) => void;
  setLanguage: (lang: "fr" | "en") => void;
  resetLanguage: () => void;
}

export const useYoutubeStore = create<YoutubeState>()(
  persist(
    (set, get) => ({
      channels: YOUTUBE_CHANNELS,
      videos: {},
      loadingChannelId: null,
      currentVideo: null,
      favorites: [],
      history: [],
      activeCategory: "Tous",
      selectedLanguage: null,

      loadVideos: async (channelId) => {
        if (get().videos[channelId]) return; // déjà en cache client
        set({ loadingChannelId: channelId });
        try {
          const res = await fetch(`/api/youtube?channelId=${encodeURIComponent(channelId)}`);
          const data = await res.json();
          set((s) => ({
            videos: { ...s.videos, [channelId]: data.videos ?? [] },
            loadingChannelId: null,
          }));
        } catch {
          set({ loadingChannelId: null });
        }
      },

      setCurrentVideo: (video) => {
        set({ currentVideo: video });
        if (video) {
          set((s) => ({
            history: s.history.includes(video.id) ? s.history : [video.id, ...s.history],
          }));
        }
      },

      toggleFavorite: async (video) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isFav = get().favorites.includes(video.id);
        if (isFav) {
          await supabase
            .from("media_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("media_type", "youtube")
            .eq("item_id", video.id);
          set((s) => ({ favorites: s.favorites.filter((id) => id !== video.id) }));
        } else {
          await supabase.from("media_favorites").upsert({
            user_id: user.id,
            media_type: "youtube",
            item_id: video.id,
            title: video.title,
            description: video.description,
            thumbnail_url: video.thumbnail,
            channel_name: video.channelTitle,
          } as any);
          set((s) => ({ favorites: [video.id, ...s.favorites] }));
        }
      },

      fetchFavorites: async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("media_favorites")
          .select("item_id")
          .eq("media_type", "youtube");
        if (data) set({ favorites: data.map((r: any) => r.item_id) });
      },

      fetchHistory: async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("media_history")
          .select("item_id")
          .eq("media_type", "youtube")
          .order("last_played_at", { ascending: false });
        if (data) set({ history: data.map((r: any) => r.item_id) });
      },

      setActiveCategory: (cat) => set({ activeCategory: cat }),
      setLanguage: (lang) => set({ selectedLanguage: lang, activeCategory: "Tous" }),
      resetLanguage: () => set({ selectedLanguage: null, activeCategory: "Tous" }),
    }),
    {
      name: "biproductive-youtube",
      partialize: (state) => ({ selectedLanguage: state.selectedLanguage }),
    }
  )
);
