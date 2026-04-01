import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";
import { fetchRoute } from "@/lib/api";
import type { RoutePayload } from "@/types/route";

/* ------------------------------------------------------------------ */
/*  Default center (Chandigarh)                                       */
/* ------------------------------------------------------------------ */
const CHD_DEFAULT_CENTER: [number, number] = [30.7333, 76.778]; // [lat, lng]

/* ------------------------------------------------------------------ */
/*  Tile URLs                                                         */
/* ------------------------------------------------------------------ */
const TILE_LIGHT = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/* ------------------------------------------------------------------ */
/*  Custom Leaflet icons                                              */
/* ------------------------------------------------------------------ */
const busIcon = L.divIcon({
  className: "",
  html: `<div class="bus-marker-animation" style="
    display:flex;align-items:center;justify-content:center;
    width:42px;height:52px;
  ">
    <svg width="42" height="52" viewBox="0 0 42 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin background -->
      <path d="M21 52C21 52 42 34.0909 42 21C42 9.40202 32.598 0 21 0C9.40202 0 0 9.40202 0 21C0 34.0909 21 52 21 52Z" fill="#EA580C"/>
      <path d="M21 50C21 50 40 33.1818 40 21C40 10.5066 31.4934 2 21 2C10.5066 2 2 10.5066 2 21C2 33.1818 21 50 21 50Z" fill="#F97316"/>
      <!-- White circle inside -->
      <circle cx="21" cy="21" r="15" fill="white"/>
      <!-- Bus Icon (simplified path) -->
      <path d="M29.5 24.5V17.5C29.5 15.0147 27.4853 13 25 13H17C14.5147 13 12.5 15.0147 12.5 17.5V24.5M29.5 24.5H12.5M29.5 24.5V27C29.5 27.5523 29.0523 28 28.5 28H13.5C12.9477 28 12.5 27.5523 12.5 27V24.5M15.5 28V30M26.5 28V30M16 23V25M26 23V25M17 17H25M15 17V21M27 17V21" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <style>
    @keyframes bus-float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
      100% { transform: translateY(0px); }
    }
    .bus-marker-animation {
      animation: bus-float 2s ease-in-out infinite;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    }
  </style>`,
  iconSize: [42, 52],
  iconAnchor: [21, 52],
});

function makeStopIcon(status: string) {
  const size = status === "current" ? 14 : 12;
  const bg =
    status === "done"
      ? "#94a3b8"
      : status === "current"
        ? "hsl(217 91% 55%)"
        : "#64748b";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const userLocationIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#3b82f6;border:2px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,0.25), 0 0 0 6px rgba(59,130,246,0.2);
    animation: pulse 2s infinite;
  "><div style="
    width:6px;height:6px;border-radius:50%;background:#fff;
    margin:3px auto;
  "></div></div>
  <style>@keyframes pulse{0%,100%{box-shadow:0 1px 4px rgba(0,0,0,.25),0 0 0 6px rgba(59,130,246,.2)}50%{box-shadow:0 1px 4px rgba(0,0,0,.25),0 0 0 12px rgba(59,130,246,.08)}}</style>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const emergencyIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:hsl(217 91% 55%);border:2px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,0.25), 0 0 0 4px rgba(59,130,246,0.25);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/* ------------------------------------------------------------------ */
/*  Theme-aware tile layer                                            */
/* ------------------------------------------------------------------ */
function useMapTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return "light";
  return "light"; // Always return light as requested
}

/* ------------------------------------------------------------------ */
/*  FitBounds helper (child of MapContainer)                          */
/* ------------------------------------------------------------------ */
function FitRouteBounds({
  polyline,
  vehicle,
  userLocation,
}: {
  polyline: [number, number][];
  vehicle: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (polyline.length < 1) return;

    const points: L.LatLngExpression[] = polyline.map(
      ([lat, lng]) => [lat, lng] as [number, number],
    );
    points.push([vehicle.lat, vehicle.lng]);
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
  }, [map, polyline, vehicle, userLocation]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Smooth marker mover (child of MapContainer)                       */
/* ------------------------------------------------------------------ */
function MovingBusMarker({
  position,
}: {
  position: [number, number];
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={busIcon}
      zIndexOffset={1000}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                  */
/* ------------------------------------------------------------------ */
const FLUID_MAP_HEIGHT_CLASS = "min-h-[280px] h-[min(62vh,600px)]";

function MapSkeleton({
  height,
  className,
  message,
}: {
  height?: number | string;
  className?: string;
  message: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/40 flex flex-col items-center justify-center text-center px-3",
        height === undefined && className === undefined
          ? "min-h-[160px]"
          : className,
      )}
      style={height !== undefined ? { height } : undefined}
    >
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RouteMapInner – the actual Leaflet map for route display          */
/* ------------------------------------------------------------------ */
function RouteMapInner({
  data,
  className,
  userLocation,
}: {
  data: RoutePayload;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const mapTheme = useMapTheme();
  const tileUrl = mapTheme === "dark" ? TILE_DARK : TILE_LIGHT;
  const v = data.vehicle;
  const polylineLatLngs: [number, number][] = data.polyline.map(
    ([lat, lng]) => [lat, lng] as [number, number],
  );
  const center: [number, number] =
    polylineLatLngs.length > 0
      ? polylineLatLngs[0]
      : CHD_DEFAULT_CENTER;

  const stopIcons = useMemo(
    () =>
      data.stops.map((stop) => ({
        ...stop,
        icon: makeStopIcon(stop.status),
      })),
    [data.stops],
  );

  return (
    <MapContainer
      center={center}
      zoom={11}
      className={cn("h-full w-full min-h-0 rounded-xl z-0", className)}
      style={{ background: "#f0f0f0" }}
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer url={tileUrl} attribution={TILE_ATTR} />

      <FitRouteBounds
        polyline={data.polyline}
        vehicle={v}
        userLocation={userLocation}
      />

      {/* Route polyline */}
      {polylineLatLngs.length > 1 && (
        <Polyline
          positions={polylineLatLngs}
          pathOptions={{
            color: "hsl(217, 91%, 48%)",
            weight: 4,
            opacity: 0.92,
          }}
        />
      )}

      {/* Stop markers */}
      {stopIcons.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stop.icon}
        />
      ))}

      {/* Bus / vehicle marker */}
      <MovingBusMarker position={[v.lat, v.lng]} />

      {/* User location marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        />
      )}
    </MapContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  DriverMapRoute – public export (used by Dashboard & RouteScreen)  */
/* ------------------------------------------------------------------ */
export function DriverMapRoute({
  routeId,
  height,
  className = "",
  userLocation,
}: {
  routeId: string;
  height?: number | string;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["route", routeId],
    queryFn: () => fetchRoute(routeId),
    refetchInterval: 15_000,
  });

  const shellClass = cn(
    "overflow-hidden rounded-xl border border-border",
    height === undefined && FLUID_MAP_HEIGHT_CLASS,
    className,
  );

  if (isLoading && !data) {
    return (
      <MapSkeleton
        height={typeof height === "number" ? height : undefined}
        className={height === undefined ? shellClass : undefined}
        message="Loading map…"
      />
    );
  }
  if (!data) {
    return (
      <MapSkeleton
        height={typeof height === "number" ? height : undefined}
        className={height === undefined ? shellClass : undefined}
        message="No route data."
      />
    );
  }

  return (
    <div
      className={shellClass}
      style={height !== undefined ? { height } : undefined}
    >
      <RouteMapInner data={data} userLocation={userLocation} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DriverMapEmergency – public export (used by EmergencyScreen)      */
/* ------------------------------------------------------------------ */
export function DriverMapEmergency({
  lat,
  lng,
  accuracyMeters: _accuracyMeters,
  height = 160,
  className = "",
}: {
  lat: number | null;
  lng: number | null;
  accuracyMeters: number | null;
  height?: number | string;
  className?: string;
}) {
  const hasFix = lat != null && lng != null;
  const center: [number, number] = hasFix
    ? [lat!, lng!]
    : CHD_DEFAULT_CENTER;
  const mapTheme = useMapTheme();
  const tileUrl = mapTheme === "dark" ? TILE_DARK : TILE_LIGHT;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border",
        className,
      )}
      style={{ height }}
    >
      <MapContainer
        key={hasFix ? "geo" : "default"}
        center={center}
        zoom={hasFix ? 14 : 11}
        className="h-full w-full min-h-0 rounded-xl z-0"
        style={{
          background: "#f0f0f0",
        }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer url={tileUrl} attribution={TILE_ATTR} />
        {hasFix && (
          <Marker
            position={[lat!, lng!]}
            icon={emergencyIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}
