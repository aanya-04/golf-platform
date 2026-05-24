import { prisma } from "@/lib/prisma/client";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import type { Winner, WinnerProof } from "@prisma/client";

export async function getWinnersByUser(userId: string) {
  return prisma.winner.findMany({
    where: { userId },
    include: {
      draw: { include: { drawResult: true } },
      proofs: { orderBy: { submittedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function submitProof(winnerId: string, userId: string, proofUrl: string): Promise<WinnerProof> {
  const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
  if (!winner || winner.userId !== userId) throw new NotFoundError("Winner record");
  if (winner.payoutStatus === "paid") {
    throw new ValidationError("This prize has already been paid.");
  }

  const proof = await prisma.winnerProof.create({
    data: { winnerId, proofUrl, reviewStatus: "pending" },
  });

  // Move winner to verified-pending state
  await prisma.winner.update({
    where: { id: winnerId },
    data: { payoutStatus: "pending" },
  });

  return proof;
}

export async function reviewProof(
  proofId: string,
  decision: "approved" | "rejected",
  adminNote?: string
): Promise<WinnerProof> {
  const proof = await prisma.winnerProof.findUnique({
    where: { id: proofId },
    include: { winner: true },
  });
  if (!proof) throw new NotFoundError("Proof");

  const updated = await prisma.winnerProof.update({
    where: { id: proofId },
    data: {
      reviewStatus: decision,
      adminNote: adminNote ?? null,
      reviewedAt: new Date(),
    },
  });

  // Update winner payout status
  await prisma.winner.update({
    where: { id: proof.winnerId },
    data: {
      payoutStatus: decision === "approved" ? "verified" : "rejected",
      verifiedAt: decision === "approved" ? new Date() : null,
    },
  });

  return updated;
}

export async function markPaid(winnerId: string): Promise<Winner> {
  const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
  if (!winner) throw new NotFoundError("Winner");
  if (winner.payoutStatus !== "verified") {
    throw new ValidationError("Winner must be verified before marking as paid.");
  }

  return prisma.winner.update({
    where: { id: winnerId },
    data: { payoutStatus: "paid", paidAt: new Date() },
  });
}

export async function getAllWinners(page = 1, pageSize = 20) {
  const [winners, total] = await Promise.all([
    prisma.winner.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        draw: { select: { monthKey: true } },
        proofs: { orderBy: { submittedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.winner.count(),
  ]);

  return { winners, total, page, pageSize, hasMore: page * pageSize < total };
}
