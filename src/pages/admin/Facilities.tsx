import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Loader2, Info } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function AdminFacilities() {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        icon: "",
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    async function fetchFacilities() {
        setLoading(true);
        const { data, error } = await supabase.from("facilities").select("*").order("name", { ascending: true });
        if (error) {
            toast.error("Error fetching facilities: " + error.message);
        } else {
            setFacilities(data || []);
        }
        setLoading(false);
    }

    const handleOpenNew = () => {
        setEditingId(null);
        setFormData({ name: "", icon: "Check" });
        setIsDialogOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            icon: item.icon || "Check",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this facility?")) return;

        const { error } = await supabase.from("facilities").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete facility: " + error.message);
        } else {
            toast.success("Facility deleted");
            fetchFacilities();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };

        let error;
        if (editingId) {
            const { error: updateErr } = await supabase.from("facilities").update(payload).eq("id", editingId);
            error = updateErr;
        } else {
            const { error: insertErr } = await supabase.from("facilities").insert([payload]);
            error = insertErr;
        }

        if (error) {
            toast.error("Error saving facility: " + error.message);
        } else {
            toast.success(editingId ? "Facility updated!" : "Facility created!");
            setIsDialogOpen(false);
            fetchFacilities();
        }
        setLoading(false);
    };

    // Helper to render lucide icon by string name
    const renderIcon = (iconName: string) => {
        // @ts-ignore
        const Icon = LucideIcons[iconName] || LucideIcons.Info;
        return <Icon className="w-5 h-5 text-slate-500" />;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Facilities Management</h2>
                    <p className="text-muted-foreground mt-2">Manage property wide amenities.</p>
                </div>
                <Button onClick={handleOpenNew} className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Facility
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Icon</TableHead>
                                <TableHead>Facility Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && facilities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : facilities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No facilities found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                facilities.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {renderIcon(item.icon)}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2 mt-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
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

            {isDialogOpen && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Facility" : "Add New Facility"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Facility Name</Label>
                                <Input id="name" placeholder="Free WiFi" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Lucide Icon Name</Label>
                                <Input id="icon" placeholder="Wifi, Coffee, Wind" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Use exact icon names from <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="underline text-primary">Lucide React</a> (PascalCase, e.g. "Wifi", "Wind", "Coffee").
                                </p>
                                <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                                    <span className="text-sm font-medium">Preview:</span>
                                    {renderIcon(formData.icon)}
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
