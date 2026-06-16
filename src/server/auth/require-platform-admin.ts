import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/server/auth/get-current-db-user";

export async function requirePlatformAdmin() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.platformRole !== "PLATFORM_ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
