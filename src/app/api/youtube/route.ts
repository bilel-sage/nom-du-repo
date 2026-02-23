import { NextRequest, NextResponse } from "next/server";

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  channelId: string;
}

function mapItems(items: any[], fallbackChannelId: string): YoutubeVideo[] {
  return (items ?? [])
    .filter((item: any) => item.id?.videoId)
    .map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",
      channelTitle: item.snippet?.channelTitle ?? "",
      publishedAt: item.snippet?.publishedAt ?? "",
      channelId: item.snippet?.channelId ?? fallbackChannelId,
    }));
}

async function searchYoutube(
  apiKey: string,
  params: Record<string, string>
): Promise<YoutubeVideo[]> {
  const qs = new URLSearchParams({ key: apiKey, part: "snippet", type: "video", ...params });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${qs.toString()}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return mapItems(json.items, params.channelId ?? "");
}

function mergeDeduped(a: YoutubeVideo[], b: YoutubeVideo[], max: number): YoutubeVideo[] {
  const seen = new Set<string>();
  const out: YoutubeVideo[] = [];
  for (const v of [...a, ...b]) {
    if (!seen.has(v.id)) {
      seen.add(v.id);
      out.push(v);
    }
  }
  return out
    .sort((x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime())
    .slice(0, max);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  const channelName = searchParams.get("channelName") || "";
  const maxResults = parseInt(searchParams.get("maxResults") || "12", 10);

  if (!channelId) {
    return NextResponse.json({ error: "Paramètre channelId manquant", videos: [] }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY manquante — configurez la clé dans .env.local", videos: [] },
      { status: 200 }
    );
  }

  try {
    const half = Math.ceil(maxResults / 2);

    // ── Étape 1 : channelId + filtre durée (exclut les Shorts)
    const [medium, long] = await Promise.all([
      searchYoutube(apiKey, { channelId, order: "date", maxResults: String(half), videoDuration: "medium" }),
      searchYoutube(apiKey, { channelId, order: "date", maxResults: String(half), videoDuration: "long" }),
    ]);
    let videos = mergeDeduped(medium, long, maxResults);

    // ── Étape 2 : channelId sans filtre durée (channel avec peu de longues vidéos)
    if (videos.length === 0) {
      videos = await searchYoutube(apiKey, {
        channelId,
        order: "date",
        maxResults: String(maxResults),
      });
    }

    // ── Étape 3 : recherche par nom de chaîne (channel ID incorrect ou introuvable)
    if (videos.length === 0 && channelName) {
      const byName = await searchYoutube(apiKey, {
        q: channelName,
        order: "relevance",
        maxResults: String(maxResults),
        videoDuration: "medium", // exclut encore les Shorts
      });
      videos = byName;
    }

    return NextResponse.json({ videos }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur: ${err instanceof Error ? err.message : String(err)}`, videos: [] },
      { status: 500 }
    );
  }
}
