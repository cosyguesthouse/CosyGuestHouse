import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAttractionsData } from "@/hooks/useSupabaseData";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { MapPin, ArrowRight } from "lucide-react";
import blueCityImg from "@/assets/blue-city-view.jpg";

const staticPreview = [
  { id: "1", title: "Mehrangarh Fort", location: "Fort Road, Jodhpur", images: [] },
  { id: "2", title: "Jaswant Thada", location: "Near Mehrangarh Fort", images: [] },
  { id: "3", title: "Toorji Ka Jhalra", location: "Nai Sarak, Jodhpur", images: [] },
  { id: "4", title: "Clock Tower Market", location: "Old City, Jodhpur", images: [] },
];

const AttractionsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: attractions = [] } = useAttractionsData();

  const preview = (attractions.length > 0 ? attractions : staticPreview).slice(0, 4);

  return (
    <section id="attractions" className="section-padding bg-secondary/50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Discover</p>
          <h2 className="section-heading">Explore Jodhpur</h2>
          <div className="gold-divider mt-6" />
          <p className="font-body text-sm text-muted-foreground mt-6 max-w-xl mx-auto">
            Step beyond our gates and immerse yourself in the magic of the Blue City.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {preview.map((attraction: any, i: number) => (
            <motion.div
              key={attraction.id || i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group border border-border hover:border-accent/50 transition-all duration-500 overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <ImageSlider
                  images={attraction.images || []}
                  fallbackImage={blueCityImg}
                  sliderType="attraction_slider"
                />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg font-light mb-1 group-hover:text-accent transition-colors duration-300">
                  {attraction.title}
                </h3>
                {attraction.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={11} className="text-accent flex-shrink-0" />
                    <span>{attraction.location}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/attractions"
            className="inline-flex items-center gap-3 px-10 py-3.5 border border-accent text-accent text-xs tracking-[0.2em] uppercase font-medium hover:bg-accent hover:text-background transition-all duration-300"
          >
            Explore All Attractions
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AttractionsSection;
