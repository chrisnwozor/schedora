import { Check, CreditCard, Crown, Zap } from "lucide-react";

import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    bookings: "20 bookings / month",
    description: "For testing Schedora.",
    features: ["Online booking page", "Manage services", "1 staff member"],
    active: false,
  },
  {
    name: "Starter",
    price: "$19",
    bookings: "100 bookings / month",
    description: "For growing local businesses.",
    features: ["Everything in Free", "Multiple staff", "Customer records"],
    active: true,
  },
  {
    name: "Pro",
    price: "$39",
    bookings: "Unlimited bookings",
    description: "For busy service businesses.",
    features: [
      "Everything in Starter",
      "Unlimited bookings",
      "Priority support",
    ],
    active: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div>
      <ModuleHeader
        title="Subscription"
        description="Manage your current plan, booking usage, and upgrade options."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <CreditCard className="mr-2 size-4" />
            Manage billing
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
                    Starter Plan
                  </Badge>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    $19 / month
                  </h2>
                  <p className="mt-3 max-w-xl leading-7 text-neutral-600">
                    Your business can receive up to 100 bookings per month on
                    the Starter plan.
                  </p>
                </div>

                <div className="grid size-14 place-items-center rounded-2xl border border-neutral-200">
                  <Crown className="size-6" />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Monthly booking usage</span>
                  <span className="font-semibold">68%</span>
                </div>

                <div className="mt-3 h-3 rounded-full bg-neutral-200">
                  <div className="h-3 w-[68%] rounded-full bg-black" />
                </div>

                <div className="mt-3 flex justify-between text-sm text-neutral-500">
                  <span>68 bookings used</span>
                  <span>32 remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Billing status</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <StatusRow label="Plan status" value="Active" />
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

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`rounded-2xl border-neutral-200 shadow-none ${
                plan.active ? "border-black" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.active ? <Badge>Current</Badge> : null}
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

                <Button
                  className={`mt-8 w-full ${
                    plan.active
                      ? "bg-black text-white hover:bg-neutral-800"
                      : ""
                  }`}
                  variant={plan.active ? "default" : "outline"}
                >
                  {plan.active ? "Current plan" : "Switch plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
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
