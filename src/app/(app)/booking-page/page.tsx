import {
  ArrowUpRight,
  Calendar,
  Check,
  Copy,
  Globe,
  LinkIcon,
  Settings,
} from "lucide-react";

import { formatMoneyFromCents } from "@/lib/format";
import { getDemoBusiness } from "@/server/business/get-demo-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function BookingPageSettings() {
  const business = await getDemoBusiness();

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const availabilityRules = await prisma.availabilityRule.findMany({
    where: {
      businessId: business.id,
      staffMemberId: null,
    },
  });

  const openDays = availabilityRules.filter((rule) => !rule.isClosed).length;
  const bookingLink = `schedora.app/book/${business.slug}`;

  return (
    <div>
      <ModuleHeader
        title="Booking Page"
        description="Manage your public booking link and preview how customers book appointments."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <ArrowUpRight className="mr-2 size-4" />
            Open public page
          </Button>
        }
      />

      <main className="grid gap-6 p-6 lg:grid-cols-[1fr_420px] lg:p-10">
        <section className="space-y-6">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Public booking link</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="max-w-2xl leading-7 text-neutral-600">
                Share this link with customers so they can choose a service,
                select a time, and book without creating an account.
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                  <LinkIcon className="size-4 text-neutral-500" />
                  <span className="truncate text-sm">{bookingLink}</span>
                </div>

                <Button className="bg-black text-white hover:bg-neutral-800">
                  <Copy className="mr-2 size-4" />
                  Copy link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Booking page settings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Business slug</label>
                <Input value={business.slug} readOnly />
                <p className="text-sm text-neutral-500">
                  This controls your public booking URL.
                </p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Booking page title
                </label>
                <Input
                  value={`Book an appointment with ${business.name}`}
                  readOnly
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Booking description
                </label>
                <textarea
                  readOnly
                  className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
                  value={
                    business.description ??
                    "Choose your service, pick a time, and confirm your appointment in minutes."
                  }
                />
              </div>

              <Button variant="outline">
                <Settings className="mr-2 size-4" />
                Edit booking settings
              </Button>
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Customer preview</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-xl bg-black text-white">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{business.name}</h3>
                    <p className="text-sm text-neutral-500">
                      {business.businessType}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-neutral-600">
                  Select a service to start your booking.
                </p>

                <div className="mt-5 space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 p-4"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-neutral-500">
                          {service.durationMinutes} min
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatMoneyFromCents(service.priceCents)}
                      </p>
                    </div>
                  ))}
                </div>

                <Button className="mt-5 w-full bg-black text-white hover:bg-neutral-800">
                  Continue
                </Button>
              </div>

              <div className="mt-5 rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5" />
                  <p className="font-semibold">Booking status</p>
                </div>

                <div className="mt-4 space-y-3 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <Check className="size-4" />
                    Public page active
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="size-4" />
                    {services.length} services available
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="size-4" />
                    {openDays} open days configured
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
