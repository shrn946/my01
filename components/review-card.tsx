import { Star, Quote } from "lucide-react";

export function ReviewCard({ review }: { review: any }) {
  return (
    <article className="group relative rounded-[2rem] border border-black/5 bg-white p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-premium lg:p-10">
      <div className="absolute top-8 right-8 text-primary/10 transition-colors group-hover:text-primary/20">
        <Quote size={48} fill="currentColor" />
      </div>
      
      <div className="flex gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            size={16} 
            fill={index < review.rating ? "currentColor" : "none"} 
            className={index < review.rating ? "" : "text-slate-200"}
          />
        ))}
      </div>
      
      <p className="mt-8 text-lg italic leading-relaxed text-slate-600">
        "{review.text}"
      </p>
      
      <div className="mt-10 flex items-center gap-4 border-t border-black/5 pt-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-black">
          {review.client.charAt(0)}
        </div>
        <div>
          <h3 className="font-black text-ink">{review.client}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {review.company} • {review.country}
          </p>
          <div className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            via {review.platform}
          </div>
        </div>
      </div>
    </article>
  );
}
