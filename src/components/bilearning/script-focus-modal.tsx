"use client";

import { useEffect, useRef } from "react";
import { type Article, useBilearningStore } from "@/stores/use-bilearning-store";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptFocusModalProps {
  script: Article;
  onClose: () => void;
}

export function ScriptFocusModal({ script, onClose }: ScriptFocusModalProps) {
  const { toggleRead } = useBilearningStore();
  const contentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDone = async () => {
    if (!script.is_read) await toggleRead(script.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="min-w-0">
          <h2 className="text-white font-bold text-lg truncate">{script.title}</h2>
          {script.category && (
            <span className="inline-flex items-center gap-1 text-[11px] text-violet-400 font-medium mt-0.5">
              <Tag className="w-3 h-3" />
              {script.category}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 shrink-0 p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-8 py-8 max-w-3xl mx-auto w-full"
      >
        <div className="text-white/90 text-base leading-relaxed whitespace-pre-wrap font-mono">
          {script.content || (
            <span className="text-white/30 italic">Aucun contenu dans ce script.</span>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 flex items-center justify-center gap-4 px-6 py-5 border-t border-white/10">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
        >
          Fermer
        </Button>
        <Button
          onClick={handleDone}
          className={cn(
            "gap-2 font-semibold",
            script.is_read
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-violet-600 hover:bg-violet-700"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          {script.is_read ? "Déjà terminé ✓" : "Script terminé"}
        </Button>
      </div>
    </div>
  );
}
