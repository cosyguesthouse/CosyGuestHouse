import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { galleryData as staticGalleryData } from "@/data/siteData";
import { useGalleryData } from "@/hooks/useSupabaseData";

const GallerySection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: gallery = [] } = useGalleryData();

  const activeGallery = gallery.length > 0 ? gallery : staticGalleryData;

  return (
    <section id="gallery" className="section-padding bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Moments</p>
          <h2 className="section-heading">Gallery</h2>
          <div className="gold-divider mt-6" />
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {activeGallery.map((img: any, i: number) => (
            <motion.div
              key={img.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="img-hover-zoom break-inside-avoid"
            >
              <img
                src={img.image_url || img.src}
                alt={img.title || img.alt || "Gallery Image"}
                className="w-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
