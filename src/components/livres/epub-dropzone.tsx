"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EpubMetadata {
  title: string;
  author: string;
  cover_url: string;
  description: string;
  file: File;
}

interface EpubDropzoneProps {
  onParsed: (meta: EpubMetadata) => void;
}

type DropState = "idle" | "dragging" | "parsing" | "done" | "error";

export function EpubDropzone({ onParsed }: EpubDropzoneProps) {
  const [state, setState] = useState<DropState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<{ title: string; author: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".epub")) {
      setErrorMsg("Fichier invalide. Seuls les fichiers .epub sont acceptés.");
      setState("error");
      return;
    }

    setState("parsing");
    setErrorMsg("");

    try {
      const ePub = (await import("epubjs")).default;
      const arrayBuffer = await file.arrayBuffer();
      const book = ePub(arrayBuffer);
      await book.ready;

      const meta = await book.loaded.metadata as any;
      const title = meta?.title ?? file.name.replace(".epub", "");
      const author = meta?.creator ?? "";
      let description = meta?.description ?? "";
      let cover_url = "";

      try {
        const coverUrl = await book.coverUrl();
        if (coverUrl) cover_url = coverUrl;
      } catch {
        // cover extraction is optional
      }

      const result: EpubMetadata = { title, author, cover_url, description, file };
      setPreview({ title, author });
      setState("done");
      onParsed(result);
    } catch (err) {
      setErrorMsg("Impossible de lire ce fichier ePub.");
      setState("error");
    }
  }, [onParsed]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
        onDragLeave={() => setState((s) => s === "dragging" ? "idle" : s)}
        onDrop={handleDrop}
        onClick={() => state !== "parsing" && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          state === "dragging" && "border-primary bg-primary/5 scale-[1.01]",
          state === "done" && "border-emerald-500 bg-emerald-500/5",
          state === "error" && "border-red-400 bg-red-500/5",
          state === "parsing" && "border-border cursor-wait",
          state === "idle" && "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".epub"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center gap-3">
          {state === "parsing" ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Lecture du fichier ePub...</p>
            </>
          ) : state === "done" && preview ? (
            <>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-emerald-600">ePub importé</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {preview.title}{preview.author ? ` — ${preview.author}` : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Clique pour changer de fichier</p>
            </>
          ) : state === "error" ? (
            <>
              <FileText className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-500">{errorMsg}</p>
                <p className="text-xs text-muted-foreground mt-1">Clique pour réessayer</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Glisse ton fichier ePub ici</p>
                <p className="text-xs text-muted-foreground mt-1">ou clique pour parcourir</p>
              </div>
              <p className="text-xs text-muted-foreground/70">Format .epub uniquement</p>
            </>
          )}
        </div>
      </div>

      {state === "done" && (
        <p className="text-xs text-muted-foreground text-center">
          Les métadonnées ont été importées. Tu peux les modifier ci-dessus avant de valider.
        </p>
      )}
    </div>
  );
}
