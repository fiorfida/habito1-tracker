import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8e96v7okHNCfR69auypJ6Sux9ZhX9qg8",
  authDomain: "habito1-tracker.firebaseapp.com",
  projectId: "habito1-tracker",
  storageBucket: "habito1-tracker.firebasestorage.app",
  messagingSenderId: "538081057483",
  appId: "1:538081057483:web:6e48725434358cef56594e",
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}
export function logout() {
  return signOut(auth);
}
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}