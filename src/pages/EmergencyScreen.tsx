import { useEffect, useState } from "react";
import { Wrench, Car, Plus, HelpCircle, Send, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/MobileLayout";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DriverMapEmergency } from "@/components/DriverMap";
import { postEmergency } from "@/lib/api";

const ROUTE_ID = "204C";
const BUS_ID = "BC-4029";

const emergencyTypes = [
  { id: "breakdown", label: "Vehicle Breakdown", icon: Wrench },
  { id: "accident", label: "Road Accident", icon: Car },
  { id: "medical", label: "Medical Emergency", icon: Plus },
  { id: "other", label: "Other Issue", icon: HelpCircle },
];

const EmergencyScreen = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("breakdown");
  const [details, setDetails] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoHint("Geolocation not supported — alert will be sent without coordinates.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracyMeters(pos.coords.accuracy ?? null);
      },
      (err) => {
        setGeoHint(err.message || "Could not read location");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    );
  }, []);

  const sendAlert = useMutation({
    mutationFn: () =>
      postEmergency({
        type: selected,
        details,
        lat,
        lng,
        routeId: ROUTE_ID,
        busId: BUS_ID,
      }),
    onSuccess: (res) => {
      toast.success("Emergency alert sent to dispatch", { description: `Reference: ${res.id}` });
      navigate(-1);
    },
    onError: (e: Error) => {
      toast.error("Failed to send alert", { description: e.message });
    },
  });

  return (
    <MobileLayout>
      <ScreenHeader title="Emergency Alert" />
      <div className="space-y-5 px-4 pb-4 pt-4">
        <div className="flex flex-col items-center rounded-xl bg-destructive/10 p-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
            <AlertTriangle size={32} className="text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Report an Emergency</h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Identify the emergency type to notify dispatch and nearby services immediately.
          </p>
        </div>

        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Select Emergency Type</p>

        <div className="space-y-2">
          {emergencyTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelected(type.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selected === type.id ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected === type.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                <type.icon size={20} />
              </div>
              <span className="font-medium text-foreground flex-1 text-left">{type.label}</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === type.id ? "border-primary" : "border-muted-foreground/30"
                }`}
              >
                {selected === type.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Additional Details</p>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide more details about the situation (e.g. current location, severity, number of persons involved)..."
            className="w-full h-28 bg-secondary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none border-0 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1.5">Your location on map</p>
          <DriverMapEmergency lat={lat} lng={lng} accuracyMeters={accuracyMeters} height={176} />
          <p className="text-xs text-muted-foreground mt-2">
            {lat != null && lng != null
              ? `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
              : geoHint ?? "Fetching location…"}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => sendAlert.mutate()}
          disabled={sendAlert.isPending}
          className="w-full h-14 rounded-2xl text-base font-semibold gap-2 bg-destructive hover:bg-destructive/90"
        >
          <Send size={18} /> SEND ALERT
        </Button>
        <p className="text-xs text-muted-foreground text-center">This will alert dispatchers and log your position.</p>
      </div>
    </MobileLayout>
  );
};

export default EmergencyScreen;
