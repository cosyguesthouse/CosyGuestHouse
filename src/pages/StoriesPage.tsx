import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTravelStoriesData } from "@/hooks/useSupabaseData";
import { travelStoriesData as staticStories } from "@/data/siteData";
import blueAlleyImg from "@/assets/blue-alley.jpg";

export default function StoriesPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { data: stories = [] } = useTravelStoriesData();
    const [expanded, setExpanded] = useState<string | null>(null);

    const active = stories.length > 0 ? stories : staticStories;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                <img src={blueAlleyImg} alt="Travel Stories" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/30 to-background/90" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Journal</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Travel Stories</h1>
                    <div className="gold-divider mt-6" />
                    <p className="font-body text-sm text-primary-foreground/70 mt-4 max-w-md">
                        Tales from the Blue City — vivid journeys and unforgettable moments from Jodhpur.
                    </p>
                </motion.div>
            </div>

            {/* Stories Grid */}
            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {active.map((story: any, i: number) => (
                        <motion.article
                            key={story.id || i}
                            initial={{ opacity: 0, y: 40 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: i * 0.15 }}
                            className="group cursor-pointer"
                        >
                            <div className="img-hover-zoom aspect-[16/10] mb-6 overflow-hidden relative">
                                <img
                                    src={story.cover_image || story.image}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {story.publish_date && (
                                    <div className="absolute top-4 left-4 bg-background/90 px-3 py-1 text-xs text-muted-foreground">
                                        {new Date(story.publish_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-heading text-2xl font-light mb-3 group-hover:text-accent transition-colors duration-300">
                                {story.title}
                            </h3>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                                {story.description || story.excerpt}
                            </p>

                            {/* Full content expandable */}
                            {story.content && (
                                <>
                                    {expanded === (story.id || story.slug) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="font-body text-sm text-muted-foreground leading-relaxed mb-4 border-t pt-4 overflow-hidden"
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: story.content.replace(/\n/g, "<br/>") }} />
                                        </motion.div>
                                    )}
                                    <button
                                        onClick={() => setExpanded(expanded === (story.id || story.slug) ? null : (story.id || story.slug))}
                                        className="font-body text-xs tracking-[0.2em] uppercase text-accent border-b border-accent pb-1 hover:border-foreground hover:text-foreground transition-colors duration-300"
                                    >
                                        {expanded === (story.id || story.slug) ? "Read Less" : "Read More"}
                                    </button>
                                </>
                            )}
                            {!story.content && (
                                <span className="font-body text-xs tracking-[0.2em] uppercase text-accent border-b border-accent pb-1">
                                    Read More
                                </span>
                            )}
                        </motion.article>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
