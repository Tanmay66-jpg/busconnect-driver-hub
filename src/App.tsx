import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "./pages/SplashScreen";
import RoleSelection from "./pages/RoleSelection";
import LoginScreen from "./pages/LoginScreen";
import Dashboard from "./pages/Dashboard";
import RouteScreen from "./pages/RouteScreen";
import EmergencyScreen from "./pages/EmergencyScreen";
import ProfileScreen from "./pages/ProfileScreen";
import SettingsScreen from "./pages/SettingsScreen";
import ScheduleScreen from "./pages/ScheduleScreen";
import NotFound from "./pages/NotFound";

// Admin Imports
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage";
import AdminRoutesPage from "./admin/pages/AdminRoutesPage";
import AdminAnalyticsPage from "./admin/pages/AdminAnalyticsPage";
import AdminSettingsPage from "./admin/pages/AdminSettingsPage";
import AdminBusTrackingPage from "./admin/pages/AdminBusTrackingPage";
import AdminRouteDetailsPage from "./admin/pages/AdminRouteDetailsPage";
import AdminDriversPage from "./admin/pages/AdminDriversPage";
import AdminSecurityPage from "./admin/pages/AdminSecurityPage";
import AdminNotificationsPage from "./admin/pages/AdminNotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="busconnect-theme" disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login/driver" element={<LoginScreen />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/route" element={<RouteScreen />} />
            <Route path="/schedule" element={<ScheduleScreen />} />

            <Route path="/emergency" element={<EmergencyScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            
            {/* Admin Routes */}
            <Route path="/login/admin" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="routes" element={<AdminRoutesPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="tracking" element={<AdminBusTrackingPage />} />
              <Route path="route-details" element={<AdminRouteDetailsPage />} />
              <Route path="drivers" element={<AdminDriversPage />} />
              <Route path="security" element={<AdminSecurityPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
