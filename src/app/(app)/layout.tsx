import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { AppMobileHeader } from "@/components/app-shell/app-mobile-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-black">
      <AppMobileHeader />

      <div className="grid min-h-[calc(100vh-4rem)] lg:min-h-screen lg:grid-cols-[280px_1fr]">
        <AppSidebar />
        <section className="min-w-0 border-l border-neutral-200">
          {children}
        </section>
      </div>
    </main>
  );
}
