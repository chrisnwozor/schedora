import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <section className="min-w-0 border-l border-neutral-200">
          {children}
        </section>
      </div>
    </main>
  );
}
