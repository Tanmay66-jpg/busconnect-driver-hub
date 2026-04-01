import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import busLogo from "@/assets/bus-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
    const timer = setTimeout(() => navigate("/role-selection"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, hsl(217 91% 55%), hsl(217 91% 40%))",
        transition: "opacity 0.8s",
        opacity,
      }}
    >
      <div className="absolute top-3 right-3 z-50">
        <ThemeToggle />
      </div>
      <img src={busLogo} alt="BusConnect" className="w-24 h-24 mb-6 rounded-2xl bg-primary-foreground/20 p-3" />
      <h1 className="text-3xl font-bold text-primary-foreground">BusConnect Driver</h1>
      <p className="text-primary-foreground/70 mt-2 text-sm">Smart Driving. Real-Time Tracking</p>
    </div>
  );
};

export default SplashScreen;
