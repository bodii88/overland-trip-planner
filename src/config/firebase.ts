import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDCrgmmNwA3tZYT3Tk4HzbndmmYTzyv15U",
    authDomain: "overland-6df3e.firebaseapp.com",
    projectId: "overland-6df3e",
    storageBucket: "overland-6df3e.firebasestorage.app",
    messagingSenderId: "439828272968",
    appId: "1:439828272968:web:48e8459baf1f175944057d",
    measurementId: "G-L7GKX7CP93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to prevent offline issues
export const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    // Disable offline persistence to prevent sync issues
    localCache: undefined
});

export const auth = getAuth(app);
export const analytics = getAnalytics(app);

