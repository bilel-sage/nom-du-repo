import { NextRequest, NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  channelId: string;
}

// ── Cache mémoire serveur (20 min) ────────────────────────────────────────────
const CACHE_TTL = 20 * 60 * 1000;
const memCache = new Map<string, { videos: YoutubeVideo[]; ts: number }>();

// ── Parsing Atom XML (format YouTube RSS officiel) ────────────────────────────
function tag(xml: string, name: string): string {
  const esc = name.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const m = xml.match(new RegExp(`<${esc}[^>]*>([\\s\\S]*?)<\\/${esc}>`, "i"));
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
}

function attrVal(xml: string, element: string, attribute: string): string {
  const esc = element.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const m = xml.match(new RegExp(`<${esc}[^>]*\\s${attribute}="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

// ── Filtre anti-Shorts (titre uniquement — durée absente du flux RSS) ─────────
function isShort(title: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("#shorts") ||
    t.includes("#short") ||
    /(?:^|\s)shorts(?:\s|$)/.test(t) ||
    /(?:^|\s)short(?:\s|$)/.test(t)
  );
}

function parseFeed(xml: string, fallbackChannelId: string): YoutubeVideo[] {
  const videos: YoutubeVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(xml)) !== null) {
    const e = m[1];

    const videoId = tag(e, "yt:videoId");
    if (!videoId) continue;

    const title = tag(e, "title");
    if (!title || isShort(title)) continue;

    const publishedAt = tag(e, "published");
    const description = tag(e, "media:description");
    const channelTitle = tag(e, "name"); // <author><name>
    const channelId = tag(e, "yt:channelId") || fallbackChannelId;
    const thumbnail =
      attrVal(e, "media:thumbnail", "url") ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    videos.push({
      id: videoId,
      title,
      description,
      thumbnail,
      channelTitle,
      publishedAt,
      channelId,
    });
  }

  return videos;
}

// ── Fetch + cache ─────────────────────────────────────────────────────────────
async function fetchChannelRSS(channelId: string): Promise<YoutubeVideo[]> {
  const cached = memCache.get(channelId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.videos;

  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Biproductive/1.0 RSS Reader" },
      next: { revalidate: 1200 },
    });

    if (!res.ok) {
      // Retourner données en cache si disponibles, sinon vide
      return cached?.videos ?? [];
    }

    const xml = await res.text();
    const videos = parseFeed(xml, channelId);

    memCache.set(channelId, { videos, ts: Date.now() });
    return videos;
  } catch {
    return cached?.videos ?? [];
  }
}

// ── Route GET ─────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const channelId = new URL(req.url).searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ error: "Paramètre channelId manquant", videos: [] }, { status: 400 });
  }

  const videos = await fetchChannelRSS(channelId);

  if (videos.length === 0) {
    return NextResponse.json(
      { videos: [], message: "Contenu temporairement indisponible, mise à jour en cours." },
      { status: 200 }
    );
  }

  return NextResponse.json({ videos });
}
