"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function required(value: FormDataEntryValue | null, field: string) {
  if (!value || value.toString().trim().length === 0) {
    throw new Error(`${field} is required.`);
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
  const slug = required(formData.get("slug"), "Business slug");
  const serviceId = required(formData.get("serviceId"), "Service");
  const appointmentDate = required(formData.get("date"), "Date");
  const startTime = required(formData.get("startTime"), "Start time");
  const customerName = required(formData.get("customerName"), "Customer name");
  const customerPhone = required(formData.get("customerPhone"), "Phone number");
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
    throw new Error("This business is not available for booking.");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
      isActive: true,
    },
  });

  if (!service) {
    throw new Error("Selected service is not available.");
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
    throw new Error("This business is closed on the selected date.");
  }

  if (startTime < availability.startTime || endTime > availability.endTime) {
    throw new Error("Selected time is outside business availability.");
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
    throw new Error("That time slot is already booked.");
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
    throw new Error("This business has reached its monthly booking limit.");
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
