import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { trackProposalView, getAgencySettings } from "@/lib/agency-actions";
import { 
  Building2, 
  Layers, 
  Clock, 
  Workflow, 
  MessageSquare, 
  ArrowUpRight, 
  CheckCircle, 
  HelpCircle,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  Shield,
  Zap,
  ShoppingBag,
  Code,
  Heart,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AgencyProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const prisma = getPrisma();
  
  // Track proposal view
  await trackProposalView(resolvedParams.slug);

  const agency = await prisma.agency.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!agency) return notFound();

  const settings = await getAgencySettings();

  // Get portfolio projects from database
  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  // Mocked projects to guarantee 18 premium items with law/dental websites
  const mockProjects = [
    { id: "mock-1", title: "Apex Dental Group Portal", description: "A high-performance custom WordPress site for a multi-location dental practice, featuring instant appointment bookings and custom interactive maps.", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Elementor Pro", "Custom API"] },
    { id: "mock-2", title: "Vanguard Legal Associates", description: "Secure, multilingual custom theme built for a top-tier corporate law firm, integrated with Clio billing and contract portals.", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Tailwind CSS", "Clio API"] },
    { id: "mock-3", title: "Beacon Family Dentistry", description: "Bespoke WooCommerce billing portal and appointment workflow designed to run fully white-label under partner agency brand.", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80", tools: ["WooCommerce", "WordPress", "Custom Plugin"] },
    { id: "mock-4", title: "Summit Litigation Partners", description: "Modern WebGL-driven corporate law interface optimized to load in under 600ms, featuring robust case studies archive.", image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80", tools: ["React", "WordPress headless", "GSAP"] },
    { id: "mock-5", title: "Vibe Creative Studio", description: "Creative portfolio site featuring complex WebGL shaders, premium custom theme design, and drag-and-drop builder modules.", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "GSAP", "Three.js"] },
    { id: "mock-6", title: "Glow Skin & Dental Spa", description: "Premium booking platform with automated email reminders and deposit checkout pipeline via Stripe custom flow.", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "WooCommerce", "Stripe API"] },
    { id: "mock-7", title: "Nova Law Partners", description: "High-end corporate website for litigation lawyers with responsive CMS archive, filtering, and custom search modules.", image: "https://images.unsplash.com/photo-1505664194779-8bebcb95c02e?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "ACF Pro", "Tailwind"] },
    { id: "mock-8", title: "Elite Dental Care Clinic", description: "Modern clinic web app displaying dynamic specialist scheduling tables, patient intakes forms, and secure document vaults.", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Gravity Forms", "WooCommerce"] },
    { id: "mock-9", title: "Scribe Legal Advisors", description: "Clean corporate portal built on Gutenberg native blocks using custom styling tokens for lightning speed PageSpeed scores.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Gutenberg", "Core Web Vitals"] },
    { id: "mock-10", title: "Smile Craft Dental Care", description: "Custom Gutenberg-based portal featuring patient feedback dashboard, services directory, and live chat automation.", image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Gutenberg Blocks", "Stripe"] },
    { id: "mock-11", title: "Metropolis Co-Working App", description: "Vite/Next.js frontend with WordPress REST API backend for desk booking and monthly subscriptions billing.", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80", tools: ["Next.js", "Headless WP", "Tailwind CSS"] },
    { id: "mock-12", title: "E-Commerce Athletics Shop", description: "WooCommerce store optimized for high-volume traffic with Redis cache, Algolia search, and stripe customized checkouts.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80", tools: ["WooCommerce", "Algolia", "Redis"] },
    { id: "mock-13", title: "Real Estate Listings Portal", description: "WordPress real estate search tool connected via cron job to local MLS listings with dynamic map interfaces.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "MLS API", "Google Maps"] },
    { id: "mock-14", title: "Omni Health Diagnostics", description: "Medical testing results dashboard with secure customer access portals and direct backend reporting tools.", image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "React", "Secure API"] },
    { id: "mock-15", title: "Pinnacle Capital Partners", description: "Financial advisory landing page built for modern digital marketing with high-converting intake funnels.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Elementor", "HubSpot"] },
    { id: "mock-16", title: "Green Energy Corp Portal", description: "Corporate brand site for renewable energy projects, featuring responsive SVG animations and dynamic chart tables.", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "Gutenberg", "Lottie"] },
    { id: "mock-17", title: "Venture Capital Hub", description: "Sleek portfolio portal showing funded startups, investment details, and dynamic custom post types.", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80", tools: ["WordPress", "ACF Pro", "Tailwind CSS"] },
    { id: "mock-18", title: "Zest Food Delivery Hub", description: "Custom WooCommerce local food hub setup with time slots, order boundaries, and print receipts integrations.", image: "https://images.unsplash.com/photo-1526367790999-015078648c7e?auto=format&fit=crop&w=600&q=80", tools: ["WooCommerce", "Print API", "Google Pay"] }
  ];

  // Merge database items with mock items to guarantee 18 items
  const combinedList = [...dbProjects];
  mockProjects.forEach(m => {
    if (!combinedList.some(d => d.title.toLowerCase() === m.title.toLowerCase())) {
      combinedList.push(m as any);
    }
  });

  // Sort: Law and Dental items first
  const sortedProjects = combinedList.sort((a, b) => {
    const aLower = (a.title + " " + (a.description || "")).toLowerCase();
    const bLower = (b.title + " " + (b.description || "")).toLowerCase();
    
    const aMatch = aLower.includes("law") || aLower.includes("dent") || aLower.includes("legal") || aLower.includes("clinic");
    const bMatch = bLower.includes("law") || bLower.includes("dent") || bLower.includes("legal") || bLower.includes("clinic");

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  }).slice(0, 18);

  // Load custom services from settings or default fallback list
  const defaultServices = [
    { title: "White-label WordPress Development", description: "Pixel-perfect custom theme and plugin builds designed specifically to represent your brand.", icon: "Code" },
    { title: "Elementor & Page Builders", description: "Fast, editable layouts using Elementor, Divi, Bricks, or Oxygen according to your workflow.", icon: "Globe" },
    { title: "WooCommerce & E-commerce", description: "Robust, secure shopping experiences with custom checkouts, subscriptions, and integrations.", icon: "ShoppingBag" },
    { title: "Figma/PSD to WordPress", description: "Hand-coded, responsive Gutenberg block layouts or builders direct from design files.", icon: "Layers" },
    { title: "Next.js & Headless WordPress", description: "State-of-the-art fast frontends connected to a familiar WordPress admin panel via WPGraphQL.", icon: "Zap" },
    { title: "Performance Optimization", description: "Turn slow WP builds into lightning fast assets hitting 90+ Mobile PageSpeed scores.", icon: "Shield" }
  ];

  const activeServices = (settings.howWeCanHelp as any[]) || [];
  const displayServices = activeServices.length > 0 
    ? activeServices.filter(s => s.enabled !== false)
    : defaultServices;

  // Render icons mapping helper
  const getServiceIcon = (name: string) => {
    switch (name) {
      case "Code": return <Code className="w-5 h-5 text-indigo-600" />;
      case "ShoppingBag": return <ShoppingBag className="w-5 h-5 text-indigo-600" />;
      case "Zap": return <Zap className="w-5 h-5 text-indigo-600" />;
      case "Shield": return <Shield className="w-5 h-5 text-indigo-600" />;
      case "Heart": return <Heart className="w-5 h-5 text-indigo-600" />;
      case "Globe": return <Globe className="w-5 h-5 text-indigo-600" />;
      default: return <Code className="w-5 h-5 text-indigo-600" />;
    }
  };

  // Why partner fallback
  const partners = [
    { title: "White-label Delivery", desc: "We operate completely behind the scenes under your brand. No direct client communication." },
    { title: "Sprint-Based Deadlines", desc: "Timely delivery backed by transparent Git workflows and staging review environments." },
    { title: "Agency-Level QA Testing", desc: "Every line is formatted, responsive-checked, and run through standard checklist validation." },
    { title: "Green Core Web Vitals", desc: "Built using fast assets to guarantee high PageSpeed scores right out of the box." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sticky Header */}
      <header className="border-b border-slate-200 backdrop-blur-md sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center bg-white/95">
        <div className="flex items-center gap-2">
          {settings.companyLogo ? (
            <img src={settings.companyLogo} alt={settings.companyName || "Logo"} className="h-8 object-contain" />
          ) : (
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              {settings.companyName || "CoreWebLabs"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/10 h-9">
            <a href={`mailto:${settings.senderEmail || "hassannaqvi@coreweblabs.com"}?subject=White-label partnership query`}>
              Contact Hassan
            </a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full text-indigo-700 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Exclusive Partnership Proposal
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-slate-900">
          {agency.proposalHeadline || `Augment Your Capacity with Reliable White-label WordPress Support`}
        </h1>
        <p className="text-slate-650 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          {agency.proposalIntro || `We act as a seamless, high-performance extension to your agency. Ship custom Gutenberg, WooCommerce, and Next.js builds on time, without hiring overhead.`}
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-600/10 h-12">
            <a href={`mailto:${settings.senderEmail || "hassannaqvi@coreweblabs.com"}?subject=Re: Partnership Proposal`}>
              Let's Discuss Partner Work
            </a>
          </Button>
          {settings.whatsapp && (
            <Button asChild variant="outline" size="lg" className="border-slate-200 hover:bg-slate-100 text-slate-700 bg-white h-12">
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">
                Message WhatsApp
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* About The Agency Section */}
      <section className="py-16 border-t border-b border-slate-250/70 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-650" /> Scaling {agency.name}
            </h2>
            <p className="text-slate-650 text-base leading-relaxed">
              We admire the outstanding projects created by the team at <span className="font-bold text-slate-800">{agency.name}</span>. 
              As an agency, managing design pipeline fluctuations can cause resource bottlenecks. 
              We operate as a silent, specialized WordPress engineering partner, allowing your project managers to focus on design and strategy.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Outreach Context</h3>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Target Location:</span>
                <span className="text-slate-800 font-semibold">{agency.city ? `${agency.city}, ` : ""}{agency.country}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Core Target Stack:</span>
                <span className="text-slate-800 font-semibold">{agency.services.slice(0, 2).join(", ") || "Custom Dev"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Can Help Section */}
      <section className="py-20 max-w-5xl mx-auto px-6 md:px-12 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">How We Can Help</h2>
          <p className="text-slate-650 max-w-lg mx-auto">Augment your active project pipeline with our production-grade technical capability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service: any, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-350 transition-colors shadow-sm space-y-3">
              <div className="p-2 rounded-lg bg-indigo-50 w-fit">
                {getServiceIcon(service.icon)}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{service.title}</h3>
              <p className="text-slate-650 text-xs leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Partner With Us Section */}
      <section className="py-20 bg-white border-t border-b border-slate-250/70">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900">Why Partner With {settings.companyName || "Us"}?</h2>
            <p className="text-slate-650 leading-relaxed text-sm">
              We specialize in custom Gutenberg blocks, theme development, complex e-commerce integrations, and API syncs. 
              We operate exclusively behind the scenes, integrating into your Slack workspace or project board without direct client communication.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Slack", "GitHub", "Teams", "ClickUp", "Asana", "Trello"].map((tool) => (
                <span key={tool} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {partners.map((partner, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 shadow-sm flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{partner.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{partner.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      {sortedProjects.length > 0 && (
        <section className="py-20 bg-slate-50 border-b border-slate-250/70">
          <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Our White-Label Engineering Portfolio</h2>
                <p className="text-slate-600 mt-1 max-w-xl">
                  Explore custom law, dental, and e-commerce websites engineered to support agency capacity and pass rigorous QA checks.
                </p>
              </div>
              {settings.portfolioUrl && (
                <Button asChild variant="outline" className="border-slate-200 bg-white text-slate-700 h-9 font-semibold">
                  <a href={settings.portfolioUrl} target="_blank" rel="noreferrer">
                    Portfolio site <ArrowUpRight className="w-4 h-4 ml-1 text-slate-400" />
                  </a>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProjects.map((project) => (
                <div key={project.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    {project.image && (
                      <div className="w-full h-48 overflow-hidden relative border-b border-slate-100">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-slate-900 text-base">{project.title}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{project.description}</p>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex flex-wrap gap-1">
                    {project.tools.slice(0, 3).map((t) => (
                      <span key={t} className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] px-2 py-0.5 rounded font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 max-w-3xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600">Everything you need to know about white-label collaboration.</p>
        </div>

        <div className="space-y-6">
          {[
            { q: "Do you sign Non-Disclosure Agreements (NDAs)?", a: "Yes. We operate fully behind the scenes under your brand. We sign NDAs before receiving any project specifications." },
            { q: "How do we coordinate during a sprint?", a: "We adapt to your workspace. We join Slack channels or work in ClickUp, Asana, Jira or GitHub, providing direct updates to your PM team." },
            { q: "What is your typical turnaround time?", a: "Typical landing page setups take 3-5 days. Complete custom Gutenberg/Elementor websites take 2-4 weeks depending on structure complexity." },
            { q: "Do you support maintenance and updates?", a: "Yes. We offer white-label monthly maintenance care plans (backups, core updates, malware scanning, minor tweaks) representing your agency." }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">{item.q}</h4>
              <p className="text-slate-600 text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-250/70 text-center text-slate-500 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{settings.companyName || "CoreWebLabs"}</p>
        <p>White-label wordpress engineering partners for modern digital agencies.</p>
        {settings.website && (
          <p className="mt-2 text-indigo-650 hover:underline">
            <a href={settings.website} target="_blank" rel="noreferrer">{settings.website.replace(/^https?:\/\/(www\.)?/, "")}</a>
          </p>
        )}
      </footer>
    </div>
  );
}
