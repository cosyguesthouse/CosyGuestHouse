import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { travelStoriesData as staticTravelStoriesData } from "@/data/siteData";
import { useTravelStoriesData } from "@/hooks/useSupabaseData";
import { ImageSlider } from "@/components/ui/ImageSlider";
import blueAlleyImg from "@/assets/blue-alley.jpg";

const TravelStories = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: stories = [] } = useTravelStoriesData();

  const activeStories = stories.length > 0 ? stories : staticTravelStoriesData;

  return (
    <section id="travel-stories" className="section-padding bg-secondary/50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Journal</p>
          <h2 className="section-heading">Travel Stories</h2>
          <div className="gold-divider mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {activeStories.map((story: any, i: number) => (
            <motion.article
              key={story.id || i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              {/* Image area — uses slider if multiple images exist */}
              <div className="img-hover-zoom aspect-[16/10] mb-6 overflow-hidden">
                <ImageSlider
                  images={story.images || []}
                  fallbackImage={story.cover_image || story.image || blueAlleyImg}
                  sliderType="story_slider"
                />
              </div>
              <h3 className="font-heading text-2xl font-light mb-3 group-hover:text-accent transition-colors duration-300">
                {story.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed font-light mb-4 whitespace-pre-line">
                {story.description || story.excerpt}
              </p>
              <Link
                to={`/stories?id=${story.id || story.slug}`}
                className="inline-block mt-auto font-body text-xs tracking-[0.2em] uppercase text-accent border-b border-accent pb-1 group-hover:border-foreground group-hover:text-foreground transition-colors duration-300"
              >
                Read More
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelStories;
