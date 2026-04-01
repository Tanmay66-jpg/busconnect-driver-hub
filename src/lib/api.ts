import type { RoutePayload, VehiclePosition } from "@/types/route";
import { FALLBACK_ROUTE_204C } from "@/lib/routeFallback";

const base = () => (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "") || "";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchRoute(routeId: string): Promise<RoutePayload> {
  try {
    const res = await fetch(`${base()}/api/routes/${encodeURIComponent(routeId)}`);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as RoutePayload;
  } catch {
    if (routeId === "204C") return { ...FALLBACK_ROUTE_204C, vehicle: { ...FALLBACK_ROUTE_204C.vehicle, updatedAt: Date.now() } };
    throw new Error("Route unavailable and no offline data for this id.");
  }
}

export async function postVehicleLocation(body: { lat: number; lng: number; routeId?: string; busId?: string; driverId?: string }) {
  const res = await fetch(`${base()}/api/vehicle/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<{ ok: boolean; vehicle: VehiclePosition }>(res);
}

export async function postEmergency(body: {
  type: string;
  details: string;
  lat: number | null;
  lng: number | null;
  routeId?: string;
  busId?: string;
}) {
  const res = await fetch(`${base()}/api/emergency`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<{ ok: boolean; id: string }>(res);
}

export async function fetchHealth() {
  const res = await fetch(`${base()}/api/health`);
  return parseJson<{ ok: boolean; ts: number }>(res);
}

