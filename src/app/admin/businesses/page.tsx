import { Building2, Filter, Plus, Search } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const businesses = [
  [
    "Glow Barbershop",
    "Barber",
    "Pro",
    "Active",
    "1,234",
    "$1,240",
    "May 28, 2025",
  ],
  [
    "The Nail Place",
    "Nail Tech",
    "Starter",
    "Active",
    "987",
    "$987",
    "May 24, 2025",
  ],
  ["Fresh Cuts", "Barber", "Pro", "Active", "876", "$876", "May 20, 2025"],
  [
    "Beauty Studio Lagos",
    "Beauty",
    "Free",
    "Suspended",
    "456",
    "$0",
    "May 18, 2025",
  ],
  [
    "Pure Wellness Clinic",
    "Clinic",
    "Starter",
    "Active",
    "432",
    "$432",
    "May 15, 2025",
  ],
];

export default function AdminBusinessesPage() {
  return (
    <div>
      <AdminHeader
        title="Businesses"
        description="Manage tenant businesses, plans, statuses, and account health."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Plus className="mr-2 size-4" />
            Add business
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-4">
          <Summary title="Total businesses" value="1,248" />
          <Summary title="Active" value="1,189" />
          <Summary title="Suspended" value="22" />
          <Summary title="Free plans" value="642" />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle>Business Directory</CardTitle>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Search businesses..."
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
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-3 font-medium">Business</th>
                  <th className="py-3 font-medium">Type</th>
                  <th className="py-3 font-medium">Plan</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Bookings</th>
                  <th className="py-3 font-medium">Revenue</th>
                  <th className="py-3 font-medium">Joined</th>
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {businesses.map((business) => (
                  <tr key={business[0]} className="border-b border-neutral-100">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-black text-white">
                          <Building2 className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{business[0]}</p>
                          <p className="text-neutral-500">
                            {business[0].toLowerCase().replaceAll(" ", "")}.com
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{business[1]}</td>
                    <td className="py-4">
                      <Badge variant="secondary">{business[2]}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant="secondary">{business[3]}</Badge>
                    </td>
                    <td className="py-4">{business[4]}</td>
                    <td className="py-4">{business[5]}</td>
                    <td className="py-4 text-neutral-600">{business[6]}</td>
                    <td className="py-4">
                      <Button variant="outline" size="sm">
                        Manage
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
