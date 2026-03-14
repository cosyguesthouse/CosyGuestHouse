import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";

export default function AdminPhysicalRooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        room_number: "",
        category_id: "",
        status: "available",
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [{ data: roomsData }, { data: catsData }] = await Promise.all([
            supabase.from("rooms").select("*, room_categories(category_name)").order("created_at", { ascending: false }),
            supabase.from("room_categories").select("id, category_name").order("category_name", { ascending: true })
        ]);
        setRooms(roomsData || []);
        setCategories(catsData || []);
        setLoading(false);
    }

    const handleOpenNew = () => {
        setEditingId(null);
        setFormData({ room_number: "", category_id: categories[0]?.id || "", status: "available" });
        setIsDialogOpen(true);
    };

    const handleEdit = (room: any) => {
        setEditingId(room.id);
        setFormData({
            room_number: room.room_number,
            category_id: room.category_id || "",
            status: room.status || "available",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room?")) return;

        const { error } = await supabase.from("rooms").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete room: " + error.message);
        } else {
            toast.success("Room deleted successfully");
            fetchData();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };

        if (editingId) {
            const { error } = await supabase.from("rooms").update(payload).eq("id", editingId);
            if (error) toast.error("Error updating room: " + error.message);
            else { toast.success("Room updated!"); setIsDialogOpen(false); fetchData(); }
        } else {
            const { error } = await supabase.from("rooms").insert([payload]);
            if (error) toast.error("Error creating room: " + error.message);
            else { toast.success("Room added!"); setIsDialogOpen(false); fetchData(); }
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Physical Rooms Manager</h2>
                    <p className="text-muted-foreground mt-2">Manage individual physical rooms and their associated categories.</p>
                </div>
                <Button onClick={handleOpenNew} className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Room
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room Number</TableHead>
                                <TableHead>Assigned Category</TableHead>
                                <TableHead>Status</TableHead>
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
                                        No rooms found. Add some to start taking bookings!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.room_number}</TableCell>
                                        <TableCell>{room.room_categories?.category_name || "Unassigned"}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${room.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                {room.status}
                                            </span>
                                        </TableCell>
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Physical Room" : "Add New Physical Room"}</DialogTitle>
                        <DialogDescription>Assign a room number and link it to a Category.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="room_number">Room Number / Identifier</Label>
                            <Input id="room_number" placeholder="e.g. 101, A2, Suite 5" value={formData.room_number} onChange={e => setFormData({ ...formData, room_number: e.target.value })} required />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.category_id} onValueChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.category_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
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
