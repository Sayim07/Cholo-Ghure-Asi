/* ==========================================================================
   Cholo Ghure Asssiii — Firebase Firestore Modular Config (firebase.config.js)
   ========================================================================== */

// Default Firebase Client Credentials (Replace with your Firebase Console Project Keys)
export const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForCholoGhureAsssiiiPlanner",
  authDomain: "cholo-ghure-asssiii.firebaseapp.com",
  projectId: "cholo-ghure-asssiii",
  storageBucket: "cholo-ghure-asssiii.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef1234567890"
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
