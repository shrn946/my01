import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { getInnerHeroSettings } from "@/lib/data";

type Crumb = {
  label: string;
  href?: string;
};

export async function InnerHero({
  title,
  image,
  breadcrumbs
}: {
  title: string;
  image?: string | null;
  breadcrumbs: Crumb[];
}) {
  const settings = await getInnerHeroSettings();
  const backgroundImage = image || settings.fallbackImage;
  const opacity = Math.max(0, Math.min(100, settings.overlayOpacity)) / 100;

  return (
    <section
      className="inner-hero relative isolate flex items-center justify-center overflow-hidden text-center"
      style={{ minHeight: `${settings.heroHeight}px` }}
    >
      {/* Optimized background image — served as AVIF/WebP, preloaded as LCP element */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: settings.backgroundPosition }}
      />
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: settings.overlayColor, opacity }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      <div className="section relative z-10 py-20 lg:py-32">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl leading-[1.1]" style={{ color: settings.titleColor }}>
              {title}
            </h1>
            
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm font-medium" aria-label="Breadcrumb">
              <Link
                href="/"
                className="flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4 transition-all"
                style={{ color: settings.breadcrumbColor }}
              >
                <Home size={14} /> Home
              </Link>

              {breadcrumbs.map((crumb) => (
                <span key={`${crumb.label}-${crumb.href ?? "current"}`} className="flex items-center gap-2 opacity-80" style={{ color: settings.breadcrumbColor }}>
                  <ChevronRight size={14} />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:underline decoration-2 underline-offset-4 transition-all"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-bold opacity-100">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>

          </div>
        </div>
      </div>
    </section>
  );
}
