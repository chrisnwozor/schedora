import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Your Clerk account does not have an email address.");
  }

  const user = await prisma.user.upsert({
    where: {
      clerkUserId: userId,
    },
    update: {
      email,
      name: clerkUser.fullName,
    },
    create: {
      clerkUserId: userId,
      email,
      name: clerkUser.fullName,
    },
  });

  return user;
}
