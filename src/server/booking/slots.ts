import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getDateInputValueInTimeZone,
  getTimeMinutesInTimeZone,
  isDateInputBeforeTodayInTimeZone,
  parseDateInputAsUtc,
} from "@/lib/date";
import { formatTime } from "@/lib/format";
import { calculateAvailableSlotValues } from "@/server/booking/calculate-slots";

export type SlotOption = {
  value: string;
  label: string;
};

export type SlotResult = {
  slots: SlotOption[];
  message: string | null;
};

type SlotInput = {
  slug: string;
  serviceId: string;
  date: string;
  excludeAppointmentId?: string;
};

export async function getAvailableSlotsForBooking({
  slug,
  serviceId,
  date: dateInput,
  excludeAppointmentId,
}: SlotInput): Promise<SlotResult> {
  const date = parseDateInputAsUtc(dateInput);

  if (!date) {
    return {
      slots: [],
      message: "Choose a valid date.",
    };
  }

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      status: true,
      timeZone: true,
    },
  });

  if (!business || business.status !== "ACTIVE") {
    return {
      slots: [],
      message: "This business is not available for booking.",
    };
  }

  if (isDateInputBeforeTodayInTimeZone(dateInput, business.timeZone)) {
    return {
      slots: [],
      message: "Past dates cannot be booked.",
    };
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
      isActive: true,
    },
    select: {
      durationMinutes: true,
    },
  });

  if (!service) {
    return {
      slots: [],
      message: "Choose an available service.",
    };
  }

  const availability = await prisma.availabilityRule.findFirst({
    where: {
      businessId: business.id,
      staffMemberId: null,
      dayOfWeek: date.getUTCDay(),
    },
    select: {
      startTime: true,
      endTime: true,
      isClosed: true,
    },
  });

  if (
    !availability ||
    availability.isClosed ||
    availability.startTime >= availability.endTime
  ) {
    return {
      slots: [],
      message: "The business is closed on this date.",
    };
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      date,
      status: {
        not: "CANCELLED",
      },
      id: excludeAppointmentId
        ? {
            not: excludeAppointmentId,
          }
        : undefined,
    },
    select: {
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  const businessToday = getDateInputValueInTimeZone(business.timeZone);

  const selectedDateIsToday = dateInput === businessToday;

  const minimumStartMinutes = selectedDateIsToday
    ? getTimeMinutesInTimeZone(business.timeZone)
    : null;

  const slotValues = calculateAvailableSlotValues({
    openingTime: availability.startTime,
    closingTime: availability.endTime,
    durationMinutes: service.durationMinutes,
    appointments,
    stepMinutes: 30,
    minimumStartMinutes,
  });

  const slots = slotValues.map((value) => ({
    value,
    label: formatTime(value),
  }));

  return {
    slots,
    message:
      slots.length === 0
        ? "No appointment times are available on this date."
        : null,
  };
}
