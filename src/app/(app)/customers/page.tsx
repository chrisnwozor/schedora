import Link from "next/link";
import { Mail, Phone, Plus, Search, Users } from "lucide-react";

import { getInitials } from "@/lib/format";
import { getDemoBusiness } from "@/server/business/get-demo-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function CustomersPage() {
  const business = await getDemoBusiness();

  const customers = await prisma.customer.findMany({
    where: {
      businessId: business.id,
    },
    include: {
      appointments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <ModuleHeader
        title="Customers"
        description="View customer records, contact information, and booking history."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Link
              href="/customers/new"
              className="inline-flex items-center gap-2 whitespace-nowrap no-underline"
            >
              <Plus className="size-4" />
              Add customer
            </Link>
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <Summary
            title="Total customers"
            value={customers.length.toString()}
          />
          <Summary
            title="With email"
            value={customers
              .filter((customer) => customer.email)
              .length.toString()}
          />
          <Summary
            title="Total bookings"
            value={customers
              .reduce(
                (total, customer) => total + customer.appointments.length,
                0,
              )
              .toString()}
          />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle>Customer records</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search customers..."
                  className="h-11 pl-10 sm:w-80"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-2xl border border-neutral-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-full bg-neutral-100 font-bold">
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <Badge variant="secondary" className="mt-1">
                        {customer.appointments.length > 1 ? "Returning" : "New"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <Mail className="size-4" />
                    {customer.email ?? "No email"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4" />
                    {customer.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4" />
                    {customer.appointments.length} bookings
                  </p>
                </div>

                <Button variant="outline" className="mt-5 w-full">
                  View profile
                </Button>
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
