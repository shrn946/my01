"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

export function ReviewsCarousel({ reviews }: { reviews: any[] }) {
  const autoplay = useRef(Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: reviews.length > 3 }, [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  if (!reviews.length) {
    return <p className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-soft">No active reviews yet.</p>;
  }

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-4 flex">
          {reviews.map((review) => (
            <div key={review.id ?? `${review.client}-${review.company}`} className="min-w-0 flex-[0_0_100%] pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <article className="h-full rounded-lg border border-black/5 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                    {review.image ? <Image src={PLACEHOLDER_IMAGE} alt={review.client} fill className="object-cover" /> : <User size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">{review.client}</h3>
                    <p className="text-sm text-slate-500">{review.service ?? review.company}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 text-amber-400">
                  {Array.from({ length: Math.max(1, Math.min(5, Number(review.rating) || 5)) }).map((_, index) => (
                    <Star key={index} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">"{review.text}"</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand">{review.platform}</p>
              </article>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={scrollPrev} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm hover:text-brand" aria-label="Previous review">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {snaps.map((_, index) => (
              <button key={index} onClick={() => scrollTo(index)} className={`h-2.5 rounded-full transition-all ${selected === index ? "w-7 bg-brand" : "w-2.5 bg-slate-300"}`} aria-label={`Go to review slide ${index + 1}`} />
            ))}
          </div>
          <button onClick={scrollNext} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm hover:text-brand" aria-label="Next review">
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
