"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ProjectCard } from "@/components/project-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { ProjectItem } from "@/lib/data";

interface FeaturedCarouselProps {
  projects: ProjectItem[];
}

export function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // We want to randomize on each refresh, but we must do it after hydration
  const [shuffledProjects, setShuffledProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    // Randomize and take up to 9
    const shuffled = [...projects].sort(() => 0.5 - Math.random()).slice(0, 9);
    setShuffledProjects(shuffled);
  }, [projects]);

  useEffect(() => {
    if (!api) return;
    
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (shuffledProjects.length === 0) return null;

  return (
    <div className="relative w-full mx-auto max-w-[100vw]">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-6">
          {shuffledProjects.map((project, idx) => (
            <CarouselItem key={`${project.slug}-${idx}`} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
              <div className="h-full py-2">
                <ProjectCard project={project} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex">
          <CarouselPrevious className="-left-4 lg:-left-12 h-12 w-12 border-primary/20 bg-white text-primary hover:bg-primary hover:text-white shadow-md z-10" />
          <CarouselNext className="-right-4 lg:-right-12 h-12 w-12 border-primary/20 bg-white text-primary hover:bg-primary hover:text-white shadow-md z-10" />
        </div>
      </Carousel>
      
      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              current === index ? "bg-primary w-8" : "bg-primary/20 hover:bg-primary/50"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
