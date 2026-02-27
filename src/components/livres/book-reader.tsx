"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBooksStore, type Book } from "@/stores/use-books-store";
import { createClient } from "@/lib/supabase/client";
import { AnnotationToolbar } from "@/components/livres/annotation-toolbar";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sun, Moon, Minus, Plus,
  List, X, BookOpen, Columns2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

type Theme = "light" | "dark" | "sepia";

const THEMES: Record<Theme, { bg: string; fg: string; label: string }> = {
  light: { bg: "#ffffff", fg: "#1a1a1a", label: "Clair" },
  sepia: { bg: "#f4ecd8", fg: "#3c2a1e", label: "Sépia" },
  dark: { bg: "#1a1a2e", fg: "#e0e0e0", label: "Sombre" },
};

interface Selection {
  text: string;
  cfiRange: string;
  x: number;
  y: number;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const { saveReadingProgress } = useBooksStore();

  const viewerRef = useRef<HTMLDivElement>(null);
  const epubRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState(100);
  const [spread, setSpread] = useState<"none" | "auto">("none"); // single page by default
  const [progress, setProgress] = useState(book.reading_progress?.percentage ?? 0);
  const [chapterIndex, setChapterIndex] = useState(book.reading_progress?.chapterIndex ?? 0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToc, setShowToc] = useState(false);
  const [toc, setToc] = useState<any[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showThemes, setShowThemes] = useState(false);

  const applyTheme = useCallback((t: Theme, rendition: any) => {
    const { bg, fg } = THEMES[t];
    // Injecte couleurs + mise en page centrée dans le même thème
    rendition.themes.register(t, {
      "body": {
        background: `${bg} !important`,
        color: `${fg} !important`,
        "max-width": "680px !important",
        "margin-left": "auto !important",
        "margin-right": "auto !important",
        "padding-left": "2rem !important",
        "padding-right": "2rem !important",
        "line-height": "1.85 !important",
      },
      "p": { color: `${fg} !important`, "margin-bottom": "1em !important" },
      "span": { color: `${fg} !important` },
      "h1,h2,h3,h4,h5,h6": { color: `${fg} !important` },
      "a": { color: `${fg} !important` },
    });
    rendition.themes.select(t);
  }, []);

  const scheduleSave = useCallback((rendition: any, chIdx: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const loc = rendition.currentLocation();
        const cfi = loc?.start?.cfi;
        const pct = loc?.start?.percentage ?? 0;
        await saveReadingProgress(book.id, {
          percentage: Math.round(pct * 100),
          chapterIndex: chIdx,
          cfi,
        });
        setProgress(Math.round(pct * 100));
      } catch {
        // silent
      }
    }, 2000);
  }, [book.id, saveReadingProgress]);

  useEffect(() => {
    if (!book.epub_url || !viewerRef.current) return;

    let mounted = true;

    async function init() {
      try {
        // BUG FIX 1 : télécharger le fichier via Supabase (bucket privé)
        // epub_url contient le path storage, pas une URL publique
        const supabase = createClient();
        const { data: blob, error: dlError } = await supabase.storage
          .from("epub-books")
          .download(book.epub_url!);
        if (dlError || !blob) throw new Error(dlError?.message ?? "Téléchargement échoué");
        const arrayBuffer = await blob.arrayBuffer();

        if (!mounted) return;

        const ePub = (await import("epubjs")).default;
        // Passe l'ArrayBuffer directement — pas besoin de fetch
        const epubBook = ePub(arrayBuffer as any);
        epubRef.current = epubBook;

        await epubBook.ready;
        if (!mounted) return;

        const spine = await epubBook.loaded.spine as any;
        if (mounted) setTotalChapters(spine?.items?.length ?? 0);

        const tocData = await epubBook.loaded.navigation as any;
        if (mounted && tocData?.toc) setToc(tocData.toc);

        if (!mounted || !viewerRef.current) return;

        // BUG FIX 2 : dimensions pixel depuis getBoundingClientRect (pas "100%")
        const rect = viewerRef.current.getBoundingClientRect();
        const w = rect.width || window.innerWidth - 120;
        const h = rect.height || window.innerHeight - 120;

        const rendition = epubBook.renderTo(viewerRef.current, {
          width: w,
          height: h,
          allowScriptedContent: false,
          // Forcer page unique — empêche le mode "livre ouvert" double colonne
          spread: "none",
          minSpreadWidth: 9999,
        });
        renditionRef.current = rendition;

        applyTheme(theme, rendition);
        rendition.themes.fontSize(`${fontSize}%`);

        // BUG FIX 3 : attacher tous les events AVANT display()
        // sinon l'événement "rendered" tire avant qu'on l'écoute → loading reste bloqué
        rendition.on("rendered", (section: any) => {
          if (!mounted) return;
          setChapterIndex(section?.index ?? 0);
          scheduleSave(rendition, section?.index ?? 0);
          setLoading(false);
        });

        rendition.on("relocated", (location: any) => {
          if (!mounted) return;
          const pct = location?.start?.percentage ?? 0;
          setProgress(Math.round(pct * 100));
          setChapterIndex(location?.start?.index ?? 0);
          scheduleSave(rendition, location?.start?.index ?? 0);
        });

        rendition.on("selected", (cfiRange: string, contents: any) => {
          if (!mounted) return;
          try {
            const range = contents.window.getSelection();
            const text = range?.toString() ?? "";
            if (!text.trim()) return;

            // BUGFIX : getBoundingClientRect() retourne des coords relatives à l'iframe.
            // Il faut trouver l'iframe dans le DOM et ajouter son offset.
            const selectionRect = range?.getRangeAt(0)?.getBoundingClientRect();
            const iframe = viewerRef.current?.querySelector("iframe");
            const iframeRect = iframe?.getBoundingClientRect();
            const viewerRect = viewerRef.current?.getBoundingClientRect();

            if (selectionRect && iframeRect && viewerRect) {
              setSelection({
                text: text.trim(),
                cfiRange,
                // Coords relatives au viewer (parent du toolbar en absolute)
                x: (iframeRect.left - viewerRect.left) + selectionRect.left + selectionRect.width / 2,
                y: (iframeRect.top - viewerRect.top) + selectionRect.top,
              });
            }
          } catch {
            // silent
          }
        });

        // Afficher à la position sauvegardée (ou début)
        const startCfi = book.reading_progress?.cfi;
        await rendition.display(startCfi || undefined);

        // Fallback : si "rendered" n'a pas tiré (edge case), on cache le loader quand même
        if (mounted) setLoading(false);

      } catch (err: any) {
        if (mounted) {
          setError(err?.message ?? "Erreur lors du chargement du livre.");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (renditionRef.current) {
        try { renditionRef.current.destroy(); } catch { }
        renditionRef.current = null;
      }
      if (epubRef.current) {
        try { epubRef.current.destroy(); } catch { }
        epubRef.current = null;
      }
    };
  }, [book.epub_url]); // eslint-disable-line react-hooks/exhaustive-deps

  function prevPage() {
    renditionRef.current?.prev();
    setSelection(null);
  }

  function nextPage() {
    renditionRef.current?.next();
    setSelection(null);
  }

  function changeFontSize(delta: number) {
    const newSize = Math.max(70, Math.min(150, fontSize + delta));
    setFontSize(newSize);
    renditionRef.current?.themes.fontSize(`${newSize}%`);
  }

  function changeTheme(t: Theme) {
    setTheme(t);
    if (renditionRef.current) applyTheme(t, renditionRef.current);
    setShowThemes(false);
  }

  function toggleSpread() {
    const next = spread === "none" ? "auto" : "none";
    setSpread(next);
    if (renditionRef.current) {
      renditionRef.current.spread(next);
    }
  }

  function goToChapter(href: string) {
    renditionRef.current?.display(href);
    setShowToc(false);
    setSelection(null);
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevPage();
      if (e.key === "Escape") {
        if (selection) { setSelection(null); return; }
        if (showToc) { setShowToc(false); return; }
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selection, showToc]); // eslint-disable-line react-hooks/exhaustive-deps

  const themeClass = theme === "dark" ? "bg-[#1a1a2e] text-gray-100" : theme === "sepia" ? "bg-[#f4ecd8] text-[#3c2a1e]" : "bg-white text-gray-900";

  return (
    <div className={cn("fixed inset-0 z-50 flex flex-col", themeClass)} style={{ fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <div className={cn(
        "shrink-0 flex items-center justify-between px-4 py-2 border-b",
        theme === "dark" ? "border-white/10 bg-[#16162a]" : theme === "sepia" ? "border-[#c4a882] bg-[#ede0c4]" : "border-gray-200 bg-gray-50"
      )}>
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Retour</span>
        </button>

        <p className="text-sm font-medium truncate max-w-[40%] opacity-80">{book.title}</p>

        <div className="flex items-center gap-1">
          <span className="text-xs opacity-60 mr-2">{progress}%</span>

          {/* Font size */}
          <button onClick={() => changeFontSize(-10)} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
            <Minus className="w-3.5 h-3.5 opacity-70" />
          </button>
          <button onClick={() => changeFontSize(10)} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
            <Plus className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Theme */}
          <div className="relative">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            >
              {theme === "dark" ? <Moon className="w-3.5 h-3.5 opacity-70" /> : <Sun className="w-3.5 h-3.5 opacity-70" />}
            </button>
            {showThemes && (
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-lg p-1.5 flex flex-col gap-1 z-10">
                {(Object.entries(THEMES) as [Theme, { bg: string; fg: string; label: string }][]).map(([id, t]) => (
                  <button
                    key={id}
                    onClick={() => changeTheme(id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs text-left transition-colors",
                      theme === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle page simple / double */}
          <button
            onClick={toggleSpread}
            title={spread === "none" ? "Passer en double page" : "Passer en page unique"}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
          >
            {spread === "none"
              ? <Columns2 className="w-3.5 h-3.5 opacity-70" />
              : <BookOpen className="w-3.5 h-3.5 opacity-70" />
            }
          </button>

          {/* TOC */}
          <button
            onClick={() => setShowToc(!showToc)}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
          >
            <List className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex min-h-0 relative">

        {/* TOC Sidebar */}
        {showToc && (
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-72 z-20 overflow-y-auto border-r shadow-xl",
            theme === "dark" ? "bg-[#16162a] border-white/10" : theme === "sepia" ? "bg-[#ede0c4] border-[#c4a882]" : "bg-white border-gray-200"
          )}>
            <div className="flex items-center justify-between p-3 border-b border-inherit">
              <p className="text-sm font-semibold">Table des matières</p>
              <button onClick={() => setShowToc(false)}>
                <X className="w-4 h-4 opacity-60" />
              </button>
            </div>
            <div className="p-2 space-y-0.5">
              {toc.map((item: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => goToChapter(item.href)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-80 hover:opacity-100"
                >
                  {item.label}
                </button>
              ))}
              {toc.length === 0 && (
                <p className="text-xs text-center opacity-50 py-4">Aucune table des matières</p>
              )}
            </div>
          </div>
        )}

        {/* Viewer area */}
        <div className="flex-1 flex items-center min-h-0 relative">
          {/* Prev button */}
          <button
            onClick={prevPage}
            className="hidden sm:flex shrink-0 items-center justify-center w-12 h-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 opacity-40" />
          </button>

          {/* ePub content */}
          <div className="flex-1 h-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-sm opacity-50">Chargement...</div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <Button size="sm" variant="outline" onClick={onClose}>Fermer</Button>
              </div>
            )}
            <div ref={viewerRef} className="w-full h-full" />

            {/* Annotation toolbar */}
            {selection && (
              <div
                className="absolute z-30"
                style={{
                  left: Math.max(10, Math.min(selection.x - 120, window.innerWidth - 280)),
                  top: Math.max(10, selection.y - 200),
                }}
              >
                <AnnotationToolbar
                  bookId={book.id}
                  selectedText={selection.text}
                  cfiRange={selection.cfiRange}
                  chapterIndex={chapterIndex}
                  onClose={() => setSelection(null)}
                />
              </div>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={nextPage}
            className="hidden sm:flex shrink-0 items-center justify-center w-12 h-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-6 h-6 opacity-40" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "shrink-0 flex items-center justify-between px-4 py-2 border-t text-xs",
        theme === "dark" ? "border-white/10 bg-[#16162a] opacity-70" : theme === "sepia" ? "border-[#c4a882] bg-[#ede0c4] opacity-70" : "border-gray-200 bg-gray-50 opacity-70"
      )}>
        <span>Chapitre {chapterIndex + 1}{totalChapters > 0 ? ` / ${totalChapters}` : ""}</span>

        {/* Progress bar */}
        <div className="flex-1 mx-4 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-current opacity-40 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 sm:hidden">
          <button onClick={prevPage} className="p-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextPage} className="p-1">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
