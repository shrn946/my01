import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogContent } from "@/components/blog-content";
import { InnerHero } from "@/components/inner-hero";
import { FadeIn } from "@/components/fade-in";
import { BlogCard } from "@/components/blog-card";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return {
    title: post?.metaTitle || post?.title || "Blog Post",
    description: post?.metaDescription || post?.excerpt,
    openGraph: {
      title: post?.metaTitle || post?.title,
      description: post?.metaDescription || post?.excerpt,
      images: post?.image ? [post.image] : undefined,
      type: "article"
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <article className="bg-white">
      <InnerHero 
        title={post.title} 
        image={post.image} 
        breadcrumbs={[
          { label: "Blog", href: "/blog" }, 
          { label: post.title }
        ]} 
      />
      
      <div className="section !py-12 lg:!py-24">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <div className="mb-12 flex items-center justify-between">
                <Link href="/blog" className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary">
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Blog
                </Link>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-primary hover:text-white">
                  <Share2 size={18} />
                </button>
              </div>

              <div className="mb-12 flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User size={14} />
                  </div>
                  <span className="text-ink">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  {post.readingTime || "5 min read"}
                </div>
              </div>

              <h1 className="mb-12 text-4xl font-black text-ink sm:text-5xl lg:text-6xl leading-[1.1]">
                {post.title}
              </h1>
              
              <div className="relative mb-16 aspect-[21/9] overflow-hidden rounded-[2.5rem] shadow-premium">
                <Image src={post.image} alt={post.title} fill className="object-cover" priority />
              </div>

              <div className="prose prose-slate max-w-none">
                <BlogContent content={post.content} />
              </div>
              
              <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-black/5 pt-12">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-400">Category:</span>
                  <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600">
                    {post.category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-400">Share:</span>
                  <div className="flex gap-2">
                    {["Twitter", "LinkedIn", "Facebook"].map((platform) => (
                      <button key={platform} className="h-10 px-4 rounded-full border border-black/5 text-xs font-bold text-slate-600 transition-all hover:border-primary hover:text-primary">
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <section className="section bg-slate-50/50">
        <div className="section-container">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="text-3xl font-black text-ink">Related Articles</h2>
              <Link href="/blog" className="group flex items-center gap-2 font-bold text-primary">
                View All <ArrowLeft size={18} className="rotate-180 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <FadeIn key={item.slug} delay={index * 0.1}>
                  <BlogCard post={item} />
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
