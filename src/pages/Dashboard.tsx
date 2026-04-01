import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Play, StopCircle, AlertTriangle, Asterisk, ChevronRight, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import MobileLayout from "@/components/MobileLayout";
import { DriverMapRoute } from "@/components/DriverMap";
import driverAvatar from "@/assets/driver-avatar.png";
import { fetchRoute, postVehicleLocation } from "@/lib/api";
import { upsertBusLocation } from "@/lib/firestoreBus";
import { useGeolocation } from "@/hooks/useGeolocation";

const ROUTE_ID = "204C";

const DELAY_OPTIONS = [5, 10, 15, 20, 30] as const;

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tripActive, setTripActive] = useState(false);
  const [delayOpen, setDelayOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState<number>(10);
  const [delayNote, setDelayNote] = useState("");

  // Real-time location hook
  const { lat, lng, error } = useGeolocation(tripActive);
  const userLocation = lat && lng ? { lat, lng } : null;
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [firestoreSynced, setFirestoreSynced] = useState<boolean>(true);

  const { data: routeData } = useQuery({
    queryKey: ["route", ROUTE_ID],
    queryFn: () => fetchRoute(ROUTE_ID),
    refetchInterval: 15_000,
  });

  const nextStop =
    routeData?.stops.find((s) => s.status === "current") ??
    routeData?.stops.find((s) => s.status === "upcoming");

  const syncLocation = useMutation({
    mutationFn: async (pos: { lat: number; lng: number }) => {
      const busId = routeData?.busId ?? "BC-4029";
      const driverId = "DRIVER1";

      // Try client-side Firestore first; fall back to API if not configured.
      const persisted = await upsertBusLocation({ busId, driverId, lat: pos.lat, lng: pos.lng }).catch(() => false);
      setFirestoreSynced(persisted);
      
      if (!persisted) {
        return postVehicleLocation({
          lat: pos.lat,
          lng: pos.lng,
          routeId: ROUTE_ID,
          busId,
          driverId,
        });
      }
      return { ok: true, vehicle: { routeId: ROUTE_ID, busId, driverId, lat: pos.lat, lng: pos.lng, updatedAt: Date.now() } } as any;
    },
    onSuccess: () => {
      setLastSynced(new Date());
      // Refresh route data to show updated vehicle position if the API returns it
      queryClient.invalidateQueries({ queryKey: ["route", ROUTE_ID] });
    },
    onError: (err) => {
      console.error("Sync error:", err);
      toast.error("Sync failed", { description: "Retrying in 5 seconds..." });
    }
  });

  // Auto-sync location every 5 seconds if trip is active and we have coordinates
  useEffect(() => {
    if (!tripActive || !userLocation) return;

    const interval = setInterval(() => {
      syncLocation.mutate(userLocation);
    }, 4000);

    return () => clearInterval(interval);
  }, [tripActive, userLocation, syncLocation]);

  const handleStartTrip = () => {
    if (error) {
      toast.error("Location Error", { description: error });
      // We still allow starting trip but with a warning
    }
    setTripActive(true);
    toast.success("Trip Started", { description: "Your location is being shared with dispatch." });
    if (userLocation) {
      syncLocation.mutate(userLocation);
    }
  };

  const handleNotifications = () => {
    toast.message("No new notifications from dispatch");
  };

  const submitDelayReport = () => {
    toast.success("Delay reported to dispatch", {
      description: `About ${delayMinutes} min delay${delayNote.trim() ? ` — ${delayNote.trim()}` : ""}.`,
    });
    setDelayOpen(false);
    setDelayNote("");
  };

  return (
    <MobileLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img
                src={driverAvatar}
                alt="Driver"
                className="h-12 w-12 shrink-0 rounded-full border-2 border-primary object-cover"
              />
              <div className="min-w-0">
                <h2 className="truncate font-bold text-foreground">Rajesh Kumar</h2>
                <p className="text-xs text-muted-foreground">Driver Profile Verified</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleNotifications}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 pb-4 pt-4">
          <div className="flex gap-4 rounded-xl bg-secondary px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bus ID</p>
              <p className="text-lg font-bold text-primary">{routeData?.busId ?? "BC-4029"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Route Number</p>
              <p className="text-lg font-bold text-primary">{routeData?.id ?? ROUTE_ID}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
              <div className="flex items-center gap-1.5 justify-end">
                <div className={`h-2 w-2 rounded-full ${tripActive ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                <p className="text-xs font-bold text-foreground">
                  {tripActive ? 'Active' : 'Idle'}
                </p>
              </div>
              {lastSynced && tripActive && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Sync: {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
              {!firestoreSynced && tripActive && (
                <p className="text-[9px] text-destructive mt-0.5 font-semibold">
                  (Using API Fallback)
                </p>
              )}
            </div>
          </div>

          <div className="w-full">
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Live map (Real-time tracking enabled)
            </p>
            <DriverMapRoute routeId={ROUTE_ID} userLocation={userLocation} />
          </div>

          <div className="space-y-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Current Route</p>
            <p className="text-xl font-bold text-foreground">{routeData?.label ?? "Chandigarh → Mohali"}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/route")}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <span className="text-lg text-primary">🚏</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Next stop</p>
              <p className="truncate font-semibold text-foreground">{nextStop?.name ?? "Loading…"}</p>
              <p className="truncate text-xs text-primary">
                {nextStop ? `${nextStop.time} · ${nextStop.distance}` : "—"}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
          </button>

          <div className="flex gap-3">
            <Button
              onClick={handleStartTrip}
              className="h-14 flex-1 gap-2 rounded-2xl text-base font-semibold"
              disabled={tripActive || syncLocation.isPending}
            >
              <Play size={20} /> START TRIP
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTripActive(false);
                toast.message("Trip ended");
              }}
              className="h-14 flex-1 gap-2 rounded-2xl text-base font-semibold"
              disabled={!tripActive}
            >
              <StopCircle size={20} /> END TRIP
            </Button>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setDelayOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-muted-foreground" />
                <span className="font-medium text-foreground">Report Delay</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/emergency")}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <Asterisk size={20} className="text-destructive" />
                <span className="font-semibold text-destructive">EMERGENCY ALERT</span>
              </div>
              <span className="text-destructive">→</span>
            </button>
          </div>
        </div>
      </div>

      <Dialog open={delayOpen} onOpenChange={setDelayOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Report a delay</DialogTitle>
            <DialogDescription>Dispatch will be notified with your estimate and optional note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Estimated delay</Label>
              <div className="flex flex-wrap gap-2">
                {DELAY_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDelayMinutes(m)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      delayMinutes === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delay-note">Note (optional)</Label>
              <Textarea
                id="delay-note"
                value={delayNote}
                onChange={(e) => setDelayNote(e.target.value)}
                placeholder="e.g. Traffic at Sector 43"
                className="min-h-[88px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDelayOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitDelayReport}>
              Send report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Dashboard;


