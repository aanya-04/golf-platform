import { getAuthenticatedUser } from "@/services/auth.service";
import { createOrder } from "@/services/subscription.service";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json() as unknown;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid plan", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const order = await createOrder(user.id, parsed.data.plan);
    return Response.json({ data: order, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}
