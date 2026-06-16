import Link from "next/link";
import { changeCurrentBusinessPlanAction } from "@/server/actions/business-records";
import { Check, CreditCard, Crown, Zap } from "lucide-react";

import { cleanEnum } from "@/lib/format";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "FREE",
    displayName: "Free",
    price: "$0",
    bookings: "20 bookings / month",
    description: "For testing Schedora.",
    features: ["Online booking page", "Manage services", "1 staff member"],
  },
  {
    name: "STARTER",
    displayName: "Starter",
    price: "$19",
    bookings: "100 bookings / month",
    description: "For growing local businesses.",
    features: ["Everything in Free", "Multiple staff", "Customer records"],
  },
  {
    name: "PRO",
    displayName: "Pro",
    price: "$39",
    bookings: "Unlimited bookings",
    description: "For busy service businesses.",
    features: [
      "Everything in Starter",
      "Unlimited bookings",
      "Priority support",
    ],
  },
];

export default async function SubscriptionPage() {
  const { business } = await getActiveBusiness();

  const subscription = await prisma.subscription.findUnique({
    where: {
      businessId: business.id,
    },
  });

  const usage = await prisma.bookingUsage.findFirst({
    where: {
      businessId: business.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const currentPlan = subscription?.plan ?? "FREE";
  const used = usage?.bookingCount ?? 0;

  const limit =
    currentPlan === "PRO" ? null : currentPlan === "STARTER" ? 100 : 20;
  const percentage = limit ? Math.round((used / limit) * 100) : 0;
  const remaining = limit ? Math.max(limit - used, 0) : null;

  return (
    <div>
      <ModuleHeader
        title="Subscription"
        description="Manage your current plan, booking usage, and upgrade options."
        action={
          <Button asChild className="bg-black text-white hover:bg-neutral-800">
            <Link href="#plans" className="inline-flex items-center gap-2">
              <CreditCard className="size-4" />
              Manage billing
            </Link>
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Current plan</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge className="mb-4 bg-black text-white">
                    {cleanEnum(currentPlan)} Plan
                  </Badge>

                  <h2 className="text-3xl font-semibold tracking-tight">
                    {currentPlan === "FREE"
                      ? "$0 / month"
                      : currentPlan === "STARTER"
                        ? "$19 / month"
                        : "$39 / month"}
                  </h2>

                  <p className="mt-3 max-w-xl leading-7 text-neutral-600">
                    {limit
                      ? `Your business can receive up to ${limit} bookings per month on this plan.`
                      : "Your business has unlimited bookings on this plan."}
                  </p>
                </div>

                <div className="grid size-14 place-items-center rounded-2xl border border-neutral-200">
                  <Crown className="size-6" />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Monthly booking usage</span>
                  <span className="font-semibold">
                    {limit ? `${percentage}%` : "Unlimited"}
                  </span>
                </div>

                <div className="mt-3 h-3 rounded-full bg-neutral-200">
                  <div
                    className="h-3 rounded-full bg-black"
                    style={{
                      width: `${limit ? Math.min(percentage, 100) : 100}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-sm text-neutral-500">
                  <span>{used} bookings used</span>
                  <span>
                    {remaining === null
                      ? "Unlimited"
                      : `${remaining} remaining`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Billing status</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <StatusRow
                label="Plan status"
                value={
                  subscription?.status
                    ? cleanEnum(subscription.status)
                    : "Active"
                }
              />
              <StatusRow label="Billing mode" value="Manual v1" />
              <StatusRow label="Next billing" value="Not connected" />
              <StatusRow label="Payment provider" value="Stripe later" />

              <div className="rounded-xl border border-neutral-200 p-4 text-sm leading-6 text-neutral-600">
                Stripe is intentionally not added in this MVP section. We build
                manual plan control first, then connect real payments later.
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="plans" className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const active = plan.name === currentPlan;

            return (
              <Card
                key={plan.name}
                className={`rounded-2xl border-neutral-200 shadow-none ${
                  active ? "border-black" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {plan.displayName}
                    </h3>
                    {active ? <Badge>Current</Badge> : null}
                  </div>

                  <p className="mt-3 text-sm text-neutral-600">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-neutral-500"> /month</span>
                  </div>

                  <p className="mt-3 font-medium">{plan.bookings}</p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-neutral-700"
                      >
                        <Check className="size-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <form
                    action={changeCurrentBusinessPlanAction}
                    className="mt-8"
                  >
                    <input type="hidden" name="plan" value={plan.name} />

                    <Button
                      className={`w-full ${
                        active ? "bg-black text-white hover:bg-neutral-800" : ""
                      }`}
                      variant={active ? "default" : "outline"}
                      disabled={active}
                      type="submit"
                    >
                      {active ? "Current plan" : "Switch plan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
              <Zap className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold">MVP billing rule</h3>
              <p className="mt-2 leading-7 text-neutral-600">
                For now, plan limits are controlled inside the app. Stripe
                billing will be added later after the booking flow and admin
                plan management are working.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
