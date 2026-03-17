import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    Home,
    BedDouble,
    UtensilsCrossed,
    Image as ImageIcon,
    ImagePlus,
    Compass,
    BookOpen,
    Wifi,
    LogOut,
    Menu,
    CalendarDays,
    MessageSquare,
    Star,
    Settings,
    Key,
    MapPin,
    SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Homepage Content", href: "/admin/homepage", icon: Home },
    { name: "Site Images", href: "/admin/images", icon: ImagePlus },
    { name: "Experiences", href: "/admin/experiences", icon: Compass },
    { name: "Room Categories", href: "/admin/rooms", icon: BedDouble },
    { name: "Physical Rooms", href: "/admin/physical-rooms", icon: Key },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { name: "Dining", href: "/admin/dining", icon: UtensilsCrossed },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Travel Stories", href: "/admin/stories", icon: BookOpen },
    { name: "Attractions", href: "/admin/attractions", icon: MapPin },
    { name: "Facilities", href: "/admin/facilities", icon: Wifi },
    { name: "Contact Queries", href: "/admin/contact-queries", icon: MessageSquare },
    { name: "Reviews Manager", href: "/admin/feedback", icon: Star },
    { name: "Slider Settings", href: "/admin/sliders", icon: SlidersHorizontal },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
                <div className="flex items-center justify-center py-6 border-b">
                    <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                                            ? "bg-primary/10 text-primary border-r-4 border-primary"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Header & Sidebar */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
                    <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </header>

                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                        <div
                            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-center py-6 border-b">
                                <h1 className="text-xl font-bold text-slate-800">Admin</h1>
                            </div>
                            <nav className="flex-1 overflow-y-auto py-4">
                                <ul className="space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                                                        ? "bg-primary/10 text-primary border-r-4 border-primary"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        }`}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                            <div className="p-4 border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full flex items-center justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
