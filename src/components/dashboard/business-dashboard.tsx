import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  LinkIcon,
  Plus,
  Scissors,
  Search,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const metrics = [
  {
    label: "Today's appointments",
    value: "12",
    helper: "3 pending",
    icon: Calendar,
  },
  {
    label: "Upcoming appointments",
    value: "28",
    helper: "Next 7 days",
    icon: Clock,
  },
  {
    label: "Total bookings",
    value: "68",
    helper: "This month",
    icon: BarChart3,
  },
  {
    label: "Total customers",
    value: "243",
    helper: "18 new this month",
    icon: Users,
  },
];

const todaySchedule = [
  ["9:00 AM", "Dwayne Carter", "Fade + Beard", "Confirmed"],
  ["10:30 AM", "Marvin McKinney", "Haircut", "Confirmed"],
  ["12:00 PM", "Cody Fisher", "Fade", "Pending"],
  ["1:30 PM", "Brooklyn Simmons", "Haircut + Beard", "Completed"],
  ["3:00 PM", "Esther Howard", "Beard Trim", "Confirmed"],
];

const recentAppointments = [
  [
    "DC",
    "Dwayne Carter",
    "Fade + Beard",
    "James",
    "May 19, 2025",
    "9:00 AM",
    "Confirmed",
  ],
  [
    "MM",
    "Marvin McKinney",
    "Haircut",
    "James",
    "May 19, 2025",
    "10:30 AM",
    "Confirmed",
  ],
  ["CF", "Cody Fisher", "Fade", "Mike", "May 19, 2025", "12:00 PM", "Pending"],
  [
    "BS",
    "Brooklyn Simmons",
    "Haircut + Beard",
    "James",
    "May 19, 2025",
    "1:30 PM",
    "Completed",
  ],
  [
    "EH",
    "Esther Howard",
    "Beard Trim",
    "Mike",
    "May 19, 2025",
    "3:00 PM",
    "Confirmed",
  ],
];

const quickActions = [
  { label: "Add appointment", icon: Calendar },
  { label: "Add customer", icon: Users },
  { label: "Add service", icon: Scissors },
  { label: "Add staff member", icon: Users },
  { label: "Set availability", icon: Clock },
  { label: "View booking page", icon: ArrowUpRight },
];

export function BusinessDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 px-6 py-6 lg:px-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-neutral-600">
              Here&apos;s what&apos;s happening at Glow Barbershop today.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <Input
                placeholder="Search customers or appointments..."
                className="h-11 w-full pl-10 sm:w-80"
              />
            </div>

            <Button className="h-11 bg-black text-white hover:bg-neutral-800">
              <Calendar className="mr-2 size-4" />
              New appointment
            </Button>

            <Button variant="outline" className="h-11">
              <LinkIcon className="mr-2 size-4" />
              Copy booking link
            </Button>
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
                {todaySchedule.map((item) => (
                  <div
                    key={item.join("-")}
                    className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-4 text-sm"
                  >
                    <span className="text-neutral-600">{item[0]}</span>
                    <span className="font-medium">{item[1]}</span>
                    <span className="text-neutral-600">{item[2]}</span>
                    <Badge variant="secondary">{item[3]}</Badge>
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
                <p className="text-4xl font-bold">68 / 100 bookings</p>

                <div className="mt-7 h-3 rounded-full bg-neutral-200">
                  <div className="h-3 w-[68%] rounded-full bg-black" />
                </div>

                <div className="mt-2 text-right text-sm font-semibold">68%</div>

                <p className="mt-5 leading-7 text-neutral-600">
                  You have 32 bookings remaining on the Starter plan.
                </p>

                <Button variant="outline" className="mt-8 h-11 w-full">
                  Upgrade plan
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
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
                    >
                      <span className="flex items-center gap-3">
                        <action.icon className="size-5" />
                        {action.label}
                      </span>
                      <span>›</span>
                    </button>
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
                  {recentAppointments.map((appointment) => (
                    <tr
                      key={appointment.join("-")}
                      className="border-b border-neutral-100"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-full bg-neutral-100 text-xs font-semibold">
                            {appointment[0]}
                          </div>
                          <span className="font-medium">{appointment[1]}</span>
                        </div>
                      </td>
                      <td className="py-4">{appointment[2]}</td>
                      <td className="py-4 text-neutral-600">
                        {appointment[3]}
                      </td>
                      <td className="py-4 text-neutral-600">
                        {appointment[4]}
                      </td>
                      <td className="py-4 text-neutral-600">
                        {appointment[5]}
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">{appointment[6]}</Badge>
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
                  <span className="truncate">
                    schedora.app/book/glowbarbershop
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button className="bg-black text-white hover:bg-neutral-800">
                    <Copy className="mr-2 size-4" />
                    Copy link
                  </Button>
                  <Button variant="outline">Open page</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader>
                <CardTitle>Upcoming appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                  <div className="grid size-14 place-items-center rounded-xl bg-neutral-100 text-center text-xs font-bold">
                    MAY
                    <br />
                    20
                  </div>

                  <div>
                    <p className="font-semibold">8 appointments</p>
                    <p className="text-sm text-neutral-500">Tomorrow</p>
                  </div>

                  <ArrowUpRight className="size-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
