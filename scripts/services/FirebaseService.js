/* ==========================================================================
   Cholo Ghure Asssiii — Firebase Cloud & Offline Persistence (FirebaseService.js)
   Conforms to Schema.md §3 & ImplementationPlan.md §2.5
   ========================================================================== */

import { getFirebaseDB } from "../config/firebase.config.js";
import { APP_CONSTANTS } from "../config/constants.js";

export class FirebaseService {
  /**
   * Save trip to Firestore trips collection with localStorage fallback
   */
  static async saveTrip(tripData) {
    const tripToSave = {
      ...tripData,
      updatedAt: new Date().toISOString()
    };

    // 1. Always update local storage for offline resilience
    const localTrips = FirebaseService.getLocalSavedTrips();
    const existingIndex = localTrips.findIndex(t => t.id === tripToSave.id);
    if (existingIndex >= 0) {
      localTrips[existingIndex] = tripToSave;
    } else {
      localTrips.unshift(tripToSave);
    }
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(localTrips));

    // 2. Attempt Firestore sync if SDK available
    try {
      const { db, isFirebaseAvailable } = await getFirebaseDB();
      if (isFirebaseAvailable && db) {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(doc(db, "trips", tripToSave.id), tripToSave);
        return { success: true, mode: "cloud", tripId: tripToSave.id };
      }
    } catch (err) {
      console.warn("[FirebaseService] Cloud write deferred to local store:", err);
    }

    return { success: true, mode: "local", tripId: tripToSave.id };
  }

  /**
   * Fetch all saved trips
   */
  static async getSavedTrips() {
    const localTrips = FirebaseService.getLocalSavedTrips();

    try {
      const { db, isFirebaseAvailable } = await getFirebaseDB();
      if (isFirebaseAvailable && db) {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const querySnapshot = await getDocs(collection(db, "trips"));
        const cloudTrips = [];
        querySnapshot.forEach(doc => {
          cloudTrips.push(doc.data());
        });
        if (cloudTrips.length > 0) return cloudTrips;
      }
    } catch (err) {
      console.warn("[FirebaseService] Fetching from local store:", err);
    }

    return localTrips;
  }

  /**
   * Delete saved trip
   */
  static async deleteTrip(tripId) {
    const localTrips = FirebaseService.getLocalSavedTrips().filter(t => t.id !== tripId);
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(localTrips));

    try {
      const { db, isFirebaseAvailable } = await getFirebaseDB();
      if (isFirebaseAvailable && db) {
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await deleteDoc(doc(db, "trips", tripId));
      }
    } catch (err) {
      console.warn("[FirebaseService] Delete handled locally:", err);
    }

    return true;
  }

  static getLocalSavedTrips() {
    try {
      const raw = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SAVED_TRIPS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}
