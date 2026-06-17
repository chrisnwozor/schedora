"use server";

import { redirect } from "next/navigation";

import { getMonthKeyInTimeZone, parseDateInputAsUtc } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import {
  getAvailableSlotsForBooking,
  type SlotResult,
} from "@/server/booking/slots";

function fail(slug: string, message: string): never {
  redirect(`/book/${slug}?error=${encodeURIComponent(message)}`);
}

function requiredForBooking(
  value: FormDataEntryValue | null,
  field: string,
  slug: string,
) {
  if (!value || value.toString().trim().length === 0) {
    fail(slug, `${field} is required.`);
  }

  return value.toString().trim();
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + minutesToAdd;

  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
    totalMinutes % 60,
  ).padStart(2, "0")}`;
}

export async function getAvailableSlotsAction(input: {
  slug: string;
  serviceId: string;
  date: string;
}): Promise<SlotResult> {
  return getAvailableSlotsForBooking(input);
}

export async function createPublicBooking(formData: FormData) {
  const rawSlug = formData.get("slug")?.toString().trim();

  if (!rawSlug) {
    redirect("/");
  }

  const slug = rawSlug;

  const serviceId = requiredForBooking(
    formData.get("serviceId"),
    "Service",
    slug,
  );

  const appointmentDate = requiredForBooking(
    formData.get("date"),
    "Date",
    slug,
  );

  const startTime = requiredForBooking(
    formData.get("startTime"),
    "Start time",
    slug,
  );

  const customerName = requiredForBooking(
    formData.get("customerName"),
    "Customer name",
    slug,
  );

  const customerPhone = requiredForBooking(
    formData.get("customerPhone"),
    "Phone number",
    slug,
  );

  const customerEmail =
    formData.get("customerEmail")?.toString().trim() || null;

  const notes = formData.get("notes")?.toString().trim() || null;

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    include: {
      subscription: true,
    },
  });

  if (!business || business.status !== "ACTIVE") {
    fail(slug, "This business is not available for booking.");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
      isActive: true,
    },
  });

  if (!service) {
    fail(slug, "Selected service is not available.");
  }

  const slotResult = await getAvailableSlotsForBooking({
    slug,
    serviceId,
    date: appointmentDate,
  });

  const selectedSlotIsAvailable = slotResult.slots.some(
    (slot) => slot.value === startTime,
  );

  if (!selectedSlotIsAvailable) {
    fail(
      slug,
      slotResult.message ??
        "That time is no longer available. Please choose another time.",
    );
  }

  const date = parseDateInputAsUtc(appointmentDate);

  if (!date) {
    fail(slug, "Choose a valid appointment date.");
  }

  const endTime = addMinutesToTime(startTime, service.durationMinutes);

  const { month, year } = getMonthKeyInTimeZone(business.timeZone);

  const plan = business.subscription?.plan ?? "FREE";

  const limit = plan === "PRO" ? null : plan === "STARTER" ? 100 : 20;

  try {
    await prisma.$transaction(
      async (tx) => {
        const conflictingAppointment = await tx.appointment.findFirst({
          where: {
            businessId: business.id,
            date,
            status: {
              not: "CANCELLED",
            },
            startTime: {
              lt: endTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          select: {
            id: true,
          },
        });

        if (conflictingAppointment) {
          throw new Error("SLOT_TAKEN");
        }

        const usage = await tx.bookingUsage.findUnique({
          where: {
            businessId_month_year: {
              businessId: business.id,
              month,
              year,
            },
          },
          select: {
            bookingCount: true,
          },
        });

        if (limit !== null && (usage?.bookingCount ?? 0) >= limit) {
          throw new Error("LIMIT_REACHED");
        }

        const existingCustomer = await tx.customer.findFirst({
          where: {
            businessId: business.id,
            phone: customerPhone,
          },
        });

        const customer = existingCustomer
          ? await tx.customer.update({
              where: {
                id: existingCustomer.id,
              },
              data: {
                name: customerName,
                email: customerEmail,
              },
            })
          : await tx.customer.create({
              data: {
                businessId: business.id,
                name: customerName,
                phone: customerPhone,
                email: customerEmail,
              },
            });

        await tx.appointment.create({
          data: {
            businessId: business.id,
            customerId: customer.id,
            serviceId: service.id,
            date,
            startTime,
            endTime,
            status: "PENDING",
            notes,
          },
        });

        await tx.bookingUsage.upsert({
          where: {
            businessId_month_year: {
              businessId: business.id,
              month,
              year,
            },
          },
          update: {
            bookingCount: {
              increment: 1,
            },
          },
          create: {
            businessId: business.id,
            month,
            year,
            bookingCount: 1,
          },
        });
      },
      {
        isolationLevel: "Serializable",
      },
    );
  } catch (caught) {
    const errorMessage =
      caught instanceof Error ? caught.message : "UNKNOWN_ERROR";

    const prismaCode =
      typeof caught === "object" && caught !== null && "code" in caught
        ? String(caught.code)
        : null;

    if (errorMessage === "LIMIT_REACHED") {
      fail(slug, "This business has reached its monthly booking limit.");
    }

    if (errorMessage === "SLOT_TAKEN" || prismaCode === "P2034") {
      fail(
        slug,
        "That time was just booked by someone else. Please choose another time.",
      );
    }

    fail(slug, "We could not complete the booking. Please try again.");
  }

  redirect(`/book/${slug}/success?name=${encodeURIComponent(customerName)}`);
}
