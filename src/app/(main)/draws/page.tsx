import type { Metadata } from "next";
import { getPublishedDraws } from "@/services/draw.service";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar } from "lucide-react";

export const metadata: Metadata = { title: "Draws" };

export default async function DrawsPage() {
  const { draws } = await getPublishedDraws(1, 20);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Monthly Draws</h1>
      {draws.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No draws published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw) => (
            <Link key={draw.id} href={`/draws/${draw.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {draw.monthKey}
                    </p>
                    {draw.drawResult && (
                      <div className="flex gap-1.5 mt-2">
                        {[draw.drawResult.number1, draw.drawResult.number2, draw.drawResult.number3, draw.drawResult.number4, draw.drawResult.number5].map((n, i) => (
                          <span key={i} className="h-7 w-7 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {draw.prizePool && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Prize pool</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(draw.prizePool.totalPence)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
