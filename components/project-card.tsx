"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

// Using the local placeholder image
const TALL_PLACEHOLDER = "/pro.png";

export function ProjectCard({ project, index = 0 }: { project: any; index?: number }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
    >
      <motion.div 
        className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-3xl shadow-inner"
        whileHover="hover"
      >
          {/* Scrolling screenshot effect via translateY on the Next.js Image wrapper */}
          <motion.div
            className="absolute inset-0 w-full"
            style={{ height: "160%" }}
            variants={{ hover: { y: "-37.5%" } }}
            initial={{ y: "0%" }}
            transition={{ duration: 6, ease: "linear" }}
          >
            <Image
              src={project.image || TALL_PLACEHOLDER}
              alt={project.title}
              fill
              loading={index < 6 ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-top"
            />
          </motion.div>

          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 pointer-events-none" />

        {/* Tool Tags Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {project.tools.map((tool: string) => (
            <span key={tool} className="rounded-full bg-white/80 backdrop-blur-sm border border-white/20 px-2 py-0.5 text-[9px] font-bold text-ink shadow-sm">
              {tool}
            </span>
          ))}
        </div>

      {/* Scroll Bar Track */}
      <div className="absolute right-1 top-2 bottom-2 w-1 rounded-full bg-slate-200/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden">
          <motion.div
              className="w-full bg-primary rounded-full"
              variants={{
                  hover: { height: "25%", y: [0, 300] }
              }}
              transition={{ duration: 6, ease: "linear" }}
          />
      </div>
      </motion.div>
      
      <div className="flex flex-col flex-1 p-5 sm:p-6 transition-opacity duration-300 group-hover:opacity-60">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500">
            {project.category}
          </span>
          {project.liveUrl && (
            <a 
              href={project.liveUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 transition-colors hover:text-primary"
              aria-label="Live Demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 flex-1">
          {project.description}
        </p>
      </div>
    </motion.article>
  );
}
