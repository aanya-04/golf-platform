import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default async function DrawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draw = await prisma.draw.findUnique({
    where: { id },
    include: { drawResult: true, prizePool: true, _count: { select: { winners: true, drawEntries: true } } },
  });

  if (!draw || draw.status !== "published") notFound();

  const numbers = draw.drawResult
    ? [draw.drawResult.number1, draw.drawResult.number2, draw.drawResult.number3, draw.drawResult.number4, draw.drawResult.number5]
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{draw.monthKey} Draw</h1>
        <Badge variant="secondary" className="mt-1">Published</Badge>
      </div>

      {numbers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" />Drawn Numbers</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {numbers.map((n, i) => (
                <div key={i} className="h-12 w-12 rounded-full gradient-brand text-white text-lg font-bold flex items-center justify-center">
                  {n}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {draw.prizePool && (
        <Card>
          <CardHeader><CardTitle>Prize Pool</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "5-match jackpot", amount: draw.prizePool.tier5Pence },
              { label: "4-match prize", amount: draw.prizePool.tier4Pence },
              { label: "3-match prize", amount: draw.prizePool.tier3Pence },
            ].map((tier) => (
              <div key={tier.label} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm font-medium">{tier.label}</span>
                <span className="font-bold text-primary">{formatCurrency(tier.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 text-center">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{draw._count.drawEntries}</p><p className="text-xs text-muted-foreground mt-1">Entries</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{draw._count.winners}</p><p className="text-xs text-muted-foreground mt-1">Winners</p></CardContent></Card>
      </div>
    </div>
  );
}
