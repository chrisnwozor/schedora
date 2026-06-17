"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
  const date = new Date();
  date.setHours(hour, minute + minutesToAdd, 0, 0);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
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

  const date = new Date(`${appointmentDate}T00:00:00.000Z`);
  const dayOfWeek = date.getUTCDay();
  const endTime = addMinutesToTime(startTime, service.durationMinutes);

  const availability = await prisma.availabilityRule.findFirst({
    where: {
      businessId: business.id,
      staffMemberId: null,
      dayOfWeek,
    },
  });

  if (!availability || availability.isClosed) {
    fail(slug, "This business is closed on the selected date.");
  }

  if (startTime < availability.startTime || endTime > availability.endTime) {
    fail(slug, "Selected time is outside business availability.");
  }

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      businessId: business.id,
      date,
      startTime,
      status: {
        not: "CANCELLED",
      },
    },
  });

  if (existingAppointment) {
    fail(slug, "That time slot is already booked. Please choose another time.");
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const usage = await prisma.bookingUsage.findUnique({
    where: {
      businessId_month_year: {
        businessId: business.id,
        month,
        year,
      },
    },
  });

  const currentUsage = usage?.bookingCount ?? 0;
  const plan = business.subscription?.plan ?? "FREE";
  const limit = plan === "PRO" ? null : plan === "STARTER" ? 100 : 20;

  if (limit !== null && currentUsage >= limit) {
    fail(slug, "This business has reached its monthly booking limit.");
  }

  let customer = await prisma.customer.findFirst({
    where: {
      businessId: business.id,
      phone: customerPhone,
    },
  });

  if (customer) {
    customer = await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        name: customerName,
        email: customerEmail,
      },
    });
  } else {
    customer = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
    });
  }

  await prisma.$transaction([
    prisma.appointment.create({
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
    }),

    prisma.bookingUsage.upsert({
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
    }),
  ]);

  redirect(`/book/${slug}/success?name=${encodeURIComponent(customerName)}`);
}
