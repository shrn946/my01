import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Monitor, Zap, Search, Layout, Target, AlertCircle, BarChart3, TrendingUp, ShieldCheck, Palette, Type, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: slug } });
  
  if (!lead) return notFound();

  const designAnalysis = lead.designAnalysis as any;

  const getBusinessImpact = (perf: number, seo: number) => {
    return [
      {
        title: "User Retention",
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        desc: perf < 70 
          ? `With a performance score of ${perf}%, you are likely losing up to 40% of potential visitors before the page even loads. Fast loading is critical for retaining modern mobile users.` 
          : "Your website performance is healthy, which helps keep users engaged and reduces bounce rates."
      },
      {
        title: "Search Visibility",
        icon: <Search className="h-5 w-5 text-blue-500" />,
        desc: seo < 80 
          ? `A score of ${seo}% in SEO means Google may be penalizing your ranking. Fixing these structural issues could significantly increase the number of organic leads you receive.` 
          : "You have a solid SEO foundation, but there is always room to optimize for even higher rankings and more traffic."
      },
      {
        title: "Trust & Credibility",
        icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
        desc: "Design and technical best practices directly impact how customers perceive your business. A modern, polished site builds immediate trust."
      },
      {
        title: "Conversion Potential",
        icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
        desc: "Optimizing your site's structure and CTA (Call to Action) elements can turn more of your existing traffic into paying customers."
      }
    ];
  };

  const improvements = lead.improvementProposals && lead.improvementProposals.length > 0 
    ? lead.improvementProposals 
    : [
      "Modern Hero Section with clear value proposition",
      "Optimized Typography for better readability",
      "Strategic Call-to-Action (CTA) placement",
      "Mobile-First Responsive Design",
      "Image optimization for faster load speeds",
      "Clear contact information and lead forms",
      "Structured data for better Google rankings",
      "Customer trust signals (Reviews & Testimonials)"
    ];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-24 pb-40 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest">
            Detailed Website Audit
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
            Strategic Growth Audit for {lead.businessName || "Your Business"}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            A comprehensive analysis of <span className="text-blue-400">{lead.website}</span> and actionable recommendations for improvement.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 space-y-16">
        {/* 2. Key Metrics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreBox label="Conversion Score" score={lead.websiteScore || 0} icon={<Target />} sub="Overall potential" />
          <ScoreBox label="Performance" score={lead.performanceScore || 0} icon={<Zap />} sub="Loading speed" />
          <ScoreBox label="SEO Score" score={lead.seoScore || 0} icon={<Search />} sub="Search ranking" />
          <ScoreBox label="UX/Design" score={lead.designScore || 75} icon={<Layout />} sub="Visual appeal" />
        </div>

        {/* 3. Main Screenshot Section */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Monitor className="h-6 w-6 text-blue-600" />
              Current Website Multi-Device Preview
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Desktop Laptop Frame - 8 cols */}
            <div className="lg:col-span-8 relative">
              <div className="relative mx-auto border-slate-800 bg-slate-800 border-[8px] rounded-t-2xl w-full max-w-[800px] shadow-2xl overflow-hidden">
                <div className="aspect-[16/10] w-full bg-white overflow-hidden">
                   {lead.desktopImage ? (
                      <img src={lead.desktopImage} alt="Desktop Preview" className="w-full h-full object-cover object-top" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-xs">Desktop Capture Pending</div>
                   )}
                </div>
              </div>
              <div className="relative mx-auto bg-slate-900 rounded-b-2xl rounded-t-sm h-[16px] md:h-[24px] w-[105%] -ml-[2.5%] shadow-lg"></div>
              <div className="relative mx-auto bg-slate-800/50 rounded-b-xl h-[4px] md:h-[6px] w-[20%] mt-[-2px]"></div>
            </div>

            {/* Mobile iPhone Frame - 4 cols */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative mx-auto border-slate-900 bg-slate-900 border-[12px] rounded-[3rem] w-[260px] aspect-[9/19.5] shadow-2xl overflow-hidden ring-4 ring-slate-800/50">
                <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 z-20 flex justify-center">
                   <div className="w-24 h-5 bg-slate-900 rounded-b-2xl"></div>
                </div>
                <div className="w-full h-full bg-white">
                   {lead.mobileImage ? (
                      <img src={lead.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover object-top" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center px-4">Mobile Capture Pending</div>
                   )}
                </div>
                <div className="absolute bottom-2 inset-x-0 h-1.5 w-1/3 mx-auto bg-white/20 rounded-full z-20"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Comments Section */}
        {lead.developerComments && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Terminal className="h-6 w-6 text-indigo-600" />
              Expert Technical Analysis
            </h2>
            <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden shadow-sm">
              <CardContent className="p-10 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="h-4 w-px bg-indigo-200 mx-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Developer Insights from Hassan Rizwan</p>
                  </div>
                  <div className="text-xl font-medium text-slate-800 leading-relaxed italic">
                    "{lead.developerComments}"
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pt-4">
                     <ShieldCheck className="h-4 w-4" /> Verified Professional Audit
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Side: Audit Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Design Analysis Section */}
            {designAnalysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Palette className="h-6 w-6 text-pink-500" />
                  Visual Identity Analysis
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-slate-100 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
                        <Type className="h-4 w-4" /> Detected Typography
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {designAnalysis.fonts?.map((font: string) => (
                          <span key={font} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 border border-slate-200">
                            {font}
                          </span>
                        ))}
                      </div>
                      {designAnalysis.typography?.h1FontSize && (
                        <p className="text-xs text-slate-500 mt-2">
                          Main Heading: <span className="font-bold text-slate-700">{designAnalysis.typography.h1FontSize}</span> with <span className="font-bold text-slate-700">{designAnalysis.typography.h1FontWeight}</span> weight.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border-slate-100 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
                        <Palette className="h-4 w-4" /> Color Palette
                      </div>
                      <div className="flex gap-3">
                        {designAnalysis.colors?.background?.map((color: string, i: number) => (
                          <div key={i} className="group relative">
                            <div 
                              className="w-10 h-10 rounded-full border border-black/10 shadow-sm" 
                              style={{ backgroundColor: color }} 
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                          <CheckCircle2 className={`h-3 w-3 ${designAnalysis.structure?.hasNavbar ? 'text-green-500' : 'text-slate-300'}`} /> Navbar
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                          <CheckCircle2 className={`h-3 w-3 ${designAnalysis.structure?.hasHero ? 'text-green-500' : 'text-slate-300'}`} /> Hero Section
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                          <CheckCircle2 className={`h-3 w-3 ${designAnalysis.structure?.hasFooter ? 'text-green-500' : 'text-slate-300'}`} /> Footer
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 text-blue-600">
                          {designAnalysis.structure?.ctaCount || 0} CTA Buttons
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Business Impact Analysis */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Business Impact Analysis
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {getBusinessImpact(lead.performanceScore || 0, lead.seoScore || 0).map((impact, i) => (
                  <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          {impact.icon}
                        </div>
                        <h3 className="font-bold text-slate-800">{impact.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{impact.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Critical Issues Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                Critical Issues Found
              </h2>
              <Card className="border-red-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-red-50 p-8 space-y-4">
                    {lead.topIssues ? (
                      <div className="space-y-4">
                        {lead.topIssues.split('\n').filter(Boolean).map((issue, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <span className="bg-red-200 text-red-800 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-lg text-slate-800 font-medium">{issue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-500 py-4 italic">
                        No critical issues reported.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Redesign Comparison */}
            {lead.beforeAfterImage && (
              <div className="space-y-6 pt-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Monitor className="h-6 w-6 text-blue-600" />
                  Proposed Redesign Direction
                </h2>
                <Card className="overflow-hidden shadow-2xl border-0 ring-1 ring-slate-200">
                  <img src={lead.beforeAfterImage} alt="Before vs After Comparison" className="w-full h-auto" />
                </Card>
                <p className="text-sm text-center text-slate-500 italic">
                  Note: This represents a high-level conceptual direction for your new high-converting website.
                </p>
              </div>
            )}
          </div>

          {/* Right Side: Recommendations & CTA */}
          <div className="space-y-12">
            {/* Implementation Plan */}
            <div className="space-y-6 sticky top-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Growth Strategy
              </h2>
              <Card className="border-slate-200 shadow-xl bg-slate-50">
                <CardContent className="p-8 space-y-6">
                  <h3 className="font-bold text-lg text-slate-800">Action Plan for {lead.businessName}</h3>
                  <div className="space-y-4">
                    {improvements.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-slate-200" />

                  <div className="space-y-4 pt-4">
                    <p className="text-sm font-bold text-slate-800">Ready to start?</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Transform your online presence with a website designed to convert visitors into loyal customers. Let's build something great together.
                    </p>
                    <Button className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20" asChild>
                      <a href={`mailto:hassan@example.com?subject=Re: Audit for ${lead.businessName}`}>
                        Claim My New Website <ArrowRight className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badge */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 text-center">
                 <div className="flex justify-center gap-1 mb-3">
                   {[1,2,3,4,5].map(s => <Target key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                 </div>
                 <p className="text-xs font-bold text-slate-600">Trusted by modern businesses for website optimization and growth.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Footer */}
        <div className="pt-10">
          <Card className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-0 shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="h-40 w-40" />
            </div>
            <CardContent className="p-12 md:p-16 text-center space-y-8 relative z-10">
              <h2 className="text-4xl font-black max-w-3xl mx-auto leading-tight">
                Don't let a poorly optimized website hold your business back.
              </h2>
              <p className="text-blue-100 text-xl max-w-2xl mx-auto font-medium">
                I'm offering a free 15-minute implementation strategy call to walk you through these findings and help you plan your next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-black text-xl px-10 h-16 rounded-2xl shadow-xl">
                  Schedule Strategy Call
                </Button>
                <div className="text-blue-200 text-sm font-bold flex items-center gap-2">
                   <ShieldCheck className="h-5 w-5" /> No obligation, just expert advice.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="mt-20 border-t py-12 text-center text-slate-400 text-sm font-medium">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Growth Website Audit • All Rights Reserved</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Contact Expert</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScoreBox({ label, score, icon, sub }: { label: string, score: number, icon: React.ReactNode, sub: string }) {
  const color = score >= 90 ? "text-green-600 bg-green-50 border-green-100" : score >= 60 ? "text-blue-600 bg-blue-50 border-blue-100" : "text-red-600 bg-red-50 border-red-100";
  return (
    <div className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center space-y-3 transition-all hover:scale-[1.02] shadow-sm ${color}`}>
      <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100">{icon}</div>
      <div>
        <div className="text-5xl font-black tracking-tight">{score}</div>
        <div className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{label}</div>
        <div className="text-[10px] italic font-medium opacity-50">{sub}</div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
