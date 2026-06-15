import {
  Activity,
  ArrowUp,
  Building2,
  Calendar,
  CreditCard,
  Database,
  DollarSign,
  Server,
  Users,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  ["Total Businesses", "1,248", "12.5% vs last month", Building2],
  ["Total Users", "3,652", "10.2% vs last month", Users],
  ["Total Appointments", "28,459", "18.6% vs last month", Calendar],
  ["Monthly Revenue", "$24,560", "15.3% vs last month", DollarSign],
  ["Active Subscriptions", "2,156", "9.8% vs last month", CreditCard],
];

const topBusinesses = [
  [
    "Glow Barbershop",
    "glowbarbershop.com",
    "Pro",
    "1,234",
    "$1,240",
    "Active",
    "May 28, 2025",
  ],
  [
    "The Nail Place",
    "thenailplace.com",
    "Starter",
    "987",
    "$987",
    "Active",
    "May 24, 2025",
  ],
  [
    "Fresh Cuts",
    "freshcuts.com",
    "Pro",
    "876",
    "$876",
    "Active",
    "May 20, 2025",
  ],
  [
    "Beauty Studio Lagos",
    "beautystudio.com",
    "Free",
    "456",
    "$0",
    "Suspended",
    "May 18, 2025",
  ],
  [
    "Pure Wellness Clinic",
    "purewellness.com",
    "Starter",
    "432",
    "$432",
    "Active",
    "May 15, 2025",
  ],
];

const activity = [
  ["New business registered", "Glow Barbershop", "2m ago"],
  ["New user registered", "john.doe@example.com", "10m ago"],
  ["Subscription upgraded", "The Nail Place", "25m ago"],
  ["Appointment created", "Fresh Cuts", "35m ago"],
  ["Business suspended", "Beauty Studio Lagos", "1h ago"],
];

export default function AdminOverviewPage() {
  return (
    <div>
      <AdminHeader
        title="Overview"
        description="Welcome back, Admin. Here's what's happening on Schedora."
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map(([label, value, helper, Icon]) => (
            <Card
              key={label as string}
              className="rounded-2xl border-neutral-200 shadow-none"
            >
              <CardContent className="flex items-start justify-between p-6">
                <div>
                  <p className="text-sm text-neutral-600">{label as string}</p>
                  <p className="mt-4 text-3xl font-bold">{value as string}</p>
                  <p className="mt-3 flex items-center gap-1 text-sm text-neutral-600">
                    <ArrowUp className="size-3" />
                    {helper as string}
                  </p>
                </div>

                <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Top Businesses</CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="py-3 font-medium">Business</th>
                    <th className="py-3 font-medium">Plan</th>
                    <th className="py-3 font-medium">Appointments</th>
                    <th className="py-3 font-medium">Revenue</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Joined</th>
                    <th className="py-3 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {topBusinesses.map((business) => (
                    <tr
                      key={business[1]}
                      className="border-b border-neutral-100"
                    >
                      <td className="py-4">
                        <p className="font-semibold">{business[0]}</p>
                        <p className="text-neutral-500">{business[1]}</p>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">{business[2]}</Badge>
                      </td>
                      <td className="py-4">{business[3]}</td>
                      <td className="py-4">{business[4]}</td>
                      <td className="py-4">
                        <Badge variant="secondary">{business[5]}</Badge>
                      </td>
                      <td className="py-4 text-neutral-600">{business[6]}</td>
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

          <div className="space-y-6">
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-5">
                  {activity.map((item) => (
                    <div
                      key={item.join("-")}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-3">
                        <div className="grid size-10 place-items-center rounded-xl border border-neutral-200">
                          <Activity className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item[0]}</p>
                          <p className="text-sm text-neutral-500">{item[1]}</p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">{item[2]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <HealthRow
                  icon={Server}
                  label="Platform Status"
                  value="Operational"
                />
                <HealthRow
                  icon={Database}
                  label="Database"
                  value="Operational"
                />
                <HealthRow
                  icon={Activity}
                  label="Server Uptime"
                  value="99.98%"
                />
                <HealthRow
                  icon={Activity}
                  label="API Response Time"
                  value="120ms"
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

function HealthRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 text-sm">
      <span className="flex items-center gap-3 text-neutral-600">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
