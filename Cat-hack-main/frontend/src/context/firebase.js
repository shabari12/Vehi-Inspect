import { initializeApp } from "firebase/app";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1_Yf3fLySYb1HtvXY7dA7DVXE_CHhhP0",
  authDomain: "cat-hacks.firebaseapp.com",
  projectId: "cat-hacks",
  storageBucket: "cat-hacks.appspot.com",
  messagingSenderId: "872766759984",
  appId: "1:872766759984:web:f82a14174176f708f7b9f5",
  measurementId: "G-EV94FC5CSF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const refreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // Force refresh
      console.log("Token refreshed:", token);
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, doc, setDoc, refreshToken };
