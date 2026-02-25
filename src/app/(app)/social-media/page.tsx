"use client";

import { useState } from "react";
import { useSocialMediaStore, type Creator } from "@/stores/use-social-media-store";
import { CreatorDialog } from "@/components/social-media/creator-dialog";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Edit3, Trash2, Globe, AlertTriangle } from "lucide-react";

function PlatformLink({
  label, url, color,
}: { label: string; url: string; color: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-80 ${color}`}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
      <ExternalLink className="w-2.5 h-2.5" />
    </a>
  );
}

function CreatorCard({ creator, onEdit }: { creator: Creator; onEdit: (c: Creator) => void }) {
  const { deleteCreator } = useSocialMediaStore();
  const links = [
    creator.tiktok && { label: "TikTok", url: creator.tiktok, color: "bg-slate-100 dark:bg-slate-800 text-foreground" },
    creator.reddit && { label: "Reddit", url: creator.reddit, color: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400" },
    creator.twitter && { label: "Twitter", url: creator.twitter, color: "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400" },
    creator.youtube && { label: "YouTube", url: creator.youtube, color: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400" },
  ].filter(Boolean) as { label: string; url: string; color: string }[];

  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 hover:border-foreground/20 transition-all">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
        {creator.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{creator.name}</p>
        {links.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-1.5">
            {links.map((l) => (
              <PlatformLink key={l.label} {...l} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(creator)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => deleteCreator(creator.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function SocialMediaPage() {
  const { creators } = useSocialMediaStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editCreator, setEditCreator] = useState<Creator | null>(null);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Social Media
          </h1>
          <p className="text-muted-foreground mt-1">
            Créateurs à suivre. Minimaliste. Sans algorithme.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Bannière d'avertissement */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            À utiliser uniquement le week-end.
          </p>
          <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
            Ne pas rester trop longtemps. Consultation intentionnelle, pas passive.
          </p>
        </div>
      </div>

      {/* Empty */}
      {creators.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold">Aucun créateur ajouté</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Ajoute les créateurs que tu souhaites consulter, avec leurs liens.
          </p>
          <Button className="mt-5" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un créateur
          </Button>
        </div>
      )}

      {/* Liste */}
      {creators.length > 0 && (
        <div className="space-y-2">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} onEdit={(cr) => setEditCreator(cr)} />
          ))}
        </div>
      )}

      {showAdd && (
        <CreatorDialog open={showAdd} onClose={() => setShowAdd(false)} />
      )}
      {editCreator && (
        <CreatorDialog open={!!editCreator} onClose={() => setEditCreator(null)} creator={editCreator} />
      )}
    </div>
  );
}
