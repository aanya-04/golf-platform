import { getAuthenticatedUser } from "@/services/auth.service";
import { createScore, getUserScores } from "@/services/score.service";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

const createScoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  scoreDate: z.string().datetime().or(z.string().date()),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const scores = await getUserScores(user.id);
    return Response.json({ data: scores, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json() as unknown;
    const parsed = createScoreSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const score = await createScore({
      userId: user.id,
      score: parsed.data.score,
      scoreDate: new Date(parsed.data.scoreDate),
    });

    return Response.json({ data: score, error: null }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
