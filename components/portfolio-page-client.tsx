"use client";

import { useState } from "react";
import { Grid3X3, Search } from "lucide-react";
import { slugify } from "@/lib/utils";
import { PortfolioGrid } from "@/components/portfolio-grid";

export function PortfolioPageClient({ allWork, categories }: { allWork: any[]; categories: string[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProjects = selectedCategory
    ? allWork.filter((project) => slugify(project.category) === selectedCategory)
    : allWork;

  return (
    <div>
      {/* Filter Bar */}
      <div className="sticky top-20 z-30 mb-16 flex overflow-x-auto sm:flex-wrap items-center sm:justify-center gap-2 rounded-[2rem] border border-black/5 bg-white/70 p-2 backdrop-blur-xl shadow-premium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`whitespace-nowrap shrink-0 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${!selectedCategory ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
        >
          <Grid3X3 size={14} /> All ({allWork.length})
        </button>
        {categories.map((item) => {
          const slug = slugify(item);
          const active = selectedCategory === slug;
          const count = allWork.filter(p => slugify(p.category) === slug).length;
          return (
            <button 
              key={item} 
              onClick={() => setSelectedCategory(slug)}
              className={`whitespace-nowrap shrink-0 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${active ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
            >
              {item} <span className={`ml-1 text-[10px] opacity-75 ${active ? "text-white" : "text-slate-400"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {filteredProjects.length ? (
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b border-black/5 pb-6">
            <p className="text-sm font-bold text-slate-500">
              Found <span className="text-ink">{filteredProjects.length}</span> items
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
              Sort by: <span className="text-ink">Featured First</span>
            </div>
          </div>
          
          <PortfolioGrid projects={filteredProjects} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-ink">No items found</h3>
          <p className="mt-2 text-slate-500">Try selecting a different category or view all portfolio items.</p>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
