import type { Metadata } from "next";
import { LogoutButton } from "@/components/logout-button";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Client dashboard for project updates."
};

export default async function ClientPage() {
  const user = await requireRole("CLIENT");

  return (
    <section className="section">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Client Area</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Welcome, {user.name ?? user.email}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">This area is ready for client project updates, shared files, milestones, and invoices.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {["Project Updates", "Shared Files", "Invoices"].map((item) => (
          <div key={item} className="rounded-lg bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-ink">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">No items yet.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
