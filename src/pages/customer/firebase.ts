import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHxL2gOxKUNB9LkF8bil0z_eO4Gorjp1g",
  authDomain: "shopnova-native.firebaseapp.com",
  projectId: "shopnova-native",
  storageBucket: "shopnova-native.firebasestorage.app",
  messagingSenderId: "1096921989678",
  appId: "1:1096921989678:web:3d2dd3435fa090e84555bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services we need
export const auth = getAuth(app);
export const db = getFirestore(app);