import { Clock } from "lucide-react";
import { dayName } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { AvailabilityRow } from "@/components/availability/availability-row";
import { ModuleHeader } from "@/components/modules/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default async function AvailabilityPage() {
  const { business } = await getActiveBusiness();
  const availability = await prisma.availabilityRule.findMany({
    where: { businessId: business.id, staffMemberId: null },
    orderBy: { dayOfWeek: "asc" },
  });
  return (
    <div>
      {" "}
      <ModuleHeader
        title="Availability"
        description="Set business hours so customers only book when your business is open."
      />{" "}
      <main className="space-y-6 p-4 sm:p-6 lg:p-10">
        {" "}
        <Card className="rounded-2xl border-neutral-200 shadow-none">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Weekly availability</CardTitle>{" "}
            <p className="text-sm text-neutral-500">
              {" "}
              Save each day after changing its hours.{" "}
            </p>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="space-y-4">
              {" "}
              {availability.map((day) => (
                <AvailabilityRow
                  key={day.id}
                  id={day.id}
                  dayLabel={dayName(day.dayOfWeek)}
                  initialIsClosed={day.isClosed || day.startTime >= day.endTime}
                  initialStartTime={day.startTime}
                  initialEndTime={day.endTime}
                />
              ))}{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card className="rounded-2xl border-neutral-200 shadow-none">
          {" "}
          <CardContent className="flex items-start gap-4 p-6">
            {" "}
            <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200">
              {" "}
              <Clock className="size-5" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h3 className="font-semibold">Booking rule</h3>{" "}
              <p className="mt-2 leading-7 text-neutral-600">
                {" "}
                Customers only see slots that fit inside your opening hours and
                do not overlap an existing appointment.{" "}
              </p>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </main>{" "}
    </div>
  );
}
