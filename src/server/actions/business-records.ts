"use server";

import { getAvailableSlotsForBooking } from "@/server/booking/slots";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getActiveBusiness } from "@/server/business/get-active-business";

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

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hour, minute + minutesToAdd, 0, 0);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function dollarsToCents(value: string) {
  const amount = Number(value);

  if (Number.isNaN(amount) || amount < 0) {
    throw new Error("Price must be a valid number.");
  }

  return Math.round(amount * 100);
}

type AppointmentStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";
function canChangeAppointmentStatus(
  currentStatus: AppointmentStatusValue,
  nextStatus: AppointmentStatusValue,
) {
  const transitions: Record<AppointmentStatusValue, AppointmentStatusValue[]> =
    {
      PENDING: ["CONFIRMED"],
      CONFIRMED: ["COMPLETED", "NO_SHOW"],
      CANCELLED: [],
      COMPLETED: [],
      NO_SHOW: [],
    };
  return transitions[currentStatus].includes(nextStatus);
}
function revalidateAppointmentPages(
  appointmentId: string,
  businessSlug: string,
) {
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}`);
  revalidatePath("/dashboard");
  revalidatePath(`/book/${businessSlug}`);
}

export async function createServiceAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  const name = required(formData.get("name"), "Service name");
  const price = required(formData.get("price"), "Price");
  const durationMinutes = Number(
    required(formData.get("durationMinutes"), "Duration"),
  );

  if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
    throw new Error("Duration must be a valid number.");
  }

  await prisma.service.create({
    data: {
      businessId: business.id,
      name,
      description: optional(formData.get("description")),
      priceCents: dollarsToCents(price),
      durationMinutes,
      isActive: true,
    },
  });

  redirect("/services");
}

export async function createCustomerAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  await prisma.customer.create({
    data: {
      businessId: business.id,
      name: required(formData.get("name"), "Customer name"),
      phone: required(formData.get("phone"), "Phone number"),
      email: optional(formData.get("email")),
      notes: optional(formData.get("notes")),
    },
  });

  redirect("/customers");
}

export async function createStaffAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  await prisma.staffMember.create({
    data: {
      businessId: business.id,
      name: required(formData.get("name"), "Staff name"),
      email: optional(formData.get("email")),
      phone: optional(formData.get("phone")),
      roleTitle: optional(formData.get("roleTitle")),
      isActive: true,
    },
  });

  redirect("/staff");
}

export async function createAppointmentAction(formData: FormData) {
  const { business } = await getActiveBusiness();
  const customerId = required(formData.get("customerId"), "Customer");
  const serviceId = required(formData.get("serviceId"), "Service");
  const staffMemberId = optional(formData.get("staffMemberId"));
  const appointmentDate = required(formData.get("date"), "Date");
  const startTime = required(formData.get("startTime"), "Start time");
  const status = required(formData.get("status"), "Status");
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id, isActive: true },
  });
  if (!service) {
    throw new Error("Selected service was not found.");
  }
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, businessId: business.id },
  });
  if (!customer) {
    throw new Error("Selected customer was not found.");
  }
  if (staffMemberId) {
    const staffMember = await prisma.staffMember.findFirst({
      where: { id: staffMemberId, businessId: business.id, isActive: true },
    });
    if (!staffMember) {
      throw new Error("Selected staff member was not found.");
    }
  }
  const slotResult = await getAvailableSlotsForBooking({
    slug: business.slug,
    serviceId,
    date: appointmentDate,
  });
  const selectedSlotIsAvailable = slotResult.slots.some(
    (slot) => slot.value === startTime,
  );
  if (!selectedSlotIsAvailable) {
    throw new Error(
      slotResult.message ??
        "The selected appointment time is no longer available.",
    );
  }
  const date = new Date(`${appointmentDate}T00:00:00.000Z`);
  const endTime = addMinutesToTime(startTime, service.durationMinutes);
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      businessId: business.id,
      date,
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  if (existingAppointment) {
    throw new Error("That appointment time is no longer available.");
  }
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  await prisma.$transaction([
    prisma.appointment.create({
      data: {
        businessId: business.id,
        customerId,
        serviceId,
        staffMemberId,
        date,
        startTime,
        endTime,
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "CANCELLED"
          | "COMPLETED"
          | "NO_SHOW",
        notes: optional(formData.get("notes")),
      },
    }),
    prisma.bookingUsage.upsert({
      where: {
        businessId_month_year: { businessId: business.id, month, year },
      },
      update: { bookingCount: { increment: 1 } },
      create: { businessId: business.id, month, year, bookingCount: 1 },
    }),
  ]);
  redirect("/appointments");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const { business, user } = await getActiveBusiness();
  const appointmentId = required(
    formData.get("appointmentId"),
    "Appointment ID",
  );
  const status = required(
    formData.get("status"),
    "Status",
  ) as AppointmentStatusValue;
  if (
    !["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"].includes(
      status,
    )
  ) {
    throw new Error("Invalid appointment status.");
  }
  if (status === "CANCELLED") {
    throw new Error(
      "Use the cancellation form so a cancellation reason can be recorded.",
    );
  }
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId: business.id },
    select: { id: true, status: true },
  });
  if (!appointment) {
    throw new Error("Appointment was not found.");
  }
  if (
    !canChangeAppointmentStatus(
      appointment.status as AppointmentStatusValue,
      status,
    )
  ) {
    throw new Error(
      `Appointment cannot move from ${appointment.status} to ${status}.`,
    );
  }
  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointment.id, businessId: business.id },
      data: { status },
    }),
    prisma.appointmentEvent.create({
      data: {
        businessId: business.id,
        appointmentId: appointment.id,
        actorUserId: user.id,
        type: "STATUS_CHANGED",
        fromStatus: appointment.status,
        toStatus: status,
      },
    }),
  ]);
  revalidateAppointmentPages(appointment.id, business.slug);
}
export async function cancelAppointmentAction(formData: FormData) {
  const { business, user } = await getActiveBusiness();
  const appointmentId = required(
    formData.get("appointmentId"),
    "Appointment ID",
  );
  const reason = required(formData.get("reason"), "Cancellation reason");
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId: business.id },
    select: { id: true, status: true },
  });
  if (!appointment) {
    throw new Error("Appointment was not found.");
  }
  if (appointment.status === "CANCELLED") {
    throw new Error("This appointment is already cancelled.");
  }
  if (appointment.status === "COMPLETED") {
    throw new Error("A completed appointment cannot be cancelled.");
  }
  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointment.id, businessId: business.id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    }),
    prisma.appointmentEvent.create({
      data: {
        businessId: business.id,
        appointmentId: appointment.id,
        actorUserId: user.id,
        type: "CANCELLED",
        fromStatus: appointment.status,
        toStatus: "CANCELLED",
        reason,
      },
    }),
  ]);
  revalidateAppointmentPages(appointment.id, business.slug);
}
export async function rescheduleAppointmentAction(formData: FormData) {
  const { business, user } = await getActiveBusiness();
  const appointmentId = required(
    formData.get("appointmentId"),
    "Appointment ID",
  );
  const serviceId = required(formData.get("serviceId"), "Service");
  const staffMemberId = optional(formData.get("staffMemberId"));
  const appointmentDate = required(formData.get("date"), "Date");
  const startTime = required(formData.get("startTime"), "Start time");
  const reason = optional(formData.get("reason"));
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId: business.id },
    include: { service: true },
  });
  if (!appointment) {
    throw new Error("Appointment was not found.");
  }
  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "COMPLETED"
  ) {
    throw new Error(
      "Cancelled or completed appointments cannot be rescheduled.",
    );
  }
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id, isActive: true },
  });
  if (!service) {
    throw new Error("Selected service was not found.");
  }
  if (staffMemberId) {
    const staffMember = await prisma.staffMember.findFirst({
      where: { id: staffMemberId, businessId: business.id, isActive: true },
    });
    if (!staffMember) {
      throw new Error("Selected staff member was not found.");
    }
  }
  const slotResult = await getAvailableSlotsForBooking({
    slug: business.slug,
    serviceId,
    date: appointmentDate,
    excludeAppointmentId: appointment.id,
  });
  const selectedSlotIsAvailable = slotResult.slots.some(
    (slot) => slot.value === startTime,
  );
  if (!selectedSlotIsAvailable) {
    throw new Error(
      slotResult.message ??
        "The selected appointment time is no longer available.",
    );
  }
  const newDate = new Date(`${appointmentDate}T00:00:00.000Z`);
  const newEndTime = addMinutesToTime(startTime, service.durationMinutes);
  const changed =
    appointment.serviceId !== serviceId ||
    appointment.staffMemberId !== staffMemberId ||
    appointment.date.getTime() !== newDate.getTime() ||
    appointment.startTime !== startTime;
  if (!changed) {
    throw new Error("No rescheduling changes were made.");
  }
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      id: { not: appointment.id },
      businessId: business.id,
      date: newDate,
      status: { not: "CANCELLED" },
      startTime: { lt: newEndTime },
      endTime: { gt: startTime },
    },
    select: { id: true },
  });
  if (conflictingAppointment) {
    throw new Error("That appointment time is no longer available.");
  }
  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointment.id, businessId: business.id },
      data: {
        serviceId,
        staffMemberId,
        date: newDate,
        startTime,
        endTime: newEndTime,
      },
    }),
    prisma.appointmentEvent.create({
      data: {
        businessId: business.id,
        appointmentId: appointment.id,
        actorUserId: user.id,
        type: "RESCHEDULED",
        previousDate: appointment.date,
        nextDate: newDate,
        previousStartTime: appointment.startTime,
        nextStartTime: startTime,
        reason,
      },
    }),
  ]);
  revalidateAppointmentPages(appointment.id, business.slug);
}

export async function toggleServiceStatusAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  const serviceId = required(formData.get("serviceId"), "Service ID");
  const isActive =
    required(formData.get("isActive"), "Service status") === "true";

  await prisma.service.update({
    where: {
      id: serviceId,
      businessId: business.id,
    },
    data: {
      isActive,
    },
  });

  revalidatePath("/services");
  revalidatePath("/booking-page");
}

export async function toggleStaffStatusAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  const staffMemberId = required(
    formData.get("staffMemberId"),
    "Staff member ID",
  );
  const isActive =
    required(formData.get("isActive"), "Staff status") === "true";

  await prisma.staffMember.update({
    where: {
      id: staffMemberId,
      businessId: business.id,
    },
    data: {
      isActive,
    },
  });

  revalidatePath("/staff");
  revalidatePath("/appointments/new");
}

export async function updateCustomerNotesAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  const customerId = required(formData.get("customerId"), "Customer ID");
  const notes = optional(formData.get("notes"));

  await prisma.customer.update({
    where: {
      id: customerId,
      businessId: business.id,
    },
    data: {
      notes,
    },
  });

  revalidatePath("/customers");
}

export async function changeCurrentBusinessPlanAction(formData: FormData) {
  const { business } = await getActiveBusiness();

  const plan = required(formData.get("plan"), "Plan");

  if (!["FREE", "STARTER", "PRO"].includes(plan)) {
    throw new Error("Invalid plan.");
  }

  await prisma.subscription.upsert({
    where: {
      businessId: business.id,
    },
    update: {
      plan: plan as "FREE" | "STARTER" | "PRO",
      status: "ACTIVE",
    },
    create: {
      businessId: business.id,
      plan: plan as "FREE" | "STARTER" | "PRO",
      status: "ACTIVE",
    },
  });

  revalidatePath("/subscription");
  revalidatePath("/dashboard");
}

export async function updateAvailabilityRuleAction(formData: FormData) {
  const { business } = await getActiveBusiness();
  const availabilityRuleId = required(
    formData.get("availabilityRuleId"),
    "Availability rule ID",
  );
  const isClosedValue = formData.get("isClosed")?.toString();
  const isClosed = isClosedValue === "on" || isClosedValue === "true";
  const startTime = isClosed
    ? "00:00"
    : required(formData.get("startTime"), "Start time");
  const endTime = isClosed
    ? "00:00"
    : required(formData.get("endTime"), "End time");
  if (!isClosed && startTime >= endTime) {
    throw new Error("End time must be later than start time.");
  }
  await prisma.availabilityRule.update({
    where: { id: availabilityRuleId, businessId: business.id },
    data: { startTime, endTime, isClosed },
  });
  revalidatePath("/availability");
  revalidatePath("/booking-page");
  revalidatePath(`/book/${business.slug}`);
}
