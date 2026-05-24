import { prisma } from "@/lib/prisma/client";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import type { GolfScore, Prisma } from "@prisma/client";

const MAX_SCORES = 5;
const MIN_SCORE = 1;
const MAX_SCORE = 45;

export type CreateScoreInput = {
  userId: string;
  score: number;
  scoreDate: Date;
};

export type UpdateScoreInput = {
  score?: number;
  scoreDate?: Date;
};

function validateScore(score: number): void {
  if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
    throw new ValidationError(
      `Score must be a whole number between ${MIN_SCORE} and ${MAX_SCORE} (Stableford format)`
    );
  }
}

export async function getUserScores(userId: string): Promise<GolfScore[]> {
  return prisma.golfScore.findMany({
    where: { userId },
    orderBy: { entryOrder: "desc" },
  });
}

export async function createScore(input: CreateScoreInput): Promise<GolfScore> {
  validateScore(input.score);

  const scoreDate = new Date(input.scoreDate);
  scoreDate.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.golfScore.findUnique({
    where: { userId_scoreDate: { userId: input.userId, scoreDate } },
  });

  if (existing) {
    throw new ConflictError(
      "A score already exists for this date. Edit the existing entry instead."
    );
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const currentScores = await tx.golfScore.findMany({
      where: { userId: input.userId },
      orderBy: { entryOrder: "asc" },
    });

    if (currentScores.length >= MAX_SCORES) {
      const oldest = currentScores[0];
      if (oldest) {
        await tx.golfScore.delete({ where: { id: oldest.id } });
      }
    }

    const maxOrder =
      currentScores.length > 0
        ? Math.max(...currentScores.map((s: GolfScore) => s.entryOrder))
        : 0;

    return tx.golfScore.create({
      data: {
        userId: input.userId,
        score: input.score,
        scoreDate,
        entryOrder: maxOrder + 1,
      },
    });
  });
}

export async function updateScore(
  scoreId: string,
  userId: string,
  input: UpdateScoreInput
): Promise<GolfScore> {
  const existing = await prisma.golfScore.findUnique({ where: { id: scoreId } });

  if (!existing || existing.userId !== userId) {
    throw new NotFoundError("Score");
  }

  if (input.score !== undefined) {
    validateScore(input.score);
  }

  if (input.scoreDate) {
    const newDate = new Date(input.scoreDate);
    newDate.setUTCHours(0, 0, 0, 0);

    if (newDate.getTime() !== existing.scoreDate.getTime()) {
      const conflict = await prisma.golfScore.findUnique({
        where: { userId_scoreDate: { userId, scoreDate: newDate } },
      });
      if (conflict) {
        throw new ConflictError("A score already exists for this date.");
      }
    }

    input.scoreDate = newDate;
  }

  return prisma.golfScore.update({
    where: { id: scoreId },
    data: {
      ...(input.score !== undefined && { score: input.score }),
      ...(input.scoreDate && { scoreDate: input.scoreDate }),
    },
  });
}

export async function deleteScore(scoreId: string, userId: string): Promise<void> {
  const existing = await prisma.golfScore.findUnique({ where: { id: scoreId } });

  if (!existing || existing.userId !== userId) {
    throw new NotFoundError("Score");
  }

  await prisma.golfScore.delete({ where: { id: scoreId } });
}

export async function getUserScoreValues(userId: string): Promise<number[]> {
  const scores = await prisma.golfScore.findMany({
    where: { userId },
    orderBy: { entryOrder: "desc" },
    take: MAX_SCORES,
    select: { score: true },
  });
  return scores.map((s: { score: number }) => s.score);
}
