import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, UploadCloud, Trash2 } from "lucide-react";

export default function AdminSettings() {
    const [loading, setLoading] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [id, setId] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        phone: "",
        email: "",
        whatsapp: "",
        address_line1: "",
        address_line2: "",
        address_city: "",
        instagram: "",
        facebook: "",
        tripadvisor: "",
        google_maps_embed: "",
        about_content: "",
        about_images: [] as string[],
    });

    useEffect(() => { fetchSettings(); }, []);

    async function fetchSettings() {
        const { data } = await supabase.from("settings").select("*").single();
        if (data) {
            setId(data.id);
            setSettings({
                phone: data.phone || "",
                email: data.email || "",
                whatsapp: data.whatsapp || "",
                address_line1: data.address_line1 || "",
                address_line2: data.address_line2 || "",
                address_city: data.address_city || "",
                instagram: data.instagram || "",
                facebook: data.facebook || "",
                tripadvisor: data.tripadvisor || "",
                google_maps_embed: data.google_maps_embed || "",
                about_content: data.about_content || "",
                about_images: data.about_images || [],
            });
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...settings, updated_at: new Date().toISOString() };
        let error;
        if (id) {
            const { error: e } = await supabase.from("settings").update(payload).eq("id", id);
            error = e;
        } else {
            const { data, error: e } = await supabase.from("settings").insert([payload]).select().single();
            error = e;
            if (data) setId(data.id);
        }
        if (error) toast.error("Failed to save settings: " + error.message);
        else toast.success("Settings saved successfully!");
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setLoadingImages(true);
        const newImages = [...settings.about_images];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split(".").pop();
            const name = `about-${Math.random()}.${ext}`;
            const { error } = await supabase.storage.from("about").upload(name, file);
            if (error) { toast.error("Upload error: " + error.message); continue; }
            const { data } = supabase.storage.from("about").getPublicUrl(name);
            newImages.push(data.publicUrl);
        }
        setSettings(prev => ({ ...prev, about_images: newImages }));
        setLoadingImages(false);
    };

    const removeImage = (i: number) => {
        const imgs = [...settings.about_images];
        imgs.splice(i, 1);
        setSettings(prev => ({ ...prev, about_images: imgs }));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h2>
                <p className="text-muted-foreground mt-2">Manage contact info, social links, and site-wide content.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Contact Info */}
                <Card>
                    <CardHeader><CardTitle>Contact Information</CardTitle><CardDescription>Shown on the Contact page and footer</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Phone Number</Label>
                                <Input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+91 98765 43210" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Email Address</Label>
                                <Input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>WhatsApp Number (with country code)</Label>
                            <Input value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="+919876543210" />
                            <p className="text-xs text-muted-foreground">Used for the floating WhatsApp chat button. Include country code, no spaces.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Address Line 1</Label>
                            <Input value={settings.address_line1} onChange={e => setSettings({ ...settings, address_line1: e.target.value })} placeholder="27, Brahampuri, Chune ki Chowk" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Address Line 2</Label>
                                <Input value={settings.address_line2} onChange={e => setSettings({ ...settings, address_line2: e.target.value })} placeholder="Navchokiya" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>City, State, PIN</Label>
                                <Input value={settings.address_city} onChange={e => setSettings({ ...settings, address_city: e.target.value })} placeholder="Jodhpur, Rajasthan 342001" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                    <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
                            { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
                            { key: "tripadvisor", label: "TripAdvisor URL", placeholder: "https://tripadvisor.com/..." },
                        ].map(s => (
                            <div key={s.key} className="space-y-1.5">
                                <Label>{s.label}</Label>
                                <Input value={(settings as any)[s.key]} onChange={e => setSettings({ ...settings, [s.key]: e.target.value })} placeholder={s.placeholder} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Google Maps */}
                <Card>
                    <CardHeader><CardTitle>Google Maps Embed</CardTitle><CardDescription>Paste the iframe HTML from Google Maps → Share → Embed</CardDescription></CardHeader>
                    <CardContent>
                        <Textarea rows={4} value={settings.google_maps_embed}
                            onChange={e => setSettings({ ...settings, google_maps_embed: e.target.value })}
                            placeholder='<iframe src="https://www.google.com/maps/embed?..." ...' />
                    </CardContent>
                </Card>

                {/* About Content */}
                <Card>
                    <CardHeader><CardTitle>About Us Content</CardTitle><CardDescription>Text shown on the About Us page</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea rows={8} value={settings.about_content}
                            onChange={e => setSettings({ ...settings, about_content: e.target.value })}
                            placeholder="Write your guest house story here..." />

                        <div>
                            <Label>About Page Images</Label>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {settings.about_images.map((img, i) => (
                                    <div key={i} className="relative group w-24 h-24">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded border" />
                                        <button type="button" onClick={() => removeImage(i)}
                                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" className="relative overflow-hidden w-24 h-24 border-dashed flex flex-col items-center justify-center gap-1">
                                    {loadingImages ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                    <span className="text-xs">Upload</span>
                                    <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload} disabled={loadingImages} />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={loading} className="w-full gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {loading ? "Saving..." : "Save All Settings"}
                </Button>
            </form>
        </div>
    );
}
