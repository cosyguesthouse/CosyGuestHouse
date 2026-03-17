import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useGoogleReviews } from "@/hooks/useSupabaseData";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const demoReviews = [
  { id: "1", reviewer_name: "Sarah M.", reviewer_photo: "", rating: 5, review_text: "An absolutely magical experience. The rooftop view of Mehrangarh Fort at sunset was breathtaking. The hosts were incredibly warm and attentive. A true gem in the Blue City!", review_date: "2025-12-15" },
  { id: "2", reviewer_name: "James & Priya T.", reviewer_photo: "", rating: 5, review_text: "We stayed for 5 nights and didn't want to leave. The heritage charm combined with every modern comfort made this the best stay of our India trip. The food was outstanding too.", review_date: "2026-01-22" },
  { id: "3", reviewer_name: "Elena R.", reviewer_photo: "", rating: 5, review_text: "Every detail here tells a story. From the handcrafted furniture to the Rajasthani textiles, the entire property feels like a living museum. The team arranged a fantastic fort tour for us.", review_date: "2026-02-10" },
  { id: "4", reviewer_name: "Michael K.", reviewer_photo: "", rating: 5, review_text: "Best decision of our Rajasthan trip. The rooftop breakfast with the fort view is something we will never forget. Highly recommend the Blue City walk arranged by the team.", review_date: "2026-03-01" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "fill-warm-gold text-warm-gold" : "text-border fill-border"}
        />
      ))}
    </div>
  );
}

const ReviewCard = ({ review }: { review: any }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.review_text && review.review_text.length > 150;

  return (
    <div className="bg-card border border-border px-6 py-8 flex flex-col gap-4 h-full relative">
      <Quote size={32} className="text-accent/20 absolute top-6 right-6" />
      <StarRating rating={review.rating} />
      <div className="font-body text-sm text-muted-foreground leading-relaxed flex-1 italic">
        <p>&ldquo;{expanded || !isLong ? review.review_text : `${review.review_text.slice(0, 150)}...`}&rdquo;</p>
        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-accent hover:underline text-xs mt-2 not-italic font-medium"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-border mt-auto">
        {review.reviewer_photo ? (
          <img src={review.reviewer_photo} alt={review.reviewer_name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-heading text-accent font-light text-lg">
            {review.reviewer_name[0]}
          </div>
        )}
        <div>
          <p className="font-body text-sm font-medium text-foreground">{review.reviewer_name}</p>
          <p className="font-body text-xs text-muted-foreground">
            {new Date(review.review_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: reviews = [] } = useGoogleReviews();
  const active = reviews.length > 0 ? reviews : demoReviews;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((p) => (p + 1) % Math.ceil(active.length / 2));
    }, 7000);
    return () => clearInterval(interval);
  }, [active.length]);

  // Group into pairs for desktop
  const pairs = [];
  for (let i = 0; i < active.length; i += 2) {
    pairs.push(active.slice(i, i + 2));
  }

  return (
    <section id="reviews" className="section-padding bg-background overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Guest Voices</p>
          <h2 className="section-heading">What Our Guests Say</h2>
          <div className="gold-divider mt-6" />
        </motion.div>

        {/* Mobile: single column scroll */}
        <div className="block md:hidden space-y-6">
          {active.slice(0, 4).map((review: any, i: number) => (
            <motion.div
              key={review.id || i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>

        {/* Desktop: 2-column slider */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            {pairs.map((pair, i) => (
              <div
                key={i}
                className={`grid md:grid-cols-2 gap-6 transition-all duration-700 ${i === current ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"}`}
              >
                {pair.map((review: any, j: number) => (
                  <ReviewCard key={review.id || j} review={review} />
                ))}
              </div>
            ))}
          </div>

          {pairs.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((p) => (p - 1 + pairs.length) % pairs.length)}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrent((p) => (p + 1) % pairs.length)}
                className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
              >
                <ChevronRight size={20} />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {pairs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${i === current ? "w-8 bg-accent" : "w-2 bg-border hover:bg-accent/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
