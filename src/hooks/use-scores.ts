import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Score = {
  id: string;
  score: number;
  scoreDate: string;
  entryOrder: number;
  createdAt: string;
};

async function fetchScores(): Promise<Score[]> {
  const res = await fetch("/api/scores");
  const json = await res.json() as { data: Score[]; error: string | null };
  if (!res.ok) throw new Error(json.error ?? "Failed to fetch scores");
  return json.data;
}

async function createScore(data: { score: number; scoreDate: string }): Promise<Score> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json() as { data: Score; error: string | null };
  if (!res.ok) throw new Error(json.error ?? "Failed to create score");
  return json.data;
}

async function updateScore(id: string, data: { score?: number; scoreDate?: string }): Promise<Score> {
  const res = await fetch(`/api/scores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json() as { data: Score; error: string | null };
  if (!res.ok) throw new Error(json.error ?? "Failed to update score");
  return json.data;
}

async function deleteScore(id: string): Promise<void> {
  const res = await fetch(`/api/scores/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json() as { error: string };
    throw new Error(json.error ?? "Failed to delete score");
  }
}

export function useScores() {
  return useQuery({ queryKey: ["scores"], queryFn: fetchScores });
}

export function useCreateScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createScore,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["scores"] });
      toast.success("Score added successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { score?: number; scoreDate?: string } }) =>
      updateScore(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["scores"] });
      toast.success("Score updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteScore,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["scores"] });
      toast.success("Score deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
