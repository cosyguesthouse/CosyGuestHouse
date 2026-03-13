import { siteConfig } from "@/data/siteData";
import { useSiteImages } from "@/hooks/useSupabaseData";
import { Instagram, Phone, Mail, MessageCircle } from "lucide-react";

const Footer = () => {
  const { data: siteImages = [] } = useSiteImages();
  const customBg = siteImages.find((img: any) => img.image_key === 'footer_bg')?.image_url;

  return (
    <footer id="footer" className="bg-primary text-primary-foreground relative overflow-hidden">
      {customBg && (
        <>
          <div className="absolute inset-0 z-0">
            <img src={customBg} alt="Footer Background" className="w-full h-full object-cover opacity-20" />
          </div>
          <div className="absolute inset-0 z-0 bg-primary/90" />
        </>
      )}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-3xl font-light mb-4">{siteConfig.name}</h3>
            <div className="w-12 h-[1px] bg-warm-gold mb-6" />
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed font-light">
              {siteConfig.description}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs tracking-[0.3em] uppercase text-warm-gold mb-6">Contact</h4>
            <div className="space-y-4">
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone size={16} strokeWidth={1.2} />
                <span className="font-body font-light">{siteConfig.phone}</span>
              </a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail size={16} strokeWidth={1.2} />
                <span className="font-body font-light">{siteConfig.email}</span>
              </a>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <MessageCircle size={16} strokeWidth={1.2} />
                <span className="font-body font-light">WhatsApp</span>
              </a>
              <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Instagram size={16} strokeWidth={1.2} />
                <span className="font-body font-light">Instagram</span>
              </a>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-body text-xs tracking-[0.3em] uppercase text-warm-gold mb-6">Address</h4>
            <address className="font-body text-sm text-primary-foreground/70 leading-relaxed font-light not-italic">
              {siteConfig.address.line1}<br />
              {siteConfig.address.line2}<br />
              {siteConfig.address.city}
            </address>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="font-body text-xs text-primary-foreground/40 tracking-wide">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
