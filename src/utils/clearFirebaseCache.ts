import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Clears all Firebase offline cache and forces a fresh connection
 * Call this if you're experiencing "client is offline" errors
 */
export async function clearFirebaseCache() {
    try {
        console.log('🧹 Clearing Firebase cache...');

        // Terminate the Firestore instance
        await terminate(db);
        console.log('✅ Firestore terminated');

        // Clear IndexedDB persistence
        await clearIndexedDbPersistence(db);
        console.log('✅ IndexedDB cleared');

        // Reload the page to reinitialize
        window.location.reload();
    } catch (error) {
        console.error('❌ Error clearing Firebase cache:', error);
        // If clearing fails, just reload anyway
        window.location.reload();
    }
}

// Expose globally for debugging
if (typeof window !== 'undefined') {
    (window as any).clearFirebaseCache = clearFirebaseCache;
}
