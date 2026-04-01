import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";

const RoleSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔁 STEP 5: Auto-redirect if role is already stored
    const storedRole = localStorage.getItem("user_role");
    if (storedRole === "driver") {
      navigate("/login/driver", { replace: true });
    } else if (storedRole === "admin") {
      navigate("/login/admin", { replace: true });
    }
  }, [navigate]);

  const handleSelectRole = (role: "driver" | "admin") => {
    // 💾 STEP 4: Persist User Choice
    localStorage.setItem("user_role", role);
    // ➡️ STEP 3: Navigation Logic
    if (role === "driver") {
      navigate("/login/driver", { replace: true });
    } else {
      navigate("/login/admin", { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Bus Connect</h1>
          <p className="text-muted-foreground text-sm">Select your role to continue</p>
        </div>

        <div className="w-full space-y-4">
          <Card 
            className="group relative flex flex-col items-center justify-center p-8 gap-4 overflow-hidden border-2 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            onClick={() => handleSelectRole("driver")}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Bus size={32} />
            </div>
            <span className="font-semibold text-lg">Login as Driver</span>
          </Card>

          <Card 
            className="group relative flex flex-col items-center justify-center p-8 gap-4 overflow-hidden border-2 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            onClick={() => handleSelectRole("admin")}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <span className="font-semibold text-lg">Login as Admin</span>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;
