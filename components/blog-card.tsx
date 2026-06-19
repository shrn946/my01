import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { formatDate, PLACEHOLDER_IMAGE } from "@/lib/utils";

export function BlogCard({ post }: { post: any }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-premium">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image 
            src={PLACEHOLDER_IMAGE} 
            alt={post.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
            sizes="(min-width: 1024px) 33vw, 100vw" 
          />
          <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-black/0" />
        </div>
        
        <div className="flex flex-1 flex-col p-8">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-primary" />
              {post.readingTime || "5 min read"}
            </span>
          </div>
          
          <h3 className="mt-4 text-xl font-black leading-snug text-ink transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {post.excerpt}
          </p>
          
          <div className="mt-auto pt-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink group-hover:text-primary transition-colors">
              Read Article
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
