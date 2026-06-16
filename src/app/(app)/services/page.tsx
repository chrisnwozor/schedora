import { toggleServiceStatusAction } from "@/server/actions/business-records";
import Link from "next/link";
import { Clock, DollarSign, Plus, Scissors } from "lucide-react";

import { formatMoneyFromCents } from "@/lib/format";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ServicesPage() {
  const { business } = await getActiveBusiness();

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const averagePrice =
    services.length > 0
      ? services.reduce((total, service) => total + service.priceCents, 0) /
        services.length
      : 0;

  const averageDuration =
    services.length > 0
      ? Math.round(
          services.reduce(
            (total, service) => total + service.durationMinutes,
            0,
          ) / services.length,
        )
      : 0;

  return (
    <div>
      <ModuleHeader
        title="Services"
        description="Create services, set pricing, manage durations, and control what customers can book."
        action={
          <Button asChild className="bg-black text-white hover:bg-neutral-800">
            <Link
              href="/services/new"
              className="inline-flex items-center gap-2 whitespace-nowrap no-underline"
            >
              <Plus className="size-4" />
              Add service
            </Link>
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <Summary
            title="Active services"
            value={services
              .filter((service) => service.isActive)
              .length.toString()}
          />
          <Summary
            title="Average price"
            value={formatMoneyFromCents(averagePrice)}
          />
          <Summary title="Average duration" value={`${averageDuration}m`} />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Service catalog</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-neutral-200 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
                    <Scissors className="size-5" />
                  </div>
                  <Badge variant="secondary">
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <h3 className="mt-5 text-lg font-bold">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {service.description ?? "No description"}
                </p>

                <div className="mt-5 grid gap-3 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <DollarSign className="size-4" />
                    {formatMoneyFromCents(service.priceCents)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="size-4" />
                    {service.durationMinutes} min
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline">Edit</Button>
                  <form action={toggleServiceStatusAction}>
                    <input type="hidden" name="serviceId" value={service.id} />
                    <input
                      type="hidden"
                      name="isActive"
                      value={service.isActive ? "false" : "true"}
                    />

                    <Button variant="outline" type="submit" className="w-full">
                      {service.isActive ? "Disable" : "Enable"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-2xl border-neutral-200 shadow-none">
      <CardContent className="p-6">
        <p className="text-sm text-neutral-600">{title}</p>
        <p className="mt-3 text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
