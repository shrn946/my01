"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "center" | "left";
  outlineText?: string;
  className?: string;
}

export function SectionHeading({ 
  eyebrow, 
  title, 
  text, 
  align = "center",
  outlineText,
  className
}: SectionHeadingProps) {
  return (
    <div className={cn(
      "relative mb-16 max-w-4xl",
      align === "center" ? "mx-auto text-center" : "text-left",
      className
    )}>
      {outlineText && (
        <span className="absolute -top-12 left-1/2 -z-10 -translate-x-1/2 select-none text-7xl font-black uppercase tracking-[0.2em] text-black/[0.03] sm:text-8xl md:text-9xl whitespace-nowrap pointer-events-none">
          {outlineText}
        </span>
      )}

      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.1]">
        {title}
      </h2>
      {text ? <p className="mt-6 text-lg leading-relaxed text-slate-500">{text}</p> : null}
    </div>
  );
}
