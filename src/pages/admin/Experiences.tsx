import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Pencil, Loader2, X, Save, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ExperienceImage {
    id?: string;
    image_url: string;
    order_index: number;
}

interface Experience {
    id: string;
    title: string;
    description: string;
    image_url: string;
    display_order: number;
    images?: ExperienceImage[];
}

export default function Experiences() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        display_order: "0",
    });
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchExperiences();
    }, []);

    async function fetchExperiences() {
        setLoading(true);
        const { data, error } = await supabase
            .from("experiences")
            .select("*, experience_images(id, image_url, order_index)")
            .order("display_order", { ascending: true });

        if (error) {
            toast.error("Failed to load: " + error.message);
        } else {
            const processed = (data || []).map((exp: any) => ({
                ...exp,
                images: (exp.experience_images || []).sort((a: any, b: any) => a.order_index - b.order_index),
            }));
            setExperiences(processed);
        }
        setLoading(false);
    }

    const openNew = () => {
        setEditingExp(null);
        setForm({ title: "", description: "", display_order: "0" });
        setImages([]);
        setIsDialogOpen(true);
    };

    const openEdit = (exp: Experience) => {
        setEditingExp(exp);
        setForm({
            title: exp.title,
            description: exp.description || "",
            display_order: exp.display_order?.toString() || "0",
        });
        setImages((exp.images || []).map((img) => img.image_url));
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        const newImages = [...images];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split(".").pop();
            const path = `experiences/${Date.now()}-${Math.random()}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from("experiences").upload(path, file);
            if (uploadErr) {
                toast.error("Upload failed: " + uploadErr.message);
                continue;
            }
            const { data } = supabase.storage.from("experiences").getPublicUrl(path);
            newImages.push(data.publicUrl);
        }

        setImages(newImages);
        setUploading(false);
        // Reset input
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };

    const moveImage = (index: number, direction: "up" | "down") => {
        const updated = [...images];
        if (direction === "up" && index > 0) {
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        } else if (direction === "down" && index < updated.length - 1) {
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        }
        setImages(updated);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return toast.error("Title is required");
        setSaving(true);

        const payload = {
            title: form.title,
            description: form.description,
            display_order: parseInt(form.display_order) || 0,
            // keep backward-compat image_url as first image
            image_url: images[0] || "",
        };

        let expId = editingExp?.id;

        if (editingExp) {
            const { error } = await supabase.from("experiences").update(payload).eq("id", editingExp.id);
            if (error) { toast.error(error.message); setSaving(false); return; }
        } else {
            const { data, error } = await supabase.from("experiences").insert([payload]).select().single();
            if (error) { toast.error(error.message); setSaving(false); return; }
            expId = data.id;
        }

        // Sync experience_images table
        await supabase.from("experience_images").delete().eq("experience_id", expId);
        if (images.length > 0) {
            const imgPayload = images.map((url, idx) => ({
                experience_id: expId,
                image_url: url,
                order_index: idx,
            }));
            const { error: imgErr } = await supabase.from("experience_images").insert(imgPayload);
            if (imgErr) toast.error("Images saved partially: " + imgErr.message);
        }

        toast.success(editingExp ? "Experience updated!" : "Experience added!");
        setSaving(false);
        setIsDialogOpen(false);
        fetchExperiences();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this experience?")) return;
        const { error } = await supabase.from("experiences").delete().eq("id", id);
        if (error) toast.error(error.message);
        else { toast.success("Deleted"); fetchExperiences(); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Curated Experiences</h2>
                    <p className="text-muted-foreground mt-1">
                        Each experience can have multiple images — they display as a slider on the website.
                    </p>
                </div>
                <Button onClick={openNew} className="gap-2">
                    <Plus size={16} /> Add Experience
                </Button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            ) : experiences.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg text-muted-foreground">
                    No experiences yet. Click "Add Experience" to get started.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {experiences.map((exp) => (
                        <Card key={exp.id} className="overflow-hidden group">
                            {/* Image preview */}
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {exp.images && exp.images.length > 0 ? (
                                    <img
                                        src={exp.images[0].image_url}
                                        alt={exp.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : exp.image_url ? (
                                    <img
                                        src={exp.image_url}
                                        alt={exp.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Upload size={32} />
                                    </div>
                                )}
                                <Badge className="absolute top-2 right-2 bg-black/60 text-white border-none text-[10px]">
                                    {exp.images?.length || (exp.image_url ? 1 : 0)} image{(exp.images?.length || 0) !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-slate-800">{exp.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{exp.description}</p>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(exp)}>
                                        <Pencil size={12} /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(exp.id)}>
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingExp ? "Edit Experience" : "Add New Experience"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 pt-2">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Rooftop Sunset Tour"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe this experience..."
                            />
                        </div>

                        {/* Display Order */}
                        <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.display_order}
                                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Lower number = shown first</p>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-2">
                            <Label>Cover Image (Required)</Label>
                            <div className="flex gap-2 items-center">
                                <Label className="border-2 border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted transition-colors w-full text-center flex justify-center items-center gap-2">
                                    {uploading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Upload size={16} />
                                    )}
                                    <span className="text-sm font-medium">
                                        Upload Cover Image
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setUploading(true);
                                            const ext = file.name.split(".").pop();
                                            const path = `experiences/cover-${Date.now()}-${Math.random()}.${ext}`;
                                            const { error } = await supabase.storage.from("experiences").upload(path, file);
                                            if (!error) {
                                                const { data } = supabase.storage.from("experiences").getPublicUrl(path);
                                                // If there's already a cover image, replace it at index 0 or add it
                                                if (images.length === 0) {
                                                    setImages([data.publicUrl]);
                                                } else {
                                                    const newImages = [...images];
                                                    // we don't have a dedicated cover url, let's keep it as first image for schema compat
                                                    newImages[0] = data.publicUrl;
                                                    setImages(newImages);
                                                }
                                            }
                                            setUploading(false);
                                        }}
                                        disabled={uploading}
                                    />
                                </Label>
                                {images.length > 0 && (
                                     <img src={images[0]} alt="" className="w-12 h-12 rounded object-cover border" />
                                )}
                            </div>
                        </div>

                        {/* Multi-Image Upload */}
                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Slider Images</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Add multiple images here. They will display as a slider.
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                    {Math.max(0, images.length - 1)} image{Math.max(0, images.length - 1) !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Upload Button */}
                            <Label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted transition-colors w-full justify-center">
                                {uploading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Upload size={16} />
                                )}
                                <span className="text-sm font-medium">
                                    {uploading ? "Uploading..." : "Click to add slider images (You can select multiple files)"}
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </Label>

                            {/* Image Grid */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {images.slice(1).map((url, idx) => {
                                        const actualIdx = idx + 1; // offset by 1 for cover
                                        return (
                                        <div key={actualIdx} className="relative aspect-square group rounded-md overflow-hidden border">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            {/* Order badge */}
                                            <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {idx + 1}
                                            </div>
                                            {/* Controls */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(actualIdx, "up")}
                                                    disabled={actualIdx === 1}
                                                    className="w-7 h-7 bg-white/90 rounded flex items-center justify-center disabled:opacity-30 hover:bg-white"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(actualIdx)}
                                                    className="w-7 h-7 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(actualIdx, "down")}
                                                    disabled={actualIdx === images.length - 1}
                                                    className="w-7 h-7 bg-white/90 rounded flex items-center justify-center disabled:opacity-30 hover:bg-white"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                            {images.length <= 1 && (
                                <p className="text-xs text-muted-foreground text-center py-4 bg-slate-50 rounded-lg border">
                                    No slider images yet.
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {editingExp ? "Update Experience" : "Save Experience"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
