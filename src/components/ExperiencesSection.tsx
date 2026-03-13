import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { experiencesData as staticExperiencesData } from "@/data/siteData";
import { useExperiencesData } from "@/hooks/useSupabaseData";

const ExperiencesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: experiences = [] } = useExperiencesData();

  const activeExperiences = experiences.length > 0 ? experiences : staticExperiencesData;

  return (
    <section id="experiences" className="section-padding bg-secondary/50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Discover</p>
          <h2 className="section-heading">Curated Experiences</h2>
          <div className="gold-divider mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {activeExperiences.map((exp: any, i: number) => (
            <motion.div
              key={exp.id || i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              <div className="img-hover-zoom aspect-[4/5] mb-6">
                <img
                  src={exp.image_url || exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-heading text-2xl md:text-3xl font-light mb-3 group-hover:text-accent transition-colors duration-300">
                {exp.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed font-light">
                {exp.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
