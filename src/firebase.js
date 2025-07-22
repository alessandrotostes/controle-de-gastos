// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJf7McM8NlsD6Z_KLx6nVh9beJuBzyQGE",
  authDomain: "app-gastos-react-ff2fc.firebaseapp.com",
  projectId: "app-gastos-react-ff2fc",
  storageBucket: "app-gastos-react-ff2fc.firebasestorage.app",
  messagingSenderId: "103444341439",
  appId: "1:103444341439:web:5e4c226cbaee2f18cd5c0a",
  measurementId: "G-ZD05VE7WK5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
