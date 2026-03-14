import { motion } from "framer-motion";
import { heroData as staticHeroData } from "@/data/siteData";
import { useHomepageData, useSiteImages } from "@/hooks/useSupabaseData";

const HeroSection = () => {
  const { data, isLoading } = useHomepageData();
  const { data: siteImages = [] } = useSiteImages();

  const siteLogo = (siteImages as any[]).find((img: any) => img.image_key === 'site_logo')?.image_url;

  if (isLoading) {
    return (
      <div className="h-screen bg-deep-navy flex flex-col items-center justify-center text-warm-gold">
        {siteLogo ? (
          <img src={siteLogo} alt="Loading..." className="w-32 h-32 object-contain animate-pulse" />
        ) : (
          <div className="text-xl tracking-widest animate-pulse">Loading...</div>
        )}
      </div>
    );
  }

  const headline = data?.hero_title || staticHeroData.headline;
  const subtext = data?.hero_subtitle || staticHeroData.subtext;

  const customBg = siteImages.find((img: any) => img.image_key === 'hero_background')?.image_url;
  const image = customBg || data?.hero_video_url || staticHeroData.image;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {image?.endsWith(".mp4") ? (
          <video
            src={image}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={image}
            alt="Jodhpur Blue City aerial view with Mehrangarh Fort"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/30 to-deep-navy/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-body text-xs md:text-sm tracking-[0.3em] uppercase text-primary-foreground/70 mb-6"
        >
          Heritage Guest House · Jodhpur
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-heading text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-primary-foreground max-w-5xl leading-tight"
        >
          {headline}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-20 h-[1px] bg-warm-gold my-8"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-body text-sm md:text-base text-primary-foreground/80 max-w-2xl leading-relaxed font-light"
        >
          {subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <a
            href="#stay"
            className="px-10 py-3.5 bg-primary-foreground/15 border border-primary-foreground/40 text-primary-foreground text-xs tracking-[0.2em] uppercase font-medium hover:bg-primary-foreground/25 transition-all duration-300"
          >
            Explore Stay
          </a>
          <a
            href="#dining"
            className="px-10 py-3.5 bg-warm-gold/90 text-deep-navy text-xs tracking-[0.2em] uppercase font-medium hover:bg-warm-gold transition-all duration-300"
          >
            View Dining
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-primary-foreground/50 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-8 bg-primary-foreground/30"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
