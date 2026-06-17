import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Scissors } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocalDateInputValue } from "@/lib/date";
import { dayName, formatTime } from "@/lib/format";
import { PublicBookingForm } from "@/components/booking/public-booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default async function PublicBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      availabilityRules: {
        where: { staffMemberId: null },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });
  if (!business || business.status !== "ACTIVE") {
    notFound();
  }
  const validOpenRules = business.availabilityRules.filter(
    (rule) => !rule.isClosed && rule.startTime < rule.endTime,
  );
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 text-black sm:px-6 sm:py-10">
      {" "}
      <div className="mx-auto max-w-6xl">
        {" "}
        <div className="mb-8 flex items-center justify-between gap-4">
          {" "}
          <Link href="/" className="text-xl font-bold tracking-tight">
            {" "}
            schedora{" "}
          </Link>{" "}
          <div className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 sm:px-4 sm:text-sm">
            {" "}
            Public booking page{" "}
          </div>{" "}
        </div>{" "}
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {" "}
          <aside className="space-y-6">
            {" "}
            <Card className="rounded-2xl border-neutral-200 bg-white shadow-none">
              {" "}
              <CardContent className="p-5 sm:p-6">
                {" "}
                <div className="grid size-14 place-items-center rounded-2xl bg-black text-white">
                  {" "}
                  <Scissors className="size-6" />{" "}
                </div>{" "}
                <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                  {" "}
                  {business.name}{" "}
                </h1>{" "}
                <p className="mt-2 text-neutral-600">
                  {" "}
                  {business.businessType}{" "}
                </p>{" "}
                <p className="mt-5 leading-7 text-neutral-600">
                  {" "}
                  {business.description ??
                    "Choose a service, pick a time, and confirm your appointment."}{" "}
                </p>{" "}
                <div className="mt-6 space-y-3 text-sm text-neutral-600">
                  {" "}
                  {business.address ? (
                    <p className="flex items-start gap-2">
                      {" "}
                      <Check className="mt-0.5 size-4 shrink-0" />{" "}
                      <span>{business.address}</span>{" "}
                    </p>
                  ) : null}{" "}
                  <p className="flex items-center gap-2">
                    {" "}
                    <Check className="size-4 shrink-0" />{" "}
                    {business.services.length} services available{" "}
                  </p>{" "}
                  <p className="flex items-center gap-2">
                    {" "}
                    <Check className="size-4 shrink-0" /> No account
                    required{" "}
                  </p>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
            <Card className="rounded-2xl border-neutral-200 bg-white shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Opening hours</CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent className="space-y-3">
                {" "}
                {business.availabilityRules.map((rule) => {
                  const closed =
                    rule.isClosed || rule.startTime >= rule.endTime;
                  return (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3 text-sm last:border-b-0"
                    >
                      {" "}
                      <span className="font-medium">
                        {" "}
                        {dayName(rule.dayOfWeek)}{" "}
                      </span>{" "}
                      <span className="shrink-0 text-right text-neutral-600">
                        {" "}
                        {closed
                          ? "Closed"
                          : `${formatTime(rule.startTime)} - ${formatTime(rule.endTime)}`}{" "}
                      </span>{" "}
                    </div>
                  );
                })}{" "}
              </CardContent>{" "}
            </Card>{" "}
          </aside>{" "}
          <Card className="min-w-0 rounded-2xl border-neutral-200 bg-white shadow-none">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-2xl sm:text-3xl">
                {" "}
                Book an appointment{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent>
              {" "}
              <PublicBookingForm
                slug={business.slug}
                services={business.services}
                initialDate={getLocalDateInputValue()}
                openDayNames={validOpenRules.map((rule) =>
                  dayName(rule.dayOfWeek),
                )}
                error={error}
              />{" "}
            </CardContent>{" "}
          </Card>{" "}
        </section>{" "}
      </div>{" "}
    </main>
  );
}
