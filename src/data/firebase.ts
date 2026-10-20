// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Import getAuth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHxL2gOxKUNB9LkF8bil0z_eO4Gorjp1g",
  authDomain: "shopnova-native.firebaseapp.com",
  projectId: "shopnova-native",
  storageBucket: "shopnova-native.firebasestorage.app",
  messagingSenderId: "1096921989678",
  appId: "1:1096921989678:web:3d2dd3435fa090e84555bf"
};
console.log("Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);

// Notice the variable name here is 'db'
export const db = getFirestore(app); 
export const auth = getAuth(app); // 2. Export auth!
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
//export const app = initializeApp(firebaseConfig);

