import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AuditClient from "./audit-client";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

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
