import { notFound } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Monitor, ShieldCheck, Target, Terminal, Zap } from "lucide-react";

import { AUDIT_CATEGORIES } from "@/lib/audit-categories";
import { getAiAudit } from "@/lib/ai-audit";
import { getLeadAiFields } from "@/lib/lead-ai-storage";
import { getPrisma } from "@/lib/prisma";
import { getReportContent, getReportMedia } from "@/lib/report-content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { slug } = await params;
  const { format = "full" } = await searchParams;
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: slug } });
  if (!lead) return notFound();

  const aiFields = await getLeadAiFields(prisma, lead.id);
  const aiAudit = getAiAudit(aiFields.aiAnalysis);
  if (!aiAudit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-xl">
          <CardContent className="p-10 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black">Focused report not generated</h1>
            <p className="mt-3 text-slate-600">Select proposal categories in the dashboard and run Start Generation first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryLabel = (category: string) =>
    AUDIT_CATEGORIES.find((item) => item.value === category)?.label || category;
  const reportContent = getReportContent(aiFields.reportContent);
  const reportMedia = getReportMedia(aiFields.reportMedia);
  const mainDesktopScreenshot = lead.beforeAfterImage || lead.desktopImage || reportMedia.find(m => m.id === 'main')?.url;
  const mediaFor = (section: string) => reportMedia.filter((item) => item.section === section);
  const finalComments = reportContent.developerComments || aiAudit.developer_comments
    .map((comment) => `${comment.heading}: ${comment.finding}\nRecommendation: ${comment.recommendation}`)
    .join("\n\n");
  const finalRecommendations = reportContent.recommendations.length
    ? reportContent.recommendations
    : aiAudit.recommendations.map((item) => item.recommendation);
  const designAnalysis = lead.designAnalysis as any;

  if (format === "png") {
    return (
      <div className="min-h-screen bg-slate-100 p-10 font-sans text-slate-950">
        <div className="mx-auto w-[1100px] overflow-hidden rounded-[3rem] bg-white shadow-2xl">
          <header className="bg-slate-950 p-12 text-white">
            <div className="flex items-start justify-between gap-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {aiAudit.selected_categories.map((category) => (
                    <span key={category} className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">{categoryLabel(category)}</span>
                  ))}
                </div>
                <h1 className="text-5xl font-black">{aiAudit.png_report_data.headline}</h1>
                <p className="mt-3 text-slate-400">{lead.website}</p>
              </div>
              <div className="h-32 w-32 shrink-0 rounded-3xl bg-white text-slate-950 flex flex-col items-center justify-center">
                <span className="text-5xl font-black">{lead.websiteScore || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Score</span>
              </div>
            </div>
          </header>
          <main className="p-12 space-y-10">
            <div className="relative mx-auto w-full flex items-end justify-center py-6">
              {/* Desktop Frame */}
              <div className="relative w-[75%] -mr-[5%] z-0">
                <div className="relative overflow-hidden rounded-t-[2rem] border-[12px] border-slate-900 bg-slate-900 aspect-[16/10] shadow-2xl">
                  {mainDesktopScreenshot ? (
                    <img src={mainDesktopScreenshot} alt="Website desktop view" className="w-full h-full object-contain object-top bg-muted/10" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">Desktop view</div>
                  )}
                </div>
                {/* Keyboard Base */}
                <div className="relative z-0 -mt-1 mx-[-3%] h-5 rounded-b-2xl bg-slate-300 border border-slate-400 shadow-xl flex justify-center">
                  <div className="w-1/4 h-1.5 bg-slate-400 rounded-b-md"></div>
                </div>
              </div>
              {/* Mobile Frame */}
              <div className="relative w-[22%] z-10 -mb-6">
                <div className="relative overflow-hidden rounded-[2.5rem] border-[8px] border-slate-800 bg-slate-900 aspect-[9/19] shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20">
                    <div className="w-1/2 h-full bg-slate-800 rounded-b-2xl"></div>
                  </div>
                  {lead.mobileImage ? (
                    <img src={lead.mobileImage} alt="Website mobile view" className="w-full h-full object-contain object-top bg-muted/10" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold bg-slate-100">Mobile view</div>
                  )}
                </div>
              </div>
            </div>
            {reportMedia.length > 0 && (
              <section>
                <h2 className="text-2xl font-black mb-5">Visual Evidence</h2>
                <div className="grid grid-cols-2 gap-5">
                  {reportMedia.slice(0, 4).map((item) => (
                    <figure key={item.id} className="overflow-hidden rounded-2xl border border-slate-200">
                      <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                      <figcaption className="p-3 text-xs font-semibold text-slate-700">{item.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}
            <div className="grid grid-cols-2 gap-8">
              <section>
                <h2 className="text-2xl font-black">Selected Findings</h2>
                <ul className="mt-5 space-y-4">
                  {aiAudit.png_report_data.findings.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-700"><AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />{item}</li>)}
                </ul>
              </section>
              <section>
                <h2 className="text-2xl font-black">AI Recommendations</h2>
                <ul className="mt-5 space-y-4">
                  {finalRecommendations.slice(0, 8).map((item) => <li key={item} className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />{item}</li>)}
                </ul>
              </section>
            </div>
            <section className="rounded-[2rem] bg-indigo-50 border border-indigo-100 p-8">
              <h2 className="text-2xl font-black flex items-center gap-2"><Terminal className="h-6 w-6 text-indigo-600" /> Developer Comments</h2>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {finalComments.split(/\n\n+/).filter(Boolean).slice(0, 6).map((item) => <p key={item} className="rounded-2xl bg-white p-5 text-sm font-semibold text-slate-700 whitespace-pre-line">{item}</p>)}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm 12mm; }
          .print-cover { break-after: page; min-height: 255mm; }
          .print-section { break-inside: avoid-page; }
          .print-heading { break-after: avoid-page; }
          img { max-height: 220mm; object-fit: contain; }
        }
      `}</style>
      <header className="print-cover bg-gradient-to-br from-slate-950 to-indigo-950 text-white px-10 flex items-center">
        <div className="max-w-5xl mx-auto py-20">
          <div className="flex flex-wrap gap-2 mb-6">
            {aiAudit.selected_categories.map((category) => (
              <span key={category} className="rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest">
                {categoryLabel(category)}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Focused Website Audit for {lead.businessName || "Your Business"}
          </h1>
          <p className="mt-5 text-xl text-slate-300 max-w-3xl">
            This report covers only the selected proposal categories for <span className="text-blue-300">{lead.website}</span>.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-14">
        <Card className="print-section shadow-xl border-slate-200">
          <CardContent className="p-8 md:p-10">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Executive Summary</p>
            <h2 className="mt-2 text-2xl font-black">{aiAudit.proposal_content.title}</h2>
            <p className="mt-4 text-slate-700 leading-relaxed">{aiAudit.full_report_data.executive_summary}</p>
          </CardContent>
        </Card>

        <section className="print-section space-y-6">
          <h2 className="print-heading text-3xl font-black flex items-center gap-2"><Monitor className="h-7 w-7 text-indigo-600" /> Website Screenshot</h2>
          <div className="relative mx-auto w-full max-w-4xl flex items-end justify-center pt-8 pb-12">
            {/* Desktop Frame */}
            <div className="relative w-[80%] -mr-[5%] z-0">
              <div className="relative overflow-hidden rounded-t-[2rem] border-[12px] border-slate-900 bg-slate-900 aspect-[16/10] shadow-2xl">
                {mainDesktopScreenshot ? (
                  <img src={mainDesktopScreenshot} alt="Website desktop view" className="w-full h-full object-contain object-top bg-muted/10" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">Desktop view</div>
                )}
              </div>
              {/* Keyboard Base */}
              <div className="relative z-0 -mt-1 mx-[-3%] h-6 rounded-b-3xl bg-slate-300 border border-slate-400 shadow-xl flex justify-center">
                <div className="w-1/4 h-2 bg-slate-400 rounded-b-md"></div>
              </div>
            </div>
            {/* Mobile Frame */}
            <div className="relative w-[22%] z-10 -mb-8">
              <div className="relative overflow-hidden rounded-[2.5rem] border-[8px] border-slate-800 bg-slate-900 aspect-[9/19] shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20">
                  <div className="w-1/2 h-full bg-slate-800 rounded-b-2xl"></div>
                </div>
                {lead.mobileImage ? (
                  <img src={lead.mobileImage} alt="Website mobile view" className="w-full h-full object-contain object-top bg-muted/10" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold bg-slate-100">Mobile view</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="print-heading text-3xl font-black">Selected Category Analysis</h2>
          {aiAudit.full_report_data.sections.map((section) => (
            <Card key={section.category} className="print-section border-slate-200 shadow-sm overflow-hidden">
              <div className="h-2 bg-indigo-600" />
              <CardContent className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-black">{section.heading}</h3>
                  <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-black uppercase">{categoryLabel(section.category)}</span>
                </div>
                <p className="mt-4 text-slate-700 leading-relaxed">{section.analysis}</p>
                <div className="mt-7 grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-black text-slate-900 mb-3">Findings</h4>
                    <ul className="space-y-3">
                      {section.findings.map((item) => <li key={item} className="text-sm text-slate-700 flex gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-3">Recommendations</h4>
                    <ul className="space-y-3">
                      {section.recommendations.map((item) => <li key={item} className="text-sm text-slate-700 flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />{item}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {mediaFor("findings").length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {mediaFor("findings").map((item) => (
                <figure key={item.id} className="print-section overflow-hidden rounded-3xl border border-slate-200">
                  <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                  <figcaption className="p-4 text-sm font-semibold">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>

        <section className="print-section space-y-6">
          <h2 className="print-heading text-3xl font-black flex items-center gap-2"><Terminal className="h-7 w-7 text-indigo-600" /> Developer Comments</h2>
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardContent className="p-8 whitespace-pre-line text-slate-700 leading-relaxed">{finalComments}</CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="print-heading text-3xl font-black">Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {finalRecommendations.map((item, index) => (
              <Card key={`${index}-${item}`} className="print-section border-slate-200">
                <CardContent className="p-6">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Recommendation {index + 1}</span>
                  <p className="mt-3 text-sm text-slate-700">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {mediaFor("recommendations").length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {mediaFor("recommendations").map((item) => (
                <figure key={item.id} className="print-section overflow-hidden rounded-3xl border border-slate-200">
                  <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                  <figcaption className="p-4 text-sm font-semibold">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>

        {mediaFor("appendix").length > 0 && (
          <section className="space-y-6">
            <h2 className="print-heading text-3xl font-black">Uploaded Screenshots</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mediaFor("appendix").map((item) => (
                <figure key={item.id} className="print-section overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                  <figcaption className="p-4 text-sm font-semibold text-slate-700">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="print-section rounded-3xl border border-indigo-100 bg-indigo-50 p-10">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Proposal</p>
          <h2 className="mt-2 text-3xl font-black">{aiAudit.proposal_content.title}</h2>
          <p className="mt-4 text-slate-700">{aiAudit.proposal_content.executive_pitch}</p>
          <ul className="mt-6 grid md:grid-cols-2 gap-3">
            {aiAudit.proposal_content.scope.map((item) => <li key={item} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />{item}</li>)}
          </ul>
          {mediaFor("proposal").length > 0 && (
            <div className="mt-7 grid md:grid-cols-2 gap-5">
              {mediaFor("proposal").map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-2xl border border-indigo-100 bg-white">
                  <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                  <figcaption className="p-3 text-xs font-semibold">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>

        {aiAudit.proposal_content.maintenance_pricing.included && (
          <section className="print-section rounded-3xl border border-emerald-100 bg-emerald-50 p-10">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Maintenance Pricing</p>
            <h2 className="mt-2 text-3xl font-black">{aiAudit.proposal_content.maintenance_pricing.plan_name}</h2>
            <p className="mt-4 text-slate-700">{aiAudit.proposal_content.maintenance_pricing.price_note}</p>
            <ul className="mt-6 grid md:grid-cols-2 gap-3">
              {aiAudit.proposal_content.maintenance_pricing.services.map((item) => <li key={item} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />{item}</li>)}
            </ul>
          </section>
        )}

        <section className="print-section rounded-3xl bg-slate-950 text-white p-10 md:p-12">
          {reportContent.includeBeforeAfter && (
            <div className="mb-12">
              <h2 className="print-heading text-3xl font-black flex items-center gap-2"><Target className="h-7 w-7 text-blue-400" /> Before / After Comparison</h2>
              <div className="mt-8 grid md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Before (Existing Website)</p>
                  {(lead.beforeAfterImage || lead.desktopImage) ? (
                    <img src={lead.beforeAfterImage || lead.desktopImage!} alt="Before" className="w-full rounded-2xl border border-white/10 shadow-lg object-contain bg-slate-900" />
                  ) : (
                    <div className="w-full h-full aspect-video flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-600">No before image</div>
                  )}
                </div>
                {/* After */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">After (Proposed Redesign)</p>
                  {((lead.reportContent as any)?.afterImage || lead.proposalImage) ? (
                    <img src={(lead.reportContent as any)?.afterImage || lead.proposalImage!} alt="After" className="w-full rounded-2xl border border-white/10 shadow-lg object-contain bg-slate-900" />
                  ) : (
                    <div className="w-full h-full aspect-video flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-600">No after image</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <h2 className="print-heading text-3xl font-black flex items-center gap-2"><Target className="h-7 w-7 text-blue-400" /> Action Plan</h2>
          <div className="mt-7 grid md:grid-cols-2 gap-4">
            {finalRecommendations.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="h-8 w-8 shrink-0 rounded-full bg-blue-500 flex items-center justify-center font-black">{index + 1}</span>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col md:flex-row gap-5 items-center justify-between border-t border-white/10 pt-8">
            <div>
              <p className="font-black text-xl">{aiAudit.proposal_content.call_to_action}</p>
              <p className="mt-2 text-sm text-slate-400 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Focused scope based on selected categories only.</p>
            </div>
            <Button className="bg-white text-slate-950 hover:bg-slate-100 h-12 px-7" asChild>
              <a href={`mailto:hassan@example.com?subject=${encodeURIComponent(aiAudit.proposal_content.subject)}`}>
                Discuss This Proposal <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        <section className="print-section rounded-3xl border border-indigo-100 bg-indigo-50 p-10">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Proposal</p>
          <h2 className="mt-2 text-3xl font-black">{aiAudit.proposal_content.title}</h2>
          <p className="mt-4 text-slate-700">{aiAudit.proposal_content.executive_pitch}</p>
          <ul className="mt-6 grid md:grid-cols-2 gap-3">
            {aiAudit.proposal_content.scope.map((item) => <li key={item} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />{item}</li>)}
          </ul>
          {mediaFor("proposal").length > 0 && (
            <div className="mt-7 grid md:grid-cols-2 gap-5">
              {mediaFor("proposal").map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-2xl border border-indigo-100 bg-white">
                  <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                  <figcaption className="p-3 text-xs font-semibold">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>

        {aiAudit.proposal_content.maintenance_pricing.included && (
          <section className="print-section rounded-3xl border border-emerald-100 bg-emerald-50 p-10">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Maintenance Pricing</p>
            <h2 className="mt-2 text-3xl font-black">{aiAudit.proposal_content.maintenance_pricing.plan_name}</h2>
            <p className="mt-4 text-slate-700">{aiAudit.proposal_content.maintenance_pricing.price_note}</p>
            <ul className="mt-6 grid md:grid-cols-2 gap-3">
              {aiAudit.proposal_content.maintenance_pricing.services.map((item) => <li key={item} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />{item}</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
