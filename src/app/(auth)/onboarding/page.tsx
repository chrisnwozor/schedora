import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { createBusinessOnboardingAction } from "./actions";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/server/auth/get-current-db-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function OnboardingPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  const existingMembership = await prisma.businessMembership.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (existingMembership) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10 text-black">
      <Card className="w-full max-w-2xl rounded-2xl border-neutral-200 bg-white shadow-none">
        <CardHeader>
          <div className="grid size-12 place-items-center rounded-2xl bg-black text-white">
            <Building2 className="size-5" />
          </div>

          <CardTitle className="mt-4 text-3xl font-semibold tracking-tight">
            Set up your business
          </CardTitle>

          <p className="text-neutral-600">
            Create your first Schedora workspace and public booking link.
          </p>
        </CardHeader>

        <CardContent>
          <form action={createBusinessOnboardingAction} className="space-y-5">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Business name</label>
              <Input name="name" placeholder="Glow Barbershop" required />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Business type</label>
                <Input
                  name="businessType"
                  placeholder="Barber, Nail Tech, Tutor..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Booking link slug</label>
                <Input name="slug" placeholder="glowbarbershop" required />
                <p className="text-xs text-neutral-500">
                  Example: schedora.app/book/glowbarbershop
                </p>
              </div>
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
                  placeholder="hello@business.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Address optional</label>
              <Input name="address" placeholder="London, Ontario, Canada" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Description optional
              </label>
              <textarea
                name="description"
                placeholder="Describe your business..."
                className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
              />
            </div>

            <Button className="h-11 bg-black text-white hover:bg-neutral-800">
              Create business
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
