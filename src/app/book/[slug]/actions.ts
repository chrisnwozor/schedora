"use server";

import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";

import { getMonthKeyInTimeZone, parseDateInputAsUtc } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import {
  bookingRequestedCustomerTemplate,
  newBookingOwnerTemplate,
} from "@/server/email/appointment-templates";
import {
  deliverEmailDeliveries,
  queueEmailDelivery,
} from "@/server/email/delivery";
import {
  getAvailableSlotsForBooking,
  type SlotResult,
} from "@/server/booking/slots";
import {
  checkPublicRateLimit,
  getPublicRequestContext,
  recordPublicBotTrap,
} from "@/server/security/public-rate-limit";

function fail(slug: string, message: string): never {
  redirect(`/book/${slug}?error=${encodeURIComponent(message)}#booking-error`);
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

function normalizeContact(value: string) {
  return value.toLowerCase().replaceAll(" ", "");
}

export async function getAvailableSlotsAction(input: {
  slug: string;
  serviceId: string;
  date: string;
}): Promise<SlotResult> {
  const context = await getPublicRequestContext();

  const ipLimit = await checkPublicRateLimit({
    action: "SLOT_LOOKUP_IP",
    identifier: `slot-ip:${context.ipAddress}:${input.slug}`,
    context,
    slug: input.slug,
    maxAttempts: 80,
    windowSeconds: 10 * 60,
    blockedMessage:
      "Too many availability checks. Please wait a few minutes and try again.",
  });

  if (!ipLimit.allowed) {
    logger.warn("booking.slots.rate_limited_ip", {
      slug: input.slug,
      ipHash: context.ipHash,
    });

    return {
      slots: [],
      message: ipLimit.message,
    };
  }

  const tenantLimit = await checkPublicRateLimit({
    action: "SLOT_LOOKUP_TENANT",
    identifier: `slot-tenant:${input.slug}`,
    context,
    slug: input.slug,
    maxAttempts: 600,
    windowSeconds: 10 * 60,
    blockedMessage:
      "This booking page is receiving too many requests. Please try again shortly.",
  });

  if (!tenantLimit.allowed) {
    logger.warn("booking.slots.rate_limited_tenant", {
      slug: input.slug,
      ipHash: context.ipHash,
    });

    return {
      slots: [],
      message: tenantLimit.message,
    };
  }

  return getAvailableSlotsForBooking(input);
}

export async function createPublicBooking(formData: FormData) {
  const rawSlug = formData.get("slug")?.toString().trim();

  if (!rawSlug) {
    redirect("/");
  }

  const slug = rawSlug;
  const context = await getPublicRequestContext();

  const honeypot = formData.get("website")?.toString().trim();

  if (honeypot) {
    await recordPublicBotTrap({
      context,
      slug,
      action: "BOOKING_BOT_TRAP",
    });

    logger.warn("booking.bot_trap_triggered", {
      slug,
      ipHash: context.ipHash,
    });

    fail(slug, "We could not complete the booking. Please try again.");
  }

  const ipLimit = await checkPublicRateLimit({
    action: "BOOKING_SUBMIT_IP",
    identifier: `booking-ip:${context.ipAddress}:${slug}`,
    context,
    slug,
    maxAttempts: 8,
    windowSeconds: 15 * 60,
    blockedMessage:
      "Too many booking attempts. Please wait a few minutes and try again.",
  });

  if (!ipLimit.allowed) {
    logger.warn("booking.submission.rate_limited_ip", {
      slug,
      ipHash: context.ipHash,
    });

    fail(slug, ipLimit.message);
  }

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
      owner: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!business || business.status !== "ACTIVE") {
    logger.warn("booking.business_unavailable", {
      slug,
      ipHash: context.ipHash,
    });

    fail(slug, "This business is not available for booking.");
  }

  const tenantSubmitLimit = await checkPublicRateLimit({
    action: "BOOKING_SUBMIT_TENANT",
    identifier: `booking-tenant:${business.id}`,
    context,
    slug,
    businessId: business.id,
    maxAttempts: 60,
    windowSeconds: 10 * 60,
    blockedMessage:
      "This booking page is receiving too many appointment requests. Please try again shortly.",
  });

  if (!tenantSubmitLimit.allowed) {
    logger.warn("booking.submission.rate_limited_tenant", {
      businessId: business.id,
      slug,
      ipHash: context.ipHash,
    });

    fail(slug, tenantSubmitLimit.message);
  }

  const contactIdentity = customerEmail
    ? `email:${normalizeContact(customerEmail)}`
    : `phone:${normalizeContact(customerPhone)}`;

  const contactLimit = await checkPublicRateLimit({
    action: "BOOKING_SUBMIT_CONTACT",
    identifier: `booking-contact:${business.id}:${contactIdentity}`,
    context,
    slug,
    businessId: business.id,
    maxAttempts: 4,
    windowSeconds: 60 * 60,
    blockedMessage:
      "Too many recent booking attempts with this contact information. Please wait and try again.",
  });

  if (!contactLimit.allowed) {
    logger.warn("booking.submission.rate_limited_contact", {
      businessId: business.id,
      slug,
      ipHash: context.ipHash,
    });

    fail(slug, contactLimit.message);
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
      isActive: true,
    },
  });

  if (!service) {
    logger.warn("booking.service_unavailable", {
      businessId: business.id,
      serviceId,
      slug,
    });

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
    logger.warn("booking.slot_unavailable", {
      businessId: business.id,
      serviceId,
      slug,
      appointmentDate,
      startTime,
    });

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

  let deliveryIds: string[] = [];
  let appointmentId = "";

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const recentDuplicate = await tx.appointment.findFirst({
          where: {
            businessId: business.id,
            serviceId: service.id,
            date,
            startTime,
            customer: {
              is: {
                phone: customerPhone,
              },
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 60 * 1000),
            },
          },
          select: {
            id: true,
          },
        });

        if (recentDuplicate) {
          throw new Error("DUPLICATE_BOOKING");
        }

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

        const appointment = await tx.appointment.create({
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

        const queuedDeliveryIds: string[] = [];

        if (customer.email) {
          const template = bookingRequestedCustomerTemplate({
            businessName: business.name,
            customerName: customer.name,
            serviceName: service.name,
            date,
            startTime,
            endTime,
          });

          queuedDeliveryIds.push(
            await queueEmailDelivery(tx, {
              businessId: business.id,
              appointmentId: appointment.id,
              type: "CUSTOMER_BOOKING_REQUESTED",
              recipientEmail: customer.email,
              recipientName: customer.name,
              subject: template.subject,
              html: template.html,
              text: template.text,
              idempotencyKey: `customer-booking-requested/${appointment.id}`,
            }),
          );
        }

        const ownerEmail = business.email || business.owner.email;

        if (ownerEmail) {
          const template = newBookingOwnerTemplate({
            businessName: business.name,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            serviceName: service.name,
            date,
            startTime,
            endTime,
          });

          queuedDeliveryIds.push(
            await queueEmailDelivery(tx, {
              businessId: business.id,
              appointmentId: appointment.id,
              type: "OWNER_NEW_BOOKING",
              recipientEmail: ownerEmail,
              recipientName: business.owner.name ?? "Business owner",
              subject: template.subject,
              html: template.html,
              text: template.text,
              idempotencyKey: `owner-new-booking/${appointment.id}`,
            }),
          );
        }

        return {
          appointmentId: appointment.id,
          deliveryIds: queuedDeliveryIds,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    appointmentId = result.appointmentId;
    deliveryIds = result.deliveryIds;
  } catch (caught) {
    const errorMessage =
      caught instanceof Error ? caught.message : "UNKNOWN_ERROR";

    const prismaCode =
      typeof caught === "object" && caught !== null && "code" in caught
        ? String(caught.code)
        : null;

    if (errorMessage === "LIMIT_REACHED") {
      logger.warn("booking.monthly_limit_reached", {
        businessId: business.id,
        slug,
        plan,
      });

      fail(slug, "This business has reached its monthly booking limit.");
    }

    if (errorMessage === "DUPLICATE_BOOKING") {
      logger.warn("booking.duplicate_blocked", {
        businessId: business.id,
        serviceId,
        slug,
        appointmentDate,
        startTime,
        ipHash: context.ipHash,
      });

      fail(slug, "This appointment request was already submitted recently.");
    }

    if (errorMessage === "SLOT_TAKEN" || prismaCode === "P2034") {
      logger.warn("booking.slot_conflict", {
        businessId: business.id,
        serviceId,
        slug,
        appointmentDate,
        startTime,
        prismaCode,
      });

      fail(
        slug,
        "That time was just booked by someone else. Please choose another time.",
      );
    }

    logger.error("booking.creation_failed", caught, {
      businessId: business.id,
      serviceId,
      slug,
      appointmentDate,
      startTime,
      prismaCode,
    });

    fail(slug, "We could not complete the booking. Please try again.");
  }

  await deliverEmailDeliveries(deliveryIds);

  logger.info("booking.created", {
    appointmentId,
    businessId: business.id,
    serviceId,
    slug,
    appointmentDate,
    startTime,
    emailDeliveryCount: deliveryIds.length,
  });

  redirect(
    `/book/${slug}/success?name=${encodeURIComponent(
      customerName,
    )}&appointmentId=${appointmentId}`,
  );
}
