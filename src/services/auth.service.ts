import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/server";
import { AuthError, NotFoundError } from "@/lib/utils/errors";
import type { User, UserRole } from "@prisma/client";

export type CreateUserInput = {
  supabaseId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
};

/**
 * Called after Supabase confirms signup.
 * Creates the user record in our Postgres DB.
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      supabaseId: input.supabaseId,
      email: input.email,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl ?? null,
      role: "subscriber",
      charityPercentage: 10,
    },
  });
}

/**
 * Fetch our DB user from a Supabase user ID.
 * Used in every API route to get the full user record.
 */
export async function getUserBySupabaseId(supabaseId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { supabaseId },
  });
}

/**
 * Get the authenticated user from the current request.
 * Throws AuthError if not authenticated.
 * Throws NotFoundError if the user exists in Supabase but not in our DB.
 */
export async function getAuthenticatedUser(): Promise<User> {
  const supabase = await createAdminClient();
  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    throw new AuthError("Not authenticated");
  }

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) {
    throw new NotFoundError("User profile");
  }

  return user;
}

/**
 * Require admin role — throws ForbiddenError if not admin.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAuthenticatedUser();
  if (user.role !== "admin") {
    throw new AuthError("Admin access required");
  }
  return user;
}

/**
 * Update user profile fields.
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, "fullName" | "avatarUrl" | "charityPercentage" | "selectedCharityId">>
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Set admin role — used during seeding or manual promotion.
 */
export async function setUserRole(userId: string, role: UserRole): Promise<User> {
  // Also update Supabase user metadata so middleware can read it without a DB hit
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  const supabase = await createAdminClient();
  await supabase.auth.admin.updateUserById(user.supabaseId, {
    user_metadata: { role },
  });

  return user;
}
