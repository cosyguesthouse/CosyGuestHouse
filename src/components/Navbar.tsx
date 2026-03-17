import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { siteConfig } from "@/data/siteData";

const navLinks = [
  { label: "Experiences", href: "/experiences" },
  { label: "Stay", href: "/stay" },
  { label: "Dining", href: "/dining" },
  { label: "Travel Stories", href: "/stories" },
  { label: "Attractions", href: "/attractions" },
  { label: "About Us", href: "/about" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLight = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || !isHome
        ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
        : "bg-transparent"
        }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 h-20">
        {/* Logo */}
        <Link to="/" className="font-heading text-2xl md:text-3xl font-semibold tracking-wide">
          <span className={isLight ? "text-primary-foreground" : "text-foreground"}>
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`font-body text-sm tracking-widest uppercase transition-colors duration-300 ${isLight
                ? "text-primary-foreground/80 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                } ${location.pathname === link.href ? "!text-accent" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/stay"
            className={`ml-4 px-6 py-2.5 text-xs tracking-widest uppercase font-medium transition-all duration-300 ${isLight
              ? "bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            Book Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className={isLight ? "text-primary-foreground" : "text-foreground"} size={24} />
          ) : (
            <Menu className={isLight ? "text-primary-foreground" : "text-foreground"} size={24} />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <div className="flex flex-col items-center py-8 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-sm tracking-widest uppercase text-foreground hover:text-accent transition-colors ${location.pathname === link.href ? "text-accent" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/stay"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-8 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
