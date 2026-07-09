"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  caption: string;
  notes?: string;
}

export function AuditLightbox({ items }: { items: MediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeLightbox = () => {
    setActiveIndex(null);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % items.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + items.length) % items.length);
  };

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 relative z-10">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            onClick={() => openLightbox(idx)}
            className="group cursor-pointer overflow-hidden rounded-[2rem] border border-red-100 shadow-xl shadow-red-900/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/10 flex flex-col h-full"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
              <img src={item.url} alt={item.caption} className="max-h-full max-w-full object-contain p-2 transition-transform duration-500 group-hover:scale-102" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-colors duration-300">
                <span className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-4 py-2 text-xs font-bold text-slate-800 shadow-lg border border-slate-100">
                  <ZoomIn size={14} /> View Details & Fixes
                </span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-900 text-lg mb-2">{item.caption}</p>
                {item.notes && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {item.notes}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] font-black text-red-600 uppercase tracking-widest">
                Analyze Issue & Suggested Fix
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeIndex !== null && activeItem && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md transition-opacity duration-300"
        >
          <div className="flex items-center justify-between p-4 md:p-6 text-white border-b border-white/10">
            <span className="text-sm font-semibold tracking-wider text-slate-400">
              Screenshot {activeIndex + 1} of {items.length}
            </span>
            <button 
              onClick={closeLightbox}
              className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-black/20">
              {items.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-4 md:left-8 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 backdrop-blur transition-all active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img 
                src={activeItem.url} 
                alt={activeItem.caption} 
                onClick={(e) => e.stopPropagation()}
                className="max-h-[60vh] lg:max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
              />

              {items.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-4 md:right-8 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 backdrop-blur transition-all active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full lg:w-[450px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10 p-6 md:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Issue Discovered</span>
                  <h3 className="text-xl font-bold text-white mt-1.5">{activeItem.caption}</h3>
                </div>

                {activeItem.notes && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Analysis & Notes</span>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {activeItem.notes}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
