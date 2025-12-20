// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "run4life-9460b.firebaseapp.com",
  projectId: "run4life-9460b",
  storageBucket: "run4life-9460b.firebasestorage.app",
  messagingSenderId: "7234282420",
  appId: "1:7234282420:web:1ad818249b1b2bc1ae48e1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
