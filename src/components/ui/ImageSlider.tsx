import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSliderSettings } from "@/hooks/useSupabaseData";

export function ImageSlider({ images, fallbackImage, sliderType = "default" }: { images: string[], fallbackImage?: string, sliderType?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { data: sliderSettings } = useSliderSettings();
  
  const settings = sliderSettings?.find((s: any) => s.slider_type === sliderType) || {
    speed: 5000,
    animation_type: 'slide',
    pause_on_hover: true,
    show_dots: true,
    show_arrows: true
  };

  const imagesList = images.length > 0 ? images : (fallbackImage ? [fallbackImage] : []);

  useEffect(() => {
    if (imagesList.length <= 1) return;
    if (settings.pause_on_hover && isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagesList.length);
    }, settings.speed || 5000);

    return () => clearInterval(interval);
  }, [imagesList.length, isHovered, settings.speed, settings.pause_on_hover]);

  if (imagesList.length === 0) return <div className="w-full h-full bg-slate-200" />;

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imagesList.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Slide ${i}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-${settings.animation_type === 'fade' ? '1000' : '700'} ${
            i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}
      
      {imagesList.length > 1 && settings.show_arrows && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 z-20 bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 z-20 bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {imagesList.length > 1 && settings.show_dots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {imagesList.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(i); }}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                i === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
