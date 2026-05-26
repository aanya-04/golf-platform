import { resend, EMAIL_FROM } from "@/lib/email/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type DrawResultEmailInput = {
  to: string;
  userName: string;
  monthKey: string;
  drawnNumbers: number[];
  userScores: number[];
  matchCount: number;
  prizeAmount?: number;
};

type WinnerAlertEmailInput = {
  to: string;
  userName: string;
  prizeAmountPence: number;
  matchTier: number;
  drawMonth: string;
};

type SubscriptionEmailInput = {
  to: string;
  userName: string;
  plan: string;
  nextBillingDate: Date;
};

export async function sendDrawResultEmail(input: DrawResultEmailInput): Promise<void> {
  const isWinner = input.matchCount >= 3;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: input.to,
    subject: isWinner
      ? `🎉 You won in the ${input.monthKey} draw!`
      : `${input.monthKey} draw results are in`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">
          ${isWinner ? "🎉 Congratulations!" : "Draw Results"}
        </h1>
        <p>Hi ${input.userName},</p>
        <p>The ${input.monthKey} draw has been completed.</p>
        <h2>Drawn Numbers</h2>
        <p style="font-size: 24px; letter-spacing: 8px; font-weight: bold;">
          ${input.drawnNumbers.join(" · ")}
        </p>
        <h2>Your Scores</h2>
        <p>${input.userScores.map((s) =>
          `<span style="
            display:inline-block;
            padding:4px 12px;
            margin:4px;
            border-radius:999px;
            background:${input.drawnNumbers.includes(s) ? "#dcfce7" : "#f3f4f6"};
            color:${input.drawnNumbers.includes(s) ? "#15803d" : "#374151"};
            font-weight:${input.drawnNumbers.includes(s) ? "bold" : "normal"};
          ">${s}</span>`
        ).join("")}</p>
        <p><strong>Matches: ${input.matchCount}</strong></p>
        ${isWinner && input.prizeAmount
          ? `<p style="color:#16a34a;font-size:18px;">
              Prize: <strong>${formatCurrency(input.prizeAmount)}</strong>
            </p>
            <p>Please log in and upload your proof of scores to claim your prize.</p>`
          : `<p>Better luck next month!</p>`
        }
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;border-radius:8px;text-decoration:none;margin-top:16px;">
          View Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendWinnerAlert(input: WinnerAlertEmailInput): Promise<void> {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: input.to,
    subject: `Action required: Claim your ${formatCurrency(input.prizeAmountPence)} prize`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">🏆 You are a winner!</h1>
        <p>Hi ${input.userName},</p>
        <p>You matched <strong>${input.matchTier} numbers</strong> in the <strong>${input.drawMonth}</strong> draw.</p>
        <p style="font-size: 24px; color: #16a34a; font-weight: bold;">
          Prize: ${formatCurrency(input.prizeAmountPence)}
        </p>
        <ol>
          <li>Log in to your dashboard</li>
          <li>Navigate to My Winnings</li>
          <li>Upload a screenshot of your scores from your golf platform</li>
        </ol>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/winnings"
           style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;border-radius:8px;text-decoration:none;">
          Claim Prize
        </a>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmation(input: SubscriptionEmailInput): Promise<void> {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: input.to,
    subject: "Welcome — your subscription is active",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">You are in! 🎉</h1>
        <p>Hi ${input.userName},</p>
        <p>Your <strong>${input.plan}</strong> subscription is now active.</p>
        <p>Next billing date: <strong>${formatDate(input.nextBillingDate)}</strong></p>
        <ul>
          <li>Enter your golf scores</li>
          <li>Participate in monthly draws</li>
          <li>Support your chosen charity</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;border-radius:8px;text-decoration:none;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}
