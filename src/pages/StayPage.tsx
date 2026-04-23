import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { format, differenceInDays, isSameDay, addDays, parseISO } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ChevronLeft, ChevronRight, X, Check, Wifi, Snowflake, Droplets, Eye, Bath, Users, UploadCloud, Calendar as CalendarIcon, Minus, Plus, Search } from "lucide-react";
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

import * as Popover from '@radix-ui/react-popover';

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

type GuestRoom = { adults: number; childAbove5: number; childBelow5: number };

function GuestSelector({ rooms, maxRooms, isSingleOrBudget, onChange }: { rooms: GuestRoom[], maxRooms: number, isSingleOrBudget: boolean, onChange: (rooms: GuestRoom[]) => void }) {
    const handleAddRoom = () => {
        if (rooms.length < maxRooms) {
            onChange([...rooms, { adults: 2, childAbove5: 0, childBelow5: 0 }]);
        }
    };
    const handleRemoveRoom = (index: number) => {
        if (rooms.length > 1) {
            onChange(rooms.filter((_, i) => i !== index));
        }
    };
    const updateRoom = (index: number, field: keyof GuestRoom, value: number) => {
        const newRooms = [...rooms];
        newRooms[index] = { ...newRooms[index], [field]: Math.max(0, value) };
        if (field === 'adults' && newRooms[index].adults < 1) newRooms[index].adults = 1; // min 1 adult per room
        if (field === 'adults' && newRooms[index].adults > 2) newRooms[index].adults = 2; // max 2 adults explicitly
        if (field === 'childAbove5' && newRooms[index].childAbove5 > 1) newRooms[index].childAbove5 = 1; // max 1
        if (field === 'childBelow5' && newRooms[index].childBelow5 > 1) newRooms[index].childBelow5 = 1; // max 1
        onChange(newRooms);
    };

    return (
        <div className="w-80 p-4 bg-background border shadow-xl rounded-md z-50">
            <h4 className="font-heading tracking-wider text-sm mb-4 border-b pb-2">Guest Selection</h4>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {rooms.map((room, idx) => (
                    <div key={idx} className="bg-secondary/20 p-3 rounded space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-accent">Room {idx + 1}</span>
                            {rooms.length > 1 && (
                                <button type="button" onClick={() => handleRemoveRoom(idx)} className="text-red-500 hover:text-red-600 text-xs flex items-center">
                                    <X size={12} className="mr-1"/> Remove
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <p>Adults</p>
                                <p className="text-xs text-muted-foreground">Max 2</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => updateRoom(idx, 'adults', room.adults - 1)} className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-secondary disabled:opacity-30" disabled={room.adults <= 1}>
                                    <Minus size={14} />
                                </button>
                                <span className="w-4 text-center text-sm font-medium">{room.adults}</span>
                                <button type="button" onClick={() => updateRoom(idx, 'adults', room.adults + 1)} className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-secondary disabled:opacity-30" disabled={room.adults >= 2}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                        
                        {!isSingleOrBudget && (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <p>Child (&gt; 5 yrs)</p>
                                        <p className="text-xs text-muted-foreground">+₹500 for mattress</p>
                                    </div>
                                    <select 
                                        className="h-8 w-16 text-center text-sm border rounded bg-background"
                                        value={room.childAbove5}
                                        onChange={(e) => updateRoom(idx, 'childAbove5', parseInt(e.target.value))}
                                    >
                                        <option value={0}>0</option>
                                        <option value={1}>1</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <p>Child (&le; 5 yrs)</p>
                                        <p className="text-xs text-muted-foreground">No extra charge</p>
                                    </div>
                                    <select 
                                        className="h-8 w-16 text-center text-sm border rounded bg-background"
                                        value={room.childBelow5}
                                        onChange={(e) => updateRoom(idx, 'childBelow5', parseInt(e.target.value))}
                                    >
                                        <option value={0}>0</option>
                                        <option value={1}>1</option>
                                    </select>
                                </div>
                            </>
                        )}
                        {isSingleOrBudget && (
                            <p className="text-[10px] text-amber-600 font-medium leading-tight">Children not allowed in Single/Budget rooms.</p>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t">
                {rooms.length < maxRooms ? (
                    <Button type="button" variant="outline" className="w-full text-xs" onClick={handleAddRoom}>
                        + Add Another Room
                    </Button>
                ) : (
                    <p className="text-xs text-center text-amber-600 font-medium">Maximum {maxRooms} rooms available for these dates.</p>
                )}
            </div>
        </div>
    );
}


function BookingModal({ 
    initialCategory, 
    initialRange,
    allCategories,
    availabilityMap,
    onClose 
}: { 
    initialCategory: any; 
    initialRange?: DateRange;
    allCategories: any[];
    availabilityMap: Record<string, {total: number; available: number; pRooms: any[]}>;
    onClose: () => void 
}) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    
    // Booking config state
    const [selectedCategory, setSelectedCategory] = useState(initialCategory.id);
    const [range, setRange] = useState<DateRange | undefined>(initialRange);
    const [guestRooms, setGuestRooms] = useState<GuestRoom[]>([{ adults: 2, childAbove5: 0, childBelow5: 0 }]);
    
    // UI state
    const [isCalOpen, setIsCalOpen] = useState(false);
    const [isGuestOpen, setIsGuestOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form state
    const [form, setForm] = useState({
        guest_name: "", email: "", mobile: "", address: "", special_request: ""
    });
    const [payment, setPayment] = useState({
        transaction_id: "",
        screenshot_file: null as File | null,
        screenshot_preview: "",
    });
    const [paySettings, setPaySettings] = useState({ qr_code_image_url: "", advance_percentage: 50 });

    useEffect(() => {
        (async () => {
            const { data: pSet } = await supabase.from("payment_settings").select("*").maybeSingle();
            if (pSet) setPaySettings({ 
                qr_code_image_url: pSet.qr_code_image_url || "", 
                advance_percentage: pSet.advance_percentage || 50 
            });
        })();
    }, []);

    // Derived vars
    const roomDetails = allCategories.find(c => c.id === selectedCategory) || initialCategory;
    const availInfo = availabilityMap[selectedCategory] || { total: 0, available: 0, pRooms: [] };
    const maxAvailable = availInfo.available;
    
    const roomNameForLogic = (roomDetails.name || "").toLowerCase();
    const isSingleOrBudget = roomNameForLogic.includes("single") || roomNameForLogic.includes("budget");
    
    // If they change category and current guestRooms length exceeds maxAvailable, trim it.
    useEffect(() => {
        let updated = [...guestRooms];
        if (maxAvailable > 0 && updated.length > maxAvailable) {
            updated = updated.slice(0, maxAvailable);
        }
        if (isSingleOrBudget) {
            updated = updated.map(r => ({ ...r, childAbove5: 0, childBelow5: 0 }));
        }
        // Only set if changed to avoid infinite loop
        if (JSON.stringify(updated) !== JSON.stringify(guestRooms)) {
            setGuestRooms(updated);
        }
    }, [selectedCategory, maxAvailable]);

    const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;
    const baseRoomPriceTotal = nights * (roomDetails.price || 0) * guestRooms.length;
    
    let extraMattressPriceTotal = 0;
    guestRooms.forEach(r => {
        if (!isSingleOrBudget && r.childAbove5 > 0) {
            extraMattressPriceTotal += (500 * nights); // 500 per night max 1 child
        }
    });

    const totalAmount = baseRoomPriceTotal + extraMattressPriceTotal;
    const advanceAmount = Math.ceil((totalAmount * paySettings.advance_percentage) / 100);

    const totalGuests = guestRooms.reduce((acc, r) => acc + r.adults + r.childAbove5 + r.childBelow5, 0);

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPayment({ ...payment, screenshot_file: file, screenshot_preview: URL.createObjectURL(file) });
        }
    };

    const handleStep1Submit = () => {
        if (!range?.from || !range?.to) { toast.error("Please select dates"); return; }
        if (maxAvailable < 1) { toast.error("Sold out for selected dates"); return; }
        if (guestRooms.length > maxAvailable) { toast.error(`Only ${maxAvailable} rooms available`); return; }
        setStep(2);
    };

    const handleFinalSubmit = async () => {
        if (!range?.from || !range?.to || !payment.transaction_id || !payment.screenshot_file) {
            toast.error("Please provide transaction ID and screenshot.");
            return;
        }
        
        setLoading(true);

        try {
            // Upload screenshot
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

            // Assign physical rooms
            const { data: overlapBookings } = await supabase.from('bookings')
                .select('room_id')
                .eq('category_id', selectedCategory)
                .in('status', ['confirmed', 'pending'])
                .lt('check_in', format(range.to, "yyyy-MM-dd"))
                .gt('check_out', format(range.from, "yyyy-MM-dd"));
                
            const bookedRoomIds = overlapBookings?.map(b => b.room_id) || [];
            const availablePhysicalRooms = availInfo.pRooms.filter(r => !bookedRoomIds.includes(r.id));
            
            if (availablePhysicalRooms.length < guestRooms.length) {
                throw new Error("Rooms got booked just now! Please try again.");
            }

            // Generate booking records (one for each room)
            const sharedTxId = `tx_${payment.transaction_id}_${Date.now()}`;
            const perRoomAmount = totalAmount / guestRooms.length;
            const perRoomAdvance = advanceAmount / guestRooms.length;

            const bookingsToInsert = guestRooms.map((gRoom, idx) => ({
                category_id: selectedCategory,
                category_name: roomDetails.name,
                room_id: availablePhysicalRooms[idx]?.id,
                
                guest_name: form.guest_name,
                email: form.email,
                mobile: form.mobile,
                address: form.address,
                special_request: `Room ${idx+1}: ${gRoom.adults} Adults, ${gRoom.childAbove5} Child(>5), ${gRoom.childBelow5} Child(<=5). ${form.special_request}`,
                num_guests: gRoom.adults + gRoom.childAbove5 + gRoom.childBelow5,
                
                check_in: format(range.from!, "yyyy-MM-dd"),
                check_out: format(range.to!, "yyyy-MM-dd"),
                status: "pending",
                payment_status: "pending",
                transaction_id: payment.transaction_id,  // their entered ref no
                payment_screenshot_url: publicUrl,
                total_amount: perRoomAmount,
                advance_amount: perRoomAdvance
            }));

            const { error: bookingError } = await supabase.from("bookings").insert(bookingsToInsert);

            if (bookingError) throw bookingError;

            await supabase.from("notifications").insert([{
                type: "payment",
                message: `New payment submitted by ${form.guest_name} for ${guestRooms.length}x ${roomDetails.name}`
            }]);

            setStep(4);
        } catch (error: any) {
            toast.error("Error: " + (error.message || "Failed to submit booking"));
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
            >
                {/* Visual Left Sidebar */}
                <div className="hidden md:block w-1/3 bg-secondary/30 relative">
                    <img src={roomDetails.images?.[0] || heroImg} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply" alt=""/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end text-white">
                        <p className="text-xs uppercase tracking-widest text-accent mb-1">Booking</p>
                        <h2 className="font-heading text-2xl font-medium">{roomDetails.name}</h2>
                        {range?.from && range?.to && (
                            <div className="mt-4 text-sm opacity-90 space-y-1">
                                <p>{format(range.from, "MMM dd, yyyy")} - {format(range.to, "MMM dd, yyyy")}</p>
                                <p>{nights} Nights &bull; {guestRooms.length} Room{guestRooms.length>1?'s':''}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-background relative min-h-[500px]">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h3 className="font-heading text-lg">Complete Booking</h3>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Room Details Selection */}
                                <div className="space-y-1.5">
                                    <Label>Select Room Type</Label>
                                    <select 
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {allCategories.map(c => {
                                            const aInfo = availabilityMap[c.id] || { available: 0 };
                                            return (
                                                <option key={c.id} value={c.id} disabled={aInfo.available === 0}>
                                                    {c.name} {aInfo.available === 0 ? "(Sold Out)" : `(${aInfo.available} Left - ₹${c.price}/night)`}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 relative">
                                        <Label>Dates</Label>
                                        <Popover.Root open={isCalOpen} onOpenChange={setIsCalOpen}>
                                            <Popover.Trigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal px-3">
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
                                                    {range?.from && range?.to ? `${format(range.from, "d MMM")} - ${format(range.to, "d MMM")}` : "Select Dates"}
                                                </Button>
                                            </Popover.Trigger>
                                            <Popover.Portal>
                                                <Popover.Content className="z-[200] bg-background border shadow-xl rounded-md p-2 mt-1" align="start">
                                                    <DayPicker
                                                        mode="range"
                                                        selected={range}
                                                        onSelect={v => { setRange(v); if(v?.from && v?.to) setIsCalOpen(false); }}
                                                        disabled={[{ before: new Date() }]}
                                                        numberOfMonths={1}
                                                    />
                                                </Popover.Content>
                                            </Popover.Portal>
                                        </Popover.Root>
                                    </div>
                                    <div className="space-y-1.5 ">
                                        <Label>Rooms & Guests</Label>
                                        <Popover.Root open={isGuestOpen} onOpenChange={setIsGuestOpen}>
                                            <Popover.Trigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal px-3" disabled={maxAvailable===0}>
                                                    <Users className="mr-2 h-4 w-4 text-accent" />
                                                    {guestRooms.length} Room{guestRooms.length>1?'s':''}, {totalGuests} Guest{totalGuests>1?'s':''}
                                                </Button>
                                            </Popover.Trigger>
                                            <Popover.Portal>
                                                <Popover.Content className="z-[200] mt-1" align="end">
                                                    <GuestSelector 
                                                        rooms={guestRooms} 
                                                        maxRooms={maxAvailable || 1}
                                                        isSingleOrBudget={isSingleOrBudget}
                                                        onChange={(v) => {
                                                            if (v.length <= maxAvailable) {
                                                                setGuestRooms(v);
                                                            }
                                                        }} 
                                                    />
                                                </Popover.Content>
                                            </Popover.Portal>
                                        </Popover.Root>
                                    </div>
                                </div>

                                {maxAvailable === 0 && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">
                                        This room type is sold out for these dates. Please change the room type or dates.
                                    </div>
                                )}

                                {range?.from && range?.to && maxAvailable > 0 && (
                                    <div className="bg-secondary/20 p-4 rounded-md text-sm space-y-2 mt-4">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Base Price</span>
                                            <span>₹{roomDetails.price} x {guestRooms.length} Room(s) x {nights} Night(s)</span>
                                        </div>
                                        {extraMattressPriceTotal > 0 && (
                                            <div className="flex justify-between text-amber-600">
                                                <span>Extra Mattress (Child &gt; 5 yrs)</span>
                                                <span>₹{extraMattressPriceTotal.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-medium text-base pt-2 border-t mt-2">
                                            <span>Total Price</span>
                                            <span className="text-accent">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full mt-6 h-12"
                                    disabled={!range?.from || !range?.to || maxAvailable === 0}
                                    onClick={handleStep1Submit}
                                >
                                    Continue to Guest Details
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={e => { e.preventDefault(); setStep(3); }} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-accent/10 p-3 rounded-md text-sm text-accent-foreground mb-4 flex gap-2">
                                    <Users size={18} className="text-accent" />
                                    <span>Booking for {guestRooms.length} room(s) and {totalGuests} guest(s).</span>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Lead Guest Name *</Label>
                                    <Input value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Email *</Label>
                                        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Mobile *</Label>
                                        <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Address</Label>
                                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Special Request</Label>
                                    <Textarea rows={2} value={form.special_request} onChange={e => setForm({ ...form, special_request: e.target.value })} placeholder="Any dietary needs or requests..." />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
                                    <Button type="submit" className="flex-1 hover-lift">Proceed to Pay</Button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-gradient-to-r from-accent/5 to-transparent p-5 border border-accent/20 rounded-xl text-center">
                                    <p className="text-xs uppercase tracking-widest text-accent mb-1 font-medium">Advance Amount</p>
                                    <h3 className="text-4xl font-light text-primary">₹{advanceAmount.toLocaleString()}</h3>
                                    <p className="text-xs text-muted-foreground mt-2">({paySettings.advance_percentage}% of ₹{totalAmount.toLocaleString()} total)</p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-sm text-center text-muted-foreground">Scan QR code below via any UPI app</p>
                                    <div className="w-48 h-48 border-2 border-dashed p-3 bg-white rounded-xl shadow-inner flex items-center justify-center">
                                        {paySettings.qr_code_image_url ? (
                                            <img src={paySettings.qr_code_image_url} alt="Payment QR" className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <p className="text-xs text-center text-muted-foreground">QR code unavailable</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label>Transaction ID *</Label>
                                        <Input 
                                            value={payment.transaction_id} 
                                            onChange={e => setPayment({ ...payment, transaction_id: e.target.value })} 
                                            placeholder="UPI Ref No. / Txn ID"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Payment Screenshot *</Label>
                                        <Button type="button" variant="outline" className="relative overflow-hidden w-full h-12 border-dashed border-2 hover:bg-secondary/50">
                                            <UploadCloud size={18} className="mr-2 text-accent" />
                                            <span className="font-medium">{payment.screenshot_file ? "Change Screenshot" : "Select File"}</span>
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleScreenshotChange} />
                                        </Button>
                                        {payment.screenshot_preview && (
                                            <div className="mt-3 w-max relative group rounded-md overflow-hidden border shadow-sm">
                                                <img src={payment.screenshot_preview} alt="Preview" className="h-24 w-auto object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                    <Check className="text-white drop-shadow-md" size={24} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button type="button" variant="ghost" onClick={() => setStep(2)} className="w-1/3" disabled={loading}>Back</Button>
                                    <Button onClick={handleFinalSubmit} disabled={loading || !payment.transaction_id || !payment.screenshot_file} className="flex-1 shadow-lg shadow-accent/20">
                                        {loading ? (uploading ? "Uploading..." : "Confirming...") : "Submit Payment"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center py-10 animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-100 shadow-xl">
                                    <Check className="text-green-600" size={32} />
                                </div>
                                <h3 className="font-heading text-3xl font-light mb-3">Booking Requested!</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                    Your booking has been submitted pending payment verification. You'll receive a confirmation email shortly.
                                </p>
                                <Button className="mt-8 px-8 rounded-full" onClick={onClose}>Return to Rooms</Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}


function RoomCard({ 
    room, 
    index, 
    inView, 
    availability, 
    onBook 
}: { 
    room: any; 
    index: number; 
    inView: boolean; 
    availability: number;
    onBook: () => void;
}) {
    const [slide, setSlide] = useState(0);
    const images = room.images?.length > 0 ? room.images : [staticRoom.images[0]];
    const features = room.features || [];
    
    const isSoldOut = availability === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            className={`group border bg-card transition-all duration-500 rounded-xl overflow-hidden shadow-sm hover:shadow-xl ${isSoldOut ? 'opacity-70 grayscale-[20%]' : 'hover:border-accent/40'}`}
        >
            {/* Image Gallery */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={images[slide]}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
                
                {/* Dynamic Status Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 text-xs tracking-wider rounded font-semibold text-white shadow-lg backdrop-blur-md ${isSoldOut ? 'bg-red-500/80' : availability <= 2 ? 'bg-amber-600/80 z-20' : 'bg-black/60'}`}>
                    {isSoldOut ? "Sold Out" : availability === 1 ? "1 Room Left" : `${availability} Rooms Left`}
                </div>

                {images.length > 1 && (
                    <>
                        <button onClick={() => setSlide(p => (p - 1 + images.length) % images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100 shadow">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setSlide(p => (p + 1) % images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100 shadow">
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}
                {room.price && (
                    <div className="absolute bottom-4 right-4 bg-background/95 px-3 py-1.5 rounded text-sm font-medium shadow-lg backdrop-blur-sm">
                        <span className="text-accent font-semibold">₹{room.price}</span>
                        <span className="text-muted-foreground text-xs"> / night</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="font-heading text-2xl font-light mb-2">{room.name}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                    {room.description || "No description available."}
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-6">
                    {features.slice(0, 4).map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <span className="text-accent/80 p-1 bg-accent/10 rounded">{getIcon(f)}</span>
                            {f}
                        </div>
                    ))}
                </div>
                <Button
                    onClick={onBook}
                    disabled={isSoldOut}
                    className="w-full py-6 text-sm tracking-[0.1em] uppercase font-semibold"
                    variant={isSoldOut ? "secondary" : "default"}
                >
                    {isSoldOut ? "Unavailable" : "Select Room"}
                </Button>
            </div>
        </motion.div>
    );
}

export default function StayPage() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const { data: rooms = [], isLoading } = useRoomsData();
    const { data: siteImages = [] } = useSiteImages();
    
    // Global search state
    const [searchRange, setSearchRange] = useState<DateRange | undefined>({ from: new Date(), to: addDays(new Date(), 1) });
    const [availabilityMap, setAvailabilityMap] = useState<Record<string, {total: number; available: number; pRooms: any[]}>>({});
    
    // Modal state
    const [selectedRoomToBook, setSelectedRoomToBook] = useState<any | null>(null);

    // Fetch availability based on searchRange
    useEffect(() => {
        async function fetchAvailability() {
            if (!searchRange?.from || !searchRange?.to) {
                // if no dates selected, default to max rooms as available just to show the UI
                const { data: pRooms } = await supabase.from('rooms').select('id, category_id').eq('status', 'available');
                const map: any = {};
                pRooms?.forEach(r => {
                    if (!map[r.category_id]) map[r.category_id] = { total: 0, available: 0, pRooms: [] };
                    map[r.category_id].total++;
                    map[r.category_id].available++;
                    map[r.category_id].pRooms.push(r);
                });
                setAvailabilityMap(map);
                return;
            }

            const { data: pRooms } = await supabase.from('rooms').select('id, category_id').eq('status', 'available');
            
            const startStr = format(searchRange.from, 'yyyy-MM-dd');
            const endStr = format(searchRange.to, 'yyyy-MM-dd');
            
            const { data: bookings } = await supabase.from('bookings')
                .select('category_id, room_id')
                .in('status', ['confirmed', 'pending'])
                .lt('check_in', endStr)
                .gt('check_out', startStr);

            const map: any = {};
            
            pRooms?.forEach(r => {
                if (!map[r.category_id]) map[r.category_id] = { total: 0, available: 0, booked: 0, pRooms: [] };
                map[r.category_id].total++;
                map[r.category_id].pRooms.push(r);
            });
            
            // Map booked rooms to the rooms list
            bookings?.forEach(b => {
                if (map[b.category_id]) {
                    map[b.category_id].booked++;
                }
            });

            // Calculate final avail
            Object.keys(map).forEach(k => {
                map[k].available = Math.max(0, map[k].total - map[k].booked);
            });

            setAvailabilityMap(map);
        }
        
        fetchAvailability();
    }, [searchRange?.from, searchRange?.to]);


    const banner = (siteImages as any[]).find(img => img.image_key === 'stay_banner')?.image_url || heroImg;
    const siteLogo = (siteImages as any[]).find(img => img.image_key === 'site_logo')?.image_url;

    return (
        <div className="min-h-screen bg-background flex flex-col font-body">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[65vh] w-full mt-20 md:mt-0">
                <img src={banner} alt="Rooms" className="w-full h-full object-cover select-none pointer-events-none filter brightness-[0.8]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
                
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    <span className="px-4 py-1.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white/90 text-[10px] tracking-widest uppercase mb-6 font-medium">
                        The Blue City Haven Experience
                    </span>
                    <h1 className="font-heading text-5xl md:text-7xl font-light text-white drop-shadow-md">Our Rooms & Suites</h1>
                    <p className="font-body text-base md:text-lg text-white/90 mt-6 max-w-2xl font-light leading-relaxed">
                        Thoughtfully designed spaces blending classical heritage with elegant comfort for a truly memorable stay.
                    </p>
                </motion.div>
                
                {/* Modern Availability Search Bar absolute on bottom of Hero */}
                <div className="absolute -bottom-8 left-0 right-0 z-20 flex justify-center px-4">
                    <div className="bg-background rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col md:flex-row gap-3 w-full max-w-xl items-center border">
                        <Popover.Root>
                            <Popover.Trigger asChild>
                                <Button variant="ghost" className="flex-1 justify-start h-12 w-full text-left font-normal border-r border-border rounded-none hover:bg-secondary/20">
                                    <CalendarIcon className="mr-3 h-5 w-5 text-accent" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Stay Dates</p>
                                        <p className="font-medium text-sm">
                                            {searchRange?.from && searchRange?.to ? 
                                                `${format(searchRange.from, 'MMM d')} - ${format(searchRange.to, 'MMM d')}`  
                                                : "Select Dates"
                                            }
                                        </p>
                                    </div>
                                </Button>
                            </Popover.Trigger>
                            <Popover.Portal>
                                <Popover.Content className="z-50 bg-background border shadow-xl rounded-xl p-3" align="center">
                                    <DayPicker
                                        mode="range"
                                        selected={searchRange}
                                        onSelect={setSearchRange}
                                        disabled={[{ before: new Date() }]}
                                        numberOfMonths={1}
                                    />
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>
                        
                        <div className="px-4 text-center md:text-left text-xs text-muted-foreground flex items-center justify-center font-medium opacity-80 h-10">
                            Check real-time availability below
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-32" ref={ref}>
                {isLoading ? (
                    <div className="text-center py-24 flex justify-center items-center flex-col gap-4">
                        {siteLogo ? (
                            <img src={siteLogo} alt="Loading..." className="w-16 h-16 object-contain animate-pulse" />
                        ) : (
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        )}
                        <p className="text-muted-foreground text-sm tracking-widest uppercase inline-block">Loading Rooms...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No rooms are currently available.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room: any, i: number) => {
                            const avail = availabilityMap[room.id]?.available ?? room.capacity ?? 1;
                            return (
                                <RoomCard 
                                    key={room.id || i} 
                                    room={room} 
                                    index={i} 
                                    inView={inView} 
                                    availability={avail}
                                    onBook={() => setSelectedRoomToBook(room)}
                                />
                            )
                        })}
                    </div>
                )}
            </main>

            {selectedRoomToBook && (
                <BookingModal 
                    initialCategory={selectedRoomToBook}
                    initialRange={searchRange}
                    allCategories={rooms}
                    availabilityMap={availabilityMap}
                    onClose={() => setSelectedRoomToBook(null)}
                />
            )}

            <Footer />
        </div>
    );
}
