import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Loader2, Trash2, Star, Eye, EyeOff, Pin, PinOff, Plus, Search,
    AlertCircle, RefreshCcw, UserCircle2,
} from "lucide-react";
import { toast } from "sonner";

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={13}
                    className={n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                />
            ))}
        </div>
    );
}

export default function AdminFeedback() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        reviewer_name: "",
        reviewer_photo: "",
        rating: 5,
        review_text: "",
        review_date: new Date().toISOString().slice(0, 10),
        is_visible: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        setLoading(true);
        const { data, error } = await supabase
            .from("google_reviews")
            .select("*")
            .order("review_date", { ascending: false });
        if (error) toast.error(error.message);
        else setReviews(data || []);
        setLoading(false);
    }

    const toggleVisible = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from("google_reviews")
            .update({ is_visible: !current })
            .eq("id", id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success(!current ? "Review approved & visible" : "Review hidden");
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, is_visible: !current } : r))
            );
        }
    };

    const togglePinned = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from("google_reviews")
            .update({ is_pinned: !current })
            .eq("id", id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success(!current ? "Review pinned" : "Review unpinned");
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, is_pinned: !current } : r))
            );
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review permanently?")) return;
        const { error } = await supabase.from("google_reviews").delete().eq("id", id);
        if (error) toast.error(error.message);
        else {
            toast.success("Deleted");
            setReviews((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const payload = {
            ...addForm,
            review_date: new Date(addForm.review_date).toISOString(),
        };
        const { error } = await supabase.from("google_reviews").insert([payload]);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Review added!");
            setAddOpen(false);
            setAddForm({
                reviewer_name: "",
                reviewer_photo: "",
                rating: 5,
                review_text: "",
                review_date: new Date().toISOString().slice(0, 10),
                is_visible: true,
            });
            fetchReviews();
        }
        setIsSaving(false);
    };

    const filtered = reviews.filter((r) =>
        r.reviewer_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.review_text?.toLowerCase().includes(search.toLowerCase())
    );

    const visible = reviews.filter((r) => r.is_visible).length;
    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : "—";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Google Reviews Manager</h2>
                    <p className="text-muted-foreground mt-1">
                        Approve, hide, pin and manage all guest reviews shown on the website.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchReviews} className="gap-2">
                        <RefreshCcw size={14} />
                        Refresh
                    </Button>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus size={14} />
                                Add Review
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Review Manually</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Reviewer Name *</Label>
                                    <Input
                                        required
                                        value={addForm.reviewer_name}
                                        onChange={(e) => setAddForm({ ...addForm, reviewer_name: e.target.value })}
                                        placeholder="e.g. Sarah M."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Photo URL (optional)</Label>
                                    <Input
                                        value={addForm.reviewer_photo}
                                        onChange={(e) => setAddForm({ ...addForm, reviewer_photo: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                type="button"
                                                key={n}
                                                onClick={() => setAddForm({ ...addForm, rating: n })}
                                            >
                                                <Star
                                                    size={24}
                                                    className={
                                                        n <= addForm.rating
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-slate-200 text-slate-200 hover:fill-amber-200"
                                                    }
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Review Text *</Label>
                                    <Textarea
                                        required
                                        rows={4}
                                        value={addForm.review_text}
                                        onChange={(e) => setAddForm({ ...addForm, review_text: e.target.value })}
                                        placeholder="A wonderful stay in Jodhpur..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Review Date</Label>
                                    <Input
                                        type="date"
                                        value={addForm.review_date}
                                        onChange={(e) => setAddForm({ ...addForm, review_date: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full gap-2" disabled={isSaving}>
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Add Review
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold text-amber-600">{avgRating}</div>
                    <StarRating rating={Math.round(parseFloat(avgRating as string) || 0)} />
                    <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold text-slate-700">{reviews.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total Reviews</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold text-green-600">{visible}</div>
                    <p className="text-xs text-muted-foreground mt-1">Approved & Visible</p>
                </div>
            </div>

            {/* Note about Google API */}
            <div className="flex gap-3 items-start p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-1">Google Reviews API Note</p>
                    <p className="text-blue-700">
                        Google's official Places API returns only the 5 most recent reviews. To show more reviews, use a service like{" "}
                        <a
                            href="https://outscraper.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium hover:text-blue-900"
                        >
                            Outscraper
                        </a>{" "}
                        or{" "}
                        <a
                            href="https://apify.com/apify/google-maps-reviews-scraper"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium hover:text-blue-900"
                        >
                            Apify
                        </a>{" "}
                        to bulk-fetch all reviews, then add them manually or via their APIs.
                        Only reviews marked <strong>Visible</strong> will appear on the website.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search by name or review text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed rounded-lg">
                    <UserCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                    <p>{reviews.length === 0 ? "No reviews yet. Add one above!" : "No reviews match your search."}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filtered.map((review) => (
                        <Card
                            key={review.id}
                            className={`transition-all ${review.is_visible ? "border-green-200 bg-green-50/30" : "border-slate-200 opacity-70"}`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        {review.reviewer_photo ? (
                                            <img
                                                src={review.reviewer_photo}
                                                alt={review.reviewer_name}
                                                className="w-10 h-10 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                                                {review.reviewer_name?.[0] || "?"}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800">{review.reviewer_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(review.review_date).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        {review.is_pinned && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 border-amber-200">
                                                Pinned
                                            </Badge>
                                        )}
                                        <Badge
                                            variant={review.is_visible ? "default" : "outline"}
                                            className={`text-[10px] px-1.5 py-0.5 ${review.is_visible ? "bg-green-100 text-green-700 border-green-200" : "text-slate-500"}`}
                                        >
                                            {review.is_visible ? "Visible" : "Hidden"}
                                        </Badge>
                                    </div>
                                </div>

                                <StarRating rating={review.rating} />
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-4">
                                    "{review.review_text}"
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={`flex-1 gap-1.5 text-xs ${review.is_visible ? "text-slate-600" : "text-green-700 border-green-300 hover:bg-green-50"}`}
                                        onClick={() => toggleVisible(review.id, review.is_visible)}
                                    >
                                        {review.is_visible ? (
                                            <><EyeOff size={12} /> Hide</>
                                        ) : (
                                            <><Eye size={12} /> Approve</>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={`flex-1 gap-1.5 text-xs ${review.is_pinned ? "text-amber-700 border-amber-300 hover:bg-amber-50" : "text-slate-600"}`}
                                        onClick={() => togglePinned(review.id, review.is_pinned)}
                                    >
                                        {review.is_pinned ? (
                                            <><PinOff size={12} /> Unpin</>
                                        ) : (
                                            <><Pin size={12} /> Pin</>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:bg-red-50"
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
