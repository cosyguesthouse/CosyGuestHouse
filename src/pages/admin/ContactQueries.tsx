import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Trash2, Eye } from "lucide-react";

export default function AdminContactQueries() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => { fetch(); }, []);

    async function fetch() {
        setLoading(true);
        const { data, error } = await supabase.from("contact_queries").select("*").order("created_at", { ascending: false });
        if (error) toast.error(error.message);
        else setItems(data || []);
        setLoading(false);
    }

    const markRead = async (id: string) => {
        await supabase.from("contact_queries").update({ is_read: true }).eq("id", id);
        fetch();
    };

    const del = async (id: string) => {
        if (!confirm("Delete this query?")) return;
        await supabase.from("contact_queries").delete().eq("id", id);
        toast.success("Deleted");
        if (selected?.id === id) setSelected(null);
        fetch();
    };

    const unread = items.filter(i => !i.is_read).length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Contact Queries</h2>
                    <p className="text-muted-foreground mt-1">Messages submitted via the Contact page.</p>
                </div>
                {unread > 0 && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">{unread} unread</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No queries yet</div>
                        ) : (
                            <div className="divide-y">
                                {items.map(item => (
                                    <button key={item.id}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${selected?.id === item.id ? "bg-slate-100" : ""}`}
                                        onClick={() => { setSelected(item); if (!item.is_read) markRead(item.id); }}
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.is_read ? "bg-slate-200" : "bg-blue-500"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!item.is_read ? "text-slate-900" : "text-slate-600"}`}>{item.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.message}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selected ? (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{selected.name}</CardTitle>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => del(selected.id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                            <a href={`mailto:${selected.email}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
                                <Mail size={13} /> {selected.email}
                            </a>
                            <p className="text-xs text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-line">{selected.message}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center">
                        <CardContent className="text-center py-16 text-muted-foreground">
                            <Eye size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a query to view</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
