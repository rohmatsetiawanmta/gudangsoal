import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDEz1OgJyocMmBxPAAwTzXdEqGv9-8ZzUg",
  authDomain: "gudang-soal-35095.firebaseapp.com",
  projectId: "gudang-soal-35095",
  storageBucket: "gudang-soal-35095.firebasestorage.app",
  messagingSenderId: "677459288150",
  appId: "1:677459288150:web:791d04d66510cf01559bf7",
  // Isi setelah Realtime Database dibuat di Firebase Console
  databaseURL: "https://gudang-soal-35095-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
