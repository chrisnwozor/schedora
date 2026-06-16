import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { createAppointmentAction } from "@/server/actions/business-records";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const timeOptions = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export default async function NewAppointmentPage() {
  const { business } = await getActiveBusiness();

  const [customers, services, staffMembers] = await Promise.all([
    prisma.customer.findMany({
      where: {
        businessId: business.id,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.service.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.staffMember.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div>
      <ModuleHeader
        title="New appointment"
        description="Create an appointment manually from the business dashboard."
        action={
          <Button asChild variant="outline">
            <Link href="/appointments">Cancel</Link>
          </Button>
        }
      />

      <main className="p-6 lg:p-10">
        <Card className="max-w-3xl rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Appointment details</CardTitle>
          </CardHeader>

          <CardContent>
            <form action={createAppointmentAction} className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Customer</label>
                <select
                  name="customerId"
                  required
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Service</label>
                  <select
                    name="serviceId"
                    required
                    className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} — {service.durationMinutes} min
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Staff optional</label>
                  <select
                    name="staffMemberId"
                    className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="">Unassigned</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input name="date" type="date" required />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Start time</label>
                  <select
                    name="startTime"
                    required
                    className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    defaultValue="CONFIRMED"
                    className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Notes optional</label>
                <textarea
                  name="notes"
                  placeholder="Appointment notes..."
                  className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
                />
              </div>

              <Button className="bg-black text-white hover:bg-neutral-800">
                Create appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
