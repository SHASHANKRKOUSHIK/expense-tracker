import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZZOZPNPdi8k3I_lgpCbo0sjsCIhliQZw",
  authDomain: "expense-tracker-5461.firebaseapp.com",
  projectId: "expense-tracker-5461",
  storageBucket: "expense-tracker-5461.firebasestorage.app",
  messagingSenderId: "954081476211",
  appId: "1:954081476211:web:d7ea4c70489eb2db043406"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);