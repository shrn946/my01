import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, Gauge, Grid3X3, LayoutTemplate, LifeBuoy, MonitorCog, Plug, ShoppingCart, Truck, Wrench, Search } from "lucide-react";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { ProjectCard } from "@/components/project-card";
import { FadeIn } from "@/components/fade-in";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { getProjects } from "@/lib/data";
import { slugify } from "@/lib/utils";


export const metadata: Metadata = {
  title: "Portfolio | WordPress Developer Case Studies",
  description: "Explore my WordPress projects, custom Elementor designs, and WooCommerce developments."
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const projects = await getProjects();
  const categories = [
    "Healthcare and Wellness",
    "Security and Transportation",
    "Moving Services",
    "Retail Parks And Shopping",
    "Educational",
    "Law Firms",
    "Other"
  ];
  const filteredProjects = category
    ? projects.filter((project) => slugify(project.category) === category)
    : projects;

  return (
    <>
      <InnerHero title="Portfolio" breadcrumbs={[{ label: "Portfolio" }]} />
      
      <section className="section !py-12 lg:!py-20">
        <div className="section-container">
          <SectionHeading 
            eyebrow="My Work" 
            title="Transforming ideas into digital reality" 
            text="A curated selection of my latest WordPress builds, optimizations, and custom development projects." 
          />
          
          {/* Modern Filter Bar */}
          <div className="sticky top-20 z-30 mb-16 flex flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-black/5 bg-white/70 p-2 backdrop-blur-xl shadow-premium">
            <Link 
              href="/portfolio" 
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${!category ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
            >
              <Grid3X3 size={14} /> All
            </Link>
            {categories.map((item) => {
              const slug = slugify(item);
              const active = category === slug;
              return (
                <Link 
                  key={item} 
                  href={`/portfolio?category=${slug}`} 
                  className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${active ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          {filteredProjects.length ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <p className="text-sm font-bold text-slate-500">
                  Found <span className="text-ink">{filteredProjects.length}</span> projects
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  Sort by: <span className="text-ink">Newest First</span>
                </div>
              </div>
              
              <PortfolioGrid projects={filteredProjects} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">No projects found</h3>
              <p className="mt-2 text-slate-500">Try selecting a different category or view all projects.</p>
              <Link href="/portfolio" className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25">
                Clear All Filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
