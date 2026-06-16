import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/server/auth/get-current-db-user";

export async function getActiveBusiness() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  const membership = await prisma.businessMembership.findFirst({
    where: {
      userId: user.id,
    },
    include: {
      business: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  return {
    user,
    business: membership.business,
    role: membership.role,
  };
}
