"use client";

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

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
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
  );
}
