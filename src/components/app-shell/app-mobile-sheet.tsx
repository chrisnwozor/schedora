"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Clock,
  CreditCard,
  Home,
  LinkIcon,
  Menu,
  Scissors,
  Settings,
  Store,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

export function AppMobileSheet({
  businessName,
  businessType,
}: {
  businessName: string;
  businessType: string;
}) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[320px] p-0">
        <div className="flex h-full flex-col p-4">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-black text-white">
                <Store className="size-5" />
              </div>
              schedora
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 rounded-2xl border border-neutral-200 p-3">
            <p className="truncate text-sm font-semibold">{businessName}</p>
            <p className="text-xs text-neutral-500">{businessType}</p>
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

          <div className="mt-auto rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <UserButton />
              <div>
                <p className="text-sm font-semibold">Account</p>
                <p className="text-xs text-neutral-500">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
