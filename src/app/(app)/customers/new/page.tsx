import Link from "next/link";

import { createCustomerAction } from "@/server/actions/business-records";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewCustomerPage() {
  return (
    <div>
      <ModuleHeader
        title="Add customer"
        description="Create a customer record for this business."
        action={
          <Button asChild variant="outline">
            <Link href="/customers">Cancel</Link>
          </Button>
        }
      />

      <main className="p-6 lg:p-10">
        <Card className="max-w-2xl rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>

          <CardContent>
            <form action={createCustomerAction} className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full name</label>
                <Input name="name" placeholder="John Doe" required />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone number</label>
                  <Input name="phone" placeholder="+1 519 555 0000" required />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email optional</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Notes optional</label>
                <textarea
                  name="notes"
                  placeholder="Customer notes..."
                  className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
                />
              </div>

              <Button className="bg-black text-white hover:bg-neutral-800">
                Create customer
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
