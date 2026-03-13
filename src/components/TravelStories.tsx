import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { travelStoriesData as staticTravelStoriesData } from "@/data/siteData";
import { useTravelStoriesData } from "@/hooks/useSupabaseData";

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
              <div className="img-hover-zoom aspect-[16/10] mb-6">
                <img
                  src={story.cover_image || story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-heading text-2xl font-light mb-3 group-hover:text-accent transition-colors duration-300">
                {story.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed font-light mb-4 whitespace-pre-line">
                {story.description || story.excerpt}
              </p>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-accent border-b border-accent pb-1 group-hover:border-foreground group-hover:text-foreground transition-colors duration-300">
                Read More
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelStories;
