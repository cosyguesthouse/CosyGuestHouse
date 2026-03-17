import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGoogleReviews, useSiteImages } from "@/hooks/useSupabaseData";
import { Star, Quote } from "lucide-react";
import blueAlleyImg from "@/assets/blue-alley.jpg"; // Heritage background fallback

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={16}
          className={s <= rating ? "fill-warm-gold text-warm-gold" : "text-border fill-border"}
        />
      ))}
    </div>
  );
}

export default function GuestFeedbackPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: reviews = [] } = useGoogleReviews();
    const { data: siteImages = [] } = useSiteImages();

    const banner = (siteImages as any[]).find(img => img.image_key === 'feedback_banner')?.image_url || blueAlleyImg;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[50vh] overflow-hidden">
                <img src={banner} alt="Guest Feedback" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/30 to-background/90" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Testimonials</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Guest Feedback</h1>
                    <div className="gold-divider mt-6" />
                    <p className="font-body text-sm text-primary-foreground/70 mt-4 max-w-lg">
                        Kind words from our dear guests — sharing their experiences in the heart of the Blue City.
                    </p>
                </motion.div>
            </div>

            {/* Reviews Grid */}
            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                {reviews.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground italic font-body">No reviews available yet. Check back soon!</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review: any, i: number) => (
                        <motion.div
                            key={review.id || i}
                            initial={{ opacity: 0, y: 40 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: i * 0.1 }}
                            className="bg-card border border-border p-8 flex flex-col gap-6 relative group hover:border-accent/40 transition-all duration-500"
                        >
                            <Quote size={40} className="text-accent/10 absolute top-6 right-6 group-hover:text-accent/20 transition-colors" />
                            
                            <div className="flex flex-col gap-2">
                              <StarRating rating={review.rating} />
                              <p className="font-body text-sm text-muted-foreground leading-relaxed italic line-clamp-6">
                                &ldquo;{review.review_text}&rdquo;
                              </p>
                            </div>

                            <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border/50">
                                {review.reviewer_photo ? (
                                    <img src={review.reviewer_photo} alt={review.reviewer_name} className="w-12 h-12 rounded-full object-cover border border-border" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center font-heading text-accent text-xl font-light">
                                        {review.reviewer_name[0]}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-heading text-lg font-light group-hover:text-accent transition-colors">
                                        {review.reviewer_name}
                                    </h3>
                                    <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">
                                        {new Date(review.review_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                  </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
