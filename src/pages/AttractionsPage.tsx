import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAttractionsData, useSiteImages } from "@/hooks/useSupabaseData";
import { MapPin } from "lucide-react";
import { ImageSlider } from "@/components/ui/ImageSlider";
import blueCityImg from "@/assets/blue-city-view.jpg";

const staticAttractions = [
  { id: "1", title: "Mehrangarh Fort", description: "One of the largest forts in India, perched 400 feet above the city of Jodhpur. The massive walls of this magnificent fort have ramparts and spectacular views of the Blue City.", location: "Fort Road, Jodhpur", images: [] },
  { id: "2", title: "Jaswant Thada", description: "A beautiful white marble cenotaph built in 1899 in memory of Maharaja Jaswant Singh II. The intricate lattice work and serene surroundings make it a must-visit.", location: "Near Mehrangarh Fort", images: [] },
  { id: "3", title: "Umaid Bhawan Palace", description: "One of the world's largest private residences, this art deco palace is still the home of the Jodhpur royal family. A part of it functions as a heritage hotel and museum.", location: "Palace Road, Jodhpur", images: [] },
  { id: "4", title: "Toorji Ka Jhalra", description: "A beautifully restored stepwell from the 18th century that was once the primary source of water for the city's residents. It is now surrounded by cafés and boutique shops.", location: "Nai Sarak, Jodhpur", images: [] },
  { id: "5", title: "Clock Tower & Sardar Market", description: "The bustling Clock Tower stands at the heart of the old city, surrounded by the vibrant Sardar Market where you can shop for spices, textiles, silver jewellery, and handicrafts.", location: "Old City, Jodhpur", images: [] },
  { id: "6", title: "Blue City Streets", description: "Wander through the labyrinthine lanes of Brahampuri and other old city neighbourhoods, painted in every shade of indigo. Getting lost here is the entire adventure.", location: "Old City, Jodhpur", images: [] },
];

function AttractionPageCard({ attraction, index, inView }: { attraction: any, index: number, inView: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const desc = attraction.description || "";
  const isLong = desc.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group border border-border hover:border-accent/50 transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <ImageSlider
          images={attraction.images || []}
          fallbackImage={blueCityImg}
          sliderType="attraction_slider"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-heading text-2xl font-light mb-2 group-hover:text-accent transition-colors duration-300">
          {attraction.title}
        </h3>
        <div className="w-8 h-px bg-accent mb-4" />
        {attraction.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin size={12} className="text-accent flex-shrink-0" />
            <span>{attraction.location}</span>
          </div>
        )}
        <div className="font-body text-sm text-muted-foreground leading-relaxed flex-grow">
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
      </div>
    </motion.div>
  );
}

export default function AttractionsPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: attractions = [] } = useAttractionsData();
  const { data: siteImages = [] } = useSiteImages();

  const active = attractions.length > 0 ? attractions : staticAttractions;
  const banner = (siteImages as any[]).find(img => img.image_key === 'attractions_banner')?.image_url || blueCityImg;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={banner} alt="Attractions" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/30 to-background/90" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        >
          <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Explore</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Jodhpur Attractions</h1>
          <div className="gold-divider mt-6" />
          <p className="font-body text-sm text-primary-foreground/70 mt-4 max-w-lg">
            Discover the magic of the Blue City — from majestic forts to hidden stepwells.
          </p>
        </motion.div>
      </div>

      {/* Attractions Grid */}
      <section className="section-padding max-w-7xl mx-auto" ref={ref}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {active.map((attraction: any, i: number) => (
            <AttractionPageCard key={attraction.id || i} attraction={attraction} index={i} inView={inView} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
