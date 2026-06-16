import Link from "next/link";
import { CopyButton } from "@/components/modules/copy-button";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  LinkIcon,
  Search,
  Users,
  Zap,
} from "lucide-react";

import { formatDate, formatTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DashboardData = Awaited<
  ReturnType<
    typeof import("@/server/dashboard/get-dashboard-data").getDashboardData
  >
>;

export function BusinessDashboard({ data }: { data: DashboardData }) {
  const usageLimitText = data.usage.limit
    ? data.usage.limit.toString()
    : "Unlimited";
  const usageLabel = data.usage.limit
    ? `${data.usage.used} / ${data.usage.limit} bookings`
    : `${data.usage.used} bookings`;

  const metrics = [
    {
      label: "Today's appointments",
      value: data.metrics.todayAppointments.toString(),
      helper: `${data.metrics.pendingToday} pending`,
      icon: Calendar,
    },
    {
      label: "Upcoming appointments",
      value: data.metrics.upcomingAppointments.toString(),
      helper: "Next appointments",
      icon: Clock,
    },
    {
      label: "Total bookings",
      value: data.metrics.monthlyBookings.toString(),
      helper: "All seeded bookings",
      icon: BarChart3,
    },
    {
      label: "Total customers",
      value: data.metrics.totalCustomers.toString(),
      helper: "Customer records",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 px-6 py-6 lg:px-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-neutral-600">
              Here&apos;s what&apos;s happening at {data.business.name} today.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <form action="/appointments" className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <Input
                name="search"
                placeholder="Search customers or appointments..."
                className="h-11 w-full pl-10 sm:w-80"
              />
            </form>

            <Button
              asChild
              className="h-11 bg-black text-white hover:bg-neutral-800"
            >
              <Link
                href="/appointments/new"
                className="inline-flex items-center gap-2"
              >
                <Calendar className="size-4" />
                New appointment
              </Link>
            </Button>

            <CopyButton
              value={data.bookingLink}
              label="Copy booking link"
              className="h-11 border border-neutral-200 bg-white text-black hover:bg-neutral-50"
            />
          </div>
        </div>
      </header>

      <div className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card
              key={metric.label}
              className="rounded-2xl border-neutral-200 shadow-none"
            >
              <CardContent className="flex items-start justify-between p-6">
                <div>
                  <p className="text-sm text-neutral-600">{metric.label}</p>
                  <p className="mt-4 text-4xl font-bold">{metric.value}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    {metric.helper}
                  </p>
                </div>

                <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
                  <metric.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.9fr]">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Today&apos;s schedule</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                {data.todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-4 text-sm"
                  >
                    <span className="text-neutral-600">
                      {formatTime(item.startTime)}
                    </span>
                    <span className="font-medium">{item.customer.name}</span>
                    <span className="text-neutral-600">
                      {item.service.name}
                    </span>
                    <Badge variant="secondary">
                      {cleanStatus(item.status)}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5">
                <Button variant="ghost" className="px-0">
                  View all appointments
                </Button>
                <ArrowUpRight className="size-4" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader>
                <CardTitle>Monthly booking usage</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-bold">{usageLabel}</p>

                <div className="mt-7 h-3 rounded-full bg-neutral-200">
                  <div
                    className="h-3 rounded-full bg-black"
                    style={{
                      width: `${Math.min(data.usage.percentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-2 text-right text-sm font-semibold">
                  {data.usage.limit ? `${data.usage.percentage}%` : "Unlimited"}
                </div>

                <p className="mt-5 leading-7 text-neutral-600">
                  {data.usage.limit
                    ? `You have ${data.usage.remaining} bookings remaining on the ${cleanStatus(data.usage.plan)} plan.`
                    : `You have unlimited bookings on the ${cleanStatus(data.usage.plan)} plan.`}
                </p>

                <Button asChild variant="outline" className="mt-8 h-11 w-full">
                  <Link href="/subscription">Upgrade plan</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quick actions</CardTitle>
                <Zap className="size-5" />
              </CardHeader>

              <CardContent>
                <div className="divide-y divide-neutral-200">
                  {[
                    { label: "Add appointment", href: "/appointments/new" },
                    { label: "Add customer", href: "/customers/new" },
                    { label: "Add service", href: "/services/new" },
                    { label: "Set availability", href: "/availability" },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-neutral-600"
                    >
                      <span>{action.label}</span>
                      <span>›</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Recent appointments</CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="py-3 font-medium">Customer</th>
                    <th className="py-3 font-medium">Service</th>
                    <th className="py-3 font-medium">Staff</th>
                    <th className="py-3 font-medium">Date</th>
                    <th className="py-3 font-medium">Time</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.recentAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-neutral-100"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-full bg-neutral-100 text-xs font-semibold">
                            {getInitials(appointment.customer.name)}
                          </div>
                          <span className="font-medium">
                            {appointment.customer.name}
                          </span>
                        </div>
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
                        <Badge variant="secondary">
                          {cleanStatus(appointment.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Button variant="ghost" className="mt-5 px-0">
                View all appointments
                <ArrowUpRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Booking link</CardTitle>
                <LinkIcon className="size-5" />
              </CardHeader>

              <CardContent>
                <p className="leading-7 text-neutral-600">
                  Your customers can book appointments using your public booking
                  link.
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-neutral-300 p-4 text-sm">
                  <LinkIcon className="size-4 shrink-0" />
                  <span className="truncate">{data.bookingLink}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <CopyButton
                    value={data.bookingLink}
                    label="Copy link"
                    className="bg-black text-white hover:bg-neutral-800"
                  />

                  <Button asChild variant="outline">
                    <Link href={`/book/${data.business.slug}`}>Open page</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader>
                <CardTitle>Plan</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="font-semibold">
                    {cleanStatus(data.usage.plan)} Plan
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Booking limit: {usageLimitText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function cleanStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
