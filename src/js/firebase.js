import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// client config (ok to keep in repo for client apps)
const firebaseConfig = {
  apiKey: "AIzaSyAOMSUmgAy50p7UA8JSGATUpHZrC-vG81o",
  authDomain: "bikeshop-5538b.firebaseapp.com",
  projectId: "bikeshop-5538b",
  storageBucket: "bikeshop-5538b.firebasestorage.app",
  messagingSenderId: "856565983628",
  appId: "1:856565983628:web:231f23c25865cc22f48ea9",
  measurementId: "G-B00VPZJVFY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
//dsdssddsd