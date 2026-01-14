import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config (upewnij się, że apiKey jest stringiem, nie undefined)
const firebaseConfig = {
  apiKey: "AIzaSyCfuZwlGsmdLyePIvpLAKxj3jy7ZnvD8lA",
  authDomain: "run4life-9460b.firebaseapp.com",
  projectId: "run4life-9460b",
  storageBucket: "run4life-9460b.firebasestorage.app",
  messagingSenderId: "7234282420",
  appId: "1:7234282420:web:1ad818249b1b2bc1ae48e1",
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Initialize auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
export const db = getFirestore(app);
