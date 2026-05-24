export type DrawMode = "random" | "algorithmic";
export type DrawStatus = "pending" | "simulated" | "completed" | "published";
export type MatchTier = 3 | 4 | 5;
export type PayoutStatus = "pending" | "verified" | "paid" | "rejected";

export type DrawnNumbers = [number, number, number, number, number];

export type DrawSimulationResult = {
  drawnNumbers: DrawnNumbers;
  winners: {
    tier: MatchTier;
    userIds: string[];
    prizePerWinner: number;
    totalPrize: number;
  }[];
  prizePool: {
    total: number;
    tier5: number;
    tier4: number;
    tier3: number;
    jackpotRollover: number;
  };
  isJackpotRolledOver: boolean;
  totalWinners: number;
};

export type ScoreFrequencyMap = Record<number, number>;
