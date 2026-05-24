import { getAuthenticatedUser } from "@/services/auth.service";
import { updateScore, deleteScore } from "@/services/score.service";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

const updateScoreSchema = z.object({
  score: z.number().int().min(1).max(45).optional(),
  scoreDate: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json() as unknown;
    const parsed = updateScoreSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const score = await updateScore(id, user.id, {
      score: parsed.data.score,
      scoreDate: parsed.data.scoreDate ? new Date(parsed.data.scoreDate) : undefined,
    });

    return Response.json({ data: score, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    await deleteScore(id, user.id);
    return Response.json({ data: { deleted: true }, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}
