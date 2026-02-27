"use client";

import { useState } from "react";
import { useBooksStore, type Annotation } from "@/stores/use-books-store";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnnotationToolbarProps {
  bookId: string;
  selectedText: string;
  cfiRange: string;
  chapterIndex: number;
  onClose: () => void;
}

type Category = Annotation["category"];

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: "idee", label: "Idée", icon: "💡", color: "#facc15" },
  { id: "citation", label: "Citation", icon: "💬", color: "#fb923c" },
  { id: "action", label: "Action", icon: "⚡", color: "#4ade80" },
  { id: "question", label: "Question", icon: "❓", color: "#60a5fa" },
];

export function AnnotationToolbar({
  bookId,
  selectedText,
  cfiRange,
  chapterIndex,
  onClose,
}: AnnotationToolbarProps) {
  const { addAnnotation } = useBooksStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave() {
    if (!selectedCategory || saving) return;
    setSaving(true);
    setStatus("idle");

    const ok = await addAnnotation(bookId, {
      text: selectedText,
      note: note.trim() || undefined,
      category: selectedCategory,
      chapterIndex,
      cfiRange,
      color: CATEGORIES.find((c) => c.id === selectedCategory)?.color ?? "#facc15",
    });

    setSaving(false);

    if (ok) {
      setStatus("success");
      // Fermer après un bref feedback visuel
      setTimeout(onClose, 600);
    } else {
      setStatus("error");
      setErrorMsg("Erreur de sauvegarde. Vérifie que les colonnes SQL ont bien été ajoutées.");
    }
  }

  return (
    // stopPropagation : empêche les clics de traverser vers l'iframe epubjs
    <div
      className="bg-popover border border-border rounded-xl shadow-lg p-3 space-y-3 min-w-[240px]"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Texte sélectionné */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground italic line-clamp-2 flex-1">
          "{selectedText.slice(0, 80)}{selectedText.length > 80 ? "..." : ""}"
        </p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Catégories */}
      <div className="flex gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
              selectedCategory === cat.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-border/80 hover:bg-muted"
            }`}
          >
            <span>{cat.icon}</span>
            <span className="text-[10px]">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Note optionnelle */}
      {selectedCategory && (
        <Input
          placeholder="Note (optionnelle)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-xs h-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onClose();
          }}
        />
      )}

      {/* Feedback erreur */}
      {status === "error" && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {errorMsg}
        </p>
      )}

      {/* Bouton */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={`flex-1 h-7 text-xs ${status === "success" ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
          disabled={!selectedCategory || saving}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleSave}
        >
          {saving ? "Sauvegarde..." : status === "success" ? (
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sauvegardé</span>
          ) : "Annoter"}
        </Button>
      </div>
    </div>
  );
}
