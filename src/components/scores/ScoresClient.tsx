"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useScores, useCreateScore, useUpdateScore, useDeleteScore } from "@/hooks/use-scores";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Target, Plus, Pencil, Trash2, Loader2, Info } from "lucide-react";

const scoreSchema = z.object({
  score: z.coerce.number().int().min(1, "Min score is 1").max(45, "Max score is 45"),
  scoreDate: z.string().min(1, "Date is required"),
});

type ScoreFormData = z.infer<typeof scoreSchema>;

type Score = {
  id: string;
  score: number;
  scoreDate: string;
  entryOrder: number;
};

export function ScoresClient() {
  const { data: scores, isLoading } = useScores();
  const createScore = useCreateScore();
  const updateScore = useUpdateScore();
  const deleteScore = useDeleteScore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<ScoreFormData>({ resolver: zodResolver(scoreSchema) });
  const editForm = useForm<ScoreFormData>({ resolver: zodResolver(scoreSchema) });

  function onAdd(data: ScoreFormData) {
    createScore.mutate(
      { score: data.score, scoreDate: new Date(data.scoreDate).toISOString() },
      { onSuccess: () => form.reset() }
    );
  }

  function startEdit(score: Score) {
    setEditingId(score.id);
    editForm.setValue("score", score.score);
    editForm.setValue("scoreDate", score.scoreDate.split("T")[0] ?? "");
  }

  function onEdit(data: ScoreFormData) {
    if (!editingId) return;
    updateScore.mutate(
      { id: editingId, data: { score: data.score, scoreDate: new Date(data.scoreDate).toISOString() } },
      { onSuccess: () => setEditingId(null) }
    );
  }

  if (isLoading) return <CardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">My Golf Scores</h1>
        <p className="text-muted-foreground mt-1">
          Enter your Stableford scores. Only your latest 5 are kept.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Rolling 5-score system:</strong> When you add a 6th score, the oldest is automatically removed. One score per date only.
        </div>
      </div>

      {/* Add score form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onAdd)} className="flex gap-3 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[120px]">
              <Label>Score (1–45)</Label>
              <Input
                type="number"
                placeholder="e.g. 32"
                min={1}
                max={45}
                {...form.register("score")}
              />
              {form.formState.errors.score && (
                <p className="text-xs text-destructive">{form.formState.errors.score.message}</p>
              )}
            </div>
            <div className="space-y-1 flex-1 min-w-[160px]">
              <Label>Date played</Label>
              <Input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...form.register("scoreDate")}
              />
              {form.formState.errors.scoreDate && (
                <p className="text-xs text-destructive">{form.formState.errors.scoreDate.message}</p>
              )}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createScore.isPending}>
                {createScore.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="ml-1">Add</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Score list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Current Scores
            </span>
            <Badge variant="secondary">{scores?.length ?? 0}/5</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scores || scores.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No scores yet"
              description="Add your first Stableford score above to get started."
            />
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {scores.map((score: Score, index: number) => (
                  <motion.div
                    key={score.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {editingId === score.id ? (
                      <form
                        onSubmit={editForm.handleSubmit(onEdit)}
                        className="flex gap-2 items-end rounded-xl border border-primary/30 bg-primary/5 p-3 flex-wrap"
                      >
                        <div className="space-y-1 flex-1 min-w-[100px]">
                          <Label className="text-xs">Score</Label>
                          <Input type="number" min={1} max={45} {...editForm.register("score")} />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[140px]">
                          <Label className="text-xs">Date</Label>
                          <Input type="date" {...editForm.register("scoreDate")} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={updateScore.isPending}>
                            {updateScore.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-muted/50 hover:bg-muted transition-colors px-4 py-3">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-primary w-8 text-center">
                            {score.score}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{formatDate(score.scoreDate)}</p>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs mt-0.5">Latest</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(score)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(score.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this score?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The score will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  deleteScore.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
