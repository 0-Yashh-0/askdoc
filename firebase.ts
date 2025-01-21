import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "askdoc-21a80.firebaseapp.com",
    projectId: "askdoc-21a80",
    storageBucket: "askdoc-21a80.firebasestorage.app",
    messagingSenderId: "176187687952",
    appId: "1:176187687952:web:c60a92be75e172d41c7695",
    measurementId: "G-611LDVXKCB"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export { db };