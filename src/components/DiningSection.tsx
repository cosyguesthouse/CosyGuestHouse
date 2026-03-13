import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { diningData as staticDiningData } from "@/data/siteData";
import { useDiningData, useHomepageData, useSiteImages } from "@/hooks/useSupabaseData";

const DiningSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: diningItems = [] } = useDiningData();
  const { data: homepageData } = useHomepageData();
  const { data: siteImages = [] } = useSiteImages();

  // If there are specific items from DB, use the first one as primary. 
  // Otherwise default to the static mock.
  const activeDiningItem = diningItems.length > 0 ? diningItems[0] : null;

  const title = activeDiningItem?.title || staticDiningData.title;
  const description = activeDiningItem?.description || homepageData?.dining_description || staticDiningData.description;
  const highlights = activeDiningItem?.features?.length > 0 ? activeDiningItem.features : staticDiningData.highlights;
  const images = activeDiningItem?.images?.length >= 3 ? activeDiningItem.images : staticDiningData.images;

  const customBanner = siteImages.find((img: any) => img.image_key === 'dining_banner')?.image_url;
  const bannerImage = customBanner || images[0];

  return (
    <section id="dining" ref={ref} className="relative">
      {/* Full-width hero image */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <img
          src={bannerImage}
          alt="Rooftop candlelight dining"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 via-deep-navy/30 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="absolute bottom-12 left-6 md:left-12 lg:left-20"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-warm-gold mb-4">Culinary</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground">
            {title}
          </h2>
        </motion.div>
      </div>

      {/* Content */}
      <div className="section-padding bg-background">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="section-heading mb-6">{staticDiningData.subtitle}</p>
            <div className="gold-divider !mx-0 mb-6" />
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed font-light mb-8 whitespace-pre-line">
              {description}
            </p>
            {/* <ul className="space-y-3">
              {highlights.map((h: string, i: number) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                  <span className="font-body text-sm text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="img-hover-zoom aspect-[3/4]">
              <img src={images[1] || images[0]} alt="Rooftop dining view" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="img-hover-zoom aspect-[3/4] mt-8">
              <img src={images[2] || images[0]} alt="Rajasthani cuisine" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiningSection;
