import { prisma } from "@/lib/prisma";

const DEMO_BUSINESS_SLUG = "glowbarbershop";

export async function getDemoBusiness() {
  const business = await prisma.business.findUnique({
    where: {
      slug: DEMO_BUSINESS_SLUG,
    },
  });

  if (!business) {
    throw new Error("Demo business not found. Run `npx prisma db seed` first.");
  }

  return business;
}
