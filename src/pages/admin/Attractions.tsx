import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Upload, MapPin, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { compressImage } from "@/lib/imageCompression";

export default function AdminAttractions() {
    const [attractions, setAttractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        id: "",
        title: "",
        description: "",
        location: "",
        images: [] as string[]
    });

    useEffect(() => { fetchAttractions(); }, []);

    async function fetchAttractions() {
        setLoading(true);
        const { data, error } = await supabase
            .from('attractions')
            .select('*, attraction_images(image_url, order_index)')
            .order('created_at', { ascending: false });
        
        if (error) {
            toast.error(error.message);
        } else {
            const processed = data?.map(attr => ({
                ...attr,
                images: attr.attraction_images?.sort((a: any, b: any) => a.order_index - b.order_index).map((img: any) => img.image_url) || []
            })) || [];
            setAttractions(processed);
        }
        setLoading(false);
    }

    const resetForm = (attr?: any) => {
        if (attr) {
            setForm({
                id: attr.id,
                title: attr.title,
                description: attr.description || "",
                location: attr.location || "",
                images: attr.images || []
            });
        } else {
            setForm({ id: "", title: "", description: "", location: "", images: [] });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { id, title, description, location, images } = form;
        const payload = { title, description, location };

        let attrId = id;
        if (id) {
            await supabase.from('attractions').update(payload).eq('id', id);
        } else {
            const { data } = await supabase.from('attractions').insert([payload]).select().single();
            attrId = data.id;
        }

        // Handle Images
        await supabase.from('attraction_images').delete().eq('attraction_id', attrId);
        if (images.length > 0) {
            const imgPayload = images.map((url, index) => ({
                attraction_id: attrId,
                image_url: url,
                order_index: index
            }));
            await supabase.from('attraction_images').insert(imgPayload);
        }

        toast.success(id ? "Updated" : "Created");
        setIsSaving(false);
        setIsOpen(false);
        fetchAttractions();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this attraction?")) return;
        await supabase.from('attractions').delete().eq('id', id);
        toast.success("Deleted");
        fetchAttractions();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages = [...form.images];

        for (let i = 0; i < files.length; i++) {
            const originalFile = files[i];
            const file = await compressImage(originalFile);
            const ext = file.name.split('.').pop();
            const name = `${Date.now()}-${Math.random()}.${ext}`;
            const path = `attractions/${name}`;

            const { error: uploadError } = await supabase.storage.from('attractions').upload(path, file);
            if (uploadError) {
                toast.error("Upload failed: " + uploadError.message);
                continue;
            }

            const { data } = supabase.storage.from('attractions').getPublicUrl(path);
            newImages.push(data.publicUrl);
        }

        setForm({ ...form, images: newImages });
        setUploading(false);
    };

    const removeImage = (index: number) => {
        const newImgs = [...form.images];
        newImgs.splice(index, 1);
        setForm({ ...form, images: newImgs });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Attractions Manager</h2>
                    <p className="text-muted-foreground mt-1">Manage tourist spots displayed on the Attractions page.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => resetForm()}>
                            <Plus size={16} /> Add Attraction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{form.id ? "Edit Attraction" : "Add New Attraction"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mehrangarh Fort" />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                                    <Input className="pl-9" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Fort Road, Jodhpur" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the place..." />
                            </div>
                            
                            <div className="space-y-4">
                                <Label>Gallery Images</Label>
                                <div className="grid grid-cols-4 gap-3">
                                    {form.images.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={16} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <Label className="border-2 border-dashed border-border rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                        <span className="text-[10px] mt-1 uppercase font-semibold">Upload</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </Label>
                                </div>
                            </div>

                            <Button type="submit" className="w-full gap-2" disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {form.id ? "Update Attraction" : "Save Attraction"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : attractions.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No attractions found. Start by adding one!</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attractions.map(attr => (
                        <Card key={attr.id} className="overflow-hidden group">
                            <div className="aspect-[16/10] bg-slate-100 relative">
                                {attr.images?.[0] ? (
                                    <img src={attr.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Plus size={32} /></div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => { resetForm(attr); setIsOpen(true); }}>
                                        <Upload size={14} />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(attr.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-lg">{attr.title}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin size={10} /> {attr.location || "N/A"}
                                </p>
                                <p className="text-sm text-slate-600 line-clamp-2 mt-3">{attr.description}</p>
                                <p className="text-[10px] mt-4 uppercase tracking-wider font-semibold text-accent">
                                    {attr.images?.length || 0} Images
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
