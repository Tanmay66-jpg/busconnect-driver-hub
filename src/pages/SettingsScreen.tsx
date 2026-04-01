import { MapPin, Bell, Moon, Globe, Info, FileText, LogOut, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { ScreenHeader } from "@/components/ScreenHeader";
import driverAvatar from "@/assets/driver-avatar.png";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  return (
    <MobileLayout>
      <ScreenHeader title="Settings" />
      <div className="space-y-6 px-4 pb-4 pt-4">
        {/* Driver */}
        <div className="flex items-center gap-3">
          <img src={driverAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="text-xs text-muted-foreground">Primary Driver</p>
            <p className="font-bold text-foreground">David Thompson</p>
          </div>
        </div>

        {/* Device Preferences */}
        <div>
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Device Preferences</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground text-sm">Location Tracking</p>
                  <p className="text-xs text-muted-foreground">Real-time route optimization</p>
                </div>
              </div>
              <Toggle checked={locationTracking} onChange={() => setLocationTracking(!locationTracking)} />
            </div>

            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground text-sm">Notifications</p>
                  <p className="text-xs text-muted-foreground">Alerts for route changes</p>
                </div>
              </div>
              <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
            </div>

            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Better for night driving</p>
                </div>
              </div>
              <Toggle
                checked={isDark}
                onChange={() => setTheme(isDark ? "light" : "dark")}
              />
            </div>

            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground text-sm">Language</p>
                  <p className="text-xs text-muted-foreground">English (US)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Support */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Support & Legal</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground text-sm">App Version</p>
                  <p className="text-xs text-muted-foreground">BusConnect v4.2.1-stable</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">Up to date</span>
            </div>
            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-muted-foreground" />
                <p className="font-medium text-foreground text-sm">Terms of Service</p>
              </div>
              <span className="text-muted-foreground">↗</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { localStorage.removeItem("user_role"); navigate("/", { replace: true }); }}
          className="w-full flex items-center justify-center gap-2 text-destructive font-semibold bg-destructive/5 border border-destructive/20 rounded-xl py-3"
        >
          <LogOut size={18} /> Sign Out Account
        </button>
      </div>
    </MobileLayout>
  );
};

export default SettingsScreen;
