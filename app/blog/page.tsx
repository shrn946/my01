import type { Metadata } from "next";
import { BlogCard } from "@/components/blog-card";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import { Search } from "lucide-react";
import { getBlogPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog | WordPress Developer Portfolio",
  description: "Read my latest articles on WordPress development, Elementor design, and website optimization."
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  
  return (
    <>
      <InnerHero title="Our Blog" breadcrumbs={[{ label: "Blog" }]} />
      
      <section className="section !py-12 lg:!py-24">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Knowledge Base" 
            title="WordPress articles & growth notes" 
            text="Deep dives into WordPress development, Elementor design systems, and digital strategy to help your business scale."
          />
          
          {posts.length ? (
            <div className="space-y-16">
              {/* Featured Post could go here if we wanted one */}
              
              <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <FadeIn key={post.slug} delay={index * 0.05}>
                    <BlogCard post={post} />
                  </FadeIn>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">No articles found</h3>
              <p className="mt-2 text-slate-500">I'm currently working on some fresh content. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
