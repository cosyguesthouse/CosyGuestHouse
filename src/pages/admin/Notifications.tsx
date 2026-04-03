import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Loader2, Bell, BookOpen, CreditCard, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchNotifications(); }, []);

    async function fetchNotifications() {
        setLoading(true);
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) toast.error("Failed to fetch notifications: " + error.message);
        else setNotifications(data || []);
        setLoading(false);
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        if (error) toast.error("Failed to update status: " + error.message);
        else fetchNotifications();
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase.from("notifications").delete().eq("id", id);
        if (error) toast.error("Failed to delete: " + error.message);
        else { 
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification deleted"); 
        }
    };

    const markAllAsRead = async () => {
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
        if (error) toast.error("Failed to update: " + error.message);
        else {
            toast.success("All marked as read");
            fetchNotifications();
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "booking": return <BookOpen className="text-blue-500" size={18} />;
            case "payment": return <CreditCard className="text-green-500" size={18} />;
            case "contact": return <MessageSquare className="text-purple-500" size={18} />;
            case "feedback": return <Star className="text-yellow-500" size={18} />;
            default: return <Bell className="text-slate-500" size={18} />;
        }
    };

    const filteredNotifications = {
        booking: notifications.filter(n => n.type === "booking"),
        payment: notifications.filter(n => n.type === "payment"),
        contact: notifications.filter(n => n.type === "contact"),
        feedback: notifications.filter(n => n.type === "feedback"),
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Notifications</h2>
                    <p className="text-muted-foreground mt-2">Oversee all recent activities and submissions.</p>
                </div>
                <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={notifications.every(n => n.is_read)}>
                    Mark all as read
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No notifications yet</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="min-w-[300px]">Message</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.map(n => (
                                    <TableRow key={n.id} className={n.is_read ? "opacity-60" : "bg-primary/5"}>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                {getTypeIcon(n.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {n.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {n.message}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(n.created_at), "dd MMM, hh:mm a")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {!n.is_read && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => markAsRead(n.id)} title="Mark as read">
                                                        <Check size={16} />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteNotification(n.id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
