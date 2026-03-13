import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2, Loader2, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchBookings(); }, []);

    async function fetchBookings() {
        setLoading(true);
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) toast.error("Failed to fetch bookings: " + error.message);
        else setBookings(data || []);
        setLoading(false);
    }

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
        if (error) toast.error("Failed to update status: " + error.message);
        else { toast.success(`Booking ${status}`); fetchBookings(); }
    };

    const deleteBooking = async (id: string) => {
        if (!confirm("Delete this booking permanently?")) return;
        const { error } = await supabase.from("bookings").delete().eq("id", id);
        if (error) toast.error("Failed to delete: " + error.message);
        else { toast.success("Booking deleted"); fetchBookings(); }
    };

    const statusColor = (s: string) => {
        if (s === "confirmed") return "bg-green-100 text-green-700 border-green-200";
        if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    };

    const counts = {
        pending: bookings.filter(b => b.status === "pending").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
        cancelled: bookings.filter(b => b.status === "cancelled").length,
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Bookings Management</h2>
                <p className="text-muted-foreground mt-2">Manage all room booking requests.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Pending", count: counts.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { label: "Confirmed", count: counts.confirmed, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Cancelled", count: counts.cancelled, color: "text-red-600", bg: "bg-red-50" },
                ].map(s => (
                    <Card key={s.label} className={s.bg}>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <CalendarDays className={s.color} size={28} />
                            <div>
                                <p className="text-2xl font-bold">{s.count}</p>
                                <p className="text-sm text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No bookings yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Guest</TableHead>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Check-in</TableHead>
                                        <TableHead>Check-out</TableHead>
                                        <TableHead>Guests</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map(b => (
                                        <TableRow key={b.id}>
                                            <TableCell className="font-medium">{b.guest_name}</TableCell>
                                            <TableCell>{b.room_name || "—"}</TableCell>
                                            <TableCell>{format(new Date(b.check_in), "dd MMM yy")}</TableCell>
                                            <TableCell>{format(new Date(b.check_out), "dd MMM yy")}</TableCell>
                                            <TableCell>{b.num_guests}</TableCell>
                                            <TableCell>
                                                <div className="text-xs">{b.email}</div>
                                                <div className="text-xs text-muted-foreground">{b.mobile}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${statusColor(b.status)}`}>
                                                    {b.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    {b.status !== "confirmed" && (
                                                        <Button size="icon" variant="outline" className="h-7 w-7 text-green-600 border-green-300 hover:bg-green-50"
                                                            onClick={() => updateStatus(b.id, "confirmed")} title="Confirm">
                                                            <Check size={13} />
                                                        </Button>
                                                    )}
                                                    {b.status !== "cancelled" && (
                                                        <Button size="icon" variant="outline" className="h-7 w-7 text-orange-500 border-orange-300 hover:bg-orange-50"
                                                            onClick={() => updateStatus(b.id, "cancelled")} title="Cancel">
                                                            <X size={13} />
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="outline" className="h-7 w-7 text-destructive border-destructive/30 hover:bg-destructive/5"
                                                        onClick={() => deleteBooking(b.id)} title="Delete">
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
