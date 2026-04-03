import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { format, differenceInDays, isWithinInterval, parseISO, addDays, isSameDay } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ChevronLeft, ChevronRight, X, Check, Wifi, Snowflake, Droplets, Eye, Bath, Users, UploadCloud } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRoomsData, useSiteImages } from "@/hooks/useSupabaseData";
import { roomData as staticRoom } from "@/data/siteData";
import heroImg from "@/assets/room-neela-mahal.jpg";

const featureIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi size={14} />, ac: <Snowflake size={14} />, water: <Droplets size={14} />,
    view: <Eye size={14} />, bathroom: <Bath size={14} />, guests: <Users size={14} />,
};
const getIcon = (f: string) => {
    const key = f.toLowerCase();
    if (key.includes("wifi")) return featureIcons.wifi;
    if (key.includes("ac") || key.includes("air")) return featureIcons.ac;
    if (key.includes("water")) return featureIcons.water;
    if (key.includes("view") || key.includes("fort")) return featureIcons.view;
    if (key.includes("bathroom") || key.includes("bath")) return featureIcons.bathroom;
    return <Check size={14} />;
};

function BookingModal({ room, onClose }: { room: any; onClose: () => void }) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [range, setRange] = useState<DateRange | undefined>();
    const [bookedDates, setBookedDates] = useState<{ from: Date; to: Date }[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        guest_name: "", email: "", mobile: "", address: "",
        num_guests: "1", special_request: ""
    });
    const [payment, setPayment] = useState({
        transaction_id: "",
        screenshot_file: null as File | null,
        screenshot_preview: "",
    });

    const [disabledDates, setDisabledDates] = useState<Date[]>([]);
    const [totalPhysicalRooms, setTotalPhysicalRooms] = useState<any[]>([]);
    const [paySettings, setPaySettings] = useState({ qr_code_image_url: "", advance_percentage: 50 });

    // Fetch booked dates, max physical rooms, and payment settings
    useEffect(() => {
        (async () => {
            // Fetch payment settings
            const { data: pSet } = await supabase.from("payment_settings").select("*").maybeSingle();
            if (pSet) setPaySettings({ 
                qr_code_image_url: pSet.qr_code_image_url || "", 
                advance_percentage: pSet.advance_percentage || 50 
            });

            // Fetch physical rooms
            const { data: pRooms } = await supabase
                .from("rooms")
                .select("id")
                .eq("category_id", room.id)
                .eq("status", "available");
            
            const foundRooms = pRooms || [];
            setTotalPhysicalRooms(foundRooms);
            const maxRooms = foundRooms.length || 1;

            const { data } = await supabase
                .from("bookings")
                .select("check_in, check_out")
                .eq("category_id", room.id)
                .eq("status", "confirmed");
            
            if (data && maxRooms > 0) {
                const dateCounts = new Map<string, number>();
                data.forEach((b: any) => {
                    const start = parseISO(b.check_in);
                    const end = parseISO(b.check_out);
                    let current = start;
                    while (current < end) {
                        const dateStr = format(current, "yyyy-MM-dd");
                        dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
                        current = addDays(current, 1);
                    }
                });

                const fullyBooked: Date[] = [];
                dateCounts.forEach((count, dateStr) => {
                    if (count >= maxRooms) fullyBooked.push(parseISO(dateStr));
                });
                setDisabledDates(fullyBooked);
            }
        })();
    }, [room.id]);

    const isDateBooked = (date: Date) =>
        disabledDates.some(bd => isSameDay(date, bd));

    const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;
    const totalAmount = nights * (room.price || 0);
    const advanceAmount = Math.ceil((totalAmount * paySettings.advance_percentage) / 100);

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPayment({ ...payment, screenshot_file: file, screenshot_preview: URL.createObjectURL(file) });
        }
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handleFinalSubmit = async () => {
        if (!range?.from || !range?.to || !payment.transaction_id || !payment.screenshot_file) {
            toast.error("Please provide transaction ID and screenshot.");
            return;
        }
        
        setLoading(true);

        try {
            // 1. Upload screenshot
            setUploading(true);
            const ext = payment.screenshot_file.name.split(".").pop();
            const fileName = `booking-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from("payment_screenshots")
                .upload(fileName, payment.screenshot_file);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("payment_screenshots")
                .getPublicUrl(fileName);

            // 2. Check room availability
            const { data: overlap } = await supabase
                .from("bookings")
                .select("room_id")
                .eq("category_id", room.id)
                .eq("status", "confirmed")
                .lt("check_in", format(range.to, "yyyy-MM-dd"))
                .gt("check_out", format(range.from, "yyyy-MM-dd"));

            const bookedRoomIds = overlap?.map(b => b.room_id) || [];
            const availableRooms = totalPhysicalRooms.filter(r => !bookedRoomIds.includes(r.id));
            const assignedRoomId = availableRooms.length > 0 ? availableRooms[0].id : null;

            // 3. Insert booking
            const { error: bookingError } = await supabase.from("bookings").insert([{
                category_id: room.id,
                category_name: room.name,
                room_id: assignedRoomId,
                ...form,
                num_guests: parseInt(form.num_guests),
                check_in: format(range.from, "yyyy-MM-dd"),
                check_out: format(range.to, "yyyy-MM-dd"),
                status: "pending",
                payment_status: "pending",
                transaction_id: payment.transaction_id,
                payment_screenshot_url: publicUrl,
                total_amount: totalAmount,
                advance_amount: advanceAmount
            }]);

            if (bookingError) throw bookingError;

            // 4. Create Notification
            await supabase.from("notifications").insert([{
                type: "payment",
                message: `New booking & payment submitted by ${form.guest_name} for ${room.name}`
            }]);

            setStep(4);
            toast.success("Booking submitted!");
        } catch (error: any) {
            toast.error("Error: " + (error.message || "Failed to submit booking"));
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-accent">Book Your Stay</p>
                        <h2 className="font-heading text-2xl font-light">{room.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Step 1: Calendar */}
                    {step === 1 && (
                        <div>
                            <p className="font-body text-sm text-muted-foreground mb-4">Select your check-in and check-out dates.</p>
                            <div className="flex justify-center">
                                <DayPicker
                                    mode="range"
                                    selected={range}
                                    onSelect={setRange}
                                    disabled={[{ before: new Date() }, isDateBooked]}
                                    modifiersClassNames={{ disabled: "opacity-40 line-through", selected: "bg-accent text-accent-foreground", range_middle: "bg-accent/20" }}
                                    numberOfMonths={1}
                                />
                            </div>
                            {range?.from && range?.to && (
                                <div className="mt-4 bg-secondary/50 p-4 rounded text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Check-in</span>
                                        <span className="font-medium">{format(range.from, "dd MMM yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Check-out</span>
                                        <span className="font-medium">{format(range.to, "dd MMM yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="font-medium">{nights} night{nights > 1 ? "s" : ""}</span>
                                    </div>
                                    {room.price && (
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="font-medium">Total Stay</span>
                                            <span className="text-accent font-semibold">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <Button
                                className="w-full mt-4"
                                disabled={!range?.from || !range?.to}
                                onClick={() => setStep(2)}
                            >
                                Continue to Guest Details
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Form */}
                    {step === 2 && (
                        <form onSubmit={handleStep2Submit} className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {format(range!.from!, "dd MMM")} → {format(range!.to!, "dd MMM yyyy")} &bull; {nights} night{nights > 1 ? "s" : ""}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <Label>Full Name *</Label>
                                    <Input value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email *</Label>
                                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Mobile *</Label>
                                    <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <Label>Address</Label>
                                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Number of Guests *</Label>
                                    <Input type="number" min="1" max="10" value={form.num_guests} onChange={e => setForm({ ...form, num_guests: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Special Request (optional)</Label>
                                <Textarea rows={2} value={form.special_request} onChange={e => setForm({ ...form, special_request: e.target.value })} placeholder="Any dietary needs, preferences, or special occasions..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                                <Button type="submit" className="flex-1">
                                    Pay & Confirm
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-accent/5 p-4 border border-accent/20 rounded text-center">
                                <p className="text-xs uppercase tracking-widest text-accent mb-1">Advance Amount Payable</p>
                                <h3 className="text-3xl font-light text-primary">₹{advanceAmount.toLocaleString()}</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">({paySettings.advance_percentage}% of ₹{totalAmount.toLocaleString()} total)</p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <p className="text-sm text-center text-muted-foreground">Scan QR code below to pay via any UPI app</p>
                                <div className="w-48 h-48 border p-2 bg-white flex items-center justify-center">
                                    {paySettings.qr_code_image_url ? (
                                        <img src={paySettings.qr_code_image_url} alt="Payment QR" className="w-full h-full object-contain" />
                                    ) : (
                                        <p className="text-xs text-center text-muted-foreground">QR code not available.<br/>Please contact admin.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label>Transaction ID *</Label>
                                    <Input 
                                        value={payment.transaction_id} 
                                        onChange={e => setPayment({ ...payment, transaction_id: e.target.value })} 
                                        placeholder="Enter UPI Ref No. / Transaction ID"
                                        required 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Payment Screenshot *</Label>
                                    <div className="flex items-center gap-4">
                                        <Button type="button" variant="outline" className="relative overflow-hidden w-full h-12 border-dashed">
                                            <UploadCloud size={18} className="mr-2" />
                                            {payment.screenshot_file ? "Change Screenshot" : "Upload Screenshot"}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleScreenshotChange}
                                            />
                                        </Button>
                                    </div>
                                    {payment.screenshot_preview && (
                                        <div className="mt-2 relative w-20 h-20 border rounded overflow-hidden">
                                            <img src={payment.screenshot_preview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>Back</Button>
                                <Button 
                                    onClick={handleFinalSubmit} 
                                    disabled={loading || !payment.transaction_id || !payment.screenshot_file} 
                                    className="flex-1"
                                >
                                    {loading ? (uploading ? "Uploading..." : "Submitting...") : "Submit Payment"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="text-green-600" size={28} />
                            </div>
                            <h3 className="font-heading text-2xl font-light mb-2">Booking Submitted!</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                Your booking request has been submitted successfully.<br />
                                Our team will verify your payment and contact you shortly to confirm your reservation.
                            </p>
                            <Button className="mt-6" onClick={onClose}>Close</Button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}


function RoomCard({ room, index, inView }: { room: any; index: number; inView: boolean }) {
    const [slide, setSlide] = useState(0);
    const [showBooking, setShowBooking] = useState(false);
    const images = room.images?.length > 0 ? room.images : [staticRoom.images[0]];
    const features = room.features || [];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className="group border border-border hover:border-accent/50 transition-all duration-500"
            >
                {/* Image Gallery */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={images[slide]}
                        alt={room.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                    {images.length > 1 && (
                        <>
                            <button onClick={() => setSlide(p => (p - 1 + images.length) % images.length)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setSlide(p => (p + 1) % images.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100">
                                <ChevronRight size={16} />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_: any, i: number) => (
                                    <button key={i} onClick={() => setSlide(i)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-5 bg-accent" : "w-1.5 bg-white/60"}`} />
                                ))}
                            </div>
                        </>
                    )}
                    {room.price && (
                        <div className="absolute top-4 right-4 bg-background/95 px-3 py-1.5 text-sm font-medium">
                            <span className="text-accent font-semibold">₹{room.price}</span>
                            <span className="text-muted-foreground text-xs"> / night</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="font-heading text-2xl font-light mb-2">{room.name}</h3>
                    <div className="w-8 h-px bg-accent mb-4" />
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
                        {room.description || "No description available."}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {features.slice(0, 6).map((f: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="text-accent">{getIcon(f)}</span>
                                {f}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowBooking(true)}
                        className="w-full py-3.5 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-all duration-300"
                    >
                        Book Now
                    </button>
                </div>
            </motion.div>

            {showBooking && <BookingModal room={room} onClose={() => setShowBooking(false)} />}
        </>
    );
}

export default function StayPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const { data: rooms = [], isLoading } = useRoomsData();
    const { data: siteImages = [] } = useSiteImages();
    const displayRooms = rooms;
    const banner = (siteImages as any[]).find(img => img.image_key === 'stay_banner')?.image_url || heroImg;
    const siteLogo = (siteImages as any[]).find(img => img.image_key === 'site_logo')?.image_url;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                <img src={banner} alt="Rooms" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/70 via-deep-navy/30 to-background/90" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <p className="font-body text-xs tracking-[0.4em] uppercase text-warm-gold mb-4">Accommodation</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground">Our Rooms</h1>
                    <div className="gold-divider mt-6" />
                    <p className="font-body text-sm text-primary-foreground/70 mt-4 max-w-lg">
                        Thoughtfully designed rooms blending Rajasthani heritage with modern comfort.
                    </p>
                </motion.div>
            </div>

            {/* Rooms Grid */}
            <section className="section-padding max-w-7xl mx-auto" ref={ref}>
                {isLoading ? (
                    <div className="text-center py-24 flex justify-center">
                        {siteLogo ? (
                            <img src={siteLogo} alt="Loading..." className="w-24 h-24 object-contain animate-pulse" />
                        ) : (
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                ) : displayRooms.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No rooms are currently available.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {displayRooms.map((room: any, i: number) => (
                            <RoomCard key={room.id || i} room={room} index={i} inView={inView} />
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
