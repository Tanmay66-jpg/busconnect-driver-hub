import { Phone, Bus, Building, Pencil, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { ScreenHeader } from "@/components/ScreenHeader";
import driverAvatar from "@/assets/driver-avatar.png";

const ProfileScreen = () => {
  const navigate = useNavigate();

  const handleLogout = () => { localStorage.removeItem("user_role");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <MobileLayout>
      <ScreenHeader title="Driver Profile" />
      <div className="pb-4">
        {/* Profile header */}
        <div className="bg-secondary h-24 mt-4" />
        <div className="flex flex-col items-center -mt-12">
          <div className="relative">
            <img src={driverAvatar} alt="Driver" className="w-24 h-24 rounded-full object-cover border-4 border-card" />
            <button
              type="button"
              onClick={() => toast.message("Photo update", { description: "Profile photo can be changed from the operator portal." })}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label="Edit profile photo"
            >
              <Pencil size={13} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-3">Alex Johnson</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold bg-success/10 text-success px-2 py-0.5 rounded">BC-99420</span>
            <span className="text-xs text-muted-foreground">• Verified Driver</span>
          </div>
        </div>

        {/* Information */}
        <div className="mx-4 mt-6 bg-card rounded-xl border border-border p-4 space-y-5">
          <h3 className="font-semibold text-foreground">Information</h3>

          <div className="flex items-center gap-3">
            <Phone size={18} className="text-primary" />
            <div>
              <p className="text-[10px] uppercase text-primary font-semibold tracking-wider">Phone Number</p>
              <p className="font-medium text-foreground">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bus size={18} className="text-primary" />
            <div>
              <p className="text-[10px] uppercase text-primary font-semibold tracking-wider">Current Bus ID</p>
              <p className="font-medium text-foreground">BUS-402 (Express)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building size={18} className="text-primary" />
            <div>
              <p className="text-[10px] uppercase text-primary font-semibold tracking-wider">Operator</p>
              <p className="font-medium text-foreground">Metro Transit Corp.</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mx-4 mt-4">
          <h3 className="font-semibold text-foreground mb-2">Account Settings</h3>
          <button
            type="button"
            onClick={() =>
              toast.success("Password reset", {
                description: "If your account uses email login, check your inbox for a reset link.",
              })
            }
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left"
          >
            <span className="text-muted-foreground">🔒</span>
            <span className="font-medium text-foreground">Change Password</span>
            <span className="ml-auto text-muted-foreground">›</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3.5 mt-4 text-left transition-colors hover:bg-destructive/20"
          >
            <LogOut size={20} className="text-destructive" />
            <span className="font-medium text-destructive">Log Out</span>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ProfileScreen;
