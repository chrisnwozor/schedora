import Link from "next/link";

import { createServiceAction } from "@/server/actions/business-records";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewServicePage() {
  return (
    <div>
      <ModuleHeader
        title="Add service"
        description="Create a bookable service with price and duration."
        action={
          <Button asChild variant="outline">
            <Link href="/services">Cancel</Link>
          </Button>
        }
      />

      <main className="p-6 lg:p-10">
        <Card className="max-w-2xl rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Service details</CardTitle>
          </CardHeader>

          <CardContent>
            <form action={createServiceAction} className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Service name</label>
                <Input name="name" placeholder="Fade + Beard" required />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe this service..."
                  className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="55"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Duration minutes
                  </label>
                  <Input
                    name="durationMinutes"
                    type="number"
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <Button className="bg-black text-white hover:bg-neutral-800">
                Create service
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
