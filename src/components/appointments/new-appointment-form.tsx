"use client";
import { useEffect, useState } from "react";
import { getAvailableSlotsAction } from "@/app/book/[slug]/actions";
import { createAppointmentAction } from "@/server/actions/business-records";
import { Button } from "@/components/ui/button";
type SlotOption = { value: string; label: string };
type CustomerOption = { id: string; name: string; phone: string };
type ServiceOption = { id: string; name: string; durationMinutes: number };
type StaffOption = { id: string; name: string };
type NewAppointmentFormProps = {
  businessSlug: string;
  initialDate: string;
  customers: CustomerOption[];
  services: ServiceOption[];
  staffMembers: StaffOption[];
};
export function NewAppointmentForm({
  businessSlug,
  initialDate,
  customers,
  services,
  staffMembers,
}: NewAppointmentFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      if (!serviceId || !date) {
        setSlots([]);
        setStartTime("");
        setSlotMessage("Choose a service and date.");
        return;
      }
      setIsLoadingSlots(true);
      try {
        const result = await getAvailableSlotsAction({
          slug: businessSlug,
          serviceId,
          date,
        });
        if (cancelled) {
          return;
        }
        setSlots(result.slots);
        setSlotMessage(result.message);
        setStartTime((current) =>
          result.slots.some((slot) => slot.value === current)
            ? current
            : (result.slots[0]?.value ?? ""),
        );
      } catch {
        if (!cancelled) {
          setSlots([]);
          setStartTime("");
          setSlotMessage("Could not load appointment times.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      }
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [businessSlug, date, serviceId]);
  const canSubmit =
    Boolean(customerId) &&
    Boolean(serviceId) &&
    Boolean(date) &&
    Boolean(startTime) &&
    !isLoadingSlots;
  return (
    <form action={createAppointmentAction} className="space-y-5">
      {" "}
      <div className="grid gap-2">
        {" "}
        <label className="text-sm font-medium">Customer</label>{" "}
        <select
          name="customerId"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          required
          className="h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
        >
          {" "}
          <option value="">Select customer</option>{" "}
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {" "}
              {customer.name} — {customer.phone}{" "}
            </option>
          ))}{" "}
        </select>{" "}
        {customers.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {" "}
            Add a customer before creating an appointment.{" "}
          </p>
        ) : null}{" "}
      </div>{" "}
      <div className="grid gap-5 md:grid-cols-2">
        {" "}
        <div className="grid min-w-0 gap-2">
          {" "}
          <label className="text-sm font-medium">Service</label>{" "}
          <select
            name="serviceId"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            required
            className="h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
          >
            {" "}
            <option value="">Select service</option>{" "}
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {" "}
                {service.name} — {service.durationMinutes} min{" "}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        <div className="grid min-w-0 gap-2">
          {" "}
          <label className="text-sm font-medium"> Staff optional </label>{" "}
          <select
            name="staffMemberId"
            className="h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
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
      <div className="grid min-w-0 gap-5 md:grid-cols-3">
        {" "}
        <div className="min-w-0">
          {" "}
          <label htmlFor="appointment-date" className="text-sm font-medium">
            {" "}
            Date{" "}
          </label>{" "}
          <input
            id="appointment-date"
            name="date"
            type="date"
            min={initialDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="mt-2 block h-12 w-full min-w-0 max-w-full rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
          />{" "}
        </div>{" "}
        <div className="grid min-w-0 gap-2">
          {" "}
          <label htmlFor="appointment-time" className="text-sm font-medium">
            {" "}
            Start time{" "}
          </label>{" "}
          <select
            id="appointment-time"
            name="startTime"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
            disabled={isLoadingSlots || slots.length === 0}
            className="h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
          >
            {" "}
            {isLoadingSlots ? (
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
          <p className="min-h-5 text-xs text-neutral-500" aria-live="polite">
            {" "}
            {isLoadingSlots ? "Checking availability..." : slotMessage}{" "}
          </p>{" "}
        </div>{" "}
        <div className="grid min-w-0 gap-2">
          {" "}
          <label className="text-sm font-medium">Status</label>{" "}
          <select
            name="status"
            defaultValue="CONFIRMED"
            className="h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none"
          >
            {" "}
            <option value="PENDING">Pending</option>{" "}
            <option value="CONFIRMED">Confirmed</option>{" "}
            <option value="COMPLETED">Completed</option>{" "}
          </select>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid gap-2">
        {" "}
        <label className="text-sm font-medium"> Notes optional </label>{" "}
        <textarea
          name="notes"
          placeholder="Appointment notes..."
          className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none"
        />{" "}
      </div>{" "}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="bg-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {" "}
        Create appointment{" "}
      </Button>{" "}
    </form>
  );
}
