import { getAdminSubscriptionsData } from "@/server/admin/get-admin-data";
import { cleanEnum } from "@/lib/format";
import { CreditCard, Filter, Search } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const subscriptions = [
  ["Glow Barbershop", "Pro", "$39", "Unlimited", "Active"],
  ["The Nail Place", "Starter", "$19", "68 / 100", "Active"],
  ["Fresh Cuts", "Pro", "$39", "Unlimited", "Active"],
  ["Beauty Studio Lagos", "Free", "$0", "20 / 20", "Limit reached"],
  ["Pure Wellness Clinic", "Starter", "$19", "45 / 100", "Active"],
];

export default async function AdminSubscriptionsPage() {
  const data = await getAdminSubscriptionsData();
  return (
    <div>
      <AdminHeader
        title="Subscriptions"
        description="Track plans, booking limits, billing status, and manual upgrades."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <CreditCard className="mr-2 size-4" />
            Billing settings
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-4">
          <Summary title="Free" value={data.free.toString()} />
          <Summary title="Starter" value={data.starter.toString()} />
          <Summary title="Pro" value={data.pro.toString()} />
          <Summary title="Active" value={data.active.toString()} />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle>Subscription Accounts</CardTitle>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Search subscriptions..."
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
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-3 font-medium">Business</th>
                  <th className="py-3 font-medium">Plan</th>
                  <th className="py-3 font-medium">Price</th>
                  <th className="py-3 font-medium">Usage</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.subscriptions.map((subscription) => {
                  const usage =
                    subscription.business.bookingUsage[0]?.bookingCount ?? 0;
                  const limit =
                    subscription.plan === "PRO"
                      ? "Unlimited"
                      : subscription.plan === "STARTER"
                        ? `${usage} / 100`
                        : `${usage} / 20`;

                  return (
                    <tr
                      key={subscription.id}
                      className="border-b border-neutral-100"
                    >
                      <td className="py-4 font-semibold">
                        {subscription.business.name}
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">
                          {cleanEnum(subscription.plan)}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {subscription.plan === "FREE"
                          ? "$0"
                          : subscription.plan === "STARTER"
                            ? "$19"
                            : "$39"}
                      </td>
                      <td className="py-4">{limit}</td>
                      <td className="py-4">
                        <Badge variant="secondary">
                          {cleanEnum(subscription.status)}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Button variant="outline" size="sm">
                          Change plan
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        <p className="mt-3 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
