import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import videosData from "@/lib/videos.json";
import { VideosPageClient } from "@/components/videos-page-client";

export const metadata: Metadata = {
  title: "Videos & Tutorials",
  description: "Watch my latest video tutorials on WordPress, Elementor, and custom web development."
};

export default async function VideosPage() {
  return (
    <>
      <InnerHero title="Video Tutorials" breadcrumbs={[{ label: "Videos" }]} />
      
      <section className="section bg-slate-50">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Learn with me" 
            title="Latest Video Guides" 
            text="Explore my collection of video tutorials covering WordPress development, Elementor tricks, and custom coding solutions." 
            outlineText="VIDEOS"
            className="mb-12"
          />

          <VideosPageClient videosData={videosData} />
        </div>
      </section>
    </>
  );
}
