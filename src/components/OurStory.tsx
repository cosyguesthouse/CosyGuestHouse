import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { storyData as staticStoryData } from "@/data/siteData";
import { useHomepageData, useSiteImages } from "@/hooks/useSupabaseData";

const OurStory = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useHomepageData();
  const { data: siteImages = [] } = useSiteImages();

  const title = data?.story_title || staticStoryData.title;
  const description = data?.story_description || staticStoryData.paragraphs.join("\n\n");
  const parsedParagraphs = description.split('\n').filter((p: string) => p.trim() !== '');

  const customImg = siteImages.find((img: any) => img.image_key === 'story_image')?.image_url;
  const image = customImg || data?.story_image || staticStoryData.image;

  return (
    <section id="our-story" className="section-padding bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="img-hover-zoom"
        >
          <img
            src={image}
            alt="Castle View Guest House heritage exterior"
            className="w-full h-[500px] object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent">
            {staticStoryData.subtitle}
          </p>
          <h2 className="section-heading">{title}</h2>
          <div className="gold-divider !mx-0" />
          {parsedParagraphs.map((p: string, i: number) => (
            <p key={i} className="font-body text-sm md:text-base text-muted-foreground leading-relaxed font-light">
              {p}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;
