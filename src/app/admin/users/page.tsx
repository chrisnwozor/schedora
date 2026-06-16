import { getAdminUsersData } from "@/server/admin/get-admin-data";
import { cleanEnum } from "@/lib/format";
import { Filter, Search, UserPlus } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const users = [
  [
    "Ugochukwu Nwozor",
    "owner@glowbarbershop.com",
    "Owner",
    "Glow Barbershop",
    "Active",
  ],
  [
    "James Wilson",
    "james@glowbarbershop.com",
    "Staff",
    "Glow Barbershop",
    "Active",
  ],
  ["Sarah Lee", "sarah@thenailplace.com", "Owner", "The Nail Place", "Active"],
  ["Mike Adams", "mike@freshcuts.com", "Staff", "Fresh Cuts", "Active"],
  ["Admin Owner", "admin@schedora.com", "Platform Admin", "Schedora", "Active"],
];

export default async function AdminUsersPage() {
  const data = await getAdminUsersData();
  return (
    <div>
      <AdminHeader
        title="Users"
        description="View platform users, business memberships, and account status."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <UserPlus className="mr-2 size-4" />
            Invite user
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-4">
          <Summary title="Total users" value={data.total.toString()} />
          <Summary title="Owners" value={data.businessOwners.toString()} />
          <Summary title="Staff" value={data.staffUsers.toString()} />
          <Summary title="Admins" value={data.platformAdmins.toString()} />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle>Platform Users</CardTitle>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Search users..."
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
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-3 font-medium">User</th>
                  <th className="py-3 font-medium">Role</th>
                  <th className="py-3 font-medium">Business</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.users.map((user) => {
                  const firstMembership = user.memberships[0];

                  return (
                    <tr key={user.id} className="border-b border-neutral-100">
                      <td className="py-4">
                        <p className="font-semibold">
                          {user.name ?? "Unnamed user"}
                        </p>
                        <p className="text-neutral-500">{user.email}</p>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">
                          {user.platformRole === "PLATFORM_ADMIN"
                            ? "Platform Admin"
                            : firstMembership
                              ? cleanEnum(firstMembership.role)
                              : "User"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {firstMembership?.business.name ?? "No business"}
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">Active</Badge>
                      </td>
                      <td className="py-4">
                        <Button variant="outline" size="sm">
                          View
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
