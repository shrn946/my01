"use client";

import { useState } from "react";
import { FadeIn } from "@/components/fade-in";
import { DemoCard, type DemoItem } from "@/components/demo-card";

export function DemoGrid({ demos }: { demos: DemoItem[] }) {
  const [visibleCount, setVisibleCount] = useState(18);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 18);
  };

  const visibleDemos = demos.slice(0, visibleCount);
  const hasMore = visibleCount < demos.length;

  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visibleDemos.map((demo, index) => (
          <FadeIn key={demo.slug} delay={(index % 18) * 0.05}>
            <DemoCard demo={demo} />
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
