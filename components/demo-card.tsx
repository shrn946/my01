"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

const TALL_PLACEHOLDER = "/pro.png";

export interface DemoItem {
  title: string;
  slug: string;
  category: string;
  description: string;
  tools: string[];
  image: string;
  liveUrl: string;
}

export function DemoCard({ demo }: { demo: DemoItem }) {
  return (
    <a
      href={demo.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group cursor-pointer h-full"
    >
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
      >
        <motion.div 
          className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-3xl shadow-inner"
          whileHover="hover"
        >
          <div className="relative w-full h-full overflow-hidden">
            <motion.div
              className="absolute inset-0 w-full h-full bg-no-repeat bg-top"
              style={{ 
                backgroundImage: `url(${demo.image || TALL_PLACEHOLDER})`,
                backgroundSize: "100% auto"
              }}
              variants={{
                hover: { backgroundPosition: "50% 100%" }
              }}
              initial={{ backgroundPosition: "50% 0%" }}
              transition={{ duration: 6, ease: "linear" }}
            />
          </div>

          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 pointer-events-none" />

          {/* Tool Tags Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {demo.tools.map((tool: string) => (
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
                hover: { height: "25%", y: ["0%", "300%"] }
              }}
              transition={{ duration: 6, ease: "linear" }}
            />
          </div>
        </motion.div>
        
        <div className="flex flex-col flex-1 p-5 sm:p-6 transition-opacity duration-300 group-hover:opacity-90">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500">
              {demo.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-primary">
            {demo.title}
          </h3>
          
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 flex-1">
            {demo.description}
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
            <span>Live Demo</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </motion.article>
    </a>
  );
}
