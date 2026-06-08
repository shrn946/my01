"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function HeroSlider({ slides }: { slides: any[] }) {
  const autoplay = useRef(Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 }, [autoplay.current]);
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  if (!slides.length) {
    return (
      <section className="relative overflow-hidden bg-coal text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="section relative z-10 min-h-[85vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="eyebrow !text-primary-foreground/60">Professional WordPress Partner</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
              WordPress Developer & <span className="text-primary">Elementor</span> Expert
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-slate-300">
              Transforming complex business requirements into high-performance, conversion-focused WordPress experiences.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-primary/25">
                Start a Project <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10">
                View My Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-coal text-white overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={slide.id ?? slide.title} className="relative min-w-0 flex-[0_0_100%]">
              <div className="absolute inset-0">
                <Image 
                  src={slide.image} 
                  alt={slide.title} 
                  fill 
                  priority={index === 0}
                  className="object-cover opacity-60" 
                  sizes="100vw" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-coal via-coal/80 to-transparent" />
              </div>
              
              <div className="section relative z-10 grid min-h-[90vh] items-center">
                <AnimatePresence mode="wait">
                  {selected === index && (
                    <motion.div 
                      key={selected}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                      }}
                      className="max-w-4xl"
                    >
                      <motion.p 
                        variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                        className="eyebrow !text-primary/80"
                      >
                        WordPress Specialist
                      </motion.p>
                      <motion.h1 
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-5 text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-[1.1]"
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.p 
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-200"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-10">
                        <Link href={slide.buttonLink} className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-primary/25">
                          {slide.buttonText} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="absolute bottom-12 left-6 z-20 flex gap-3 lg:left-32">
            {slides.map((_, index) => (
              <button 
                key={index} 
                onClick={() => scrollTo(index)} 
                className={`h-1.5 rounded-full transition-all duration-500 ${selected === index ? "w-12 bg-primary" : "w-6 bg-white/20"}`} 
                aria-label={`Go to slide ${index + 1}`} 
              />
            ))}
          </div>
          
          <div className="absolute bottom-12 right-6 z-20 hidden gap-4 md:flex lg:right-32">
            <button onClick={scrollPrev} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur transition-all hover:bg-primary hover:border-primary" aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <button onClick={scrollNext} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur transition-all hover:bg-primary hover:border-primary" aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
