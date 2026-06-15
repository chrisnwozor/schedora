import { Save, Settings, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminHeader
        title="Admin Settings"
        description="Control platform defaults, plan limits, and operational settings."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Save className="mr-2 size-4" />
            Save settings
          </Button>
        }
      />

      <main className="grid gap-6 p-6 lg:grid-cols-[1fr_420px] lg:p-10">
        <section className="space-y-6">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="size-5" />
                Plan limits
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <Field label="Free plan booking limit" value="20" />
              <Field label="Starter plan booking limit" value="100" />
              <Field label="Pro plan booking limit" value="Unlimited" />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                Platform settings
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <Field label="Default business status" value="Active" />
              <Field label="Default plan" value="Free" />
              <Field label="Support email" value="support@schedora.app" />
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-2xl border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                Admin safety rules
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm leading-6 text-neutral-600">
              <p>Only platform admins should access this area.</p>
              <p>Dangerous actions must require confirmation.</p>
              <p>Plan changes should be logged later in audit logs.</p>
              <p>
                Impersonation should not be added until audit logging exists.
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} readOnly />
    </div>
  );
}
