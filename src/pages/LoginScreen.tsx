import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Lock, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import busLogo from "@/assets/bus-logo.png";
import busInterior from "@/assets/bus-interior.jpg";
import { getAuthService, signInAnonymously, signInWithEmailAndPassword } from "@/lib/firebase";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleSendOtp = () => {
    if (phone.length < 10) {
      toast.error("Invalid Phone", { description: "Please enter a valid phone number" });
      return;
    }
    setShowOtp(true);
    toast.success("OTP Sent!", { description: "Verification code sent to " + phone });
  };

  const handleLogin = async () => {
    if (tab === "phone" && !showOtp) {
      handleSendOtp();
      return;
    }

    try {
      const auth = getAuthService();
      if (auth) {
        if (tab === "email" && email && password) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          // Verify OTP (Mock logic since real Phone Auth requires ReCAPTCHA interaction)
          if (tab === "phone" && otp !== "123456" && otp.length > 0) {
            // Allow any OTP for testing if needed, or enforce one
            console.log("Mock OTP verified:", otp);
          }
          await signInAnonymously(auth);
        }
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Firebase Login failed:", err.message);
      toast.error("Auth Error", { description: err.message });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="absolute top-3 right-3 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <img src={busLogo} alt="BusConnect" className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Driver Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to start your route</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary rounded-full p-1 mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              tab === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => setTab("phone")}
          >
            Phone
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              tab === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => setTab("email")}
          >
            Email
          </button>
        </div>

        {tab === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Phone Number</label>
              <div className="relative mt-1.5">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-0"
                  disabled={showOtp}
                />
              </div>
            </div>
            
            {showOtp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Enter 6-Digit OTP</label>
                <div className="relative mt-1.5">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="· · · · · ·"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 h-12 bg-secondary border-0 text-center tracking-[0.5em] text-lg font-bold"
                  />
                </div>
                <button 
                  onClick={() => setShowOtp(false)}
                  className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline"
                >
                  Change number?
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Email</label>
              <div className="relative mt-1.5">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="driver@busconnect.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-0"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Password</label>
              <div className="relative mt-1.5">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-0"
                />
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleLogin} className="w-full h-12 mt-6 text-base font-semibold rounded-xl transition-all">
          {tab === "phone" && !showOtp ? "Send OTP →" : "Verify & Login →"}
        </Button>

        <div className="mt-8 rounded-xl overflow-hidden">
          <img src={busInterior} alt="Bus interior" className="w-full h-32 object-cover opacity-60 grayscale" />
        </div>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("user_role");
            navigate("/", { replace: true });
          }}
          className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5"
        >
          <ArrowLeft size={16} />
          Back to Role Selection
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Only authorized drivers can access this app.<br />Contact your dispatcher for support.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
