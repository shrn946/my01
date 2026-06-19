"use client";

import AutoplayPlugin from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Magnetic } from "./magnetic";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

export function HeroSlider({ slides }: { slides: any[] }) {
  const autoplay = useRef(AutoplayPlugin({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }));
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

  const headingVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!slides.length) {
    return (
      <section className="relative overflow-hidden bg-coal text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="section relative z-10 min-h-[85vh] flex flex-col justify-center">
          <div className="section-container">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.p variants={headingVariants} className="eyebrow !text-primary/80 !mb-6">Professional WordPress Partner</motion.p>
              <motion.h1 variants={headingVariants} className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                WordPress Developer & <span className="text-primary">Elementor</span> Expert
              </motion.h1>
              <motion.p variants={headingVariants} className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300">
                Transforming complex requirements into high-performance, conversion-focused WordPress solutions.
              </motion.p>
              <motion.div variants={headingVariants} className="mt-10 flex flex-wrap gap-6">
                <Magnetic>
                  <Link href="/contact" className="group inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-primary/40 active:scale-95">
                    Start a Project <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
                <Link href="/portfolio" className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-10 py-5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10">
                  View Case Studies
                </Link>
              </motion.div>
            </motion.div>
          </div>
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
                  src={PLACEHOLDER_IMAGE} 
                  alt={slide.title} 
                  fill 
                  priority={index === 0}
                  className="object-cover opacity-50" 
                  sizes="100vw" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-coal via-coal/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-coal to-transparent opacity-60" />
              </div>
              
              <div className="section relative z-10 grid min-h-[90vh] items-center">
                <div className="section-container">
                  <AnimatePresence mode="wait">
                    {selected === index && (
                      <motion.div 
                        key={selected}
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-4xl"
                      >
                        <motion.p 
                          variants={headingVariants}
                          className="eyebrow !text-primary/80 !mb-6"
                        >
                          WordPress Specialist
                        </motion.p>
                        <motion.h1 
                          variants={headingVariants}
                          className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]"
                        >
                          {slide.title.split(" ").map((word: string, i: number) => (
                            <span key={i} className="inline-block mr-[0.3em] overflow-hidden">
                              <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                className="inline-block"
                              >
                                {word}
                              </motion.span>
                            </span>
                          ))}
                        </motion.h1>
                        <motion.p 
                          variants={headingVariants}
                          className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-200 opacity-80"
                        >
                          {slide.subtitle}
                        </motion.p>
                        <motion.div variants={headingVariants} className="mt-12 flex gap-4">
                          <Magnetic>
                            <Link href={slide.buttonLink} className="group inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-primary/40 active:scale-95">
                              {slide.buttonText} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Magnetic>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 z-20">
        <div className="section-container flex items-center gap-4">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button 
                key={index} 
                onClick={() => scrollTo(index)} 
                className={`h-1 rounded-full transition-all duration-700 ${selected === index ? "w-12 bg-primary" : "w-4 bg-white/20 hover:bg-white/40"}`} 
                aria-label={`Go to slide ${index + 1}`} 
              />
            ))}
          </div>
          
          <div className="ml-auto hidden gap-4 md:flex">
            <button onClick={scrollPrev} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-lg transition-all hover:bg-primary hover:border-primary active:scale-90" aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <button onClick={scrollNext} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-lg transition-all hover:bg-primary hover:border-primary active:scale-90" aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
