import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

const SLIDER_TYPES = [
    { key: "dining_slider", label: "Dining Slider", description: "Controls the image slider on dining cards" },
    { key: "story_slider", label: "Travel Stories Slider", description: "Controls the slider on travel story cards" },
    { key: "experience_slider", label: "Experiences Slider", description: "Controls the slider on experience cards" },
    { key: "attraction_slider", label: "Attractions Slider", description: "Controls the slider on attraction cards" },
    { key: "review_slider", label: "Reviews Slider", description: "Controls the homepage review carousel" },
];

const defaultSettings = {
    speed: 5000,
    animation_type: "slide",
    pause_on_hover: true,
    show_dots: true,
    show_arrows: true,
};

export default function AdminSliderSettings() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        setLoading(true);
        const { data } = await supabase.from("slider_settings").select("*");
        const map: Record<string, any> = {};
        SLIDER_TYPES.forEach(({ key }) => {
            const found = data?.find((s: any) => s.slider_type === key);
            map[key] = found || { ...defaultSettings, slider_type: key };
        });
        setSettings(map);
        setLoading(false);
    }

    const update = (type: string, field: string, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [type]: { ...prev[type], [field]: value },
        }));
    };

    const handleSave = async (type: string) => {
        setSaving(type);
        const s = settings[type];
        const payload = {
            slider_type: type,
            speed: s.speed,
            animation_type: s.animation_type,
            pause_on_hover: s.pause_on_hover,
            show_dots: s.show_dots,
            show_arrows: s.show_arrows,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from("slider_settings")
            .upsert(payload, { onConflict: "slider_type" });

        if (error) {
            toast.error("Failed to save: " + error.message);
        } else {
            toast.success("Slider settings saved!");
        }
        setSaving(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-7 w-7 text-primary" />
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Slider Settings</h2>
                    <p className="text-muted-foreground mt-1">
                        Control speed, animation, and behaviour of image sliders across the site.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {SLIDER_TYPES.map(({ key, label, description }) => {
                        const s = settings[key] || defaultSettings;
                        const speedSec = Math.round(s.speed / 1000);
                        return (
                            <Card key={key} className="border border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold text-slate-800">{label}</CardTitle>
                                    <CardDescription>{description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Speed */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-sm font-medium">
                                                Slide Speed
                                            </Label>
                                            <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {speedSec}s
                                            </span>
                                        </div>
                                        <Slider
                                            value={[speedSec]}
                                            min={2}
                                            max={15}
                                            step={1}
                                            onValueChange={([val]) => update(key, "speed", val * 1000)}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            How many seconds between automatic slide changes (2–15s)
                                        </p>
                                    </div>

                                    {/* Animation Type */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Transition Animation</Label>
                                        <Select
                                            value={s.animation_type || "slide"}
                                            onValueChange={(val) => update(key, "animation_type", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="slide">Slide (Opacity)</SelectItem>
                                                <SelectItem value="fade">Fade</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-4 pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium">Pause on Hover</Label>
                                                <p className="text-xs text-muted-foreground">Stop auto-sliding when user hovers</p>
                                            </div>
                                            <Switch
                                                checked={!!s.pause_on_hover}
                                                onCheckedChange={(val) => update(key, "pause_on_hover", val)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium">Show Dot Indicators</Label>
                                                <p className="text-xs text-muted-foreground">Display navigation dots below images</p>
                                            </div>
                                            <Switch
                                                checked={!!s.show_dots}
                                                onCheckedChange={(val) => update(key, "show_dots", val)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium">Show Arrow Buttons</Label>
                                                <p className="text-xs text-muted-foreground">Show prev/next chevrons on hover</p>
                                            </div>
                                            <Switch
                                                checked={!!s.show_arrows}
                                                onCheckedChange={(val) => update(key, "show_arrows", val)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full gap-2"
                                        onClick={() => handleSave(key)}
                                        disabled={saving === key}
                                    >
                                        {saving === key ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Save {label}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
