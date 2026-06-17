import { notFound } from "next/navigation";
import { Calendar, Check, Clock, Scissors } from "lucide-react";

import { createPublicBooking } from "./actions";
import { prisma } from "@/lib/prisma";
import { dayName, formatMoneyFromCents, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const timeOptions = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

function getTodayInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 10);
}

export default async function PublicBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const todayInputValue = getTodayInputValue();

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    include: {
      services: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      availabilityRules: {
        where: {
          staffMemberId: null,
        },
        orderBy: {
          dayOfWeek: "asc",
        },
      },
    },
  });

  if (!business || business.status !== "ACTIVE") {
    notFound();
  }

  const openDays = business.availabilityRules.filter((rule) => !rule.isClosed);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            schedora
          </a>

          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
            Public booking page
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6">
            <Card className="rounded-2xl border-neutral-200 bg-white shadow-none">
              <CardContent className="p-6">
                <div className="grid size-14 place-items-center rounded-2xl bg-black text-white">
                  <Scissors className="size-6" />
                </div>

                <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                  {business.name}
                </h1>

                <p className="mt-2 text-neutral-600">{business.businessType}</p>

                <p className="mt-5 leading-7 text-neutral-600">
                  {business.description ??
                    "Choose a service, pick a time, and confirm your appointment."}
                </p>

                <div className="mt-6 space-y-3 text-sm text-neutral-600">
                  {business.address ? (
                    <p className="flex items-center gap-2">
                      <Check className="size-4" />
                      {business.address}
                    </p>
                  ) : null}

                  <p className="flex items-center gap-2">
                    <Check className="size-4" />
                    {business.services.length} services available
                  </p>

                  <p className="flex items-center gap-2">
                    <Check className="size-4" />
                    No account required
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 bg-white shadow-none">
              <CardHeader>
                <CardTitle>Opening hours</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {business.availabilityRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between border-b border-neutral-100 pb-3 text-sm"
                  >
                    <span className="font-medium">
                      {dayName(rule.dayOfWeek)}
                    </span>
                    <span className="text-neutral-600">
                      {rule.isClosed
                        ? "Closed"
                        : `${formatTime(rule.startTime)} - ${formatTime(rule.endTime)}`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <Card className="rounded-2xl border-neutral-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Book an appointment</CardTitle>
            </CardHeader>

            <CardContent>
              <form action={createPublicBooking} className="space-y-8">
                {error ? (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm font-medium text-black">
                    {error}
                  </div>
                ) : null}
                <input type="hidden" name="slug" value={business.slug} />

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Scissors className="size-5" />
                    <h2 className="font-semibold">1. Select service</h2>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {business.services.map((service, index) => (
                      <label
                        key={service.id}
                        className="cursor-pointer rounded-2xl border border-neutral-200 p-4 transition hover:border-black"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="serviceId"
                            value={service.id}
                            defaultChecked={index === 0}
                            className="mt-1"
                          />

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <p className="font-semibold">{service.name}</p>
                              <p className="font-semibold">
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
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="size-5" />
                    <h2 className="font-semibold">2. Select date and time</h2>
                  </div>

                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        name="date"
                        type="date"
                        min={todayInputValue}
                        defaultValue={todayInputValue}
                        required
                        className="h-12 w-full max-w-full"
                      />
                      <p className="text-xs text-neutral-500">
                        Open days:{" "}
                        {openDays
                          .map((rule) => dayName(rule.dayOfWeek))
                          .join(", ")}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Time</label>
                      <select
                        name="startTime"
                        required
                        className="h-12 w-full max-w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {formatTime(time)}
                          </option>
                        ))}
                      </select>
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
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Phone number
                        </label>
                        <Input
                          name="customerPhone"
                          placeholder="+1 519 555 0000"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Email optional
                        </label>
                        <Input
                          name="customerEmail"
                          type="email"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Notes optional
                      </label>
                      <textarea
                        name="notes"
                        placeholder="Anything the business should know?"
                        className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                </section>

                <Button className="h-12 w-full bg-black text-white hover:bg-neutral-800">
                  Confirm booking
                </Button>

                <p className="text-center text-sm text-neutral-500">
                  Your appointment will be created as pending until the business
                  confirms it.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
