import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import Link from "next/link";
import { Download, Star, GitFork, ArrowRight, Layout, Code, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Addons & Plugins",
  description: "Download free open-source WordPress plugins, Elementor addons, and scripts developed by Hassan Naqvi."
};

export const runtime = "edge";

async function getGithubPlugins() {
  try {
    const res = await fetch("https://api.github.com/users/shrn946/repos?type=public&sort=updated", {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((repo: any) => {
      let category = "WordPress Plugin";
      if (repo.name.toLowerCase().includes("elementor")) category = "Elementor Addon";
      else if (repo.name.toLowerCase().includes("theme") || repo.name.toLowerCase().includes("slider")) category = "Theme Component";
      else if (repo.language === "JavaScript" || repo.language === "TypeScript") category = "Script/Tool";

      const title = repo.name.replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

      return {
        id: repo.id,
        title,
        slug: repo.name,
        description: repo.description || `A powerful, lightweight ${category.toLowerCase()} to enhance your website functionality. Developed to provide clean code and high performance.`,
        category,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        updatedAt: repo.updated_at
      };
    }).filter((repo: any) => {
      const excluded = ["shrn946", "my-portfolio", "port01backup", "my01", "youtubeapp"];
      return !excluded.includes(repo.slug) && !repo.slug.includes("portfolio");
    }); 
  } catch {
    return [];
  }
}

export default async function FreeAddonsPage({ searchParams }: { searchParams: { category?: string, page?: string } }) {
  const allPlugins = await getGithubPlugins();
  const currentCategory = searchParams.category || "All";
  const categories = ["All", ...Array.from(new Set(allPlugins.map((p: any) => p.category)))];
  
  const filteredPlugins = currentCategory === "All" 
    ? allPlugins 
    : allPlugins.filter((p: any) => p.category === currentCategory);

  const itemsPerPage = 20;
  const currentPage = parseInt(searchParams.page || "1", 10) || 1;
  const totalItems = filteredPlugins.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlugins = filteredPlugins.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <InnerHero title="Free Plugins & Addons" breadcrumbs={[{ label: "Free Addons" }]} />
      
      <section className="section bg-slate-50">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Open Source" 
            title="Custom Tools & Plugins" 
            text="As a custom plugin developer, I regularly release free, open-source plugins and tools to help the WordPress community build better websites." 
            outlineText="ADDONS"
            className="mb-8"
          />

          <div className="mb-12 flex justify-center">
            <a 
              href="https://github.com/shrn946/" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Code2 size={18} /> View all on GitHub
            </a>
          </div>

          {/* Category Filter */}
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((cat: any) => (
              <Link 
                key={cat}
                href={`/free-addons${cat === "All" ? "" : `?category=${encodeURIComponent(cat)}`}`}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                  currentCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-ink border border-black/5"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="mb-8 flex items-center justify-between text-sm font-bold text-slate-500">
            <div>
              Showing {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} addons
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPlugins.map((plugin: any, index: number) => (
              <FadeIn key={plugin.id} delay={index * 0.1}>
                <article className="group flex h-full flex-col justify-between rounded-3xl border border-black/5 bg-white p-8 shadow-soft transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-premium">
                  <div>
                    <div className="mb-6 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                      {plugin.category}
                    </div>
                    
                    <h3 className="mb-4 text-2xl font-black text-ink">{plugin.title}</h3>
                    <p className="line-clamp-3 text-slate-500 leading-relaxed">
                      {plugin.description}
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <div className="mb-6 flex items-center gap-4 text-sm font-bold text-slate-400">
                      <div className="flex items-center gap-1.5"><Star size={16} /> {plugin.stars}</div>
                      <div className="flex items-center gap-1.5"><GitFork size={16} /> {plugin.forks}</div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-4">
                      
                      <a 
                        href={plugin.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-110 shadow-lg shadow-primary/20"
                        title="Download from GitHub"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const search = new URLSearchParams();
                if (currentCategory !== "All") search.set("category", currentCategory);
                search.set("page", p.toString());
                return (
                  <Link
                    key={p}
                    href={`/free-addons?${search.toString()}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                      p === currentPage 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white text-slate-500 hover:bg-slate-100 border border-black/5"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}

          {filteredPlugins.length === 0 && (
            <div className="rounded-[3rem] bg-white p-20 text-center shadow-soft">
              <Code size={48} className="mx-auto text-slate-300 mb-6" />
              <h3 className="text-2xl font-black text-ink">No plugins found</h3>
              <p className="mt-4 text-slate-500">Check back later for new releases or try another category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
