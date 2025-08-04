import { initializeApp } from "firebase/app";
import { getFirestore }  from "firebase/firestore";
import {getAuth,GoogleAuthProvider} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDYtamWDuBlKUCc1j6TnKhZeIoVH4i8X1I",
  authDomain: "fastblog-9c41f.firebaseapp.com",
  projectId: "fastblog-9c41f",
  storageBucket: "fastblog-9c41f.firebasestorage.app",
  messagingSenderId: "530339051451",
  appId: "1:530339051451:web:3835ff97dba6cc7a4eb69e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore (app);
export const auth = getAuth (app);
export const provider = new GoogleAuthProvider();
