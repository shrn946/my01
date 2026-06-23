import { notFound } from "next/navigation";
import { CheckCircle2, Globe, Mail, Phone, Terminal, Zap } from "lucide-react";

import { AUDIT_CATEGORIES } from "@/lib/audit-categories";
import { getAiAudit } from "@/lib/ai-audit";
import { getLeadAiFields } from "@/lib/lead-ai-storage";
import { getPrisma } from "@/lib/prisma";
import { getReportContent, getReportMedia } from "@/lib/report-content";

export const dynamic = "force-dynamic";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { leadId } = await params;
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return notFound();

  const aiFields = await getLeadAiFields(prisma, lead.id);
  const audit = getAiAudit(aiFields.aiAnalysis);
  if (!audit) return notFound();
  const reportContent = getReportContent(aiFields.reportContent);
  const reportMedia = getReportMedia(aiFields.reportMedia).filter((item) => item.section === "proposal");
  const proposalScope = reportContent.recommendations.length
    ? reportContent.recommendations
    : audit.proposal_content.scope;

  const designAnalysis = lead.designAnalysis as any;
  const brandColors = designAnalysis?.colors?.background?.filter((color: string) => color !== "rgb(255, 255, 255)").slice(0, 4) || [];
  const categoryLabel = (category: string) =>
    AUDIT_CATEGORIES.find((item) => item.value === category)?.label || category;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          .proposal-shell { width: 100% !important; box-shadow: none !important; border-radius: 0 !important; }
          section, figure, footer { break-inside: avoid-page; }
          h1, h2, h3 { break-after: avoid-page; }
          img { max-height: 210mm; }
        }
      `}</style>
      <div className="proposal-shell mx-auto w-[1100px] overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-black/5">
        <header className="relative overflow-hidden bg-slate-950 p-14 text-white">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-indigo-600/40 to-transparent" />
          <div className="relative z-10">
            <div className="flex justify-between gap-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {audit.selected_categories.map((category) => (
                    <span key={category} className="rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                      {categoryLabel(category)}
                    </span>
                  ))}
                </div>
                <h1 className="text-5xl font-black leading-tight">{audit.proposal_content.title}</h1>
                <p className="mt-5 text-xl text-slate-300">{lead.businessName || lead.website}</p>
                <p className="mt-1 text-sm text-blue-300">{lead.website}</p>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-[1fr_1fr] gap-6">
              {/* Design Identity */}
              <div className="rounded-[2rem] bg-white/10 border border-white/10 p-7 shadow-2xl backdrop-blur-sm">
                <p className="text-2xl font-black mb-1">Design Identity</p>
                <p className="text-xs text-slate-400 mb-6">Visual patterns and structure detected on the website.</p>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detected Fonts</p>
                    <div className="flex flex-wrap gap-2">
                      {designAnalysis?.fonts?.map((font: string) => (
                        <span key={font} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{font}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      {designAnalysis?.colors?.background?.map((color: string, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full border border-white/30 shadow-md" style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Website Scores */}
              <div className="rounded-[2rem] bg-white/10 border border-white/10 p-7 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">Website Scores</p>
                    <p className="text-xs text-slate-400 mt-1">Performance and SEO metrics</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/5 p-4 text-center border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overall</p>
                      <p className="text-3xl font-black text-white mt-1">{lead.websiteScore || 0}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 text-center border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</p>
                      <p className="text-3xl font-black text-emerald-400 mt-1">{lead.performanceScore || 0}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEO</p>
                    <p className="text-xl font-black text-white mt-1">{lead.seoScore || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access.</p>
                    <p className="text-xl font-black text-white mt-1">{lead.accessibilityScore || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Best Prac.</p>
                    <p className="text-xl font-black text-white mt-1">{lead.bestPracticesScore || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-14 space-y-14">
          <section>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Executive Proposal</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Focused on the work that matters now</h2>
              <p className="mt-5 text-slate-600 leading-relaxed">{audit.proposal_content.executive_pitch}</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black">Selected Findings</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              {audit.developer_comments.slice(0, 6).map((comment) => (
                <div key={`${comment.category}-${comment.heading}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[10px] font-black uppercase">{categoryLabel(comment.category)}</span>
                    <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-[10px] font-black uppercase">{comment.priority}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black">{comment.heading}</h3>
                  <p className="mt-2 text-sm text-slate-600">{comment.finding}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl font-black mb-7">Recommended Scope</h2>
              <ul className="space-y-5">
                {proposalScope.slice(0, 8).map((item) => (
                  <li key={item} className="flex gap-4">
                    <span className="h-9 w-9 shrink-0 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center"><CheckCircle2 className="h-5 w-5" /></span>
                    <span className="text-base font-semibold text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white">
              <div className="flex items-center gap-3 text-blue-400">
                <Terminal className="h-6 w-6" />
                <span className="text-xs font-black uppercase tracking-widest">Developer Recommendation</span>
              </div>
              <p className="mt-6 text-2xl font-semibold leading-relaxed">
                {audit.png_report_data.developer_comments[0]}
              </p>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Expected outcome</p>
                <p className="mt-2 text-slate-300">{audit.proposal_content.expected_outcomes[0]}</p>
              </div>
            </div>
          </section>

          {reportMedia.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-black">Proposal References</h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                {reportMedia.map((item) => (
                  <figure key={item.id} className="overflow-hidden rounded-3xl border border-slate-200">
                    <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                    <figcaption className="p-4 text-sm font-semibold text-slate-700">{item.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {audit.proposal_content.maintenance_pricing.included && (
            <section className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-9">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Maintenance Pricing</p>
              <h2 className="mt-2 text-3xl font-black">{audit.proposal_content.maintenance_pricing.plan_name}</h2>
              <p className="mt-4 text-slate-700">{audit.proposal_content.maintenance_pricing.price_note}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {audit.proposal_content.maintenance_pricing.services.map((item) => (
                  <div key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="rounded-[2.5rem] bg-gradient-to-r from-indigo-700 to-blue-600 p-10 text-white">
            <div className="flex items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-black">{audit.proposal_content.call_to_action}</h2>
                <p className="mt-3 text-blue-100">The attached full audit contains the complete selected-category findings and action plan.</p>
              </div>
              <div className="space-y-3 shrink-0 text-sm font-bold">
                <div className="flex items-center gap-3"><Phone className="h-5 w-5" /> +{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923226682496'}</div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5" /> {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hassannaqvi@coreweblabs.com'}</div>
                <div className="flex items-center gap-3"><Globe className="h-5 w-5" /> www.coreweblabs.com</div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
