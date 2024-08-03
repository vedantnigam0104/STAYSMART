// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOjGtg5Lm0dSKDW23iuzElFtSV_2Q5CdU",
  authDomain: "staysmart-dcf8d.firebaseapp.com",
  projectId: "staysmart-dcf8d",
  storageBucket: "staysmart-dcf8d.appspot.com",
  messagingSenderId: "235791600719",
  appId: "1:235791600719:web:a238e8b7511ea37f38ee3a",
  measurementId: "G-7LZLS94WF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };