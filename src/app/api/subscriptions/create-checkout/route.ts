import { getAuthenticatedUser } from "@/services/auth.service";
import { createCheckoutSession } from "@/services/subscription.service";
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
      return Response.json({ error: "Invalid plan", code: "VALIDATION_ERROR" }, { status: 422 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const url = await createCheckoutSession(
      user.id,
      user.email,
      user.fullName,
      parsed.data.plan,
      `${appUrl}/dashboard?subscribed=true`,
      `${appUrl}/subscription`
    );

    return Response.json({ data: { url }, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}
