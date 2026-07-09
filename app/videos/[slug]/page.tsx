import { notFound } from "next/navigation";
import { InnerHero } from "@/components/inner-hero";
import { FadeIn } from "@/components/fade-in";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, PlayCircle } from "lucide-react";
import videosData from "@/lib/videos.json";

export const runtime = "edge";

export async function generateStaticParams() {
  return videosData.map((v) => ({
    slug: v.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = videosData.find((v) => v.slug === slug);
  if (!video) return { title: "Video Not Found" };
  return {
    title: `${video.title} - Video Tutorial`,
    description: video.description.split('\n')[0]
  };
}

export default async function VideoDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = videosData.find((v) => v.slug === slug);
  
  if (!video) return notFound();

  // Basic formatting for description to preserve paragraphs
  const formattedDescription = video.description.split('\n').map((paragraph: string, i: number) => {
    if (!paragraph.trim()) return <br key={i} />;
    return <p key={i} className="mb-4">{paragraph}</p>;
  });

  return (
    <>
      <InnerHero title={video.title} breadcrumbs={[{ label: "Videos", href: "/videos" }, { label: "Tutorial" }]} />
      
      <section className="section bg-slate-50">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            <Link href="/videos" className="mb-8 inline-flex items-center gap-2 font-bold text-slate-500 hover:text-primary transition-colors">
              <ArrowLeft size={18} /> Back to Videos
            </Link>

            <FadeIn>
              <div className="overflow-hidden rounded-[3rem] bg-white shadow-soft border border-black/5">
                {/* Video Embed or Placeholder Image */}
                <div className="relative aspect-video w-full bg-slate-900">
                  {video.id.includes("-") || video.id.length !== 11 ? (
                    <div className="relative w-full h-full">
                      <img 
                        src="/video-placeholder.jpg" 
                        alt={video.title} 
                        className="h-full w-full object-cover opacity-70"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-white p-6 text-center">
                        <div className="rounded-full bg-white/95 p-5 text-[#FF0000] shadow-2xl mb-4 transition-transform hover:scale-110">
                          <PlayCircle size={48} className="fill-current" />
                        </div>
                        <p className="text-lg font-bold tracking-tight">Video tutorial coming soon!</p>
                        <p className="text-xs text-slate-300 mt-1">Real video embed will be active once URL is updated.</p>
                      </div>
                    </div>
                  ) : (
                    <iframe 
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=0&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  )}
                </div>

                <div className="p-8 lg:p-12">
                  <h1 className="mb-6 text-3xl font-black text-ink md:text-4xl tracking-tight">
                    {video.title}
                  </h1>
                  
                  <div className="mb-10 flex flex-wrap items-center gap-6 border-b border-slate-100 pb-8 text-sm font-bold text-slate-500">
                    {video.date && (
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-primary" /> {video.date}
                      </div>
                    )}
                    {video.duration && (
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-primary" /> {video.duration}
                      </div>
                    )}
                    
                    <a 
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto flex items-center gap-2 rounded-full bg-[#FF0000]/10 px-4 py-2 text-[#FF0000] hover:bg-[#FF0000]/20 transition-colors"
                    >
                      <PlayCircle size={18} /> Watch on YouTube
                    </a>
                  </div>

                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-brand prose-p:text-slate-600 text-lg">
                    {formattedDescription}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
