import Link from "next/link";

import { createStaffAction } from "@/server/actions/business-records";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewStaffPage() {
  return (
    <div>
      <ModuleHeader
        title="Add staff member"
        description="Create a staff profile for appointments and scheduling."
        action={
          <Button asChild variant="outline">
            <Link href="/staff">Cancel</Link>
          </Button>
        }
      />

      <main className="p-6 lg:p-10">
        <Card className="max-w-2xl rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Staff details</CardTitle>
          </CardHeader>

          <CardContent>
            <form action={createStaffAction} className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full name</label>
                <Input name="name" placeholder="James Wilson" required />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Role title</label>
                <Input name="roleTitle" placeholder="Barber" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone optional</label>
                  <Input name="phone" placeholder="+1 519 555 0000" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email optional</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="staff@example.com"
                  />
                </div>
              </div>

              <Button className="bg-black text-white hover:bg-neutral-800">
                Create staff member
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
