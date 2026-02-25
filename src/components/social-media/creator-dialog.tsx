"use client";

import { useState } from "react";
import { useSocialMediaStore, type Creator } from "@/stores/use-social-media-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatorDialogProps {
  open: boolean;
  onClose: () => void;
  creator?: Creator;
}

export function CreatorDialog({ open, onClose, creator }: CreatorDialogProps) {
  const { addCreator, updateCreator } = useSocialMediaStore();

  const [name, setName] = useState(creator?.name ?? "");
  const [tiktok, setTiktok] = useState(creator?.tiktok ?? "");
  const [reddit, setReddit] = useState(creator?.reddit ?? "");
  const [twitter, setTwitter] = useState(creator?.twitter ?? "");
  const [youtube, setYoutube] = useState(creator?.youtube ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      tiktok: tiktok.trim() || undefined,
      reddit: reddit.trim() || undefined,
      twitter: twitter.trim() || undefined,
      youtube: youtube.trim() || undefined,
    };
    if (creator) {
      updateCreator(creator.id, data);
    } else {
      addCreator(data);
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{creator ? "Modifier le créateur" : "Ajouter un créateur"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              placeholder="Nom du créateur"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {[
            { id: "tiktok", label: "TikTok", value: tiktok, set: setTiktok, placeholder: "https://tiktok.com/@..." },
            { id: "reddit", label: "Reddit", value: reddit, set: setReddit, placeholder: "https://reddit.com/u/..." },
            { id: "twitter", label: "Twitter / X", value: twitter, set: setTwitter, placeholder: "https://x.com/..." },
            { id: "youtube", label: "YouTube", value: youtube, set: setYoutube, placeholder: "https://youtube.com/@..." },
          ].map(({ id, label, value, set, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                type="url"
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
              />
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{creator ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
