"use client";

import { useState } from "react";
import { FadeIn } from "@/components/fade-in";
import { ProjectCard } from "@/components/project-card";

export function PortfolioGrid({ projects }: { projects: any[] }) {
  const [visibleCount, setVisibleCount] = useState(18);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 18);
  };

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project, index) => (
          <FadeIn key={project.slug} delay={(index % 18) * 0.05}>
            <ProjectCard project={project} />
          </FadeIn>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-1"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
