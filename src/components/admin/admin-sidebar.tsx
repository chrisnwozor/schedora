"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Home,
  Layers,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const navGroups = [
  {
    title: "Management",
    items: [
      { label: "Overview", href: "/admin/overview", icon: Home },
      { label: "Businesses", href: "/admin/businesses", icon: Building2 },
      { label: "Users", href: "/admin/users", icon: Users },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        icon: CreditCard,
      },
      { label: "Plans", href: "/admin/settings", icon: Layers },
      { label: "Invoices", href: "/admin/settings", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Activity Logs", href: "/admin/overview", icon: Activity },
      { label: "Notifications", href: "/admin/settings", icon: Bell },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen border-r border-neutral-200 bg-white p-4 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid size-9 place-items-center rounded-lg bg-black text-white">
            <ShieldCheck className="size-5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">schedora</span>
            <span className="rounded-md bg-black px-2 py-1 text-[10px] font-bold uppercase text-white">
              Admin
            </span>
          </div>
        </div>

        <nav className="mt-8 space-y-8">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.title}
              </p>

              <div className="mt-3 space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                        active
                          ? "bg-neutral-100 text-black"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                      }`}
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <div>
              <p className="text-sm font-semibold">Admin Account</p>
              <p className="text-xs text-neutral-500">Protected</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
