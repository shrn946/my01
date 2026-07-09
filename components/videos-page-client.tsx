"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { VideoThumbnail } from "@/components/video-thumbnail";

export function VideosPageClient({ videosData }: { videosData: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 18;
  const totalItems = videosData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentVideos = videosData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {currentVideos.map((video: any, index: number) => (
          <FadeIn key={video.id} delay={(index % 10) * 0.1}>
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-premium">
              <Link href={`/videos/${video.slug}`} className="relative aspect-video w-full overflow-hidden bg-slate-100 block">
                <VideoThumbnail videoId={video.id} alt={video.title} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="rounded-full bg-white/90 p-4 text-primary shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                    <PlayCircle size={32} />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    {video.duration}
                  </div>
                )}
              </Link>
              
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                  {video.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {video.date}
                    </div>
                  )}
                </div>
                
                <h3 className="mb-4 text-xl font-black text-ink line-clamp-2">
                  <Link href={`/videos/${video.slug}`} className="hover:text-primary transition-colors">
                    {video.title}
                  </Link>
                </h3>
                
                <p className="mt-auto line-clamp-3 text-sm leading-relaxed text-slate-500">
                  {video.description.split('\n')[0]}
                </p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-black/5 pt-8">
          <p className="text-sm font-bold text-slate-500">
            Showing <span className="text-ink">{startIndex + 1}</span> to <span className="text-ink">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> of <span className="text-ink">{totalItems}</span> videos
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-ink shadow-soft transition-all ${currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:border-primary/20 hover:text-primary hover:shadow-premium"}`}
              aria-label="Previous page"
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                
                const shouldShow = 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  Math.abs(pageNum - currentPage) <= 1;

                const showLeftEllipsis = pageNum === 2 && currentPage > 3;
                const showRightEllipsis = pageNum === totalPages - 1 && currentPage < totalPages - 2;

                if (!shouldShow) {
                  if (showLeftEllipsis) {
                    return <span key="left-el" className="px-2 text-slate-400 text-sm font-bold">...</span>;
                  }
                  if (showRightEllipsis) {
                    return <span key="right-el" className="px-2 text-slate-400 text-sm font-bold">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition-all ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-100 hover:text-ink"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-ink shadow-soft transition-all ${currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:border-primary/20 hover:text-primary hover:shadow-premium"}`}
              aria-label="Next page"
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
