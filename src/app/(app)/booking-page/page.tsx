import {
  ArrowUpRight,
  Calendar,
  Check,
  Copy,
  Globe,
  LinkIcon,
  Settings,
} from "lucide-react";

import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const services = [
  ["Haircut", "$35", "30 min"],
  ["Fade", "$40", "35 min"],
  ["Fade + Beard", "$55", "50 min"],
];

export default function BookingPageSettings() {
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
                  <span className="truncate text-sm">
                    schedora.app/book/glowbarbershop
                  </span>
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
                <Input value="glowbarbershop" readOnly />
                <p className="text-sm text-neutral-500">
                  This controls your public booking URL.
                </p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Booking page title
                </label>
                <Input
                  value="Book an appointment with Glow Barbershop"
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
                  value="Choose your service, pick a time, and confirm your appointment in minutes."
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
                    <h3 className="font-semibold">Glow Barbershop</h3>
                    <p className="text-sm text-neutral-500">Barber</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-neutral-600">
                  Select a service to start your booking.
                </p>

                <div className="mt-5 space-y-3">
                  {services.map((service) => (
                    <div
                      key={service[0]}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 p-4"
                    >
                      <div>
                        <p className="font-medium">{service[0]}</p>
                        <p className="text-sm text-neutral-500">{service[2]}</p>
                      </div>
                      <p className="font-semibold">{service[1]}</p>
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
                    <Check className="size-4" />5 services available
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="size-4" />
                    Availability configured
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
