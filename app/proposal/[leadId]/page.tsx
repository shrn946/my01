import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Globe, Mail, Phone, ExternalLink, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ leadId: string }>,
  searchParams: Promise<{ mode?: string }>
}) {
  const { leadId } = await params;
  const { mode = "design" } = await searchParams;
  const prisma = getPrisma();

  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!lead) return notFound();

  const isTech = mode === "tech";

  const portfolioExamples = lead.category 
    ? await prisma.portfolioExample.findMany({
        where: { category: lead.category },
        take: 3
      })
    : [];

  const scores = [
    { label: "Performance", score: lead.performanceScore ?? lead.pageSpeedPerformance ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "SEO", score: lead.seoScore ?? lead.pageSpeedSeo ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Accessibility", score: lead.accessibilityScore ?? lead.pageSpeedAccessibility ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Best Practices", score: lead.bestPracticesScore ?? lead.pageSpeedBestPractices ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const designImprovements = [
    "Modern & Minimalist Hero Section",
    "Enhanced Typography for Readability",
    "High-Contrast Call-to-Action Buttons",
    "Mobile-First Responsive Layout",
    "Trust-Building Social Proof Sections",
    "Streamlined Lead Capture Forms"
  ];

  const techImprovements = [
    "Optimized Image Compression & WebP",
    "Core Web Vitals Optimization",
    "SEO-Friendly Semantic HTML Structure",
    "Advanced Caching & Minification",
    "Accessibility (WCAG) Compliance",
    "Rapid Server Response Time"
  ];

  const improvements = isTech ? techImprovements : designImprovements;

  const designAnalysis = lead.designAnalysis as any;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {/* 1200px container */}
      <div className="mx-auto w-[1100px] bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-black/5">
        
        {/* Header Section */}
        <header className={`${isTech ? 'bg-slate-900' : 'bg-primary'} p-16 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest mb-6">
                  {isTech ? "Technical Audit & Optimization" : "UI/UX & Design Transformation"}
                </span>
                <h1 className="text-6xl font-black tracking-tight leading-tight">
                  {isTech ? "Speed & SEO" : "Design & Conversion"} <br /> Proposal
                </h1>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold opacity-90">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <div className="mt-4 h-1 w-24 bg-white/30 ml-auto rounded-full" />
              </div>
            </div>

            <div className="mt-16 flex flex-wrap gap-12 items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Prepared For</p>
                <h2 className="text-3xl font-black">{lead.businessName}</h2>
                <p className="text-lg opacity-80 mt-1">{lead.website}</p>
              </div>
              <div className="h-16 w-px bg-white/20 hidden lg:block" />
              <div>
                <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Expert Developer</p>
                <h3 className="text-3xl font-black">Hassan Rizwan</h3>
                <p className="text-lg opacity-80 mt-1">{isTech ? "Full-Stack Performance Engineer" : "UI/UX & Next.js Expert"}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-16 space-y-20">
          
          {/* Performance Audit Section */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-3xl font-black text-ink">{isTech ? "Technical Performance Metrics" : "Website Health Audit"}</h3>
              <div className="h-px flex-1 bg-black/5" />
            </div>
            
            <div className="grid grid-cols-4 gap-8">
              {scores.map((s) => (
                <div key={s.label} className={`${s.bg} rounded-[2.5rem] p-8 text-center border border-black/5 shadow-sm`}>
                  <div className={`text-5xl font-black mb-3 ${s.color}`}>
                    {s.score}%
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Developer Insights Section */}
          {lead.developerComments && (
            <section>
               <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-3xl font-black text-ink">Expert Analysis & Strategy</h3>
                  <div className="h-px flex-1 bg-black/5" />
               </div>
               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Terminal className="h-40 w-40" />
                  </div>
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                           <div className="w-3 h-3 rounded-full bg-red-400" />
                           <div className="w-3 h-3 rounded-full bg-amber-400" />
                           <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="h-4 w-px bg-white/20 mx-2" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Developer Insights</span>
                     </div>
                     <p className="text-2xl font-medium leading-relaxed italic text-slate-300">
                        "{lead.developerComments}"
                     </p>
                     <div className="pt-4 flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Analysis by Hassan Rizwan</span>
                        <div className="w-12 h-px bg-slate-800" />
                        <span>Lead Full-Stack Engineer</span>
                     </div>
                  </div>
               </div>
            </section>
          )}

          {/* Design Identity Section */}
          {designAnalysis && (
            <section className="grid grid-cols-2 gap-16">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-3xl font-black text-ink">Design Identity</h3>
                  <div className="h-px flex-1 bg-black/5" />
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Detected Typography</p>
                    <div className="flex flex-wrap gap-3">
                      {designAnalysis.fonts?.map((font: string) => (
                        <div key={font} className="px-5 py-3 bg-white border border-black/5 rounded-2xl shadow-sm text-lg font-bold text-slate-700">
                          {font}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Color Palette</p>
                    <div className="flex gap-4">
                      {designAnalysis.colors?.background?.map((color: string, i: number) => (
                        <div key={i} className="group relative">
                          <div 
                            className="w-16 h-16 rounded-2xl border border-black/10 shadow-inner transition-transform group-hover:scale-110" 
                            style={{ backgroundColor: color }} 
                          />
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20">
                            {color}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-[3rem] p-12 border border-black/5 flex flex-col justify-center">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Navbar</p>
                        <p className="text-xl font-black text-ink">{designAnalysis.structure?.hasNavbar ? "Detected" : "Missing"}</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Hero Section</p>
                        <p className="text-xl font-black text-ink">{designAnalysis.structure?.hasHero ? "Detected" : "Missing"}</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">CTA Buttons</p>
                        <p className="text-xl font-black text-ink">{designAnalysis.structure?.ctaCount || 0} Found</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Mobile View</p>
                        <p className="text-xl font-black text-ink">Optimized</p>
                    </div>
                 </div>
              </div>
            </section>
          )}

          {/* Improvement Points Section */}
          <section className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-10">
                <h3 className="text-3xl font-black text-ink">{isTech ? "Technical Roadmap" : "Design Strategy"}</h3>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              <ul className="space-y-6">
                {improvements.map((text) => (
                  <li key={text} className="flex items-center gap-5">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl ${isTech ? 'bg-slate-200 text-slate-700' : 'bg-primary/10 text-primary'} flex items-center justify-center`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-xl font-bold text-slate-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-[3rem] p-12 border border-black/5">
                <p className="text-2xl font-black text-ink mb-6 italic leading-relaxed">
                    {isTech 
                      ? "A faster website isn't just a luxury—it's a requirement for SEO rankings and user retention in 2026." 
                      : "We don't just build websites; we create high-converting digital experiences that drive real business growth."}
                </p>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${isTech ? 'bg-slate-800' : 'bg-primary'}`} />
                    <div>
                        <p className="font-black text-ink">Hassan Rizwan</p>
                        <p className="text-sm font-bold text-slate-400">{isTech ? "Technical Lead" : "Lead Designer"}</p>
                    </div>
                </div>
            </div>
          </section>

          {/* Screenshot / Before-After Section (Only for Design) */}
          {!isTech && lead.beforeAfterImage && (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h3 className="text-3xl font-black text-ink">Proposed Visual Transformation</h3>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              <div className="rounded-[2.5rem] overflow-hidden border border-black/5 shadow-lg">
                <img src={lead.beforeAfterImage} alt="Visual Transformation" className="w-full h-auto" />
              </div>
            </section>
          )}

          {/* Portfolio Section */}
          {portfolioExamples.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h3 className="text-3xl font-black text-ink">Relevant {isTech ? "Case Studies" : "Portfolio Work"}</h3>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              <div className="grid grid-cols-3 gap-8">
                {portfolioExamples.map((item) => (
                  <div key={item.id} className="group rounded-[2.5rem] border border-black/5 bg-white overflow-hidden shadow-soft transition-all hover:shadow-premium">
                    <div className="relative aspect-video bg-slate-100">
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="p-8">
                      <h4 className="text-xl font-black text-ink mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{item.description}</p>
                      <div className="flex items-center text-primary font-black text-xs uppercase tracking-widest gap-2">
                        <Globe size={14} />
                        {item.url.replace('https://', '').replace('www.', '')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer CTA Section */}
          <footer className={`bg-slate-950 rounded-[3rem] p-16 text-white text-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-primary/10" />
            <div className="relative z-10">
                <h3 className="text-4xl font-black mb-4">{isTech ? "Ready to optimize your performance?" : "Want a modern website like these examples?"}</h3>
                <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                    Let's discuss how we can transform your online presence and start attracting more customers today.
                </p>
                
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-8 py-4 border border-white/10">
                        <div className="text-primary"><Phone size={24} /></div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">WhatsApp Me</p>
                            <p className="text-lg font-bold">+92 312 1234567</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-8 py-4 border border-white/10">
                        <div className="text-primary"><Mail size={24} /></div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Email Support</p>
                            <p className="text-lg font-bold">hassan@example.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-8 py-4 border border-white/10">
                        <div className="text-primary"><Globe size={24} /></div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Visit My Website</p>
                            <p className="text-lg font-bold">www.hassanrizwan.com</p>
                        </div>
                    </div>
                </div>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
