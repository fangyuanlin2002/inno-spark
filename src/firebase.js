import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDN3WJCkajxiz7SVnRmB4DxmWlWKrvUxds",
  authDomain: "innospark-b3206.firebaseapp.com",
  projectId: "innospark-b3206",
  storageBucket: "innospark-b3206.appspot.com",
  messagingSenderId: "930562636272",
  appId: "1:930562636272:web:516e8fe235cf1a41874535",
  measurementId: "G-J356DP4C6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
