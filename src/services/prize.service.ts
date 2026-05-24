import { prisma } from "@/lib/prisma/client";

const PRIZE_POOL_PERCENTAGE = Number(process.env.PRIZE_POOL_PERCENTAGE ?? 60) / 100;
const MONTHLY_PRICE_PENCE = Number(process.env.MONTHLY_SUBSCRIPTION_PRICE_PENCE ?? 999);
const YEARLY_PRICE_PENCE = Number(process.env.YEARLY_SUBSCRIPTION_PRICE_PENCE ?? 9990);

// Monthly equivalent of yearly plan (for fair prize pool contribution)
const YEARLY_MONTHLY_EQUIVALENT = Math.round(YEARLY_PRICE_PENCE / 12);

const TIER_5_SHARE = 0.4;
const TIER_4_SHARE = 0.35;
const TIER_3_SHARE = 0.25;

export type PrizePoolBreakdown = {
  totalPence: number;
  tier5Pence: number;
  tier4Pence: number;
  tier3Pence: number;
  activeSubscribers: number;
  jackpotCarryover: number;
};

/**
 * Calculate prize pool for a given draw.
 *
 * Formula:
 *   contribution_per_user = monthly_equivalent × PRIZE_POOL_PERCENTAGE
 *   total = (contribution × active_subscribers) + jackpot_carryover
 */
export async function calculatePrizePool(
  drawId: string,
  jackpotCarryover = 0
): Promise<PrizePoolBreakdown> {
  // Count active subscribers at the time of calculation
  const activeSubscribers = await prisma.subscription.count({
    where: { status: "active" },
  });

  // Mixed plan pool — use monthly price equivalent for both
  const contributionPerUser = Math.round(MONTHLY_PRICE_PENCE * PRIZE_POOL_PERCENTAGE);
  const basePool = contributionPerUser * activeSubscribers;
  const totalPence = basePool + jackpotCarryover;

  const tier5Pence = Math.round(totalPence * TIER_5_SHARE);
  const tier4Pence = Math.round(totalPence * TIER_4_SHARE);
  const tier3Pence = totalPence - tier5Pence - tier4Pence; // absorbs rounding remainder

  return {
    totalPence,
    tier5Pence,
    tier4Pence,
    tier3Pence,
    activeSubscribers,
    jackpotCarryover,
  };
}

/**
 * Calculate per-winner prize amounts given winner counts per tier.
 */
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
  const isJackpotRolledOver = tier5Count === 0;

  return {
    perWinnerTier5: tier5Count > 0 ? Math.floor(pool.tier5Pence / tier5Count) : 0,
    perWinnerTier4: tier4Count > 0 ? Math.floor(pool.tier4Pence / tier4Count) : 0,
    perWinnerTier3: tier3Count > 0 ? Math.floor(pool.tier3Pence / tier3Count) : 0,
    isJackpotRolledOver,
  };
}

/**
 * Upsert prize pool record for a draw.
 */
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
