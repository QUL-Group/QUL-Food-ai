import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAHNHXIUau6-fX0K4FDr0mi_W_ObHEOek4",
  authDomain: "qul-food-ai.firebaseapp.com",
  projectId: "qul-food-ai",
  storageBucket: "qul-food-ai.firebasestorage.app",
  messagingSenderId: "664053366877",
  appId: "1:664053366877:web:14448a269033a60880cdb4",
  measurementId: "G-5HS5MNHLCD"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export const messaging =
typeof window !== "undefined"
?
getMessaging(app)
:
null;