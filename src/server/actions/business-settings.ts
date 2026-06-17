"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { isValidTimeZone } from "@/lib/time-zones";
import { getActiveBusiness } from "@/server/business/get-active-business";

export async function updateBusinessTimeZoneAction(formData: FormData) {
  const { business, role } = await getActiveBusiness();

  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error(
      "Only a business owner or administrator can change the timezone.",
    );
  }

  const timeZone = formData.get("timeZone")?.toString().trim();

  if (!timeZone) {
    throw new Error("Timezone is required.");
  }

  if (!isValidTimeZone(timeZone)) {
    throw new Error("Select a valid timezone.");
  }

  await prisma.business.update({
    where: {
      id: business.id,
    },
    data: {
      timeZone,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/appointments");
  revalidatePath("/appointments/new");
  revalidatePath(`/book/${business.slug}`);
}
