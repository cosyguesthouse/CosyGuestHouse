import { useEffect, useState } from "react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Loader2, UploadCloud, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { compressImage, formatFileSize } from "@/lib/imageCompression";

const CalendarPricingEditor = ({ value, onChange }: { value: any, onChange: (v: any) => void }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [pricingTab, setPricingTab] = useState("single");
    
    const [singleDate, setSingleDate] = useState("");
    const [singlePrice, setSinglePrice] = useState("");
    
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [rangePrice, setRangePrice] = useState("");
    
    const [monthInput, setMonthInput] = useState("");
    const [monthPrice, setMonthPrice] = useState("");

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });
    
    const startDayOfWeek = getDay(startOfMonth(currentMonth));
    const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => i);
    
    const getPriceBadge = (dateStr: string) => {
        if (value?.datePricing?.[dateStr]) return { type: 'single', price: value.datePricing[dateStr] };
        if (Array.isArray(value?.rangePricing)) {
            const range = value.rangePricing.find((r: any) => dateStr >= r.start && dateStr <= r.end);
            if (range) return { type: 'range', price: range.price };
        }
        const monthStr = dateStr.substring(0, 7);
        if (value?.monthlyPricing?.[monthStr]) return { type: 'month', price: value.monthlyPricing[monthStr] };
        return null;
    };

    const safeFormat = (dateStr: string, fmt: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr.replace("-01", ""); // fallback for invalid dates
            return format(d, fmt);
        } catch {
            return dateStr.replace("-01", "");
        }
    };

    const handleAddSingle = () => {
        if (!singleDate || !singlePrice) return toast.error("Enter date and price");
        const val = { ...value, datePricing: { ...(value?.datePricing || {}), [singleDate]: Number(singlePrice) } };
        onChange(val);
        setSinglePrice("");
    };

    const handleAddRange = () => {
        if (!rangeStart || !rangeEnd || !rangePrice) return toast.error("Enter start, end and price");
        if (rangeStart > rangeEnd) return toast.error("Start date must be before end date");
        const newRange = { start: rangeStart, end: rangeEnd, price: Number(rangePrice) };
        const val = { ...value, rangePricing: [...(value?.rangePricing || []), newRange] };
        onChange(val);
        setRangeStart(""); setRangeEnd(""); setRangePrice("");
    };

    const handleAddMonth = () => {
        if (!monthInput || !monthPrice) return toast.error("Select month and price");
        const val = { ...value, monthlyPricing: { ...(value?.monthlyPricing || {}), [monthInput]: Number(monthPrice) } };
        onChange(val);
        setMonthInput(""); setMonthPrice("");
    };

    const handleRemoveSingle = (d: string) => {
        const next = { ...value?.datePricing };
        delete next[d];
        onChange({ ...value, datePricing: next });
    };

    const handleRemoveRange = (idx: number) => {
        const next = [...(value?.rangePricing || [])];
        next.splice(idx, 1);
        onChange({ ...value, rangePricing: next });
    };

    const handleRemoveMonth = (m: string) => {
        const next = { ...value?.monthlyPricing };
        delete next[m];
        onChange({ ...value, monthlyPricing: next });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1 border rounded-md p-4 bg-white shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                       <Button type="button" variant="outline" size="sm" onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}><ChevronLeft size={16}/></Button>
                       <h4 className="font-semibold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h4>
                       <Button type="button" variant="outline" size="sm" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}><ChevronRight size={16}/></Button>
                   </div>
                   <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2 text-slate-500">
                       {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                   </div>
                   <div className="grid grid-cols-7 gap-1">
                       {blanks.map(b => <div key={`blank-${b}`} className="h-12"></div>)}
                       {daysInMonth.map(day => {
                           const dateStr = format(day, 'yyyy-MM-dd');
                           const badge = getPriceBadge(dateStr);
                           return (
                               <div key={dateStr} 
                                    className={`h-12 border rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-slate-50
                                        ${badge?.type === 'single' ? 'bg-red-50 border-red-200' : ''}
                                        ${badge?.type === 'range' ? 'bg-amber-50 border-amber-200' : ''}
                                        ${badge?.type === 'month' ? 'bg-blue-50 border-blue-200' : ''}
                                    `}
                                    onClick={() => { setPricingTab('single'); setSingleDate(dateStr); }}
                               >
                                   <span className="text-sm font-medium text-slate-700">{format(day, 'd')}</span>
                                   {badge && <span className={`text-[9px] font-bold ${badge.type==='single'?'text-red-600':badge.type==='range'?'text-amber-600':'text-blue-600'}`}>₹{badge.price}</span>}
                               </div>
                           )
                       })}
                   </div>
                   
                   <div className="flex gap-4 mt-6 text-[10px] text-muted-foreground justify-center uppercase font-bold tracking-wider">
                       <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border-red-200 border rounded-sm"></div> Single Date</span>
                       <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 border-amber-200 border rounded-sm"></div> Range</span>
                       <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 border-blue-200 border rounded-sm"></div> Month</span>
                   </div>
               </div>
               
               <div className="flex-1 space-y-4">
                  <div className="flex gap-2 border-b pb-2">
                      <Button type="button" variant={pricingTab === 'single' ? 'default' : 'ghost'} size="sm" onClick={() => setPricingTab('single')}>Specific Date</Button>
                      <Button type="button" variant={pricingTab === 'range' ? 'default' : 'ghost'} size="sm" onClick={() => setPricingTab('range')}>Date Range</Button>
                      <Button type="button" variant={pricingTab === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setPricingTab('month')}>Full Month</Button>
                  </div>
                  
                  {pricingTab === 'single' && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-md border">
                          <h4 className="text-sm font-semibold text-slate-800">Set Price for Specific Date</h4>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                  <Label className="text-[10px] uppercase">Date</Label>
                                  <Input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                  <Label className="text-[10px] uppercase">Price (₹)</Label>
                                  <Input type="number" placeholder="Price" value={singlePrice} onChange={e => setSinglePrice(e.target.value)} />
                              </div>
                          </div>
                          <Button type="button" size="sm" className="w-full mt-2" onClick={handleAddSingle}>Set Day Price</Button>
                          
                          <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                              {Object.entries(value?.datePricing || {}).map(([d, p]) => (
                                  <div key={d} className="flex justify-between items-center text-xs bg-white p-2.5 border rounded shadow-sm">
                                      <span className="font-medium text-slate-700">{safeFormat(d, 'dd MMM yyyy')}</span>
                                      <div className="flex items-center gap-3">
                                          <span className="font-semibold text-red-600">₹{p as number}</span>
                                          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveSingle(d)}><X size={14}/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {pricingTab === 'range' && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-md border">
                          <h4 className="text-sm font-semibold text-slate-800">Set Price for Date Range</h4>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                  <Label className="text-[10px] uppercase">Start Date</Label>
                                  <Input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                  <Label className="text-[10px] uppercase">End Date</Label>
                                  <Input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <Label className="text-[10px] uppercase">Price per night (₹)</Label>
                              <Input type="number" placeholder="Price" value={rangePrice} onChange={e => setRangePrice(e.target.value)} />
                          </div>
                          <Button type="button" size="sm" className="w-full mt-2" onClick={handleAddRange}>Set Range Price</Button>
                          
                          <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                              {(Array.isArray(value?.rangePricing) ? value.rangePricing : []).map((r: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-xs bg-white p-2.5 border rounded shadow-sm">
                                      <span className="font-medium text-slate-700">{safeFormat(r.start, 'dd MMM')} - {safeFormat(r.end, 'dd MMM yyyy')}</span>
                                      <div className="flex items-center gap-3">
                                          <span className="font-semibold text-amber-600">₹{r.price}</span>
                                          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveRange(i)}><X size={14}/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {pricingTab === 'month' && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-md border">
                          <h4 className="text-sm font-semibold text-slate-800">Set Price for Full Month</h4>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                  <Label className="text-[10px] uppercase">Month</Label>
                                  <Input type="month" value={monthInput} onChange={e => setMonthInput(e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                  <Label className="text-[10px] uppercase">Price per night (₹)</Label>
                                  <Input type="number" placeholder="Price" value={monthPrice} onChange={e => setMonthPrice(e.target.value)} />
                              </div>
                          </div>
                          <Button type="button" size="sm" className="w-full mt-2" onClick={handleAddMonth}>Set Month Price</Button>
                          
                          <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                              {Object.entries(value?.monthlyPricing || {}).map(([m, p]) => (
                                  <div key={m} className="flex justify-between items-center text-xs bg-white p-2.5 border rounded shadow-sm">
                                      <span className="font-medium text-slate-700">{safeFormat(m + "-01", 'MMMM yyyy')}</span>
                                      <div className="flex items-center gap-3">
                                          <span className="font-semibold text-blue-600">₹{p as number}</span>
                                          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveMonth(m)}><X size={14}/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
               </div>
            </div>
        </div>
    );
};

export default function AdminRooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        category_name: "",
        description: "",
        features: "",
        price: "",
        capacity: "2",
        images: [] as { url: string; id?: string }[],
        seasonal_prices: { datePricing: {}, rangePricing: [], monthlyPricing: {} } as any,
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    async function fetchRooms() {
        setLoading(true);
        const { data, error } = await supabase
            .from("room_categories")
            .select("*, room_images(id, image_url, display_order)")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Error fetching rooms: " + error.message);
        } else {
            // Sort images by display_order
            const processedRooms = data?.map(room => ({
                ...room,
                room_images: room.room_images ? room.room_images.sort((a: any, b: any) => a.display_order - b.display_order) : []
            })) || [];
            setRooms(processedRooms);
        }
        setLoading(false);
    }

    const handleOpenNew = () => {
        setEditingId(null);
        setFormData({ category_name: "", description: "", features: "", price: "", capacity: "2", images: [], seasonal_prices: { datePricing: {}, rangePricing: [], monthlyPricing: {} } });
        setIsDialogOpen(true);
    };

    const handleEdit = (room: any) => {
        try {
            setEditingId(room.id);
            const mappedImages = room.room_images ? room.room_images.map((img: any) => ({ url: img.image_url, id: img.id })) : [];
            setFormData({
                category_name: room.category_name || "",
                description: room.description || "",
                features: Array.isArray(room.features) ? room.features.join(", ") : (typeof room.features === 'string' ? room.features : ""),
                price: room.price || "",
                capacity: room.capacity?.toString() || "2",
                images: mappedImages,
                seasonal_prices: room.seasonal_prices && typeof room.seasonal_prices === 'object' && !Array.isArray(room.seasonal_prices) && 'datePricing' in room.seasonal_prices ? room.seasonal_prices : { datePricing: {}, rangePricing: [], monthlyPricing: {} },
            });
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Error in handleEdit:", error);
            toast.error("Failed to load room data for editing.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room?")) return;

        const { error } = await supabase.from("room_categories").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete category: " + error.message);
        } else {
            toast.success("Category deleted successfully");
            fetchRooms();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages = [...formData.images];

        for (let i = 0; i < files.length; i++) {
            const originalFile = files[i];
            const { file, originalSize, compressedSize, savedPercent } = await compressImage(originalFile);
            if (savedPercent > 0) toast.success(`Compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${savedPercent}% saved)`);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `rooms/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('rooms')
                .upload(filePath, file);

            if (uploadError) {
                toast.error('Error uploading image: ' + uploadError.message);
                continue;
            }

            const { data } = supabase.storage.from('rooms').getPublicUrl(filePath);
            newImages.push({ url: data.publicUrl });
        }

        setFormData(prev => ({
            ...prev,
            images: newImages
        }));

        setUploading(false);
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...formData.images];
        if (direction === 'up' && index > 0) {
            const temp = newImages[index - 1];
            newImages[index - 1] = newImages[index];
            newImages[index] = temp;
        } else if (direction === 'down' && index < newImages.length - 1) {
            const temp = newImages[index + 1];
            newImages[index + 1] = newImages[index];
            newImages[index] = temp;
        }
        setFormData({ ...formData, images: newImages });
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            category_name: formData.category_name,
            description: formData.description,
            features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
            price: formData.price ? parseFloat(formData.price) : null,
            capacity: formData.capacity ? parseInt(formData.capacity, 10) : 2,
            seasonal_prices: formData.seasonal_prices,
        };

        let roomId = editingId;

        // 1. Save or Update Room Category
        if (roomId) {
            const { error: updateErr } = await supabase.from("room_categories").update(payload).eq("id", roomId);
            if (updateErr) {
                toast.error("Error updating category: " + updateErr.message);
                setLoading(false);
                return;
            }
        } else {
            const { data: newRoom, error: insertErr } = await supabase.from("room_categories").insert([payload]).select().single();
            if (insertErr) {
                toast.error("Error creating category: " + insertErr.message);
                setLoading(false);
                return;
            }
            roomId = newRoom.id;
        }

        // 2. Clear old room images
        const { error: deleteImagesError } = await supabase.from("room_images").delete().eq("room_id", roomId);
        if (deleteImagesError) {
            console.error("Failed to clear old images:", deleteImagesError);
        }

        // 3. Insert new images mapped with updated display orders
        if (formData.images.length > 0) {
            const formattedImages = formData.images.map((img, idx) => ({
                room_id: roomId,
                image_url: img.url,
                display_order: idx
            }));
            const { error: insertImagesErr } = await supabase.from("room_images").insert(formattedImages);
            if (insertImagesErr) {
                toast.error("Error saving room images: " + insertImagesErr.message);
            }
        }

        toast.success(editingId ? "Room updated!" : "Room created!");
        setIsDialogOpen(false);
        fetchRooms();
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Room Categories Management</h2>
                    <p className="text-muted-foreground mt-2">Add, edit, and delete room categories.</p>
                </div>
                <Button onClick={handleOpenNew} className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Category
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No rooms found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell>
                                            {room.room_images && room.room_images.length > 0 ? (
                                                <div className="h-12 w-20 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                                                    <img src={room.room_images[0]?.image_url} alt={room.name} className="object-cover h-full w-full" />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-20 rounded bg-slate-200 flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{room.category_name}</TableCell>
                                        <TableCell>{room.price ? `₹${room.price}` : "N/A"}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2 mt-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(room)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDelete(room.id)} className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription>Fill out the details below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category_name">Category Name</Label>
                            <Input id="category_name" value={formData.category_name} onChange={e => setFormData({ ...formData, category_name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="features">Features (comma-separated)</Label>
                                <Input id="features" placeholder="AC, WiFi, Fort View" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input id="price" type="number" placeholder="4500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity (Guests)</Label>
                            <Input id="capacity" type="number" placeholder="2" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                        </div>

                        {/* Calendar Pricing Section */}
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Label className="text-base font-semibold">Calendar Pricing (Advanced)</Label>
                                    <p className="text-xs text-muted-foreground mt-1">Override base price for specific dates, ranges, or full months. Priorities: Date &gt; Range &gt; Month &gt; Base Price.</p>
                                </div>
                                <div className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded uppercase font-bold tracking-wider">Optional</div>
                            </div>
                            
                            <CalendarPricingEditor 
                                value={formData.seasonal_prices}
                                onChange={(val) => setFormData({ ...formData, seasonal_prices: val })}
                            />
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <Label className="text-base font-semibold">Gallery Images</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Button type="button" variant="outline" className="relative cursor-pointer overflow-hidden group">
                                    <div className="flex items-center gap-2 pointer-events-none">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                        <span>Upload Images</span>
                                    </div>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                        accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.heic,.nef"
                                        multiple
                                        disabled={uploading}
                                    />
                                </Button>
                                <span className="text-xs text-muted-foreground">Select multiple images at once. Use arrows to reorder.</span>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-4 bg-slate-50 p-4 border rounded-md">
                                {formData.images.length === 0 && <span className="text-sm text-slate-500 italic">No images added yet.</span>}
                                {formData.images.map((img, i) => (
                                    <div key={i} className="relative group w-24 h-24 shrink-0 shadow-sm">
                                        <img src={img.url} alt="" className="w-full h-full object-cover border rounded-md" />
                                        <div className="absolute top-1 left-1 flex gap-1 bg-white/90 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition p-0.5">
                                            <button type="button" onClick={() => moveImage(i, 'up')} disabled={i === 0}>
                                                <ChevronUp className="w-4 h-4 text-slate-600 hover:text-black" />
                                            </button>
                                            <button type="button" onClick={() => moveImage(i, 'down')} disabled={i === formData.images.length - 1}>
                                                <ChevronDown className="w-4 h-4 text-slate-600 hover:text-black" />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="mt-8 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Room
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
