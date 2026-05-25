import { getAuthenticatedUser } from "@/services/auth.service";
import { createPortalSession } from "@/services/subscription.service";
import { handleApiError } from "@/lib/utils/errors";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    const url = await createPortalSession(
      user.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/subscription`
    );
    return Response.json({ data: { url }, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}
