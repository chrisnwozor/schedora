import "server-only";
import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/format";
export type SlotOption = { value: string; label: string };
export type SlotResult = { slots: SlotOption[]; message: string | null };
type SlotInput = {
  slug: string;
  serviceId: string;
  date: string;
  excludeAppointmentId?: string;
};
function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}
export async function getAvailableSlotsForBooking({
  slug,
  serviceId,
  date: dateInput,
  excludeAppointmentId,
}: SlotInput): Promise<SlotResult> {
  const date = parseDateInput(dateInput);
  if (!date) {
    return { slots: [], message: "Choose a valid date." };
  }
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!business || business.status !== "ACTIVE") {
    return {
      slots: [],
      message: "This business is not available for booking.",
    };
  }
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id, isActive: true },
    select: { durationMinutes: true },
  });
  if (!service) {
    return { slots: [], message: "Choose an available service." };
  }
  const availability = await prisma.availabilityRule.findFirst({
    where: {
      businessId: business.id,
      staffMemberId: null,
      dayOfWeek: date.getUTCDay(),
    },
    select: { startTime: true, endTime: true, isClosed: true },
  });
  if (
    !availability ||
    availability.isClosed ||
    availability.startTime >= availability.endTime
  ) {
    return { slots: [], message: "The business is closed on this date." };
  }
  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      date,
      status: { not: "CANCELLED" },
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
    },
    select: { startTime: true, endTime: true },
  });
  const openingMinutes = timeToMinutes(availability.startTime);
  const closingMinutes = timeToMinutes(availability.endTime);
  const latestStart = closingMinutes - service.durationMinutes;
  const stepMinutes = 30;
  const slots: SlotOption[] = [];
  for (
    let candidateStart = openingMinutes;
    candidateStart <= latestStart;
    candidateStart += stepMinutes
  ) {
    const candidateEnd = candidateStart + service.durationMinutes;
    const overlapsExistingAppointment = appointments.some((appointment) => {
      const existingStart = timeToMinutes(appointment.startTime);
      const existingEnd = timeToMinutes(appointment.endTime);
      return candidateStart < existingEnd && candidateEnd > existingStart;
    });
    if (!overlapsExistingAppointment) {
      const value = minutesToTime(candidateStart);
      slots.push({ value, label: formatTime(value) });
    }
  }
  return {
    slots,
    message:
      slots.length === 0
        ? "No appointment times are available on this date."
        : null,
  };
}
