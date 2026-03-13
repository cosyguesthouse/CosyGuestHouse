import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Check } from "lucide-react";
import { siteConfig } from "@/data/siteData";
import blueCityImg from "@/assets/blue-city-view.jpg";

function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const { data } = await supabase.from("settings").select("*").single();
            return data;
        },
    });
}

export default function ContactPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: settings } = useSettings();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const phone = settings?.phone || siteConfig.phone;
    const email = settings?.email || siteConfig.email;
    const address1 = settings?.address_line1 || siteConfig.address.line1;
    const address2 = settings?.address_line2 || siteConfig.address.line2;
    const addressCity = settings?.address_city || siteConfig.address.city;
    const mapEmbed = settings?.google_maps_embed || "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from("contact_queries").insert([form]);
        if (error) {
            toast.error("Failed to send message. Please try again.");
        } else {
            setSubmitted(true);
            toast.success("Message sent successfully!");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[50vh] overflow-hidden">
                <img src={blueCityImg} alt="Contact" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/30 to-background/90" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Reach Us</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Contact Us</h1>
                    <div className="gold-divider mt-6" />
                </motion.div>
            </div>

            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                <div className="grid md:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="space-y-10"
                    >
                        <div>
                            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Find Us</p>
                            <h2 className="font-heading text-4xl font-light mb-6">Get In Touch</h2>
                            <div className="gold-divider !mx-0 mb-8" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 border border-accent flex items-center justify-center shrink-0">
                                    <MapPin size={16} className="text-accent" />
                                </div>
                                <div>
                                    <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Address</p>
                                    <p className="font-body text-sm text-foreground">{address1}</p>
                                    <p className="font-body text-sm text-foreground">{address2}</p>
                                    <p className="font-body text-sm text-foreground">{addressCity}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 border border-accent flex items-center justify-center shrink-0">
                                    <Phone size={16} className="text-accent" />
                                </div>
                                <div>
                                    <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Phone</p>
                                    <a href={`tel:${phone}`} className="font-body text-sm text-foreground hover:text-accent transition-colors">{phone}</a>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 border border-accent flex items-center justify-center shrink-0">
                                    <Mail size={16} className="text-accent" />
                                </div>
                                <div>
                                    <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Email</p>
                                    <a href={`mailto:${email}`} className="font-body text-sm text-foreground hover:text-accent transition-colors">{email}</a>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps */}
                        {mapEmbed ? (
                            <div className="aspect-[4/3] w-full overflow-hidden border border-border"
                                dangerouslySetInnerHTML={{ __html: mapEmbed }} />
                        ) : (
                            <div className="aspect-[4/3] w-full bg-secondary/40 border border-border flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <MapPin size={32} />
                                <p className="text-sm">Add Google Maps embed via Admin → Settings</p>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent([address1, address2, addressCity].join(", "))}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-xs underline text-accent"
                                >
                                    View on Google Maps
                                </a>
                            </div>
                        )}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="mb-8">
                            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Write to Us</p>
                            <h2 className="font-heading text-4xl font-light mb-2">Send a Message</h2>
                            <div className="gold-divider !mx-0 mt-4" />
                        </div>

                        {submitted ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="text-green-600" size={28} />
                                </div>
                                <h3 className="font-heading text-2xl font-light mb-2">Message Received!</h3>
                                <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
                                <Button className="mt-6" variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}>
                                    Send Another
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label>Your Name *</Label>
                                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email Address *</Label>
                                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Message / Query *</Label>
                                    <Textarea rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="How can we help you?" />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full py-6 text-sm tracking-[0.15em] uppercase">
                                    {loading ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        )}

                        {/* Feedback Section */}
                        <div className="mt-12 pt-10 border-t">
                            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Share Your Experience</p>
                            <h3 className="font-heading text-2xl font-light mb-4">Leave Feedback</h3>
                            <FeedbackForm />
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FeedbackForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from("feedback").insert([{ ...form, rating }]);
        if (error) {
            toast.error("Failed to submit feedback.");
        } else {
            setSubmitted(true);
            toast.success("Thank you for your feedback!");
        }
        setLoading(false);
    };

    if (submitted) return (
        <p className="text-sm text-muted-foreground">Thank you! Your feedback means the world to us. 🙏</p>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setRating(n)}
                        className={`text-2xl transition-all ${n <= rating ? "text-warm-gold scale-110" : "text-border"}`}>
                        ★
                    </button>
                ))}
            </div>
            <div className="space-y-1.5">
                <Label>Your Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
                <Label>Your Feedback *</Label>
                <Textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            <Button type="submit" variant="outline" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
        </form>
    );
}
