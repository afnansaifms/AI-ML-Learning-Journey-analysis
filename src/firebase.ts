import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMVg0T55bFsnR5s45NXasDCXG2IsvsR4k",
  authDomain: "nlp-tracker-5ce86.firebaseapp.com",
  projectId: "nlp-tracker-5ce86",
  storageBucket: "nlp-tracker-5ce86.firebasestorage.app",
  messagingSenderId: "834796618921",
  appId: "1:834796618921:web:f4bda3fd7cdf7223d295b8",
  measurementId: "G-G17YGSFDN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);