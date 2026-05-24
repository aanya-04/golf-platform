import { prisma } from "@/lib/prisma/client";
import { calculatePrizePool, calculateWinnerPrizes, savePrizePool } from "./prize.service";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import { formatMonthKey } from "@/lib/utils/format";
import type { Draw, DrawEntry, Prisma } from "@prisma/client";
import type { DrawSimulationResult, DrawnNumbers, ScoreFrequencyMap } from "@/types/draw";

const SCORE_MIN = 1;
const SCORE_MAX = 45;
const DRAW_SIZE = 5;

// ─── Number Generation ────────────────────────────────────────────

function generateRandomNumbers(): DrawnNumbers {
  const pool = Array.from({ length: SCORE_MAX }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, DRAW_SIZE).sort((a, b) => a - b) as DrawnNumbers;
}

async function generateAlgorithmicNumbers(): Promise<DrawnNumbers> {
  const scores = await prisma.golfScore.findMany({
    where: { user: { subscription: { status: "active" } } },
    select: { score: true },
  });

  if (scores.length === 0) return generateRandomNumbers();

  const freqMap: ScoreFrequencyMap = {};
  for (const { score } of scores) {
    freqMap[score] = (freqMap[score] ?? 0) + 1;
  }

  const weightedPool: number[] = [];
  for (let n = SCORE_MIN; n <= SCORE_MAX; n++) {
    const weight = freqMap[n] ?? 1;
    for (let w = 0; w < weight; w++) {
      weightedPool.push(n);
    }
  }

  const selected = new Set<number>();
  const shuffled = [...weightedPool].sort(() => Math.random() - 0.5);

  for (const num of shuffled) {
    selected.add(num);
    if (selected.size === DRAW_SIZE) break;
  }

  const pool = Array.from({ length: SCORE_MAX }, (_, i) => i + 1).filter(
    (n) => !selected.has(n)
  );
  while (selected.size < DRAW_SIZE) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.add(pool.splice(idx, 1)[0]!);
  }

  return Array.from(selected).sort((a, b) => a - b) as DrawnNumbers;
}

// ─── Match Counting ───────────────────────────────────────────────

function countMatches(userScores: number[], drawnNumbers: DrawnNumbers): number {
  const drawnSet = new Set(drawnNumbers);
  return userScores.filter((s) => drawnSet.has(s)).length;
}

// ─── Draw Creation ────────────────────────────────────────────────

export async function createMonthlyDraw(mode: "random" | "algorithmic" = "random"): Promise<Draw> {
  const monthKey = formatMonthKey();

  const existing = await prisma.draw.findUnique({ where: { monthKey } });
  if (existing) throw new ConflictError(`A draw for ${monthKey} already exists.`);

  const previousDraw = await prisma.draw.findFirst({
    orderBy: { createdAt: "desc" },
    where: { status: "published" },
    select: { jackpotCarryover: true, prizePool: { select: { tier5Pence: true } } },
  });

  const jackpotCarryover =
    previousDraw?.jackpotCarryover && previousDraw.prizePool
      ? previousDraw.prizePool.tier5Pence
      : 0;

  return prisma.draw.create({
    data: { monthKey, drawMode: mode, jackpotCarryover, status: "pending" },
  });
}

// ─── Snapshot Entries ─────────────────────────────────────────────

type UserWithScores = {
  id: string;
  golfScores: { score: number }[];
};

export async function snapshotDrawEntries(drawId: string): Promise<number> {
  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) throw new NotFoundError("Draw");

  const activeUsers = await prisma.user.findMany({
    where: {
      subscription: { status: "active" },
      golfScores: { some: {} },
    },
    select: {
      id: true,
      golfScores: {
        orderBy: { entryOrder: "desc" },
        take: 5,
        select: { score: true },
      },
    },
  });

  const eligibleUsers = activeUsers.filter(
    (u: UserWithScores) => u.golfScores.length >= 3
  );

  await prisma.$transaction(
    eligibleUsers.map((user: UserWithScores) => {
      const scores = user.golfScores.map((s: { score: number }) => s.score);
      while (scores.length < 5) scores.push(0);

      return prisma.drawEntry.upsert({
        where: { userId_drawId: { userId: user.id, drawId } },
        create: {
          userId: user.id,
          drawId,
          score1: scores[0]!,
          score2: scores[1]!,
          score3: scores[2]!,
          score4: scores[3]!,
          score5: scores[4]!,
        },
        update: {
          score1: scores[0]!,
          score2: scores[1]!,
          score3: scores[2]!,
          score4: scores[3]!,
          score5: scores[4]!,
        },
      });
    })
  );

  return eligibleUsers.length;
}

// ─── Core Draw Execution ──────────────────────────────────────────

async function executeDraw(
  drawId: string,
  mode: "random" | "algorithmic"
): Promise<{ drawnNumbers: DrawnNumbers; entries: DrawEntry[] }> {
  const drawnNumbers =
    mode === "algorithmic"
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers();

  const entries = await prisma.drawEntry.findMany({ where: { drawId } });
  return { drawnNumbers, entries };
}

// ─── Simulation ───────────────────────────────────────────────────

export async function simulateDraw(drawId: string): Promise<DrawSimulationResult> {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId },
    include: { prizePool: true },
  });
  if (!draw) throw new NotFoundError("Draw");

  await snapshotDrawEntries(drawId);
  const { drawnNumbers, entries } = await executeDraw(drawId, draw.drawMode);
  const pool = await calculatePrizePool(drawId, draw.jackpotCarryover);

  const matchedEntries = entries.map((entry: DrawEntry) => ({
    entry,
    matchCount: countMatches(
      [entry.score1, entry.score2, entry.score3, entry.score4, entry.score5],
      drawnNumbers
    ),
  }));

  const tier5 = matchedEntries.filter((e) => e.matchCount === 5);
  const tier4 = matchedEntries.filter((e) => e.matchCount === 4);
  const tier3 = matchedEntries.filter((e) => e.matchCount === 3);
  const prizes = calculateWinnerPrizes(pool, tier5.length, tier4.length, tier3.length);

  return {
    drawnNumbers,
    winners: [
      { tier: 5, userIds: tier5.map((e) => e.entry.userId), prizePerWinner: prizes.perWinnerTier5, totalPrize: pool.tier5Pence },
      { tier: 4, userIds: tier4.map((e) => e.entry.userId), prizePerWinner: prizes.perWinnerTier4, totalPrize: pool.tier4Pence },
      { tier: 3, userIds: tier3.map((e) => e.entry.userId), prizePerWinner: prizes.perWinnerTier3, totalPrize: pool.tier3Pence },
    ],
    prizePool: { total: pool.totalPence, tier5: pool.tier5Pence, tier4: pool.tier4Pence, tier3: pool.tier3Pence, jackpotRollover: pool.jackpotCarryover },
    isJackpotRolledOver: prizes.isJackpotRolledOver,
    totalWinners: tier5.length + tier4.length + tier3.length,
  };
}

// ─── Official Draw Execution ──────────────────────────────────────

export async function runOfficialDraw(drawId: string): Promise<DrawSimulationResult> {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId },
    include: { prizePool: true },
  });

  if (!draw) throw new NotFoundError("Draw");
  if (draw.status === "completed" || draw.status === "published") {
    throw new ConflictError("Draw has already been executed.");
  }

  await snapshotDrawEntries(drawId);
  const { drawnNumbers, entries } = await executeDraw(drawId, draw.drawMode);
  const pool = await calculatePrizePool(drawId, draw.jackpotCarryover);
  await savePrizePool(drawId, pool);

  const matchedEntries = entries.map((entry: DrawEntry) => ({
    entry,
    matchCount: countMatches(
      [entry.score1, entry.score2, entry.score3, entry.score4, entry.score5],
      drawnNumbers
    ),
  }));

  const tier5 = matchedEntries.filter((e) => e.matchCount === 5);
  const tier4 = matchedEntries.filter((e) => e.matchCount === 4);
  const tier3 = matchedEntries.filter((e) => e.matchCount === 3);
  const prizes = calculateWinnerPrizes(pool, tier5.length, tier4.length, tier3.length);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.drawResult.upsert({
      where: { drawId },
      create: {
        drawId,
        number1: drawnNumbers[0],
        number2: drawnNumbers[1],
        number3: drawnNumbers[2],
        number4: drawnNumbers[3],
        number5: drawnNumbers[4],
        isSimulation: false,
      },
      update: {
        number1: drawnNumbers[0],
        number2: drawnNumbers[1],
        number3: drawnNumbers[2],
        number4: drawnNumbers[3],
        number5: drawnNumbers[4],
      },
    });

    await Promise.all(
      matchedEntries.map((e) =>
        tx.drawEntry.update({
          where: { id: e.entry.id },
          data: { matchCount: e.matchCount },
        })
      )
    );

    const winnerData = [
      ...tier5.map((e) => ({ tier: 5, entry: e.entry, prize: prizes.perWinnerTier5 })),
      ...tier4.map((e) => ({ tier: 4, entry: e.entry, prize: prizes.perWinnerTier4 })),
      ...tier3.map((e) => ({ tier: 3, entry: e.entry, prize: prizes.perWinnerTier3 })),
    ];

    await Promise.all(
      winnerData.map((w) =>
        tx.winner.upsert({
          where: { userId_drawId: { userId: w.entry.userId, drawId } },
          create: {
            userId: w.entry.userId,
            drawId,
            matchTier: w.tier,
            prizeAmountPence: w.prize,
            payoutStatus: "pending",
          },
          update: { matchTier: w.tier, prizeAmountPence: w.prize },
        })
      )
    );

    await tx.draw.update({
      where: { id: drawId },
      data: {
        status: "completed",
        drawnAt: new Date(),
        jackpotCarryover: prizes.isJackpotRolledOver ? pool.tier5Pence : 0,
      },
    });
  });

  return {
    drawnNumbers,
    winners: [
      { tier: 5, userIds: tier5.map((e) => e.entry.userId), prizePerWinner: prizes.perWinnerTier5, totalPrize: pool.tier5Pence },
      { tier: 4, userIds: tier4.map((e) => e.entry.userId), prizePerWinner: prizes.perWinnerTier4, totalPrize: pool.tier4Pence },
      { tier: 3, userIds: tier3.map((e) => e.entry.userId), prizePerWinner: prizes.perWinnerTier3, totalPrize: pool.tier3Pence },
    ],
    prizePool: { total: pool.totalPence, tier5: pool.tier5Pence, tier4: pool.tier4Pence, tier3: pool.tier3Pence, jackpotRollover: pool.jackpotCarryover },
    isJackpotRolledOver: prizes.isJackpotRolledOver,
    totalWinners: tier5.length + tier4.length + tier3.length,
  };
}

export async function publishDraw(drawId: string): Promise<Draw> {
  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) throw new NotFoundError("Draw");
  if (draw.status !== "completed") {
    throw new ValidationError("Draw must be in completed status before publishing.");
  }
  return prisma.draw.update({
    where: { id: drawId },
    data: { status: "published", publishedAt: new Date() },
  });
}

export async function getPublishedDraws(page = 1, pageSize = 10) {
  const [draws, total] = await Promise.all([
    prisma.draw.findMany({
      where: { status: "published" },
      include: {
        drawResult: true,
        prizePool: true,
        _count: { select: { drawEntries: true, winners: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.draw.count({ where: { status: "published" } }),
  ]);

  return { draws, total, page, pageSize, hasMore: page * pageSize < total };
}
