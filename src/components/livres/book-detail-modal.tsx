"use client";

import { useState, useEffect, useRef } from "react";
import { useBooksStore, type Book, type Concept, type Question, type Insight } from "@/stores/use-books-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Trash2, Edit3, Check, X, BookOpen, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const {
    addPrinciple, updatePrinciple, removePrinciple,
    setApplied, setStatus, getDaysLeft, getDeadlineProgress,
    updateSummary,
    addConcept, updateConcept, removeConcept,
    addQuestion, updateQuestion, removeQuestion,
    addInsight, updateInsight, removeInsight,
  } = useBooksStore();

  // Préceptes
  const [newPrinciple, setNewPrinciple] = useState("");
  const [editingPrincipleId, setEditingPrincipleId] = useState<string | null>(null);
  const [editPrincipleContent, setEditPrincipleContent] = useState("");

  // Résumé
  const [summary, setSummary] = useState(book.summary ?? "");
  const summaryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notes
  const [notes, setNotes] = useState("");

  // Concepts
  const [newConceptTitle, setNewConceptTitle] = useState("");
  const [newConceptDesc, setNewConceptDesc] = useState("");
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null);
  const [editConceptTitle, setEditConceptTitle] = useState("");
  const [editConceptDesc, setEditConceptDesc] = useState("");

  // Questions
  const [newQuestion, setNewQuestion] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionContent, setEditQuestionContent] = useState("");
  const [editQuestionAnswer, setEditQuestionAnswer] = useState("");

  // Insights
  const [newInsight, setNewInsight] = useState("");
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
  const [editInsightContent, setEditInsightContent] = useState("");

  const [saving, setSaving] = useState(false);

  const daysLeft = getDaysLeft(book);
  const progress = getDeadlineProgress(book);
  const citations = (book.annotations ?? []).filter((a) => a.category === "citation");

  // Sync summary when book changes
  useEffect(() => {
    setSummary(book.summary ?? "");
  }, [book.summary]);

  // --- Préceptes ---
  async function handleAddPrinciple() {
    if (!newPrinciple.trim()) return;
    setSaving(true);
    await addPrinciple(book.id, newPrinciple);
    setNewPrinciple("");
    setSaving(false);
  }

  async function handleSavePrinciple() {
    if (!editingPrincipleId) return;
    setSaving(true);
    await updatePrinciple(book.id, editingPrincipleId, editPrincipleContent);
    setEditingPrincipleId(null);
    setSaving(false);
  }

  // --- Résumé auto-save ---
  function handleSummaryChange(val: string) {
    setSummary(val);
    if (summaryTimer.current) clearTimeout(summaryTimer.current);
    summaryTimer.current = setTimeout(() => {
      updateSummary(book.id, val);
    }, 1000);
  }

  // --- Concepts ---
  async function handleAddConcept() {
    if (!newConceptTitle.trim()) return;
    setSaving(true);
    await addConcept(book.id, { title: newConceptTitle.trim(), description: newConceptDesc.trim() });
    setNewConceptTitle("");
    setNewConceptDesc("");
    setSaving(false);
  }

  async function handleSaveConcept() {
    if (!editingConceptId) return;
    setSaving(true);
    await updateConcept(book.id, editingConceptId, { title: editConceptTitle, description: editConceptDesc });
    setEditingConceptId(null);
    setSaving(false);
  }

  // --- Questions ---
  async function handleAddQuestion() {
    if (!newQuestion.trim()) return;
    setSaving(true);
    await addQuestion(book.id, { content: newQuestion.trim() });
    setNewQuestion("");
    setSaving(false);
  }

  async function handleSaveQuestion() {
    if (!editingQuestionId) return;
    setSaving(true);
    await updateQuestion(book.id, editingQuestionId, { content: editQuestionContent, answer: editQuestionAnswer });
    setEditingQuestionId(null);
    setSaving(false);
  }

  // --- Insights ---
  async function handleAddInsight() {
    if (!newInsight.trim()) return;
    setSaving(true);
    await addInsight(book.id, { content: newInsight.trim() });
    setNewInsight("");
    setSaving(false);
  }

  async function handleSaveInsight() {
    if (!editingInsightId) return;
    setSaving(true);
    await updateInsight(book.id, editingInsightId, editInsightContent);
    setEditingInsightId(null);
    setSaving(false);
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-start gap-4">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-16 h-20 object-cover rounded-lg shrink-0 border border-border"
              />
            ) : (
              <div className="w-16 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl leading-tight">{book.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant={book.status === "termine" ? "default" : "secondary"}
                  className="cursor-pointer select-none"
                  onClick={() => setStatus(book.id, book.status === "en_cours" ? "termine" : "en_cours")}
                >
                  {book.status === "termine" ? "Terminé" : "En cours"}
                </Badge>
                {book.applied && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/50">
                    Appliqué ✓
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Deadline */}
        {book.deadline && (
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Deadline</span>
              </div>
              <span className={cn(
                "font-medium",
                daysLeft === null ? "text-muted-foreground"
                : daysLeft < 0 ? "text-red-500"
                : daysLeft <= 7 ? "text-amber-500"
                : "text-foreground"
              )}>
                {daysLeft === null ? "—"
                  : daysLeft < 0 ? `${Math.abs(daysLeft)}j de retard`
                  : daysLeft === 0 ? "Aujourd'hui !"
                  : `À terminer dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="preceptes" className="flex-1 overflow-hidden flex flex-col min-h-0">
          <TabsList className="shrink-0 w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="preceptes" className="text-xs">Préceptes</TabsTrigger>
            <TabsTrigger value="resume" className="text-xs">Résumé</TabsTrigger>
            <TabsTrigger value="concepts" className="text-xs">Concepts</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs">Questions</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
            <TabsTrigger value="citations" className="text-xs">
              Citations {citations.length > 0 && `(${citations.length})`}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0 pb-24">

            {/* --- Préceptes --- */}
            <TabsContent value="preceptes" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Préceptes retenus
                <span className="text-xs font-normal text-muted-foreground">
                  ({book.principles.length})
                </span>
              </h3>

              {book.principles.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Aucun précepte ajouté. Note les enseignements clés du livre.
                </p>
              )}

              <div className="space-y-2.5">
                {book.principles.map((p, idx) => (
                  <div key={p.id} className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      {editingPrincipleId === p.id ? (
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={editPrincipleContent}
                            onChange={(e) => setEditPrincipleContent(e.target.value)}
                            className="min-h-[80px] text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSavePrinciple} disabled={saving}>
                              <Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingPrincipleId(null)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start justify-between gap-2">
                          <p className="text-sm leading-relaxed flex-1">{p.content}</p>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => { setEditingPrincipleId(p.id); setEditPrincipleContent(p.content); }}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removePrinciple(book.id, p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Ajouter un précepte retenu..."
                  value={newPrinciple}
                  onChange={(e) => setNewPrinciple(e.target.value)}
                  className="min-h-[80px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddPrinciple();
                  }}
                />
                <Button size="sm" variant="outline" onClick={handleAddPrinciple} disabled={!newPrinciple.trim() || saving}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Ajouter le précepte
                </Button>
              </div>
            </TabsContent>

            {/* --- Résumé --- */}
            <TabsContent value="resume" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Résumé personnel</h3>
              <Textarea
                placeholder="Rédige ton résumé du livre..."
                value={summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                className="min-h-[200px] text-sm"
              />
              <p className="text-xs text-muted-foreground">Auto-sauvegarde après 1 seconde d'inactivité.</p>
            </TabsContent>

            {/* --- Concepts --- */}
            <TabsContent value="concepts" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Concepts clés ({(book.concepts ?? []).length})</h3>

              <div className="space-y-2.5">
                {(book.concepts ?? []).map((c) => (
                  <div key={c.id} className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                    {editingConceptId === c.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editConceptTitle}
                          onChange={(e) => setEditConceptTitle(e.target.value)}
                          placeholder="Titre du concept"
                          className="text-sm"
                        />
                        <Textarea
                          value={editConceptDesc}
                          onChange={(e) => setEditConceptDesc(e.target.value)}
                          placeholder="Description..."
                          className="min-h-[60px] text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveConcept} disabled={saving}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingConceptId(null)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{c.title}</p>
                          {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingConceptId(c.id); setEditConceptTitle(c.title); setEditConceptDesc(c.description); }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeConcept(book.id, c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <Input
                  placeholder="Titre du concept"
                  value={newConceptTitle}
                  onChange={(e) => setNewConceptTitle(e.target.value)}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Description (optionnelle)..."
                  value={newConceptDesc}
                  onChange={(e) => setNewConceptDesc(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleAddConcept} disabled={!newConceptTitle.trim() || saving}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter le concept
                </Button>
              </div>
            </TabsContent>

            {/* --- Notes --- */}
            <TabsContent value="notes" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Notes libres</h3>
              <Textarea
                placeholder="Tes notes libres sur le livre..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[250px] text-sm"
              />
              <p className="text-xs text-muted-foreground">Notes locales non synchronisées.</p>
            </TabsContent>

            {/* --- Questions --- */}
            <TabsContent value="questions" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Questions & Réponses ({(book.questions ?? []).length})</h3>

              <div className="space-y-2.5">
                {(book.questions ?? []).map((q) => (
                  <div key={q.id} className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1.5">
                    {editingQuestionId === q.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editQuestionContent}
                          onChange={(e) => setEditQuestionContent(e.target.value)}
                          placeholder="Question..."
                          className="min-h-[60px] text-sm"
                        />
                        <Textarea
                          value={editQuestionAnswer}
                          onChange={(e) => setEditQuestionAnswer(e.target.value)}
                          placeholder="Réponse..."
                          className="min-h-[60px] text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveQuestion} disabled={saving}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingQuestionId(null)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium">{q.content}</p>
                          {q.answer ? (
                            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">{q.answer}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Pas encore de réponse</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingQuestionId(q.id); setEditQuestionContent(q.content); setEditQuestionAnswer(q.answer ?? ""); }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeQuestion(book.id, q.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <Textarea
                  placeholder="Ta question sur le livre..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleAddQuestion} disabled={!newQuestion.trim() || saving}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter la question
                </Button>
              </div>
            </TabsContent>

            {/* --- Insights --- */}
            <TabsContent value="insights" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Insights ({(book.insights ?? []).length})</h3>

              <div className="space-y-2">
                {(book.insights ?? []).map((i) => (
                  <div key={i.id} className="rounded-xl border border-border bg-muted/30 p-3">
                    {editingInsightId === i.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editInsightContent}
                          onChange={(e) => setEditInsightContent(e.target.value)}
                          className="min-h-[60px] text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveInsight} disabled={saving}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingInsightId(null)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">{i.content}</p>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingInsightId(i.id); setEditInsightContent(i.content); }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeInsight(book.id, i.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <Textarea
                  placeholder="Un insight du livre..."
                  value={newInsight}
                  onChange={(e) => setNewInsight(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleAddInsight} disabled={!newInsight.trim() || saving}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter l'insight
                </Button>
              </div>
            </TabsContent>

            {/* --- Citations (depuis reader) --- */}
            <TabsContent value="citations" className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Citations surlignées ({citations.length})</h3>

              {citations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Surligne du texte dans le lecteur ePub et catégorise-le comme "Citation" pour les voir ici.
                </p>
              ) : (
                <div className="space-y-3">
                  {citations.map((a) => (
                    <div key={a.id} className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1.5">
                      <p className="text-sm italic border-l-2 border-amber-400 pl-3">"{a.text}"</p>
                      {a.note && <p className="text-xs text-muted-foreground pl-3">{a.note}</p>}
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

          </div>
        </Tabs>

        {/* Application réelle — sticky bottom */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shrink-0">
          <div>
            <p className="text-sm font-semibold">Application réelle</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              As-tu appliqué les préceptes de ce livre ?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={book.applied ? "default" : "outline"}
              onClick={() => setApplied(book.id, true)}
              className={cn(book.applied && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600")}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Oui
            </Button>
            <Button
              size="sm"
              variant={!book.applied ? "destructive" : "outline"}
              onClick={() => setApplied(book.id, false)}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Non
            </Button>
            {book.applied && (
              <span className="text-xs text-emerald-600 font-medium">
                Théorie → Pratique ✓
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
