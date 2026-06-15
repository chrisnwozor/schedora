import { Calendar, Filter, Plus, Search } from "lucide-react";

import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const appointments = [
  [
    "Dwayne Carter",
    "Fade + Beard",
    "James",
    "May 19, 2025",
    "9:00 AM",
    "Confirmed",
  ],
  [
    "Marvin McKinney",
    "Haircut",
    "James",
    "May 19, 2025",
    "10:30 AM",
    "Confirmed",
  ],
  ["Cody Fisher", "Fade", "Mike", "May 19, 2025", "12:00 PM", "Pending"],
  [
    "Brooklyn Simmons",
    "Haircut + Beard",
    "James",
    "May 19, 2025",
    "1:30 PM",
    "Completed",
  ],
  [
    "Esther Howard",
    "Beard Trim",
    "Mike",
    "May 19, 2025",
    "3:00 PM",
    "Confirmed",
  ],
];

export default function AppointmentsPage() {
  return (
    <div>
      <ModuleHeader
        title="Appointments"
        description="Manage bookings, schedules, statuses, and customer appointments."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Plus className="mr-2 size-4" />
            New appointment
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <SummaryCard title="Today" value="12" helper="3 pending" />
          <SummaryCard
            title="This week"
            value="28"
            helper="Upcoming appointments"
          />
          <SummaryCard title="This month" value="68" helper="Total bookings" />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle>All appointments</CardTitle>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Search appointments..."
                    className="h-11 pl-10 sm:w-80"
                  />
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
                    key={appointment.join("-")}
                    className="border-b border-neutral-100"
                  >
                    <td className="py-4 font-medium">{appointment[0]}</td>
                    <td className="py-4">{appointment[1]}</td>
                    <td className="py-4 text-neutral-600">{appointment[2]}</td>
                    <td className="py-4 text-neutral-600">{appointment[3]}</td>
                    <td className="py-4 text-neutral-600">{appointment[4]}</td>
                    <td className="py-4">
                      <Badge variant="secondary">{appointment[5]}</Badge>
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
