"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Clock,
  CreditCard,
  Home,
  LinkIcon,
  Scissors,
  Settings,
  Store,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Services", href: "/services", icon: Scissors },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Availability", href: "/availability", icon: Clock },
  { label: "Booking Page", href: "/booking-page", icon: LinkIcon },
  { label: "Subscription", href: "/subscription", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

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
              <p className="truncate text-sm font-semibold">Glow Barbershop</p>
              <p className="text-xs text-neutral-500">Barber</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
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
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="font-semibold">Starter Plan</p>
            <p className="mt-1 text-sm text-neutral-600">
              68 / 100 bookings used
            </p>

            <div className="mt-4 h-2 rounded-full bg-neutral-200">
              <div className="h-2 w-[68%] rounded-full bg-black" />
            </div>

            <div className="mt-3 flex justify-between text-xs text-neutral-500">
              <span>68%</span>
              <span>32 remaining</span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <UserButton />
              <div>
                <p className="text-sm font-semibold">Account</p>
                <p className="text-xs text-neutral-500">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
