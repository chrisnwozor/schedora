import { Store } from "lucide-react";

import { getActiveBusiness } from "@/server/business/get-active-business";
import { AppMobileSheet } from "@/components/app-shell/app-mobile-sheet";

export async function AppMobileHeader() {
  const { business } = await getActiveBusiness();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-black text-white">
          <Store className="size-5" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">schedora</p>
          <p className="mt-1 max-w-[180px] truncate text-xs text-neutral-500">
            {business.name}
          </p>
        </div>
      </div>

      <AppMobileSheet
        businessName={business.name}
        businessType={business.businessType}
      />
    </header>
  );
}
