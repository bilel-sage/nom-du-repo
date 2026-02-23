import { NextRequest, NextResponse } from "next/server";

export interface RssEpisode {
  guid: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  pubDate: string;
  feedId: string;
  feedName: string;
}

function extractText(xml: string, tag: string): string {
  const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(re);
  if (match) return match[1].replace(/<[^>]+>/g, "").trim();

  return "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`, "i");
  const match = xml.match(re);
  return match ? match[1] : "";
}

function parseItems(xml: string, feedId: string, feedName: string): RssEpisode[] {
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  const episodes: RssEpisode[] = [];
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null) {
    const item = m[1];

    const guid = extractText(item, "guid") || extractAttr(item, "guid", "isPermaLink") || Math.random().toString(36);
    const title = extractText(item, "title");
    const description = extractText(item, "description") || extractText(item, "itunes:summary") || "";
    const pubDate = extractText(item, "pubDate");
    const duration = extractText(item, "itunes:duration") || "";

    // enclosure url
    const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/i);
    const audioUrl = enclosureMatch ? enclosureMatch[1] : "";

    if (!audioUrl) continue;

    episodes.push({ guid, title, description, audioUrl, duration, pubDate, feedId, feedName });
  }

  return episodes;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const feedId = searchParams.get("feedId") || "";
  const feedName = searchParams.get("feedName") || "";

  if (!url) {
    return NextResponse.json({ error: "Paramètre url manquant", episodes: [] }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Biproductive/1.0 RSS Reader" },
      next: { revalidate: 3600 }, // cache 1h
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erreur fetch RSS: ${res.status}`, episodes: [] },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const episodes = parseItems(xml, feedId, feedName);

    return NextResponse.json({ episodes }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur: ${err instanceof Error ? err.message : String(err)}`, episodes: [] },
      { status: 500 }
    );
  }
}
