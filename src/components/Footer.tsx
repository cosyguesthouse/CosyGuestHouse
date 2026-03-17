import { siteConfig } from "@/data/siteData";
import { useSiteImages } from "@/hooks/useSupabaseData";
import { Instagram, Phone, Mail, MessageCircle, MapPin, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Fetch settings from Supabase with graceful fallback
function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*").single();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache — no flickering on every page
  });
}

const quickLinks = [
  { label: "Experiences", href: "/experiences" },
  { label: "Our Rooms", href: "/stay" },
  { label: "Dining", href: "/dining" },
  { label: "Travel Stories", href: "/stories" },
  { label: "Attractions", href: "/attractions" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Feedback", href: "/feedback" },
];

const Footer = () => {
  const { data: siteImages = [] } = useSiteImages();
  const { data: settings } = useSettings();

  const customBg = (siteImages as any[]).find((img: any) => img.image_key === "footer_bg")?.image_url;

  // Prefer Supabase settings, fall back to siteConfig static values
  const name        = siteConfig.name;
  const description = siteConfig.description;
  const phone       = settings?.phone        || siteConfig.phone;
  const email       = settings?.email        || siteConfig.email;
  const whatsapp    = settings?.whatsapp     || siteConfig.whatsapp;
  const instagram   = settings?.instagram    || siteConfig.instagram;
  const facebook    = settings?.facebook     || "";
  const tripadvisor = settings?.tripadvisor  || "";
  const addressL1   = settings?.address_line1 || siteConfig.address.line1;
  const addressL2   = settings?.address_line2 || siteConfig.address.line2;
  const addressCity = settings?.address_city  || siteConfig.address.city;

  return (
    <footer id="footer" className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Optional background image overlay */}
      {customBg && (
        <>
          <div className="absolute inset-0 z-0">
            <img src={customBg} alt="Footer Background" className="w-full h-full object-cover opacity-20" />
          </div>
          <div className="absolute inset-0 z-0 bg-primary/90" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-3xl font-light mb-4">{name}</h3>
            <div className="w-12 h-[1px] bg-warm-gold mb-6" />
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed font-light">
              {description}
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 border border-primary-foreground/20 flex items-center justify-center hover:border-warm-gold hover:text-warm-gold transition-all duration-300">
                  <Instagram size={15} strokeWidth={1.4} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 border border-primary-foreground/20 flex items-center justify-center hover:border-warm-gold hover:text-warm-gold transition-all duration-300">
                  <Facebook size={15} strokeWidth={1.4} />
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 border border-primary-foreground/20 flex items-center justify-center hover:border-warm-gold hover:text-warm-gold transition-all duration-300">
                  <MessageCircle size={15} strokeWidth={1.4} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs tracking-[0.3em] uppercase text-warm-gold mb-6">Explore</h4>
            <nav className="space-y-3">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="block font-body text-sm text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all duration-300"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs tracking-[0.3em] uppercase text-warm-gold mb-6">Contact</h4>
            <div className="space-y-4">
              {phone && (
                <a href={`tel:${phone}`}
                  className="flex items-start gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
                  <Phone size={15} strokeWidth={1.2} className="mt-0.5 shrink-0 group-hover:text-warm-gold transition-colors" />
                  <span className="font-body font-light">{phone}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  className="flex items-start gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
                  <Mail size={15} strokeWidth={1.2} className="mt-0.5 shrink-0 group-hover:text-warm-gold transition-colors" />
                  <span className="font-body font-light break-all">{email}</span>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
                  <MessageCircle size={15} strokeWidth={1.2} className="mt-0.5 shrink-0 group-hover:text-warm-gold transition-colors" />
                  <span className="font-body font-light">WhatsApp Chat</span>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
                  <Instagram size={15} strokeWidth={1.2} className="mt-0.5 shrink-0 group-hover:text-warm-gold transition-colors" />
                  <span className="font-body font-light">Instagram</span>
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-body text-xs tracking-[0.3em] uppercase text-warm-gold mb-6">Find Us</h4>
            <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
              <MapPin size={15} strokeWidth={1.2} className="mt-0.5 shrink-0 text-warm-gold" />
              <address className="font-body font-light not-italic leading-relaxed">
                {addressL1 && <>{addressL1}<br /></>}
                {addressL2 && <>{addressL2}<br /></>}
                {addressCity}
              </address>
            </div>
            {tripadvisor && (
              <a href={tripadvisor} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-xs text-primary-foreground/50 hover:text-warm-gold transition-colors border border-primary-foreground/15 hover:border-warm-gold/40 px-3 py-2">
                ⭐ View on TripAdvisor
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <p className="font-body text-xs text-primary-foreground/40 tracking-wide">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <p className="font-body text-xs text-primary-foreground/30">
            Made with ❤️ in Jodhpur
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
