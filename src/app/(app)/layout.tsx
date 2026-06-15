import { AppSidebar } from "@/components/app-shell/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AppSidebar />
        <section className="min-w-0 border-l border-neutral-200">
          {children}
        </section>
      </div>
    </main>
  );
}
