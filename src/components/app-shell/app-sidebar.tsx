import { UserButton } from "@clerk/nextjs";
import { Store } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { AppSidebarNav } from "@/components/app-shell/app-sidebar-nav";

function cleanPlan(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
}

export async function AppSidebar() {
  const { business, user } = await getActiveBusiness();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [subscription, usage] = await Promise.all([
    prisma.subscription.findUnique({
      where: {
        businessId: business.id,
      },
    }),

    prisma.bookingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId: business.id,
          month,
          year,
        },
      },
    }),
  ]);

  const plan = subscription?.plan ?? "FREE";
  const used = usage?.bookingCount ?? 0;
  const limit = plan === "PRO" ? null : plan === "STARTER" ? 100 : 20;
  const percentage = limit ? Math.round((used / limit) * 100) : 100;
  const remaining = limit ? Math.max(limit - used, 0) : null;

  return (
    <aside className="hidden min-h-screen border-r border-neutral-200 bg-white p-4 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid size-9 place-items-center rounded-lg bg-black text-white">
            <Store className="size-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">schedora</span>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 p-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-neutral-200">
              <Store className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{business.name}</p>
              <p className="text-xs text-neutral-500">
                {business.businessType}
              </p>
            </div>
          </div>
        </div>

        <AppSidebarNav />

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="font-semibold">{cleanPlan(plan)} Plan</p>

            <p className="mt-1 text-sm text-neutral-600">
              {limit
                ? `${used} / ${limit} bookings used`
                : `${used} bookings used`}
            </p>

            <div className="mt-4 h-2 rounded-full bg-neutral-200">
              <div
                className="h-2 rounded-full bg-black"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-neutral-500">
              <span>{limit ? `${percentage}%` : "Unlimited"}</span>
              <span>
                {remaining === null ? "Unlimited" : `${remaining} remaining`}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <UserButton />
              <div>
                <p className="text-sm font-semibold">
                  {user.name ?? "Account"}
                </p>
                <p className="text-xs text-neutral-500">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
