import { prisma } from "@/lib/prisma/client";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";
import type { Charity } from "@prisma/client";

export type CreateCharityInput = {
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  isFeatured?: boolean;
};

export type UpdateCharityInput = Partial<CreateCharityInput & { isActive: boolean }>;

export async function listCharities(activeOnly = true) {
  return prisma.charity.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: {
      _count: { select: { usersSelected: true, contributions: true } },
      events: {
        where: { eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 3,
      },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
}

export async function getCharityBySlug(slug: string) {
  const charity = await prisma.charity.findUnique({
    where: { slug },
    include: {
      _count: { select: { usersSelected: true } },
      events: { orderBy: { eventDate: "asc" } },
    },
  });
  if (!charity) throw new NotFoundError("Charity");
  return charity;
}

export async function createCharity(input: CreateCharityInput): Promise<Charity> {
  const exists = await prisma.charity.findUnique({ where: { slug: input.slug } });
  if (exists) throw new ConflictError("A charity with this slug already exists.");

  return prisma.charity.create({ data: input });
}

export async function updateCharity(id: string, input: UpdateCharityInput): Promise<Charity> {
  const charity = await prisma.charity.findUnique({ where: { id } });
  if (!charity) throw new NotFoundError("Charity");

  if (input.slug && input.slug !== charity.slug) {
    const conflict = await prisma.charity.findUnique({ where: { slug: input.slug } });
    if (conflict) throw new ConflictError("A charity with this slug already exists.");
  }

  return prisma.charity.update({ where: { id }, data: input });
}

export async function deleteCharity(id: string): Promise<void> {
  const charity = await prisma.charity.findUnique({ where: { id } });
  if (!charity) throw new NotFoundError("Charity");
  // Soft delete — keeps historical contribution records intact
  await prisma.charity.update({ where: { id }, data: { isActive: false } });
}

/**
 * Record a charity contribution for a billing period.
 * Called from the Stripe webhook when a subscription renews.
 */
export async function recordContribution(
  userId: string,
  charityId: string,
  percentage: number,
  subscriptionAmountPence: number,
  billingPeriod: string
): Promise<void> {
  const amountPence = Math.round(subscriptionAmountPence * (percentage / 100));

  await prisma.charityContribution.create({
    data: { userId, charityId, percentage, amountPence, billingPeriod },
  });
}
