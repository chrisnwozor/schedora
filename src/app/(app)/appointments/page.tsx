import { Prisma } from "@prisma/client";
import { updateAppointmentStatusAction } from "@/server/actions/business-records";
import Link from "next/link";
import { Calendar, Filter, Plus, Search } from "lucide-react";

import { formatDate, formatTime, cleanEnum } from "@/lib/format";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const query = search.trim();
  const { business } = await getActiveBusiness();

  const where: Prisma.AppointmentWhereInput = {
    businessId: business.id,
  };

  if (query) {
    where.OR = [
      {
        customer: {
          is: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        customer: {
          is: {
            phone: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        service: {
          is: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        staffMember: {
          is: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: true,
      service: true,
      staffMember: true,
    },
    orderBy: [
      {
        date: "desc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  const today = new Date("2026-06-15T00:00:00.000Z");

  const todayAppointments = appointments.filter(
    (appointment) => appointment.date.toDateString() === today.toDateString(),
  );

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "PENDING",
  );

  return (
    <div>
      <ModuleHeader
        title="Appointments"
        description="Manage bookings, schedules, statuses, and customer appointments."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Link
              href="/appointments/new"
              className="inline-flex items-center gap-2 whitespace-nowrap no-underline"
            >
              <Plus className="size-4" />
              New appointment
            </Link>
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            title="Today"
            value={todayAppointments.length.toString()}
            helper="Appointments today"
          />
          <SummaryCard
            title="All bookings"
            value={appointments.length.toString()}
            helper="Total appointment records"
          />
          <SummaryCard
            title="Pending"
            value={pendingAppointments.length.toString()}
            helper="Need confirmation"
          />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle>All appointments</CardTitle>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <form action="/appointments" className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                      name="search"
                      defaultValue={query}
                      placeholder="Search appointments..."
                      className="h-11 pl-10 sm:w-80"
                    />
                  </form>
                </div>

                <Button variant="outline" className="h-11">
                  <Filter className="mr-2 size-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-3 font-medium">Customer</th>
                  <th className="py-3 font-medium">Service</th>
                  <th className="py-3 font-medium">Staff</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Time</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-neutral-100"
                  >
                    <td className="py-4 font-medium">
                      {appointment.customer.name}
                    </td>
                    <td className="py-4">{appointment.service.name}</td>
                    <td className="py-4 text-neutral-600">
                      {appointment.staffMember?.name ?? "Unassigned"}
                    </td>
                    <td className="py-4 text-neutral-600">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="py-4 text-neutral-600">
                      {formatTime(appointment.startTime)}
                    </td>
                    <td className="py-4">
                      <form
                        action={updateAppointmentStatusAction}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="appointmentId"
                          value={appointment.id}
                        />

                        <select
                          name="status"
                          defaultValue={appointment.status}
                          className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-sm outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="NO_SHOW">No show</option>
                        </select>

                        <Button variant="outline" size="sm" type="submit">
                          Save
                        </Button>
                      </form>
                    </td>
                    <td className="py-4">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-2xl border-neutral-200 shadow-none">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="mt-3 text-4xl font-bold">{value}</p>
          <p className="mt-2 text-sm text-neutral-500">{helper}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
          <Calendar className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
