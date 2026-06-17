import Link from "next/link";
import { getDateInputValueInTimeZone } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { NewAppointmentForm } from "@/components/appointments/new-appointment-form";
import { ModuleHeader } from "@/components/modules/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default async function NewAppointmentPage() {
  const { business } = await getActiveBusiness();
  const [customers, services, staffMembers] = await Promise.all([
    prisma.customer.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
    prisma.service.findMany({
      where: { businessId: business.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, durationMinutes: true },
    }),
    prisma.staffMember.findMany({
      where: { businessId: business.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return (
    <div>
      <ModuleHeader
        title="New appointment"
        description="Create an appointment manually from the business dashboard."
        action={
          <Link
            href="/appointments"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-black transition hover:bg-neutral-50"
          >
            Cancel
          </Link>
        }
      />
      <main className="p-4 sm:p-6 lg:p-10">
        <Card className="max-w-3xl rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Appointment details</CardTitle>
          </CardHeader>
          <CardContent>
            <NewAppointmentForm
              businessSlug={business.slug}
              initialDate={getDateInputValueInTimeZone(business.timeZone)}
              customers={customers}
              services={services}
              staffMembers={staffMembers}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
