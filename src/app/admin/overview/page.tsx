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

import { getAdminOverviewData } from "@/server/admin/get-admin-data";
import { cleanEnum, formatDate } from "@/lib/format";
import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const data = await getAdminOverviewData();

  const metrics = [
    [
      "Total Businesses",
      data.metrics.totalBusinesses.toString(),
      "All tenant accounts",
      Building2,
    ],
    [
      "Total Users",
      data.metrics.totalUsers.toString(),
      "All platform users",
      Users,
    ],
    [
      "Total Appointments",
      data.metrics.totalAppointments.toString(),
      "All appointment records",
      Calendar,
    ],
    [
      "Monthly Revenue",
      `$${data.metrics.monthlyRevenue.toLocaleString()}`,
      "Estimated manual billing",
      DollarSign,
    ],
    [
      "Active Subscriptions",
      data.metrics.activeSubscriptions.toString(),
      "Active plan records",
      CreditCard,
    ],
  ] as const;

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
              key={label}
              className="rounded-2xl border-neutral-200 shadow-none"
            >
              <CardContent className="flex items-start justify-between p-6">
                <div>
                  <p className="text-sm text-neutral-600">{label}</p>
                  <p className="mt-4 text-3xl font-bold">{value}</p>
                  <p className="mt-3 flex items-center gap-1 text-sm text-neutral-600">
                    <ArrowUp className="size-3" />
                    {helper}
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
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Joined</th>
                    <th className="py-3 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data.topBusinesses.map((business) => (
                    <tr
                      key={business.id}
                      className="border-b border-neutral-100"
                    >
                      <td className="py-4">
                        <p className="font-semibold">{business.name}</p>
                        <p className="text-neutral-500">
                          /book/{business.slug}
                        </p>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">
                          {business.subscription?.plan
                            ? cleanEnum(business.subscription.plan)
                            : "Free"}
                        </Badge>
                      </td>
                      <td className="py-4">{business.appointments.length}</td>
                      <td className="py-4">
                        <Badge variant="secondary">
                          {cleanEnum(business.status)}
                        </Badge>
                      </td>
                      <td className="py-4 text-neutral-600">
                        {formatDate(business.createdAt)}
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

          <div className="space-y-6">
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-5">
                  {data.recentBusinesses.map((business) => (
                    <div
                      key={business.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-3">
                        <div className="grid size-10 place-items-center rounded-xl border border-neutral-200">
                          <Activity className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            Business registered
                          </p>
                          <p className="text-sm text-neutral-500">
                            {business.name}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {formatDate(business.createdAt)}
                      </p>
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
                <HealthRow icon={Database} label="Database" value="Connected" />
                <HealthRow
                  icon={Activity}
                  label="Admin Access"
                  value="Protected"
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
