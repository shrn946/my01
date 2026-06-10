import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { ReviewCard } from "@/components/review-card";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import { getReviews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Client testimonials and Freelancer-style reviews for Hassan Naqvi's WordPress, Elementor, WooCommerce, plugin, and maintenance projects."
};

export default async function ReviewsPage() {
  const reviews = await getReviews();
  
  return (
    <>
      <InnerHero title="Client Feedback" breadcrumbs={[{ label: "Reviews" }]} />
      
      <section className="section !py-12 lg:!py-24">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Testimonials" 
            title="What clients say after launch" 
            text="I've had the pleasure of working with businesses of all sizes to deliver exceptional WordPress results. Here's what they have to say."
          />
          
          {reviews.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, index) => (
                <FadeIn key={`${review.client}-${review.company}`} delay={index * 0.05}>
                  <ReviewCard review={review} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] bg-slate-50 p-20 text-center">
              <p className="text-slate-500 font-bold">No reviews found yet.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Social Proof Stats */}
      <section className="section bg-ink text-white">
        <div className="section-container">
          <div className="grid gap-12 text-center md:grid-cols-4">
            {[
              { label: "Client Satisfaction", value: "100%" },
              { label: "Repeat Clients", value: "85%" },
              { label: "Avg. Rating", value: "5.0" },
              { label: "Projects Delivered", value: "500+" },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <span className="text-4xl font-black text-primary block">{stat.value}</span>
                <span className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
