import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo",
    authDomain: "staffbook-e43b7.firebaseapp.com",
    projectId: "staffbook-e43b7",
    storageBucket: "staffbook-e43b7.firebasestorage.app",
    messagingSenderId: "834211101436",
    appId: "1:834211101436:web:20b1b8ff0bf74fcf4cf579",
    measurementId: "G-CP8RB3TXJH",
    databaseURL: "https://staffbook-e43b7-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'consent' });
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, googleProvider, db, storage };
