import { notFound } from "next/navigation";
import { AlertCircle, Edit2 } from "lucide-react";

import { getLeadAiFields } from "@/lib/lead-ai-storage";
import { getPrisma } from "@/lib/prisma";
import { getReportMedia } from "@/lib/report-content";
import { Card, CardContent } from "@/components/ui/card";
import { ReportViewTracker } from "../view-tracker";
import { AuditLightbox } from "@/components/audit-lightbox";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function IssuesReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: slug } });
  if (!lead) return notFound();

  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const aiFields = await getLeadAiFields(prisma, lead.id);
  const reportMedia = getReportMedia(aiFields.reportMedia);
  const issuesMedia = reportMedia.filter((item) => item.section === "appendix" || item.section === "email" || item.includeInEmail);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-20 font-sans selection:bg-indigo-100">
      <ReportViewTracker leadId={lead.id} />
      
      <header className="bg-[#0a0a0a] text-white px-5 md:px-10 flex items-center relative overflow-hidden border-b border-white/5 py-12 md:py-20">
        {/* Subtle premium background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 w-full flex flex-col items-center text-center">
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <span className="rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
              Website Issues Report
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight break-words">
            Identified Website Issues
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-light break-words">
            A review of key issues and areas of improvement discovered for <span className="text-white font-medium">{lead.website}</span>.
          </p>

          {isAdmin && (
            <div className="mt-8 flex justify-center print:hidden">
              <a
                href={`/dashboard?leadId=${lead.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 transition-all border border-indigo-500/20 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
              >
                <Edit2 className="h-4 w-4" /> Edit Issues & Screenshots
              </a>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12 w-full">
        {issuesMedia.length > 0 ? (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 shrink-0">
                <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 break-words">Visual Evidence & Findings</h2>
            </div>
            
            <AuditLightbox items={issuesMedia} />
          </section>
        ) : (
          <Card className="border border-slate-100 shadow-lg rounded-[2rem] bg-white">
            <CardContent className="p-10 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold">No screenshots available</h3>
              <p className="mt-2 text-slate-600 text-sm">Please upload and configure screenshots under Report Screenshots & Reference Images in the dashboard.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
