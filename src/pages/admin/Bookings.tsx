import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2, Loader2, CalendarDays, ExternalLink, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchBookings(); }, []);

    async function fetchBookings() {
        setLoading(true);
        const { data, error } = await supabase
            .from("bookings")
            .select("*, rooms(room_number)")
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

    const updatePaymentStatus = async (id: string, payment_status: string) => {
        // If payment verified, also confirm the booking status
        const updates: any = { payment_status };
        if (payment_status === 'verified') updates.status = 'confirmed';
        
        const { data: updatedBooking, error } = await supabase
            .from("bookings")
            .update(updates)
            .eq("id", id)
            .select() // Get the updated record for the email
            .single();

        if (error) {
            toast.error("Failed to update payment status: " + error.message);
        } else { 
            toast.success(`Payment ${payment_status}`); 
            
            // Send email notifications automatically when confirmed
            if (payment_status === 'verified' && updatedBooking) {
                sendBookingEmails(updatedBooking);
            }
            
            fetchBookings(); 
        }
    };

    const sendBookingEmails = async (booking: any) => {
        try {
            const { data, error } = await supabase.functions.invoke('send-booking-email', {
                body: {
                    name: booking.guest_name,
                    email: booking.email,
                    phone: booking.mobile,
                    room_category: booking.category_name,
                    checkin: booking.check_in,
                    checkout: booking.check_out,
                    guests: booking.num_guests
                },
            });
            
            if (error) {
                console.error('Email Function Error:', error);
            } else {
                console.log('Email sent successfully:', data);
            }
        } catch (err) {
            console.error('Failed to send booking emails:', err);
        }
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

    const paymentStatusColor = (s: string) => {
        if (s === "verified") return "bg-green-100 text-green-700 border-green-200";
        if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    const counts = {
        pending: bookings.filter(b => b.status === "pending").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
        cancelled: bookings.filter(b => b.status === "cancelled").length,
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Bookings Management</h2>
                    <p className="text-muted-foreground mt-2">Manage all room booking requests and payments.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Pending Requests", count: counts.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { label: "Confirmed Bookings", count: counts.confirmed, color: "text-green-600", bg: "bg-green-50" },
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Bookings</CardTitle>
                    <CreditCard className="text-muted-foreground h-5 w-5" />
                </CardHeader>
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
                                        <TableHead>Guest & Booking</TableHead>
                                        <TableHead>Dates & Room</TableHead>
                                        <TableHead>Payment Proof</TableHead>
                                        <TableHead>Amounts</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map(b => (
                                        <TableRow key={b.id}>
                                            <TableCell>
                                                <div className="font-semibold">{b.guest_name}</div>
                                                <div className="text-xs text-muted-foreground">{b.mobile}</div>
                                                <div className="text-xs text-muted-foreground">{b.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">
                                                    {format(new Date(b.check_in), "dd MMM")} - {format(new Date(b.check_out), "dd MMM yy")}
                                                </div>
                                                <div className="text-xs text-accent">
                                                    {b.category_name} ({b.rooms?.room_number || "Unassigned"})
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {b.num_guests} Guests
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {b.payment_screenshot_url ? (
                                                    <div className="space-y-1.5">
                                                        <div className="text-[11px] font-mono bg-slate-100 p-1 rounded truncate w-32 border" title={b.transaction_id}>
                                                            ID: {b.transaction_id || "N/A"}
                                                        </div>
                                                        <a 
                                                            href={b.payment_screenshot_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                                                        >
                                                            <div className="h-10 w-10 border rounded overflow-hidden">
                                                                <img src={b.payment_screenshot_url} className="h-full w-full object-cover" alt="Proof" />
                                                            </div>
                                                            View Proof
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic font-body">No proof provided</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div className="text-muted-foreground">Advance: <span className="font-semibold text-slate-900 font-mono">₹{b.advance_amount || 0}</span></div>
                                                    <div className="text-muted-foreground">Total: <span className="font-mono">₹{b.total_amount || 0}</span></div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <Badge variant="outline" className={`${statusColor(b.status)} border-none shadow-none text-[10px] uppercase font-bold py-0 h-4`}>
                                                        {b.status}
                                                    </Badge>
                                                    <Badge variant="outline" className={`${paymentStatusColor(b.payment_status)} border-none shadow-none text-[10px] uppercase font-bold py-0 h-4`}>
                                                        Pay: {b.payment_status || "pending"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1.5">
                                                    {b.payment_status !== "verified" && (
                                                        <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 gap-1 px-2"
                                                            onClick={() => updatePaymentStatus(b.id, "verified")}>
                                                            <Check size={14} /> Verify
                                                        </Button>
                                                    )}
                                                    {b.payment_status === "pending" && (
                                                        <Button size="sm" variant="outline" className="h-8 text-red-500 border-red-200 bg-red-50 hover:bg-red-100 px-2"
                                                            onClick={() => updatePaymentStatus(b.id, "rejected")}>
                                                            <X size={14} /> Reject
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-50"
                                                        onClick={() => deleteBooking(b.id)} title="Delete">
                                                        <Trash2 size={15} />
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

