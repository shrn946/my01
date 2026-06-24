import { notFound } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Monitor, ShieldCheck, Target, Terminal, Zap } from "lucide-react";

import { AUDIT_CATEGORIES } from "@/lib/audit-categories";
import { getAiAudit } from "@/lib/ai-audit";
import { getLeadAiFields } from "@/lib/lead-ai-storage";
import { getPrisma } from "@/lib/prisma";
import { getReportContent, getReportMedia } from "@/lib/report-content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportImageHover } from "@/components/report-image-hover";

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
  const mediaFor = (section: string) => reportMedia.filter((item) => item.section === section);
  const finalComments = lead.developerComments || reportContent.developerComments || aiAudit.developer_comments
    .filter((comment: any) => comment.category !== "seo")
    .map((comment: any) => `${comment.heading}: ${comment.finding}\nRecommendation: ${comment.recommendation}`)
    .join("\n\n");
  const finalRecommendations = reportContent.recommendations.length
    ? reportContent.recommendations
    : aiAudit.recommendations.map((item) => item.recommendation);


  if (format === "png") {
    return (
      <div className="min-h-screen bg-slate-100 p-10 font-sans text-slate-950">
        <div className="mx-auto w-[1100px] overflow-hidden rounded-[3rem] bg-white shadow-2xl">
          <header className="bg-slate-950 p-12 text-white">
            <div className="flex items-start justify-between gap-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {aiAudit.selected_categories.filter((c: string) => c !== "design").map((category) => (
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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-20 font-sans selection:bg-indigo-100">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm 12mm; }
          .print-cover { break-after: page; min-height: 255mm; }
          .print-section { break-inside: avoid-page; }
          .print-heading { break-after: avoid-page; }
          img { max-height: 220mm; }
        }
      `}</style>
      <header className="print-cover bg-[#0a0a0a] text-white px-10 flex items-center relative overflow-hidden border-b border-white/5">
        {/* Subtle premium background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto py-24 relative z-10 w-full">
          <div className="flex flex-wrap gap-2 mb-8">
            {aiAudit.selected_categories.filter((c: string) => c !== "design").map((category) => (
              <span key={category} className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                {categoryLabel(category)}
              </span>
            ))}
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
            Growth Strategy for {lead.businessName || "Your Business"}
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-3xl leading-relaxed font-light">
            A focused action plan and strategic roadmap to improve conversions, performance, and brand trust for <span className="text-white font-medium">{lead.website}</span>.
          </p>
          <div className="mt-16 max-w-2xl">
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="hidden sm:inline">Performance</span>
                      <span className="sm:hidden">Perf.</span>
                    </p>
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

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        <Card className="print-section shadow-2xl shadow-indigo-900/5 border-none rounded-[2.5rem] bg-white overflow-hidden relative">
          {/* Subtle accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardContent className="p-10 md:p-14">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4">Executive Strategy</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{aiAudit.proposal_content.title}</h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed font-light">{aiAudit.full_report_data.executive_summary}</p>
          </CardContent>
        </Card>

        <section className="space-y-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px bg-slate-200 flex-1"></span>
            <h2 className="print-heading text-3xl font-black tracking-tight text-slate-900">Strategic Analysis</h2>
            <span className="h-px bg-slate-200 flex-1"></span>
          </div>
          {aiAudit.full_report_data.sections.map((section) => {
            if (section.category === "seo") {
              const seoComments = aiAudit.developer_comments?.filter((c: any) => c.category === 'seo') || [];
              
              const groupedComments: Record<string, any[]> = {
                "Meta Tags": [],
                "Headings": [],
                "Content": [],
                "Links": [],
                "Technical SEO": [],
                "Mobile SEO": [],
                "General SEO": []
              };

              seoComments.forEach((comment: any) => {
                const lower = (comment.heading + " " + comment.finding).toLowerCase();
                let group = "General SEO";
                if (lower.includes("meta") || lower.includes("title") || lower.includes("description")) group = "Meta Tags";
                else if (lower.includes("heading") || lower.includes("h1") || lower.includes("h2") || lower.includes("h3")) group = "Headings";
                else if (lower.includes("content") || lower.includes("keyword") || lower.includes("alt text") || lower.includes("copy")) group = "Content";
                else if (lower.includes("link") || lower.includes("anchor") || lower.includes("url")) group = "Links";
                else if (lower.includes("mobile") || lower.includes("responsive") || lower.includes("viewport")) group = "Mobile SEO";
                else if (lower.includes("schema") || lower.includes("robot") || lower.includes("sitemap") || lower.includes("index") || lower.includes("technical") || lower.includes("canonical")) group = "Technical SEO";
                
                groupedComments[group].push(comment);
              });

              // Fallback to findings if no developer comments for SEO
              const activeGroups = Object.entries(groupedComments).filter(([_, comments]) => comments.length > 0);

              return (
                <Card key={section.category} className="print-section border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                  <CardContent className="p-6 md:p-12">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 break-words">{section.heading}</h3>
                      <span className="rounded-full bg-indigo-50/80 text-indigo-700 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] shrink-0">{categoryLabel(section.category)}</span>
                    </div>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light mb-8">{section.analysis}</p>
                    
                    {activeGroups.length > 0 ? (
                      <div className="space-y-8">
                        {activeGroups.map(([groupName, comments]) => (
                          <div key={groupName}>
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">{groupName}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                              {comments.map((comment: any, idx: number) => (
                                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 flex flex-col h-full">
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                      comment.priority === 'critical' ? 'bg-rose-100 text-rose-700' :
                                      comment.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                      comment.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                      'bg-slate-200 text-slate-700'
                                    }`}>
                                      {comment.priority}
                                    </span>
                                    {comment.strength && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">Strength</span>}
                                  </div>
                                  <h5 className="font-bold text-slate-900 text-sm md:text-base leading-snug break-words mb-2">{comment.heading}</h5>
                                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4 flex-grow">{comment.finding}</p>
                                  <div className="pt-3 border-t border-slate-200 mt-auto">
                                    <p className="text-xs font-semibold text-indigo-700 flex items-start gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> 
                                      <span className="leading-relaxed">{comment.recommendation}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-7 grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-black text-slate-900 mb-3 text-lg">Findings</h4>
                          <ul className="space-y-3">
                            {section.findings.map((item) => <li key={item} className="text-sm md:text-base text-slate-700 flex gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 mb-3 text-lg">Recommendations</h4>
                          <ul className="space-y-3">
                            {section.recommendations.map((item) => <li key={item} className="text-sm md:text-base text-slate-700 flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />{item}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }

            return (
            <Card key={section.category} className="print-section border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-10 md:p-12">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{section.heading}</h3>
                  <span className="rounded-full bg-indigo-50/80 text-indigo-700 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em]">{categoryLabel(section.category)}</span>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed font-light">{section.analysis}</p>
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
            );
          })}
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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
              <Terminal className="h-6 w-6" />
            </div>
            <h2 className="print-heading text-3xl font-black tracking-tight text-slate-900">Technical Observations</h2>
          </div>
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
            <CardContent className="p-10 pl-12 whitespace-pre-line text-slate-600 leading-relaxed font-light">{finalComments}</CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px bg-slate-200 flex-1"></span>
            <h2 className="print-heading text-3xl font-black tracking-tight text-slate-900">Recommended Actions</h2>
            <span className="h-px bg-slate-200 flex-1"></span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {finalRecommendations.map((item, index) => (
              <Card key={`${index}-${item}`} className="print-section border-none shadow-lg shadow-slate-200/50 rounded-3xl bg-white hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="h-10 w-10 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                      {index + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action Item</span>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed">{item}</p>
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
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px bg-slate-200 flex-1"></span>
              <h2 className="print-heading text-3xl font-black tracking-tight text-slate-900">Visual Evidence</h2>
              <span className="h-px bg-slate-200 flex-1"></span>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {mediaFor("appendix").map((item) => (
                <figure key={item.id} className="print-section overflow-hidden rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
                  <img src={item.url} alt={item.caption} className="w-full h-auto object-contain" />
                  <figcaption className="p-6 text-sm font-medium text-slate-600 text-center bg-slate-50/50">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="print-section rounded-[2.5rem] border-none shadow-2xl shadow-indigo-900/10 bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-10 md:p-14 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-300 mb-4">Strategic Proposal</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">{aiAudit.proposal_content.title}</h2>
            <p className="mt-6 text-xl text-slate-300 leading-relaxed font-light max-w-3xl">{aiAudit.proposal_content.executive_pitch}</p>
            
            <div className="mt-12 mb-6">
              <h3 className="text-xl font-bold mb-6 text-white">Project Scope</h3>
              <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                {aiAudit.proposal_content.scope.map((item) => (
                  <li key={item} className="flex gap-4 items-start">
                    <div className="mt-0.5 p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    </div>
                    <span className="text-base text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {mediaFor("proposal").length > 0 && (
              <div className="mt-10 mb-12 grid md:grid-cols-2 gap-6">
                {mediaFor("proposal").map((item) => (
                  <figure key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img src={item.url} alt={item.caption} className="w-full h-auto object-contain mix-blend-screen opacity-90" />
                    <figcaption className="p-4 text-sm font-medium text-slate-300 text-center">{item.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            
            {aiAudit.proposal_content.maintenance_pricing.included && (
              <div className="mt-12 p-8 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-3">Ongoing Support</p>
                <h3 className="text-2xl font-bold text-white">{aiAudit.proposal_content.maintenance_pricing.plan_name}</h3>
                <p className="mt-3 text-slate-300 mb-6 font-light">{aiAudit.proposal_content.maintenance_pricing.price_note}</p>
                <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                  {aiAudit.proposal_content.maintenance_pricing.services.map((item) => (
                    <li key={item} className="flex gap-3 items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                      <span className="text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reportContent.includeBeforeAfter && (
              <div className="mt-16 pt-10 border-t border-white/10">
                <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-400" /> Transformation Preview
                </h3>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Existing Website</p>
                    <ReportImageHover image={lead.beforeAfterImage || lead.desktopImage || ""} label="before" />
                  </div>
                  <div className="space-y-5">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Proposed Strategy</p>
                    <ReportImageHover image={(lead.reportContent as any)?.afterImage || ""} label="after" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-16 pt-10 border-t border-white/10 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="max-w-xl">
                <p className="font-black text-2xl md:text-3xl tracking-tight text-white">{aiAudit.proposal_content.call_to_action}</p>
                <p className="mt-3 text-base text-slate-400 flex items-center gap-2 font-light">
                  <ShieldCheck className="h-5 w-5 text-blue-400" /> Guaranteed focused implementation strategy.
                </p>
              </div>
              <Button className="bg-white text-slate-950 hover:bg-slate-200 h-14 px-8 text-lg font-bold rounded-full w-full md:w-auto shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all duration-300" asChild>
                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hassannaqvi@coreweblabs.com'}?subject=${encodeURIComponent(aiAudit.proposal_content.subject)}`}>
                  Start Your Growth Project <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
