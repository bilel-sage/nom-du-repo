"use client";

import { useEffect, useState } from "react";
import { useQuestStore } from "@/stores/use-quest-store";
import { QuestDialog } from "@/components/quests/quest-dialog";
import { QuestCard } from "@/components/quests/quest-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, Loader2, Inbox } from "lucide-react";

type Filter = "all" | "active" | "completed";

export default function QuestsPage() {
  const { quests, loading, fetchQuests } = useQuestStore();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const filtered = quests.filter((q) => {
    if (filter === "active") return !q.is_completed;
    if (filter === "completed") return q.is_completed;
    return true;
  });

  // Sort: active first (by priority score desc), then completed
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    const scoreA = a.urgency * a.importance;
    const scoreB = b.urgency * b.importance;
    return scoreB - scoreA;
  });

  const activeCount = quests.filter((q) => !q.is_completed).length;
  const completedCount = quests.filter((q) => q.is_completed).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            Quêtes
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeCount} active{activeCount > 1 ? "s" : ""} · {completedCount} terminée{completedCount > 1 ? "s" : ""}
          </p>
        </div>
        <QuestDialog />
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">Toutes ({quests.length})</TabsTrigger>
          <TabsTrigger value="active">Actives ({activeCount})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Quest list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {filter === "completed"
              ? "Aucune quête terminée."
              : filter === "active"
              ? "Toutes les quêtes sont terminées !"
              : "Aucune quête. Créez votre première mission."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}
