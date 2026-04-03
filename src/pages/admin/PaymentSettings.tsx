import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, UploadCloud, Trash2, QrCode } from "lucide-react";

export default function AdminPaymentSettings() {
    const [loading, setLoading] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);
    const [id, setId] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        qr_code_image_url: "",
        advance_percentage: 50,
    });

    useEffect(() => { fetchSettings(); }, []);

    async function fetchSettings() {
        const { data } = await supabase.from("payment_settings").select("*").maybeSingle();
        if (data) {
            setId(data.id);
            setSettings({
                qr_code_image_url: data.qr_code_image_url || "",
                advance_percentage: data.advance_percentage || 50,
            });
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...settings, updated_at: new Date().toISOString() };
        let error;
        if (id) {
            const { error: e } = await supabase.from("payment_settings").update(payload).eq("id", id);
            error = e;
        } else {
            const { data, error: e } = await supabase.from("payment_settings").insert([payload]).select().single();
            error = e;
            if (data) setId(data.id);
        }
        if (error) toast.error("Failed to save settings: " + error.message);
        else toast.success("Payment settings saved successfully!");
        setLoading(false);
    };

    const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoadingQR(true);
        
        const ext = file.name.split(".").pop();
        const name = `qr-${Math.random()}.${ext}`;
        const { error } = await supabase.storage.from("payment_screenshots").upload(name, file);
        
        if (error) { 
            toast.error("Upload error: " + error.message);
            setLoadingQR(false);
            return; 
        }
        
        const { data } = supabase.storage.from("payment_screenshots").getPublicUrl(name);
        setSettings(prev => ({ ...prev, qr_code_image_url: data.publicUrl }));
        setLoadingQR(false);
    };

    const removeQR = () => {
        setSettings(prev => ({ ...prev, qr_code_image_url: "" }));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Payment Settings</h2>
                <p className="text-muted-foreground mt-2">Manage QR code and advance payment percentage.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Payment Details</CardTitle>
                        <CardDescription>Configure how guests pay for their bookings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1.5">
                            <Label>Advance Payment Percentage (%)</Label>
                            <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={settings.advance_percentage} 
                                onChange={e => setSettings({ ...settings, advance_percentage: parseInt(e.target.value) || 0 })} 
                                placeholder="e.g. 50"
                            />
                            <p className="text-xs text-muted-foreground">The percentage of the total amount guests must pay in advance.</p>
                        </div>

                        <div className="space-y-3">
                            <Label>QR Code Image</Label>
                            <div className="flex flex-col gap-4">
                                {settings.qr_code_image_url ? (
                                    <div className="relative group w-48 h-48 border rounded p-2 bg-white">
                                        <img src={settings.qr_code_image_url} alt="QR Code" className="w-full h-full object-contain" />
                                        <button 
                                            type="button" 
                                            onClick={removeQR}
                                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 border-2 border-dashed rounded flex flex-col items-center justify-center gap-2 text-muted-foreground bg-slate-50">
                                        <QrCode size={40} strokeWidth={1} />
                                        <p className="text-xs">No QR Code uploaded</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" className="relative overflow-hidden gap-2">
                                        {loadingQR ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                        {settings.qr_code_image_url ? "Change QR Code" : "Upload QR Code"}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleQRUpload} 
                                            disabled={loadingQR} 
                                        />
                                    </Button>
                                    {settings.qr_code_image_url && (
                                        <p className="text-xs text-green-600">QR code ready.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={loading} className="w-full gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {loading ? "Saving..." : "Save Payment Settings"}
                </Button>
            </form>
        </div>
    );
}
