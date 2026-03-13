import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { ReactNode } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            {children}
            <Footer />
            <WhatsAppWidget />
        </div>
    );
}
