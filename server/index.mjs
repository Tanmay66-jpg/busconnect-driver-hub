import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} from "geofire-common";

const app = express();
app.use(cors());
app.use(express.json());

let firestoreAvailable = true;
let db = null;
let busesCol = null;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  db = admin.firestore();
  busesCol = db.collection("buses");
} catch (err) {
  firestoreAvailable = false;
  console.warn("[Firestore] init failed; running in fallback mode", err.message);
}

// Fallback in-memory vehicle state for dev without Firestore
let fallbackVehicle = {
  routeId: "204C",
  busId: "BC-4029",
  driverId: "DRIVER1",
  lat: 30.724,
  lng: 76.758,
  updatedAt: Date.now(),
};

/** Demo route: Chandigarh -> Mohali (approximate coordinates) */
const ROUTES = {
  "204C": {
    id: "204C",
    label: "Chandigarh -> Mohali",
    busId: "BC-4029",
    polyline: [
      [30.7333, 76.778],
      [30.728, 76.765],
      [30.72, 76.75],
      [30.712, 76.732],
      [30.7046, 76.7179],
    ],
    stops: [
      {
        id: "s1",
        name: "ISBT Sector 43, Chandigarh",
        lat: 30.7333,
        lng: 76.778,
        order: 0,
        status: "done",
        time: "Arrived 08:00",
        distance: "0 km",
      },
      {
        id: "s2",
        name: "Sector 17 Plaza",
        lat: 30.728,
        lng: 76.765,
        order: 1,
        status: "current",
        time: "In Transit",
        distance: "5.2 km from start",
      },
      {
        id: "s3",
        name: "Zakir Rose Garden",
        lat: 30.72,
        lng: 76.75,
        order: 2,
        status: "upcoming",
        time: "Scheduled 08:15",
        distance: "8.4 km",
      },
      {
        id: "s4",
        name: "Phase 7, Mohali",
        lat: 30.712,
        lng: 76.732,
        order: 3,
        status: "upcoming",
        time: "Scheduled 08:30",
        distance: "12.1 km",
      },
      {
        id: "s5",
        name: "Aerocity, Mohali",
        lat: 30.7046,
        lng: 76.7179,
        order: 4,
        status: "upcoming",
        time: "Scheduled 08:45",
        distance: "15.5 km",
      },
    ],
  },
};

const emergencies = [];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now(), firestore: firestoreAvailable });
});

app.get("/api/routes/:routeId", async (req, res) => {
  const r = ROUTES[req.params.routeId];
  if (!r) {
    return res.status(404).json({ error: "Route not found" });
  }

  let vehicle = { ...fallbackVehicle, routeId: r.id, busId: r.busId };

  if (firestoreAvailable) {
    try {
      const snap = await busesCol.doc(r.busId).get();
      if (snap.exists) {
        const data = snap.data();
        const loc = data.location;
        if (loc) {
          vehicle = {
            routeId: r.id,
            busId: data.busId ?? r.busId,
            driverId: data.driverId ?? "DRIVER1",
            lat: loc.latitude,
            lng: loc.longitude,
            updatedAt: data.timestamp?.toMillis?.() ?? Date.now(),
          };
        }
      }
    } catch (err) {
      console.warn("[routes/:id] Firestore read failed; using fallback", err.message);
    }
  }

  res.json({ ...r, vehicle });
});

app.post("/api/vehicle/location", async (req, res) => {
  const { busId = "BUS123", driverId = "DRIVER1", lat, lng, routeId = "204C" } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat and lng must be numbers" });
  }

  const geohash = geohashForLocation([lat, lng]);
  const payload = {
    busId,
    driverId,
    location: firestoreAvailable ? new admin.firestore.GeoPoint(lat, lng) : null,
    geohash,
    timestamp: firestoreAvailable ? admin.firestore.FieldValue.serverTimestamp() : Date.now(),
  };

  if (firestoreAvailable) {
    try {
      await busesCol.doc(busId).set(payload, { merge: true });
    } catch (err) {
      console.error("[vehicle/location] Firestore write failed", err);
    }
  }

  fallbackVehicle = { routeId, busId, driverId, lat, lng, updatedAt: Date.now() };
  res.json({ ok: true, vehicle: fallbackVehicle, geohash, persisted: firestoreAvailable });
});

app.get("/api/buses/nearby", async (req, res) => {
  if (!firestoreAvailable) {
    return res.status(503).json({ error: "Firestore unavailable; cannot run geo queries" });
  }

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm ?? 10);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query params are required" });
  }

  const center = [lat, lng];
  const radiusM = radiusKm * 1000;

  const bounds = geohashQueryBounds(center, radiusM);
  const queries = bounds.map(([start, end]) =>
    busesCol.orderBy("geohash").startAt(start).endAt(end).get()
  );

  try {
    const snapshots = await Promise.all(queries);
    const matches = [];

    snapshots.forEach((snap) => {
      snap.docs.forEach((doc) => {
        const data = doc.data();
        const busLoc = data.location;
        if (!busLoc) return;

        const distM = distanceBetween(center, [busLoc.latitude, busLoc.longitude]) * 1000;
        if (distM <= radiusM) {
          matches.push({
            busId: data.busId,
            driverId: data.driverId,
            lat: busLoc.latitude,
            lng: busLoc.longitude,
            distanceKm: distM / 1000,
            timestamp: data.timestamp?.toMillis?.() ?? null,
            geohash: data.geohash,
          });
        }
      });
    });

    matches.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json({ items: matches });
  } catch (err) {
    console.error("[buses/nearby]", err);
    res.status(500).json({ error: "Failed to query nearby buses" });
  }
});

app.post("/api/emergency", (req, res) => {
  const { type, details, lat, lng, routeId, busId } = req.body;
  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "type is required" });
  }
  const record = {
    id: `em-${Date.now()}`,
    type,
    details: typeof details === "string" ? details : "",
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
    routeId: typeof routeId === "string" ? routeId : "204C",
    busId: typeof busId === "string" ? busId : "BC-4029",
    createdAt: new Date().toISOString(),
  };
  emergencies.push(record);
  console.log("[EMERGENCY]", record);
  res.status(201).json({ ok: true, id: record.id });
});

app.get("/api/emergency/recent", (_req, res) => {
  res.json({ items: emergencies.slice(-20).reverse() });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`BusConnect API listening on http://localhost:${PORT}`);
});
