import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { experiencesData as staticData } from "@/data/siteData";
import { useExperiencesData } from "@/hooks/useSupabaseData";
import blueCityViewImg from "@/assets/blue-city-view.jpg";

export default function ExperiencesPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: experiences = [] } = useExperiencesData();
    const active = experiences.length > 0 ? experiences : staticData;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                <img src={blueCityViewImg} alt="Experiences" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/30 to-background/90" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Curated</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Experiences</h1>
                    <div className="gold-divider mt-6" />
                    <p className="font-body text-sm text-primary-foreground/70 mt-4 max-w-lg">
                        Discover Jodhpur through curated experiences crafted for the curious traveller.
                    </p>
                </motion.div>
            </div>

            {/* Cards Grid */}
            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {active.map((exp: any, i: number) => (
                        <motion.div
                            key={exp.id || i}
                            initial={{ opacity: 0, y: 40 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <div className="img-hover-zoom aspect-[4/3] mb-5 overflow-hidden">
                                <img
                                    src={exp.image_url || exp.image}
                                    alt={exp.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <h3 className="font-heading text-2xl font-light mb-3 group-hover:text-accent transition-colors duration-300">
                                {exp.title}
                            </h3>
                            <div className="w-8 h-px bg-accent mb-3" />
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">
                                {exp.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
