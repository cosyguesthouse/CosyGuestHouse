import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OurStory from "@/components/OurStory";
import ExperiencesSection from "@/components/ExperiencesSection";
import StaySection from "@/components/StaySection";
import DiningSection from "@/components/DiningSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import GallerySection from "@/components/GallerySection";
import TravelStories from "@/components/TravelStories";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <OurStory />
      <ExperiencesSection />
      <StaySection />
      <DiningSection />
      <FacilitiesSection />
      <GallerySection />
      <TravelStories />
      <Footer />
      <WhatsAppWidget />
    </div>
  );
};

export default Index;
