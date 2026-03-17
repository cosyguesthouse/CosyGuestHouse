import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDiningData, useSiteImages } from "@/hooks/useSupabaseData";
import { diningData as staticDining } from "@/data/siteData";
import rooftopImg from "@/assets/rooftop-dining.jpg";
import candlelightImg from "@/assets/dining-candlelight.jpg";
import foodImg from "@/assets/food-rajasthani.jpg";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { ImageSlider } from "@/components/ui/ImageSlider";

function DiningCard({ item, index, inView }: { item: any; index: number; inView: boolean }) {
    const images = item.images?.length > 0 ? item.images : [rooftopImg, candlelightImg, foodImg];
    const features = item.features || [];
    const [expanded, setExpanded] = useState(false);
    const desc = item.description || "";
    const isLong = desc.length > 150;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.15 }}
            className="group border border-border hover:border-accent/50 transition-all duration-500 bg-card flex flex-col h-full"
        >
            <div className="relative aspect-[16/10] overflow-hidden">
                <ImageSlider images={images} fallbackImage={rooftopImg} sliderType="dining_slider" />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-light mb-2">{item.title}</h3>
                <div className="w-8 h-px bg-accent mb-4" />
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 whitespace-pre-line flex-grow">
                    {expanded || !isLong ? desc : `${desc.slice(0, 150)}...`}
                    {isLong && (
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="text-accent hover:underline text-xs mt-2 block font-medium"
                        >
                            {expanded ? "Read Less" : "Read More"}
                        </button>
                    )}
                </p>
                {features.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                        {features.map((f: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="text-accent mt-0.5"><Check size={12} /></span>
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function DiningPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: diningItems = [] } = useDiningData();
    const { data: siteImages = [] } = useSiteImages();

    const active = diningItems.length > 0 ? diningItems[0] : null;
    const description = active?.description || staticDining.description;
    const images = active?.images?.length > 0 ? active.images : [rooftopImg, candlelightImg, foodImg];

    const banner = (siteImages as any[]).find(img => img.image_key === 'dining_banner')?.image_url || images[0];

    const displayItems = diningItems.length > 0 ? diningItems : [
        {
            title: staticDining.title,
            description: staticDining.description,
            features: staticDining.highlights,
            images: images
        }
    ];

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

            {/* Dining Options Grid */}
            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                <div className="text-center mb-14">
                    <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">The Experience</p>
                    <h2 className="section-heading">Our Dining Options</h2>
                    <div className="gold-divider mt-6" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {displayItems.map((item: any, i: number) => (
                        <DiningCard key={item.id || i} item={item} index={i} inView={inView} />
                    ))}
                </div>
            </section>

            {/* Gallery */}
            <section className="section-padding bg-background border-t border-border">
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
