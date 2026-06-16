import { ReactNode } from "react";
import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-neutral-200 px-6 py-6 lg:px-10">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-neutral-600">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form action="/admin/businesses" className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
            <Input
              name="search"
              placeholder="Search businesses..."
              className="h-11 w-full pl-10 sm:w-80"
            />
          </form>

          <button className="relative grid size-11 place-items-center rounded-xl border border-neutral-200">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-black text-[10px] text-white">
              8
            </span>
          </button>

          {action}
        </div>
      </div>
    </header>
  );
}
