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
      style={{
        minHeight: `${settings.heroHeight}px`,
        backgroundImage: `url("${backgroundImage}")`,
        backgroundPosition: settings.backgroundPosition,
        backgroundAttachment: settings.backgroundAttachment as "scroll" | "fixed",
        backgroundSize: "cover"
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: settings.overlayColor, opacity }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      <div className="section relative z-10 py-20 lg:py-32">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl leading-[1.1]" style={{ color: settings.titleColor }}>
              {title}
            </h1>
            
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="Breadcrumb">
              <Link 
                href="/" 
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/20" 
                style={{ color: settings.breadcrumbColor }}
              >
                <Home size={14} /> Home
              </Link>
              
              {breadcrumbs.map((crumb) => (
                <span key={`${crumb.label}-${crumb.href ?? "current"}`} className="flex items-center gap-3">
                  <ChevronRight size={14} className="opacity-50" style={{ color: settings.breadcrumbColor }} />
                  {crumb.href ? (
                    <Link 
                      href={crumb.href} 
                      className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/20"
                      style={{ color: settings.breadcrumbColor }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span 
                      className="flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-bold backdrop-blur-md"
                      style={{ color: settings.breadcrumbColor }}
                    >
                      {crumb.label}
                    </span>
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
