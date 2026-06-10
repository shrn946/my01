"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

export function ProjectCard({ project }: { project: any }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-soft transition-all duration-500 hover:shadow-premium"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image 
          src={project.image} 
          alt={project.title} 
          fill 
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
          sizes="(min-width: 1024px) 33vw, 100vw" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Hover Content */}
        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tools.map((tool: string) => (
              <span key={tool} className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                {tool}
              </span>
            ))}
          </div>
          
          <div className="flex gap-4">
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-ink text-sm font-bold transition-all hover:bg-slate-100 active:scale-95"
              >
                <ExternalLink size={18} />
                Live Demo
              </a>
            )}
            <Link 
              href={`/portfolio/${project.slug}`} 
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-bold transition-all hover:bg-blue-600 active:scale-95"
            >
              <ArrowUpRight size={18} />
              Details
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-8 transition-all duration-500 group-hover:-translate-y-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
            {project.category}
          </span>
        </div>
        
        <h3 className="mt-4 text-2xl font-black text-ink group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {project.description}
        </p>
      </div>
    </motion.article>
  );
}
