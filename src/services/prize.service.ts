import { prisma } from "@/lib/prisma/client";

const PRIZE_POOL_PERCENTAGE = Number(process.env.PRIZE_POOL_PERCENTAGE ?? 60) / 100;
const MONTHLY_PRICE_PENCE = Number(process.env.MONTHLY_PRICE_PENCE ?? 999);

const TIER_5_SHARE = 0.4;
const TIER_4_SHARE = 0.35;

export type PrizePoolBreakdown = {
  totalPence: number;
  tier5Pence: number;
  tier4Pence: number;
  tier3Pence: number;
  activeSubscribers: number;
  jackpotCarryover: number;
};

export async function calculatePrizePool(
  drawId: string,
  jackpotCarryover = 0
): Promise<PrizePoolBreakdown> {
  const activeSubscribers = await prisma.subscription.count({
    where: { status: "active" },
  });

  const contributionPerUser = Math.round(MONTHLY_PRICE_PENCE * PRIZE_POOL_PERCENTAGE);
  const basePool = contributionPerUser * activeSubscribers;
  const totalPence = basePool + jackpotCarryover;

  const tier5Pence = Math.round(totalPence * TIER_5_SHARE);
  const tier4Pence = Math.round(totalPence * TIER_4_SHARE);
  const tier3Pence = totalPence - tier5Pence - tier4Pence;

  return {
    totalPence,
    tier5Pence,
    tier4Pence,
    tier3Pence,
    activeSubscribers,
    jackpotCarryover,
  };
}

export function calculateWinnerPrizes(
  pool: PrizePoolBreakdown,
  tier5Count: number,
  tier4Count: number,
  tier3Count: number
): {
  perWinnerTier5: number;
  perWinnerTier4: number;
  perWinnerTier3: number;
  isJackpotRolledOver: boolean;
} {
  return {
    perWinnerTier5: tier5Count > 0 ? Math.floor(pool.tier5Pence / tier5Count) : 0,
    perWinnerTier4: tier4Count > 0 ? Math.floor(pool.tier4Pence / tier4Count) : 0,
    perWinnerTier3: tier3Count > 0 ? Math.floor(pool.tier3Pence / tier3Count) : 0,
    isJackpotRolledOver: tier5Count === 0,
  };
}

export async function savePrizePool(
  drawId: string,
  pool: PrizePoolBreakdown
): Promise<void> {
  await prisma.prizePool.upsert({
    where: { drawId },
    create: { drawId, ...pool },
    update: pool,
  });
}
