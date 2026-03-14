import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSiteImages } from "@/hooks/useSupabaseData";
import guesthouseImg from "@/assets/guesthouse-exterior.jpg";
import blueCityImg from "@/assets/blue-city-view.jpg";
import rooftopImg from "@/assets/rooftop-dining.jpg";

function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const { data } = await supabase.from("settings").select("*").single();
            return data;
        },
    });
}

export default function AboutPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: settings } = useSettings();
    const { data: siteImages = [] } = useSiteImages();

    const aboutContent = settings?.about_content ||
        "Nestled in the ancient lanes of Brahampuri, Castle View Guest House is a family-run heritage property that has been welcoming travelers for over 40 years.\n\nFounded by our grandfather, this haveli was transformed into a guest house with one simple vision — to offer every guest the warmth of a Rajasthani home with the charm of the Blue City at their doorstep.\n\nToday, we continue that tradition, blending authentic hospitality with modern comforts, while our rooftop offers one of the most breathtaking views of Mehrangarh Fort and the sprawling blue cityscape below.";

    const aboutImages = settings?.about_images?.length > 0
        ? settings.about_images
        : [guesthouseImg, blueCityImg, rooftopImg];

    const paragraphs = aboutContent.split("\n").filter((p: string) => p.trim());
    const banner = (siteImages as any[]).find((img: any) => img.image_key === 'about_image')?.image_url || guesthouseImg;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                <img src={banner} alt="About Us" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/70 via-deep-navy/30 to-background/90" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Heritage</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Our Story</h1>
                    <div className="gold-divider mt-6" />
                </motion.div>
            </div>

            {/* Story Content */}
            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">A Legacy of Hospitality</p>
                        <h2 className="section-heading text-left">40 Years of<br />Warm Welcome</h2>
                        <div className="gold-divider !mx-0 my-6" />
                        {paragraphs.map((p: string, i: number) => (
                            <p key={i} className="font-body text-sm md:text-base text-muted-foreground leading-relaxed font-light mb-4">
                                {p}
                            </p>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="img-hover-zoom aspect-[3/4] col-span-2">
                            <img src={aboutImages[0]} alt="Guesthouse" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="img-hover-zoom aspect-square">
                            <img src={aboutImages[1] || aboutImages[0]} alt="Blue City" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="img-hover-zoom aspect-square">
                            <img src={aboutImages[2] || aboutImages[0]} alt="Rooftop" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    </motion.div>
                </div>

                {/* Values */}
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: "🏛️", title: "Heritage", desc: "A haveli that has stood for generations, preserving the architecture and soul of Rajasthan." },
                        { icon: "❤️", title: "Hospitality", desc: "Every guest is treated as family — with warmth, care, and genuine Rajasthani love." },
                        { icon: "🌅", title: "Experience", desc: "From fort views to rooftop dining, we curate every moment of your Jodhpur journey." },
                    ].map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                            className="text-center p-8 border border-border/50 hover:border-accent/40 transition-all duration-300"
                        >
                            <span className="text-4xl block mb-4">{v.icon}</span>
                            <h3 className="font-heading text-xl font-light mb-3">{v.title}</h3>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
