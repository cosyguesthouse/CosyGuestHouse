import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Loader2, Upload, X, Save } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

export default function AdminStories() {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        cover_image: "",
        publish_date: new Date().toISOString().split("T")[0],
    });

    // Multi-image state (for story_images table)
    const [sliderImages, setSliderImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    useEffect(() => {
        fetchStories();
    }, []);

    async function fetchStories() {
        setLoading(true);
        const { data, error } = await supabase
            .from("travel_stories")
            .select("*, story_images(image_url, order_index)")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Error fetching stories: " + error.message);
        } else {
            const processed = (data || []).map((s: any) => ({
                ...s,
                images: (s.story_images || [])
                    .sort((a: any, b: any) => a.order_index - b.order_index)
                    .map((img: any) => img.image_url),
            }));
            setStories(processed);
        }
        setLoading(false);
    }

    const openNew = () => {
        setEditingId(null);
        setFormData({
            title: "",
            slug: "",
            description: "",
            content: "",
            cover_image: "",
            publish_date: new Date().toISOString().split("T")[0],
        });
        setSliderImages([]);
        setIsDialogOpen(true);
    };

    const openEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            slug: item.slug || "",
            description: item.description || "",
            content: item.content || "",
            cover_image: item.cover_image || "",
            publish_date: item.publish_date || new Date().toISOString().split("T")[0],
        });
        setSliderImages(item.images || []);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this story?")) return;
        const { error } = await supabase.from("travel_stories").delete().eq("id", id);
        if (error) toast.error("Failed to delete: " + error.message);
        else { toast.success("Story deleted"); fetchStories(); }
    };

    // Cover image upload
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;
        setUploadingCover(true);
        const file = await compressImage(originalFile);
        const ext = file.name.split(".").pop();
        const path = `stories/cover-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("stories").upload(path, file);
        if (error) { toast.error("Upload failed: " + error.message); }
        else {
            const { data } = supabase.storage.from("stories").getPublicUrl(path);
            setFormData((prev) => ({ ...prev, cover_image: data.publicUrl }));
        }
        setUploadingCover(false);
        e.target.value = "";
    };

    // Slider/gallery images upload — saves to story_images table
    const handleSliderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        const newImages = [...sliderImages];

        for (let i = 0; i < files.length; i++) {
            const originalFile = files[i];
            const file = await compressImage(originalFile);
            const ext = file.name.split(".").pop();
            const path = `stories/slider-${Date.now()}-${Math.random()}.${ext}`;
            const { error } = await supabase.storage.from("stories").upload(path, file);
            if (error) { toast.error("Upload failed: " + error.message); continue; }
            const { data } = supabase.storage.from("stories").getPublicUrl(path);
            newImages.push(data.publicUrl);
        }

        setSliderImages(newImages);
        setUploading(false);
        e.target.value = "";
    };

    const removeSliderImage = (index: number) => {
        const updated = [...sliderImages];
        updated.splice(index, 1);
        setSliderImages(updated);
    };

    const moveSliderImage = (index: number, dir: "up" | "down") => {
        const updated = [...sliderImages];
        if (dir === "up" && index > 0) [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        if (dir === "down" && index < updated.length - 1) [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setSliderImages(updated);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData((prev) => ({
            ...prev,
            title,
            slug: editingId ? prev.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            title: formData.title,
            slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
            description: formData.description,
            content: formData.content,
            cover_image: formData.cover_image,
            publish_date: formData.publish_date,
        };

        let storyId = editingId;

        if (editingId) {
            const { error } = await supabase.from("travel_stories").update(payload).eq("id", editingId);
            if (error) { toast.error(error.message); setSaving(false); return; }
        } else {
            const { data, error } = await supabase.from("travel_stories").insert([payload]).select().single();
            if (error) { toast.error(error.message); setSaving(false); return; }
            storyId = data.id;
        }

        // Sync story_images table
        await supabase.from("story_images").delete().eq("story_id", storyId);
        if (sliderImages.length > 0) {
            const imgPayload = sliderImages.map((url, idx) => ({
                story_id: storyId,
                image_url: url,
                order_index: idx,
            }));
            const { error: imgErr } = await supabase.from("story_images").insert(imgPayload);
            if (imgErr) toast.error("Slider images save failed: " + imgErr.message);
        }

        toast.success(editingId ? "Story updated!" : "Story created!");
        setSaving(false);
        setIsDialogOpen(false);
        fetchStories();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Travel Stories</h2>
                    <p className="text-muted-foreground mt-1">
                        Each story has a cover image + a multi-image slider shown on the stories page.
                    </p>
                </div>
                <Button onClick={openNew} className="gap-2">
                    <PlusCircle size={16} /> Add Story
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Cover</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Slider Images</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && stories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : stories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No travel stories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stories.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="h-12 w-20 rounded overflow-hidden bg-slate-100">
                                                {item.cover_image ? (
                                                    <img src={item.cover_image} alt={item.title} className="object-cover h-full w-full" />
                                                ) : item.images?.[0] ? (
                                                    <img src={item.images[0]} alt={item.title} className="object-cover h-full w-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-200" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs">
                                                {item.images?.length || 0} image{item.images?.length !== 1 ? "s" : ""}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.publish_date ? new Date(item.publish_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(v) => setIsDialogOpen(v)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Story" : "Add New Story"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title + Slug */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input required value={formData.title} onChange={handleTitleChange} placeholder="e.g. A Day in Blue City" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (URL)</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="auto-generated"
                                />
                            </div>
                        </div>

                        {/* Date + Cover Image */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Publish Date</Label>
                                <Input
                                    type="date"
                                    value={formData.publish_date}
                                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cover Image</Label>
                                <div className="flex gap-2 items-center">
                                    <Label className="border rounded px-3 py-2 cursor-pointer hover:bg-muted flex items-center gap-2 text-sm flex-shrink-0">
                                        {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {uploadingCover ? "Uploading..." : "Upload Cover"}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                                    </Label>
                                    {formData.cover_image && (
                                        <img src={formData.cover_image} alt="" className="w-10 h-10 rounded object-cover border" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Short Description (shown on cards)</Label>
                            <Textarea
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="A short summary of this travel story..."
                            />
                        </div>

                        {/* Full Content */}
                        <div className="space-y-2">
                            <Label>Full Content (optional — HTML/Markdown)</Label>
                            <Textarea
                                rows={6}
                                className="font-mono text-sm"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write the full story here..."
                            />
                        </div>

                        {/* ===== SLIDER IMAGES ===== */}
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Slider Images</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        These images display as an auto-slider on the Stories page. First image is also used as cover if no cover is set.
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                    {sliderImages.length} image{sliderImages.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Upload Area */}
                            <Label className="flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-4 cursor-pointer hover:bg-muted transition-colors">
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                <span className="font-medium text-sm">
                                    {uploading ? "Uploading images..." : "Click to upload slider images (select multiple)"}
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleSliderUpload}
                                    disabled={uploading}
                                />
                            </Label>

                            {/* Image Grid */}
                            {sliderImages.length > 0 ? (
                                <div className="grid grid-cols-5 gap-2">
                                    {sliderImages.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square group rounded overflow-hidden border">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            {/* Index badge */}
                                            <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded">
                                                #{idx + 1}
                                            </div>
                                            {/* Controls on hover */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSliderImage(idx, "up")}
                                                        disabled={idx === 0}
                                                        className="w-6 h-6 bg-white/90 rounded text-xs flex items-center justify-center disabled:opacity-30"
                                                    >↑</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSliderImage(idx, "down")}
                                                        disabled={idx === sliderImages.length - 1}
                                                        className="w-6 h-6 bg-white/90 rounded text-xs flex items-center justify-center disabled:opacity-30"
                                                    >↓</button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSliderImage(idx)}
                                                    className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-xs text-muted-foreground py-6 bg-slate-50 rounded-lg border">
                                    No slider images yet. Upload images above — they'll slide automatically on the website.
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving} className="gap-2">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {editingId ? "Update Story" : "Save Story"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
