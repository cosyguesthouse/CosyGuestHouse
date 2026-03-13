import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import Index from "./pages/Index.tsx";
import ExperiencesPage from "./pages/ExperiencesPage.tsx";
import StayPage from "./pages/StayPage.tsx";
import DiningPage from "./pages/DiningPage.tsx";
import StoriesPage from "./pages/StoriesPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFound from "./pages/NotFound.tsx";

// Admin Imports
import AdminLogin from "./pages/admin/Login.tsx";
import { AdminLayout } from "./components/admin/AdminLayout.tsx";
import { ProtectedRoute } from "./components/admin/ProtectedRoute.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminHomepage from "./pages/admin/Homepage.tsx";
import AdminRooms from "./pages/admin/Rooms.tsx";
import AdminDining from "./pages/admin/Dining.tsx";
import AdminGallery from "./pages/admin/Gallery.tsx";
import AdminStories from "./pages/admin/Stories.tsx";
import AdminFacilities from "./pages/admin/Facilities.tsx";
import AdminSiteImages from "./pages/admin/SiteImages.tsx";
import AdminExperiences from "./pages/admin/Experiences.tsx";
import AdminBookings from "./pages/admin/Bookings.tsx";
import AdminContactQueries from "./pages/admin/ContactQueries.tsx";
import AdminFeedback from "./pages/admin/Feedback.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/stay" element={<StayPage />} />
            <Route path="/dining" element={<DiningPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="images" element={<AdminSiteImages />} />
                <Route path="experiences" element={<AdminExperiences />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="dining" element={<AdminDining />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="stories" element={<AdminStories />} />
                <Route path="facilities" element={<AdminFacilities />} />
                <Route path="contact-queries" element={<AdminContactQueries />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
