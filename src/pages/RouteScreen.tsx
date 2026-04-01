import { CheckCircle, Clock, Bus, Flag, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/MobileLayout";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DriverMapRoute } from "@/components/DriverMap";
import { fetchRoute } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";

const ROUTE_ID = "204C";

const RouteScreen = () => {
  const { data: routeData, isLoading } = useQuery({
    queryKey: ["route", ROUTE_ID],
    queryFn: () => fetchRoute(ROUTE_ID),
    refetchInterval: 15_000,
  });
  
  const { lat, lng } = useGeolocation(true);
  const userLocation = lat && lng ? { lat, lng } : null;

  const stops = routeData?.stops ?? [];
  const nextStop = stops.find((s) => s.status === "upcoming");

  const openNavigate = () => {
    if (!nextStop) return;
    const q = encodeURIComponent(`${nextStop.lat},${nextStop.lng}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, "_blank", "noopener,noreferrer");
  };

  return (
    <MobileLayout showHeader={false}>
      <ScreenHeader title="Route Details" />
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Maximized Map Section */}
        <div className="relative w-full h-[45%] shrink-0 border-b border-border shadow-sm">
          <DriverMapRoute routeId={ROUTE_ID} height="100%" userLocation={userLocation} />
          
          {/* Lowered Floating Next Stop Info Overlay */}
          <div className="absolute bottom-2 left-4 right-4 z-10">
            <div className="bg-card/95 backdrop-blur-md rounded-xl border border-border p-3 flex items-center justify-between shadow-xl">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-primary tracking-wider">Next Stop</p>
                <p className="font-extrabold text-foreground truncate leading-tight">{nextStop?.name ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {nextStop ? `${nextStop.time} · ${nextStop.distance}` : "No upcoming stops"}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-lg gap-1.5 font-bold h-9 px-4 shrink-0 shadow-lg"
                disabled={!nextStop}
                onClick={openNavigate}
              >
                <Navigation size={14} /> Navigate
              </Button>
            </div>
          </div>
        </div>

        {/* Minimized Timeline Section */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-20 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Route Progress</h3>
            <div className="h-1 flex-1 mx-4 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${(stops.filter(s => s.status === 'done').length / stops.length) * 100}%` }}
              />
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">Loading route from server…</p>
          )}

          <div className="space-y-0 pl-1">
            {stops.map((stop, i) => (
              <div key={stop.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                      stop.status === "done"
                        ? "bg-secondary/50 border-secondary text-muted-foreground"
                        : stop.status === "current"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary/30 border-secondary/50 text-muted-foreground/50"
                    }`}
                  >
                    {stop.status === "done" ? (
                      <CheckCircle size={12} strokeWidth={3} />
                    ) : stop.status === "current" ? (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : i === stops.length - 1 ? (
                      <Flag size={10} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  {i < stops.length - 1 && (
                    <div className={`w-0.5 h-10 ${stop.status === "done" ? "bg-primary/40" : "bg-border/60"}`} />
                  )}
                </div>

                <div className="pb-4 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        stop.status === "current" ? "text-foreground" : "text-muted-foreground"
                      } ${stop.status === "done" ? "opacity-60" : ""}`}
                    >
                      {stop.name}
                    </p>
                    {stop.status === "current" && (
                      <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm border border-primary/20">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] font-medium ${stop.status === "current" ? "text-primary" : "text-muted-foreground/60"}`}>
                    {stop.time} · {stop.distance}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default RouteScreen;
