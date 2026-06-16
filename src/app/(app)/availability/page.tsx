import { updateAvailabilityRuleAction } from "@/server/actions/business-records";
import { Clock, Save } from "lucide-react";

import { dayName, formatTime } from "@/lib/format";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AvailabilityPage() {
  const { business } = await getActiveBusiness();

  const availability = await prisma.availabilityRule.findMany({
    where: {
      businessId: business.id,
      staffMemberId: null,
    },
    orderBy: {
      dayOfWeek: "asc",
    },
  });

  return (
    <div>
      <ModuleHeader
        title="Availability"
        description="Set business hours so customers only book when your business is open."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Save className="mr-2 size-4" />
            Save changes
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Weekly availability</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {availability.map((day) => (
                <form
                  key={day.id}
                  action={updateAvailabilityRuleAction}
                  className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <input
                    type="hidden"
                    name="availabilityRuleId"
                    value={day.id}
                  />

                  <div>
                    <p className="font-semibold">{dayName(day.dayOfWeek)}</p>

                    <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                      <input
                        name="isClosed"
                        type="checkbox"
                        defaultChecked={day.isClosed}
                      />
                      Closed
                    </label>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-500">
                      Start time
                    </label>
                    <input
                      name="startTime"
                      type="time"
                      defaultValue={day.startTime}
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-neutral-500">End time</label>
                    <input
                      name="endTime"
                      type="time"
                      defaultValue={day.endTime}
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" type="submit" className="w-full">
                      Save
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
              <Clock className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold">Booking rule</h3>
              <p className="mt-2 leading-7 text-neutral-600">
                Customers will only see time slots that fit inside your
                availability and do not conflict with existing appointments.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
