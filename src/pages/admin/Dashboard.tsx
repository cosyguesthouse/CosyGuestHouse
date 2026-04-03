import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, Image as ImageIcon, BookOpen, PlusCircle, Edit, CalendarDays, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        rooms: 0,
        gallery: 0,
        stories: 0,
        bookings: 0,
        notifications: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            const [roomsRes, galleryRes, storiesRes, bookingsRes, notificationsRes] = await Promise.all([
                supabase.from("rooms").select("*", { count: "exact", head: true }),
                supabase.from("gallery").select("*", { count: "exact", head: true }),
                supabase.from("travel_stories").select("*", { count: "exact", head: true }),
                supabase.from("bookings").select("*", { count: "exact", head: true }),
                supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
            ]);

            setStats({
                rooms: roomsRes.count || 0,
                gallery: galleryRes.count || 0,
                stories: storiesRes.count || 0,
                bookings: bookingsRes.count || 0,
                notifications: notificationsRes.count || 0,
            });
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h2>
                <p className="text-muted-foreground mt-2">Overview of your guest house activities.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Active Bookings</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.bookings}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Unread Alerts</CardTitle>
                        <Bell className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.notifications}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Physical Rooms</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.rooms}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Live Stories</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.stories}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Button asChild className="gap-2">
                        <Link to="/admin/bookings">
                            <CalendarDays className="h-4 w-4" /> Go to Bookings
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="gap-2">
                        <Link to="/admin/stories">
                            <PlusCircle className="h-4 w-4" /> Add Travel Story
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                        <Link to="/admin/homepage">
                            <Edit className="h-4 w-4" /> Edit Homepage Content
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
