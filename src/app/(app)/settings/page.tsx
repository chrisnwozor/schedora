import { Building2, Clock3, Shield, User } from "lucide-react";

import { cleanEnum } from "@/lib/format";
import { TIME_ZONE_OPTIONS } from "@/lib/time-zones";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { updateBusinessTimeZoneAction } from "@/server/actions/business-settings";
import { prisma } from "@/lib/prisma";
import { ModuleHeader } from "@/components/modules/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function SettingsPage() {
  const { business, role } = await getActiveBusiness();

  const businessWithOwner = await prisma.business.findUnique({
    where: {
      id: business.id,
    },
    include: {
      owner: true,
      subscription: true,
    },
  });

  if (!businessWithOwner) {
    throw new Error("Business not found.");
  }

  const timezoneIsListed = TIME_ZONE_OPTIONS.some(
    (option) => option.value === businessWithOwner.timeZone,
  );

  const canChangeTimezone = role === "OWNER" || role === "ADMIN";

  return (
    <div>
      <ModuleHeader
        title="Settings"
        description="Manage your business profile, account settings, and workspace configuration."
      />

      <main className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_420px] lg:p-10">
        <section className="space-y-6">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Business profile
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Business name</label>
                <Input value={businessWithOwner.name} readOnly />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Business type</label>
                  <Input value={businessWithOwner.businessType} readOnly />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Public slug</label>
                  <Input value={businessWithOwner.slug} readOnly />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={businessWithOwner.phone ?? ""} readOnly />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={businessWithOwner.email ?? ""} readOnly />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Address</label>
                <Input value={businessWithOwner.address ?? ""} readOnly />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  readOnly
                  className="min-h-28 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none"
                  value={businessWithOwner.description ?? ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-5" />
                Business timezone
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form action={updateBusinessTimeZoneAction} className="space-y-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="business-timezone"
                    className="text-sm font-medium"
                  >
                    Timezone
                  </label>

                  <select
                    id="business-timezone"
                    name="timeZone"
                    defaultValue={businessWithOwner.timeZone}
                    disabled={!canChangeTimezone}
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none disabled:bg-neutral-100"
                  >
                    {!timezoneIsListed ? (
                      <option value={businessWithOwner.timeZone}>
                        {businessWithOwner.timeZone}
                      </option>
                    ) : null}

                    {TIME_ZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm leading-6 text-neutral-500">
                  Booking dates, dashboard totals, monthly usage and reminders
                  use this timezone.
                </p>

                <Button
                  type="submit"
                  disabled={!canChangeTimezone}
                  className="bg-black text-white hover:bg-neutral-800"
                >
                  Save timezone
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Account owner
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full name</label>
                  <Input value={businessWithOwner.owner.name ?? ""} readOnly />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input value="Owner" readOnly />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={businessWithOwner.owner.email} readOnly />
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Security
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <SettingRow title="Authentication" value="Clerk active" />

              <SettingRow title="Tenant isolation" value="Required" />

              <SettingRow
                title="Business status"
                value={cleanEnum(businessWithOwner.status)}
              />

              <SettingRow
                title="Current plan"
                value={
                  businessWithOwner.subscription?.plan
                    ? cleanEnum(businessWithOwner.subscription.plan)
                    : "Free"
                }
              />

              <SettingRow title="Timezone" value={businessWithOwner.timeZone} />
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function SettingRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3 text-sm">
      <span className="text-neutral-600">{title}</span>
      <span className="break-all text-right font-medium">{value}</span>
    </div>
  );
}
