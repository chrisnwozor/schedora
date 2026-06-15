import { Calendar, Plus, Scissors, Users } from "lucide-react";

import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const staff = [
  ["James Wilson", "Barber", "5 services", "24 appointments", "Active"],
  ["Mike Adams", "Barber", "3 services", "18 appointments", "Active"],
  ["Sarah Lee", "Manager", "All services", "12 appointments", "Active"],
];

export default function StaffPage() {
  return (
    <div>
      <ModuleHeader
        title="Staff"
        description="Manage staff members, roles, assigned services, and appointment capacity."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Plus className="mr-2 size-4" />
            Add staff member
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <Summary title="Staff members" value="3" />
          <Summary title="Active today" value="2" />
          <Summary title="Assigned services" value="8" />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Team members</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member[0]}
                className="rounded-2xl border border-neutral-200 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-full bg-neutral-100 font-bold">
                    {member[0]
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <Badge variant="secondary">{member[4]}</Badge>
                </div>

                <h3 className="mt-5 text-lg font-bold">{member[0]}</h3>
                <p className="text-sm text-neutral-500">{member[1]}</p>

                <div className="mt-5 space-y-3 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <Scissors className="size-4" />
                    {member[2]}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    {member[3]}
                  </p>
                </div>

                <Button variant="outline" className="mt-6 w-full">
                  Manage staff
                </Button>
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
