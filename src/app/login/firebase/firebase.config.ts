// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional          
const firebaseConfig = {
  apiKey: "AIzaSyDRmNHHnoSucmi8mN7KHcaE2tzcTP1Gjw4",
  authDomain: "nestjs-recover-account.firebaseapp.com",
  projectId: "nestjs-recover-account",
  storageBucket: "nestjs-recover-account.firebasestorage.app",
  messagingSenderId: "762384733552",
  appId: "1:762384733552:web:438d58e8d64677cbbeebb5",
  measurementId: "G-EFW9GRQHGN"
};

// Initialize Firebase
export const initializeFirebaseConfig = initializeApp(firebaseConfig);
