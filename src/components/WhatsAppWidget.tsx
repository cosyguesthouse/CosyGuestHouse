import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/data/siteData";

const QUICK_MESSAGES = [
    "I want to book a room 🏨",
    "I want to reserve rooftop dining 🍽️",
    "I want to know room prices 💰",
    "I need travel help in Jodhpur 🗺️",
    "I have a general inquiry 💬",
];

function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const { data } = await supabase.from("settings").select("*").single();
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export default function WhatsAppWidget() {
    const [open, setOpen] = useState(false);
    const { data: settings } = useSettings();

    const whatsapp = settings?.whatsapp || siteConfig.whatsapp;
    const number = whatsapp.replace(/\D/g, "");

    const handleMessage = (msg: string) => {
        const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
        setOpen(false);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{siteConfig.name}</p>
                                    <p className="text-white/80 text-xs">Typically replies instantly</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat bubble */}
                        <div className="p-4 bg-[#ECE5DD]">
                            <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%]">
                                <p className="text-sm text-gray-700">👋 Hi! How can we help you today?</p>
                                <p className="text-[10px] text-gray-400 mt-1 text-right">Just now</p>
                            </div>
                        </div>

                        {/* Quick messages */}
                        <div className="p-3 space-y-2 bg-white">
                            <p className="text-xs text-gray-400 uppercase tracking-wide px-1">Quick Messages</p>
                            {QUICK_MESSAGES.map((msg, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleMessage(msg)}
                                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200"
                                >
                                    {msg}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 relative"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} className="text-white" />
                        </motion.span>
                    ) : (
                        <motion.span key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            {/* WhatsApp SVG icon */}
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </motion.span>
                    )}
                </AnimatePresence>
                {/* Pulse ring */}
                {!open && (
                    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
                )}
            </motion.button>
        </div>
    );
}
