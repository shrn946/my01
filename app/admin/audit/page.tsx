import { Suspense } from "react";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const prisma = getPrisma();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">Please provide a lead ID to audit.</p>
      </div>
    );
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return notFound();

  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<p>Loading...</p>}>
        <AuditClient lead={lead} />
      </Suspense>
    </div>
  );
}
