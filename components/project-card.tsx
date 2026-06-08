import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export function ProjectCard({ project }: { project: any }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-premium">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image 
          src={project.image} 
          alt={project.title} 
          fill 
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
          sizes="(min-width: 1024px) 33vw, 100vw" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
          {project.liveUrl && (
            <a 
              href={project.liveUrl} 
              target="_blank" 
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink transition-transform hover:scale-110"
              aria-label="Live Website"
            >
              <ExternalLink size={20} />
            </a>
          )}
          <Link 
            href={`/portfolio/${project.slug}`} 
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-110"
            aria-label="View Case Study"
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {project.category}
          </span>
        </div>
        
        <h3 className="mt-4 text-2xl font-black text-ink group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {project.description}
        </p>
        
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tools.slice(0, 3).map((tool: string) => (
            <span key={tool} className="text-[11px] font-semibold text-slate-400">
              #{tool}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
