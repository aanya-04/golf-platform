import { getAuthenticatedUser } from "@/services/auth.service";
import { verifyAndActivate } from "@/services/subscription.service";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json() as unknown;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const subscription = await verifyAndActivate(
      user.id,
      parsed.data.plan,
      parsed.data.razorpayOrderId,
      parsed.data.razorpayPaymentId,
      parsed.data.razorpaySignature
    );

    return Response.json({ data: subscription, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}
