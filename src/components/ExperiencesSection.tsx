import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { experiencesData as staticExperiencesData } from "@/data/siteData";
import { useExperiencesData } from "@/hooks/useSupabaseData";
import { ImageSlider } from "@/components/ui/ImageSlider";

function ExperienceCard({ exp, index, inView }: { exp: any, index: number, inView: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const desc = exp.description || "";
  const isLong = desc.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="group cursor-pointer flex flex-col h-full"
    >
      <div className="img-hover-zoom aspect-[4/5] mb-6 overflow-hidden">
        <ImageSlider images={exp.images || []} fallbackImage={exp.image_url || exp.image} sliderType="experience_slider" />
      </div>
      <h3 className="font-heading text-2xl md:text-3xl font-light mb-3 group-hover:text-accent transition-colors duration-300">
        {exp.title}
      </h3>
      <div className="font-body text-sm text-muted-foreground leading-relaxed font-light flex-grow">
        <p>
          {expanded || !isLong ? desc : `${desc.slice(0, 150)}...`}
        </p>
        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-accent hover:underline text-xs mt-2 block font-medium"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

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
            <ExperienceCard key={exp.id || i} exp={exp} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
