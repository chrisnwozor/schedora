import { Clock, Save } from "lucide-react";

import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const availability = [
  ["Monday", "9:00 AM", "6:00 PM", true],
  ["Tuesday", "9:00 AM", "6:00 PM", true],
  ["Wednesday", "9:00 AM", "6:00 PM", true],
  ["Thursday", "9:00 AM", "6:00 PM", true],
  ["Friday", "9:00 AM", "6:00 PM", true],
  ["Saturday", "10:00 AM", "4:00 PM", true],
  ["Sunday", "Closed", "Closed", false],
];

export default function AvailabilityPage() {
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
                <div
                  key={day[0].toString()}
                  className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <div>
                    <p className="font-semibold">{day[0]}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {day[3] ? "Open for bookings" : "Closed"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-500">
                      Start time
                    </label>
                    <div className="mt-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm">
                      {day[1]}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-500">End time</label>
                    <div className="mt-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm">
                      {day[2]}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </div>
                </div>
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
