import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import * as LucideIcons from "lucide-react";
import { facilitiesData as staticFacilitiesData } from "@/data/siteData";
import { useFacilitiesData } from "@/hooks/useSupabaseData";

const FacilitiesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: facilities = [] } = useFacilitiesData();

  const activeFacilities = facilities.length > 0 ? facilities : staticFacilitiesData;

  const renderIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = LucideIcons[iconName] || LucideIcons.Info;
    return <Icon size={24} className="text-muted-foreground group-hover:text-accent transition-colors duration-300" strokeWidth={1.2} />;
  };

  return (
    <section className="section-padding bg-secondary/50" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Amenities</p>
          <h2 className="section-heading">Our Facilities</h2>
          <div className="gold-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {activeFacilities.map((f: any, i: number) => {
            return (
              <motion.div
                key={f.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="w-16 h-16 flex items-center justify-center border border-border group-hover:border-accent transition-colors duration-300">
                  {renderIcon(f.icon)}
                </div>
                <span className="font-body text-xs tracking-widest uppercase text-muted-foreground text-center">
                  {f.name || f.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
