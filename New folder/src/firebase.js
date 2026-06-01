import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB4O-5xysRKl_fZGFanoH1kv7BqQ12NvII",
  authDomain: "eishan-suhail.firebaseapp.com",
  projectId: "eishan-suhail",
  storageBucket: "eishan-suhail.firebasestorage.app",
  messagingSenderId: "337697257824",
  appId: "1:337697257824:web:39bf2c8765d727cf580605",
  measurementId: "G-BK6LG4R2ZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
