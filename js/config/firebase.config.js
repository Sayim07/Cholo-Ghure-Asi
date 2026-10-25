/* ==========================================================================
   Cholo Ghure Asssiii — Firebase Firestore Modular Config (firebase.config.js)
   ========================================================================== */

// Default Firebase Client Credentials (Replace with your Firebase Console Project Keys)
export const firebaseConfig = {
  apiKey: "AIzaSyD0HGVPs-BXg-Hx_oNXzbhpukyWdsLEolw",
  authDomain: "chologhureassi.firebaseapp.com",
  projectId: "chologhureassi",
  storageBucket: "chologhureassi.firebasestorage.app",
  messagingSenderId: "187621278136",
  appId: "1:187621278136:web:defd4b5a212d5129130f4d",
  measurementId: "G-LB6RVKPTTB"
};

let db = null;
let isFirebaseAvailable = false;

// Attempt graceful dynamic import of Firebase v10 CDN SDK
export async function getFirebaseDB() {
  if (db) return { db, isFirebaseAvailable: true };

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseAvailable = true;
    return { db, isFirebaseAvailable: true };
  } catch (err) {
    console.warn("[Firebase] Operating in Local Persistence Mode (Cloud SDK offline or demo keys active).", err);
    return { db: null, isFirebaseAvailable: false };
  }
}
