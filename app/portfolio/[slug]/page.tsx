import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InnerHero } from "@/components/inner-hero";
import { FadeIn } from "@/components/fade-in";
import { getProjectBySlug, getProjects, getRelatedProjects } from "@/lib/data";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return { title: project?.title ?? "Project", description: project?.description };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProjects(slug, project.category);

  return (
    <article className="bg-white">
      <InnerHero 
        title={project.title} 
        image={project.image} 
        breadcrumbs={[
          { label: "Portfolio", href: "/portfolio" }, 
          { label: project.title }
        ]} 
      />
      
      <div className="section !py-12 lg:!py-24">
        <div className="section-container">
          <div className="mb-12 flex items-center justify-between">
            <Link href="/portfolio" className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Portfolio
            </Link>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                {project.category}
              </span>
            </div>
          </div>

          <div className="grid gap-16 lg:grid-cols-[1fr_350px]">
            <div className="space-y-16">
              <FadeIn>
                <h1 className="text-4xl font-black text-ink sm:text-5xl lg:text-6xl leading-[1.1]">
                  {project.title}
                </h1>
                <p className="mt-8 text-xl leading-relaxed text-slate-500">
                  {project.description}
                </p>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-premium">
                  <Image src={project.image} alt={project.title} fill className="object-cover" priority />
                </div>
              </FadeIn>

              <div className="space-y-16">
                {[
                  { title: "Project Overview", content: project.overview },
                  { title: "The Problem", content: project.problem },
                  { title: "The Solution", content: project.solution },
                  { title: "Final Result", content: project.result }
                ].map((section, index) => (
                  <FadeIn key={section.title} delay={index * 0.1}>
                    <div className="space-y-6">
                      <h2 className="text-3xl font-black text-ink flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm">0{index + 1}</span>
                        {section.title}
                      </h2>
                      <div className="prose prose-slate max-w-none text-lg leading-relaxed text-slate-600">
                        {section.content}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.4}>
                <div className="grid gap-8 md:grid-cols-2">
                  {project.gallery.map((image: string, index: number) => (
                    <div key={image} className="group relative aspect-[16/10] overflow-hidden rounded-3xl shadow-soft transition-all hover:shadow-premium">
                      <Image 
                        src={image} 
                        alt={`${project.title} screenshot ${index + 1}`} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <aside className="relative">
              <div className="sticky top-32 space-y-8">
                <div className="rounded-[2rem] bg-slate-50 p-8">
                  <h3 className="text-lg font-black text-ink">Project Details</h3>
                  <div className="mt-6 space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tools & Technologies</span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tools.map((tool: string) => (
                          <span key={tool} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-black/5">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {project.liveUrl && (
                      <div className="pt-6 border-t border-black/5">
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-blue-600 hover:shadow-xl"
                        >
                          Visit Live Website <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/5 bg-white p-8">
                  <h3 className="text-lg font-black text-ink">Key Deliverables</h3>
                  <ul className="mt-6 space-y-4">
                    {["Performance Optimized", "Fully Responsive", "SEO Ready", "Custom Designed"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <span className="text-primary font-bold">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
