"use client";
import { useEffect, useState, useTransition } from "react";
import { Calendar, Clock, Scissors } from "lucide-react";
import {
  createPublicBooking,
  getAvailableSlotsAction,
} from "@/app/book/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type SlotOption = { value: string; label: string };
type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  durationMinutes: number;
};
type PublicBookingFormProps = {
  slug: string;
  services: ServiceOption[];
  initialDate: string;
  openDayNames: string[];
  error?: string;
};
function formatMoneyFromCents(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}
export function PublicBookingForm({
  slug,
  services,
  initialDate,
  openDayNames,
  error,
}: PublicBookingFormProps) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [startTime, setStartTime] = useState("");
  const [slotMessage, setSlotMessage] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
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
        const result = await getAvailableSlotsAction({ slug, serviceId, date });
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
          setSlotMessage("Could not load appointment times. Please try again.");
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
  }, [date, serviceId, slug]);
  const canSubmit =
    services.length > 0 &&
    Boolean(serviceId) &&
    Boolean(date) &&
    Boolean(startTime) &&
    !isLoadingSlots &&
    !isSubmitting;
  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await createPublicBooking(formData);
        });
      }}
      className="space-y-8"
    >
      <input type="hidden" name="slug" value={slug} />
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {error ? (
        <div
          id="booking-error"
          role="alert"
          tabIndex={-1}
          className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 text-sm font-medium text-black"
        >
          {error}
        </div>
      ) : null}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Scissors className="size-5" />
          <h2 className="font-semibold">1. Select service</h2>
        </div>
        {services.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 p-5 text-sm text-neutral-600">
            This business has no active services available for booking.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => {
              const selected = service.id === serviceId;
              return (
                <label
                  key={service.id}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${selected ? "border-black" : "border-neutral-200 hover:border-neutral-400"}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      checked={selected}
                      onChange={() => setServiceId(service.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold">{service.name}</p>
                        <p className="shrink-0 font-semibold">
                          {formatMoneyFromCents(service.priceCents)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600">
                        {service.durationMinutes} minutes
                      </p>
                      {service.description ? (
                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="size-5" />
          <h2 className="font-semibold">2. Select date and time</h2>
        </div>
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="booking-date" className="text-sm font-medium">
              Date
            </label>
            <input
              id="booking-date"
              name="date"
              type="date"
              min={initialDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="mt-2 block h-12 w-full min-w-0 max-w-full rounded-xl border border-neutral-200 bg-white px-3 text-base text-black outline-none focus:border-black"
            />
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Open days:
              {openDayNames.join(", ") || "No open days configured"}
            </p>
          </div>
          <div className="min-w-0">
            <label htmlFor="booking-time" className="text-sm font-medium">
              Time
            </label>
            <select
              id="booking-time"
              name="startTime"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
              disabled={isLoadingSlots || slots.length === 0}
              className="mt-2 block h-12 w-full min-w-0 max-w-full rounded-xl border border-neutral-200 bg-white px-3 text-base text-black outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
            >
              {isLoadingSlots ? (
                <option value="">Loading times...</option>
              ) : slots.length === 0 ? (
                <option value="">No available times</option>
              ) : (
                slots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))
              )}
            </select>
            <p
              className="mt-2 min-h-5 text-xs leading-5 text-neutral-500"
              aria-live="polite"
            >
              {isLoadingSlots ? "Checking availability..." : slotMessage}
            </p>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-5" />
          <h2 className="font-semibold">3. Your details</h2>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Full name</label>
            <Input
              name="customerName"
              placeholder="Enter your full name"
              required
              className="h-12 text-base"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium"> Phone number </label>
              <Input
                name="customerPhone"
                inputMode="tel"
                placeholder="+1 519 555 0000"
                required
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email optional</label>
              <Input
                name="customerEmail"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                className="h-12 text-base"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium"> Notes optional </label>
            <textarea
              name="notes"
              placeholder="Anything the business should know?"
              className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-black"
            />
          </div>
        </div>
      </section>
      <Button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="h-12 w-full bg-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting booking..." : "Confirm booking"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        Your appointment will be created as pending until the business confirms
        it.
      </p>
    </form>
  );
}
