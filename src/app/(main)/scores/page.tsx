import type { Metadata } from "next";
import { ScoresClient } from "@/components/scores/ScoresClient";

export const metadata: Metadata = { title: "My Scores" };

export default function ScoresPage() {
  return <ScoresClient />;
}
