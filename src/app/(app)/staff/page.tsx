import { toggleStaffStatusAction } from "@/server/actions/business-records";
import Link from "next/link";
import { Calendar, Plus, Scissors } from "lucide-react";

import { getInitials } from "@/lib/format";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StaffPage() {
  const { business } = await getActiveBusiness();

  const staff = await prisma.staffMember.findMany({
    where: {
      businessId: business.id,
    },
    include: {
      appointments: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <div>
      <ModuleHeader
        title="Staff"
        description="Manage staff members, roles, assigned services, and appointment capacity."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Link
              href="/staff/new"
              className="inline-flex items-center gap-2 whitespace-nowrap no-underline"
            >
              <Plus className="size-4" />
              Add staff member
            </Link>
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <Summary title="Staff members" value={staff.length.toString()} />
          <Summary
            title="Active"
            value={staff.filter((member) => member.isActive).length.toString()}
          />
          <Summary
            title="Assigned appointments"
            value={staff
              .reduce((total, member) => total + member.appointments.length, 0)
              .toString()}
          />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Team members</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-neutral-200 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-full bg-neutral-100 font-bold">
                    {getInitials(member.name)}
                  </div>
                  <Badge variant="secondary">
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <h3 className="mt-5 text-lg font-bold">{member.name}</h3>
                <p className="text-sm text-neutral-500">
                  {member.roleTitle ?? "Staff member"}
                </p>

                <div className="mt-5 space-y-3 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <Scissors className="size-4" />
                    Services assignment coming soon
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    {member.appointments.length} appointments
                  </p>
                </div>

                <form action={toggleStaffStatusAction} className="mt-6">
                  <input type="hidden" name="staffMemberId" value={member.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={member.isActive ? "false" : "true"}
                  />

                  <Button variant="outline" type="submit" className="w-full">
                    {member.isActive ? "Deactivate staff" : "Activate staff"}
                  </Button>
                </form>
              </div>
            ))}
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
        <p className="mt-3 text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
