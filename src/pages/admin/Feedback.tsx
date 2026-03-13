import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Star } from "lucide-react";

export default function AdminFeedback() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetch(); }, []);

    async function fetch() {
        setLoading(true);
        const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
        if (error) toast.error(error.message);
        else setItems(data || []);
        setLoading(false);
    }

    const del = async (id: string) => {
        if (!confirm("Delete this feedback?")) return;
        await supabase.from("feedback").delete().eq("id", id);
        toast.success("Deleted");
        fetch();
    };

    const avgRating = items.filter(i => i.rating).length > 0
        ? (items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.filter(i => i.rating).length).toFixed(1)
        : "—";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Feedback</h2>
                <p className="text-muted-foreground mt-1">Guest feedback and reviews.</p>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-6 p-6 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-4xl font-bold text-amber-600">{avgRating}</div>
                <div>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={18} className={parseFloat(avgRating as string) >= n ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Average rating from {items.filter(i => i.rating).length} reviews</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No feedback yet</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {items.map(item => (
                        <Card key={item.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        {item.email && <p className="text-xs text-muted-foreground">{item.email}</p>}
                                        <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.rating && (
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <Star key={n} size={12} className={item.rating >= n ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        )}
                                        <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => del(item.id)}>
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.message}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
