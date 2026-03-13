import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex justify-center items-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
