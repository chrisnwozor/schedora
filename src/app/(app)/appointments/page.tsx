import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Calendar, Plus, Search } from "lucide-react";
import { getDateInputValueInTimeZone, parseDateInputAsUtc } from "@/lib/date";
import { cleanEnum, formatDate, formatTime } from "@/lib/format";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
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
  const where: Prisma.AppointmentWhereInput = { businessId: business.id };
  if (query) {
    where.OR = [
      { customer: { is: { name: { contains: query, mode: "insensitive" } } } },
      { customer: { is: { phone: { contains: query, mode: "insensitive" } } } },
      { service: { is: { name: { contains: query, mode: "insensitive" } } } },
      {
        staffMember: { is: { name: { contains: query, mode: "insensitive" } } },
      },
    ];
  }
  const appointments = await prisma.appointment.findMany({
    where,
    include: { customer: true, service: true, staffMember: true },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });
  const today = parseDateInputAsUtc(
    getDateInputValueInTimeZone(business.timeZone),
  );

  if (!today) {
    throw new Error("Unable to calculate today.");
  }
  const todayAppointments = appointments.filter(
    (appointment) => appointment.date.getTime() === today.getTime(),
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
          <Link
            href="/appointments/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <Plus className="size-4" /> New appointment
          </Link>
        }
      />
      <main className="space-y-6 p-4 sm:p-6 lg:p-10">
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
                    <td className="py-4"> {appointment.service.name} </td>
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
                      <Badge variant="secondary">
                        {cleanEnum(appointment.status)}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-sm font-medium hover:bg-neutral-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-neutral-500"
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : null}
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
          <p className="mt-2 text-sm text-neutral-500"> {helper} </p>
        </div>
        <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
          <Calendar className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
