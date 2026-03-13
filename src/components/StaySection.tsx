import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { roomData as staticRoomData } from "@/data/siteData";
import { useRoomsData } from "@/hooks/useSupabaseData";

const RoomCard = ({ room, isReversed, inView }: { room: any; isReversed: boolean; inView: boolean }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = room.images?.length > 0 ? room.images : staticRoomData.images;
  const features = room.features?.length > 0 ? room.features : staticRoomData.features;

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % images.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + images.length) % images.length);

  return (
    <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mt-16`}>
      {/* Image slider */}
      <motion.div
        initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`relative ${isReversed ? 'lg:order-2' : ''}`}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={images[currentSlide]}
            alt={`${room.name || 'Room'} - view ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-all duration-500"
            loading="lazy"
          />
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={18} className="text-foreground" />
        </button>
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-accent w-6" : "bg-border"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Room details */}
      <motion.div
        initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`flex flex-col gap-6 ${isReversed ? 'lg:order-1' : ''}`}
      >
        <h3 className="font-heading text-4xl md:text-5xl font-light">{room.name || staticRoomData.name}</h3>
        {room.price && (
          <p className="text-xl text-warm-gold">From ₹{room.price}</p>
        )}
        <div className="gold-divider !mx-0" />
        <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed font-light whitespace-pre-line">
          {room.description || staticRoomData.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {features.map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
              <span className="font-body text-xs md:text-sm text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>

        <a
          href="#"
          className="mt-4 inline-block w-fit px-10 py-3.5 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-all duration-300"
        >
          Book Now
        </a>
      </motion.div>
    </div>
  );
};

const StaySection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: rooms = [] } = useRoomsData();

  const displayRooms = rooms.length > 0 ? rooms : [staticRoomData];

  return (
    <section id="stay" className="section-padding bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Accommodation</p>
          <h2 className="section-heading">Our Rooms</h2>
          <div className="gold-divider mt-6" />
        </motion.div>

        {displayRooms.map((room, index) => (
          <RoomCard key={room.id || index} room={room} isReversed={index % 2 !== 0} inView={inView} />
        ))}
      </div>
    </section>
  );
};

export default StaySection;
