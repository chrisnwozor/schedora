"use server";
import { getAvailableSlotsForBooking } from "@/server/booking/slots";
export async function getAppointmentSlotsAction(input: {
  slug: string;
  serviceId: string;
  date: string;
  excludeAppointmentId?: string;
}) {
  return getAvailableSlotsForBooking(input);
}
