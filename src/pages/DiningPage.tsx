import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDiningData, useSiteImages } from "@/hooks/useSupabaseData";
import { diningData as staticDining } from "@/data/siteData";
import rooftopImg from "@/assets/rooftop-dining.jpg";
import candlelightImg from "@/assets/dining-candlelight.jpg";
import foodImg from "@/assets/food-rajasthani.jpg";

const HIGHLIGHTS = [
    { icon: "🌅", title: "Rooftop Seating", desc: "Dine under the open sky with panoramic Blue City views" },
    { icon: "🏰", title: "Fort View Dining", desc: "Uninterrupted vistas of the majestic Mehrangarh Fort" },
    { icon: "🍛", title: "Authentic Rajasthani", desc: "Traditional recipes passed down through generations" },
    { icon: "🕯️", title: "Candlelight Evenings", desc: "Romantic sunset dinners and candlelight experiences" },
    { icon: "🌙", title: "Sunset Experience", desc: "Watch the city turn golden as dusk falls over Jodhpur" },
    { icon: "🥘", title: "North Indian & Continental", desc: "A curated menu for every palate and preference" },
];

export default function DiningPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: diningItems = [] } = useDiningData();
    const { data: siteImages = [] } = useSiteImages();

    const active = diningItems.length > 0 ? diningItems[0] : null;
    const description = active?.description || staticDining.description;
    const images = active?.images?.length >= 3 ? active.images : [rooftopImg, candlelightImg, foodImg];

    const banner = (siteImages as any[]).find(img => img.image_key === 'dining_banner')?.image_url || images[0];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[70vh] overflow-hidden">
                <img src={banner} alt="Dining" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/90 via-deep-navy/40 to-transparent" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute bottom-16 left-6 md:left-20"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Culinary</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground mb-2">
                        {active?.title || staticDining.title}
                    </h1>
                    <p className="font-body text-sm text-primary-foreground/70 max-w-sm">
                        Dine with the fort in sight
                    </p>
                </motion.div>
            </div>

            {/* Description */}
            <section className="section-padding bg-background" ref={ref}>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">The Experience</p>
                        <h2 className="section-heading text-left">A Table Above<br />the Blue City</h2>
                        <div className="gold-divider !mx-0 my-6" />
                        <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                            {description}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="img-hover-zoom aspect-[3/4]">
                            <img src={images[1] || images[0]} alt="Dining" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="img-hover-zoom aspect-[3/4] mt-10">
                            <img src={images[2] || images[0]} alt="Food" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Highlights */}
            <section className="section-padding bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">What We Offer</p>
                        <h2 className="section-heading">Dining Highlights</h2>
                        <div className="gold-divider mt-6" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {HIGHLIGHTS.map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 group"
                            >
                                <span className="text-3xl mb-4 block">{h.icon}</span>
                                <h3 className="font-heading text-lg font-light mb-2">{h.title}</h3>
                                <p className="font-body text-sm text-muted-foreground">{h.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="section-padding bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Gallery</p>
                        <h2 className="section-heading">The Ambience</h2>
                        <div className="gold-divider mt-6" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.slice(0, 6).map((img: string, i: number) => (
                            <div key={i} className={`img-hover-zoom ${i === 0 ? "col-span-2 md:col-span-1 aspect-[4/3]" : "aspect-square"}`}>
                                <img src={img} alt={`Dining ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
