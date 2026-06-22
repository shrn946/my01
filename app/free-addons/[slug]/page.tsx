import { notFound } from "next/navigation";
import { InnerHero } from "@/components/inner-hero";
import { FadeIn } from "@/components/fade-in";
import Link from "next/link";
import { Download, Star, GitFork, CheckCircle2, FileCode2, ArrowLeft, Code2 } from "lucide-react";

async function getGithubPluginDetails(slug: string) {
  try {
    const res = await fetch(`https://api.github.com/users/shrn946/repos?type=public&sort=updated`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    
    const repos = await res.json();
    const repo = repos.find((r: any) => r.name === slug);
    if (!repo) return null;

    let category = "WordPress Plugin";
    if (repo.name.toLowerCase().includes("elementor")) category = "Elementor Addon";
    else if (repo.name.toLowerCase().includes("theme") || repo.name.toLowerCase().includes("slider")) category = "Theme Component";
    else if (repo.language === "JavaScript" || repo.language === "TypeScript") category = "Script/Tool";

    const title = repo.name.replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    return {
      title,
      slug: repo.name,
      description: repo.description || `A powerful, lightweight ${category.toLowerCase()} designed by a custom plugin developer to enhance your website's capabilities with clean code and zero bloat.`,
      fullDescription: `This ${category.toLowerCase()} was developed to solve real-world problems for WordPress users. As a custom plugin developer, I built this addon prioritizing speed, security, and ease of use. It follows strict coding standards and integrates seamlessly into any standard WordPress environment without causing conflicts or performance issues.`,
      category,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      updatedAt: new Date(repo.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      features: [
        "Lightweight and highly optimized for speed",
        "Clean, well-documented source code",
        "Seamless integration with modern WordPress themes",
        "No unnecessary bloat or third-party tracking",
        "Regularly updated for security and compatibility"
      ]
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plugin = await getGithubPluginDetails(slug);
  if (!plugin) return { title: "Plugin Not Found" };
  return {
    title: `${plugin.title} - Free Addon`,
    description: plugin.description
  };
}

export default async function AddonDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plugin = await getGithubPluginDetails(slug);
  
  if (!plugin) return notFound();

  return (
    <>
      <InnerHero title={plugin.title} breadcrumbs={[{ label: "Free Addons", href: "/free-addons" }, { label: plugin.title }]} />
      
      <section className="section bg-slate-50">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            <Link href="/free-addons" className="mb-12 inline-flex items-center gap-2 font-bold text-slate-500 hover:text-primary transition-colors">
              <ArrowLeft size={18} /> Back to Addons
            </Link>

            <FadeIn>
              <div className="overflow-hidden rounded-[3rem] bg-white p-10 lg:p-16 shadow-soft border border-black/5 relative">
                
                {/* Decorative Tech Graphic */}
                <div className="absolute right-0 top-0 -mr-20 -mt-20 text-slate-50 opacity-50">
                  <FileCode2 size={400} />
                </div>

                <div className="relative z-10">
                  <div className="mb-8 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                    {plugin.category}
                  </div>
                  
                  <h1 className="mb-6 text-4xl font-black text-ink md:text-5xl lg:text-6xl tracking-tight">
                    {plugin.title}
                  </h1>
                  
                  <p className="mb-10 text-xl leading-relaxed text-slate-600">
                    {plugin.description}
                  </p>
                  
                  <div className="mb-12 flex flex-wrap items-center gap-6 border-y border-slate-100 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-600">
                      <Star size={20} className="text-amber-400" /> {plugin.stars} Stars
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-600">
                      <GitFork size={20} className="text-slate-400" /> {plugin.forks} Forks
                    </div>
                    {plugin.language && (
                      <div className="flex items-center gap-2 font-bold text-slate-600">
                        <FileCode2 size={20} className="text-blue-400" /> {plugin.language}
                      </div>
                    )}
                    <div className="font-bold text-slate-400 ml-auto text-sm">
                      Last Updated: {plugin.updatedAt}
                    </div>
                  </div>

                  <div className="mb-12">
                    <h2 className="mb-6 text-2xl font-black text-ink">About this plugin</h2>
                    <p className="text-lg leading-relaxed text-slate-600">
                      {plugin.fullDescription}
                    </p>
                  </div>

                  <div className="mb-12">
                    <h2 className="mb-6 text-2xl font-black text-ink">Key Features</h2>
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {plugin.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-black/5">
                          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />
                          <span className="font-bold text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                    <a 
                      href={`${plugin.url}/archive/refs/heads/main.zip`}
                      className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
                    >
                      <Download size={20} /> Download Zip
                    </a>
                    <a 
                      href={plugin.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                      <Code2 size={20} /> View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
