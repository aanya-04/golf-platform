import { getAuthenticatedUser } from "@/services/auth.service";
import { cancelSubscription } from "@/services/subscription.service";
import { handleApiError } from "@/lib/utils/errors";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    const subscription = await cancelSubscription(user.id);
    return Response.json({ data: subscription, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}
