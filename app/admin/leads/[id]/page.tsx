import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LeadDetailClient from "./lead-client";
import { getLeadAiFields } from "@/lib/lead-ai-storage";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = getPrisma();
  
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { emailLogs: { orderBy: { sentAt: "desc" } } }
  });

  if (!lead) return notFound();
  const aiFields = await getLeadAiFields(prisma, lead.id);

  const [templates, settings, portfolioExamples] = await Promise.all([
    prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
    lead.category ? prisma.portfolioExample.findMany({ where: { category: lead.category }, take: 3 }) : Promise.resolve([])
  ]);

  return (
    <div className="container mx-auto py-10">
      <LeadDetailClient lead={{ ...lead, ...aiFields }} templates={templates} settings={settings} portfolioExamples={portfolioExamples} />
    </div>
  );
}
