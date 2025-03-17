// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCIndoEbLpaXUAZ3KM8nFs6BUVr1BMaaaI",
    authDomain: "disneyapp-60462.firebaseapp.com",
    projectId: "disneyapp-60462",
    storageBucket: "disneyapp-60462.firebasestorage.app",
    messagingSenderId: "351583345849",
    appId: "1:351583345849:web:8a7617e0cf51f2f3df0f68",
    measurementId: "G-D6N7G1EF46"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
