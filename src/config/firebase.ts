import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB9tn3okOIxc3iA6-o6eYSon4YwFIduF-M",
    authDomain: "trip-project1988.firebaseapp.com",
    projectId: "trip-project1988",
    storageBucket: "trip-project1988.firebasestorage.app",
    messagingSenderId: "99072322416",
    appId: "1:99072322416:web:9fb66daeabbc5dbe547db5",
    measurementId: "G-06PMZ2C6K6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
