import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { getDb } from "./firebase";

export async function upsertBusLocation({
  busId,
  driverId,
  lat,
  lng,
}: {
  busId: string;
  driverId: string;
  lat: number;
  lng: number;
}) {
  try {
    const db = getDb();
    if (!db) {
      console.warn("Firestore not initialized. Check your Firebase config.");
      return false;
    }

    const geohash = geohashForLocation([lat, lng]);
    const ref = doc(db, "bus_locations", busId);
    
    await setDoc(
      ref,
      {
        busId,
        driverId,
        lat,
        lng,
        latitude: lat, // Alias for compatibility
        longitude: lng, // Alias for compatibility
        geohash,
        lastUpdated: serverTimestamp(), // Explicit name
        timestamp: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("Firestore Permission Denied! Update your security rules to allow writes to 'buses' collection.");
    } else {
      console.error("Firestore upsert failed:", error);
    }
    return false;
  }
}
