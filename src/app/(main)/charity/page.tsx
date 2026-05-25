import type { Metadata } from "next";
import { listCharities } from "@/services/charity.service";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "Charities" };

export default async function CharityPage() {
  const charities = await listCharities(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Supported Charities</h1>
      {charities.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No charities listed yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {charities.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
