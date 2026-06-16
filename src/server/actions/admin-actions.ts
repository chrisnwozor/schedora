"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/server/auth/require-platform-admin";

function required(value: FormDataEntryValue | null, field: string) {
  if (!value || value.toString().trim().length === 0) {
    throw new Error(`${field} is required.`);
  }

  return value.toString().trim();
}

export async function updateBusinessStatusAction(formData: FormData) {
  await requirePlatformAdmin();

  const businessId = required(formData.get("businessId"), "Business ID");
  const status = required(formData.get("status"), "Business status");

  if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
    throw new Error("Invalid business status.");
  }

  await prisma.business.update({
    where: {
      id: businessId,
    },
    data: {
      status: status as "ACTIVE" | "SUSPENDED" | "INACTIVE",
    },
  });

  revalidatePath("/admin/overview");
  revalidatePath("/admin/businesses");
}

export async function changeSubscriptionPlanAction(formData: FormData) {
  await requirePlatformAdmin();

  const businessId = required(formData.get("businessId"), "Business ID");
  const plan = required(formData.get("plan"), "Subscription plan");

  if (!["FREE", "STARTER", "PRO"].includes(plan)) {
    throw new Error("Invalid subscription plan.");
  }

  await prisma.subscription.upsert({
    where: {
      businessId,
    },
    update: {
      plan: plan as "FREE" | "STARTER" | "PRO",
      status: "ACTIVE",
    },
    create: {
      businessId,
      plan: plan as "FREE" | "STARTER" | "PRO",
      status: "ACTIVE",
    },
  });

  revalidatePath("/admin/overview");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/subscriptions");
}
