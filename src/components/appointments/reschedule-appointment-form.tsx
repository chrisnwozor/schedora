"use client";
import { useEffect, useState } from "react";
import { getAppointmentSlotsAction } from "@/server/actions/appointment-slots";
import { rescheduleAppointmentAction } from "@/server/actions/business-records";
import { Button } from "@/components/ui/button";
type SlotOption = { value: string; label: string };
type ServiceOption = { id: string; name: string; durationMinutes: number };
type StaffOption = { id: string; name: string };
type RescheduleAppointmentFormProps = {
  appointmentId: string;
  businessSlug: string;
  initialServiceId: string;
  initialStaffMemberId: string;
  initialDate: string;
  initialStartTime: string;
  services: ServiceOption[];
  staffMembers: StaffOption[];
};
export function RescheduleAppointmentForm({
  appointmentId,
  businessSlug,
  initialServiceId,
  initialStaffMemberId,
  initialDate,
  initialStartTime,
  services,
  staffMembers,
}: RescheduleAppointmentFormProps) {
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [staffMemberId, setStaffMemberId] = useState(initialStaffMemberId);
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      if (!serviceId || !date) {
        setSlots([]);
        setStartTime("");
        return;
      }
      setLoading(true);
      try {
        const result = await getAppointmentSlotsAction({
          slug: businessSlug,
          serviceId,
          date,
          excludeAppointmentId: appointmentId,
        });
        if (cancelled) {
          return;
        }
        setSlots(result.slots);
        setMessage(result.message);
        setStartTime((current) =>
          result.slots.some((slot) => slot.value === current)
            ? current
            : (result.slots[0]?.value ?? ""),
        );
      } catch {
        if (!cancelled) {
          setSlots([]);
          setStartTime("");
          setMessage("Could not load available times.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [appointmentId, businessSlug, date, serviceId]);
  return (
    <form action={rescheduleAppointmentAction} className="space-y-5">
      {" "}
      <input type="hidden" name="appointmentId" value={appointmentId} />{" "}
      <div className="grid gap-5 md:grid-cols-2">
        {" "}
        <div className="grid gap-2">
          {" "}
          <label className="text-sm font-medium">Service</label>{" "}
          <select
            name="serviceId"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            required
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
          >
            {" "}
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {" "}
                {service.name} — {service.durationMinutes} min{" "}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        <div className="grid gap-2">
          {" "}
          <label className="text-sm font-medium"> Staff optional </label>{" "}
          <select
            name="staffMemberId"
            value={staffMemberId}
            onChange={(event) => setStaffMemberId(event.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
          >
            {" "}
            <option value="">Unassigned</option>{" "}
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {" "}
                {staff.name}{" "}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        {" "}
        <div className="min-w-0">
          {" "}
          <label className="text-sm font-medium">Date</label>{" "}
          <input
            name="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="mt-2 block h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
          />{" "}
        </div>{" "}
        <div className="grid min-w-0 gap-2">
          {" "}
          <label className="text-sm font-medium">Start time</label>{" "}
          <select
            name="startTime"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            disabled={loading || slots.length === 0}
            required
            className="h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none disabled:bg-neutral-100"
          >
            {" "}
            {loading ? (
              <option value="">Loading times...</option>
            ) : slots.length === 0 ? (
              <option value="">No available times</option>
            ) : (
              slots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {" "}
                  {slot.label}{" "}
                </option>
              ))
            )}{" "}
          </select>{" "}
          <p className="min-h-5 text-xs text-neutral-500">
            {" "}
            {loading ? "Checking availability..." : message}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid gap-2">
        {" "}
        <label className="text-sm font-medium">
          {" "}
          Rescheduling reason optional{" "}
        </label>{" "}
        <textarea
          name="reason"
          placeholder="Why is this appointment being moved?"
          className="min-h-24 rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none"
        />{" "}
      </div>{" "}
      <Button
        type="submit"
        disabled={loading || !startTime}
        className="bg-black text-white hover:bg-neutral-800"
      >
        {" "}
        Save new schedule{" "}
      </Button>{" "}
    </form>
  );
}
