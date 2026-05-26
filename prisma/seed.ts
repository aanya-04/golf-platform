import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed charities
  const charities = [
    {
      name: "Macmillan Cancer Support",
      slug: "macmillan-cancer-support",
      description: "We provide specialist health care, information and financial support to people affected by cancer.",
      websiteUrl: "https://www.macmillan.org.uk",
      isFeatured: true,
    },
    {
      name: "British Heart Foundation",
      slug: "british-heart-foundation",
      description: "We fund life-saving research into heart and circulatory diseases.",
      websiteUrl: "https://www.bhf.org.uk",
      isFeatured: false,
    },
    {
      name: "Age UK",
      slug: "age-uk",
      description: "We work to improve later life for everyone through our information, advice, services, and research.",
      websiteUrl: "https://www.ageuk.org.uk",
      isFeatured: false,
    },
    {
      name: "Mind",
      slug: "mind",
      description: "We provide advice and support to empower anyone experiencing a mental health problem.",
      websiteUrl: "https://www.mind.org.uk",
      isFeatured: false,
    },
  ];

  for (const charity of charities) {
    await prisma.charity.upsert({
      where: { slug: charity.slug },
      create: charity,
      update: charity,
    });
  }

  console.log(`✓ Seeded ${charities.length} charities`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
