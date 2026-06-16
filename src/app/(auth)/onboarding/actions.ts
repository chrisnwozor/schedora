"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/server/auth/get-current-db-user";

function required(value: FormDataEntryValue | null, field: string) {
  if (!value || value.toString().trim().length === 0) {
    throw new Error(`${field} is required.`);
  }

  return value.toString().trim();
}

function optional(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text && text.length > 0 ? text : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createBusinessOnboardingAction(formData: FormData) {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  const name = required(formData.get("name"), "Business name");
  const businessType = required(formData.get("businessType"), "Business type");

  const baseSlug = slugify(required(formData.get("slug"), "Business slug"));

  if (!baseSlug) {
    throw new Error("Business slug is invalid.");
  }

  const existingBusiness = await prisma.business.findUnique({
    where: {
      slug: baseSlug,
    },
  });

  if (existingBusiness) {
    throw new Error("This booking link is already taken. Choose another slug.");
  }

  const business = await prisma.business.create({
    data: {
      name,
      slug: baseSlug,
      businessType,
      phone: optional(formData.get("phone")),
      email: optional(formData.get("email")),
      address: optional(formData.get("address")),
      description: optional(formData.get("description")),
      ownerUserId: user.id,
    },
  });

  await prisma.$transaction([
    prisma.businessMembership.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: "OWNER",
      },
    }),

    prisma.subscription.create({
      data: {
        businessId: business.id,
        plan: "FREE",
        status: "ACTIVE",
      },
    }),

    prisma.bookingUsage.create({
      data: {
        businessId: business.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bookingCount: 0,
      },
    }),

    ...[1, 2, 3, 4, 5].map((dayOfWeek) =>
      prisma.availabilityRule.create({
        data: {
          businessId: business.id,
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          isClosed: false,
        },
      }),
    ),

    prisma.availabilityRule.create({
      data: {
        businessId: business.id,
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "15:00",
        isClosed: false,
      },
    }),

    prisma.availabilityRule.create({
      data: {
        businessId: business.id,
        dayOfWeek: 0,
        startTime: "00:00",
        endTime: "00:00",
        isClosed: true,
      },
    }),
  ]);

  redirect("/dashboard");
}
