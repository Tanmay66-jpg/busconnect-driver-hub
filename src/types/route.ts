export type StopStatus = "done" | "current" | "upcoming";

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  status: StopStatus;
  time: string;
  distance: string;
}

export interface VehiclePosition {
  routeId: string;
  busId?: string;
  driverId?: string;
  lat: number;
  lng: number;
  updatedAt: number;
  geohash?: string;
}

export interface RoutePayload {
  id: string;
  label: string;
  busId: string;
  polyline: [number, number][];
  stops: RouteStop[];
  vehicle: VehiclePosition;
}

