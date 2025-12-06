import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    onSnapshot,
    query,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Trip, Vehicle, Settings } from '../types';

// Constants
const USERS_COLLECTION = 'users'; // Root collection for user data

// ==================== TRIPS ====================

export async function saveTrips(userId: string | undefined, trips: Trip[]): Promise<void> {
    if (!userId) return; // Don't save if no user
    const batch = trips.map(trip =>
        setDoc(doc(db, USERS_COLLECTION, userId, 'trips', trip.id), trip)
    );
    await Promise.all(batch);
}

// Deprecated: Single usage save
export async function saveTrip(userId: string, trip: Trip): Promise<void> {
    await setDoc(doc(db, USERS_COLLECTION, userId, 'trips', trip.id), trip);
}

export async function getTrips(userId?: string): Promise<Trip[]> {
    if (!userId) return [];
    const q = query(collection(db, USERS_COLLECTION, userId, 'trips'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Trip);
}

export async function deleteTrip(userId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, USERS_COLLECTION, userId, 'trips', id));
}

export function subscribeToTrips(userId: string | undefined, callback: (trips: Trip[]) => void): Unsubscribe | undefined {
    if (!userId) return undefined;
    const q = query(collection(db, USERS_COLLECTION, userId, 'trips'));
    return onSnapshot(q, (snapshot) => {
        const trips = snapshot.docs.map(doc => doc.data() as Trip);
        callback(trips);
    });
}

// ==================== VEHICLES ====================

export async function saveVehicles(userId: string | undefined, vehicles: Vehicle[]): Promise<void> {
    if (!userId) {
        console.error('❌ Cannot save vehicles: No user ID');
        return;
    }
    console.log(`💾 Saving ${vehicles.length} vehicles for user ${userId.slice(0, 8)}...`);
    const batch = vehicles.map(vehicle =>
        setDoc(doc(db, USERS_COLLECTION, userId, 'vehicles', vehicle.id), vehicle)
    );
    await Promise.all(batch);
    console.log(`✅ Successfully saved ${vehicles.length} vehicles`);
}

export async function saveVehicle(userId: string, vehicle: Vehicle): Promise<void> {
    await setDoc(doc(db, USERS_COLLECTION, userId, 'vehicles', vehicle.id), vehicle);
}

export async function getVehicles(userId?: string): Promise<Vehicle[]> {
    if (!userId) return [];
    const q = query(collection(db, USERS_COLLECTION, userId, 'vehicles'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Vehicle);
}

export async function deleteVehicle(userId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, USERS_COLLECTION, userId, 'vehicles', id));
}

export function subscribeToVehicles(userId: string | undefined, callback: (vehicles: Vehicle[]) => void): Unsubscribe | undefined {
    if (!userId) return undefined;
    const q = query(collection(db, USERS_COLLECTION, userId, 'vehicles'));
    return onSnapshot(q, (snapshot) => {
        const vehicles = snapshot.docs.map(doc => doc.data() as Vehicle);
        callback(vehicles);
    });
}

// ==================== SETTINGS ====================

export async function saveSettings(userId: string | undefined, settings: Settings): Promise<void> {
    if (!userId) return;
    await setDoc(doc(db, USERS_COLLECTION, userId, 'settings', 'app-settings'), settings);
}

export async function getSettings(userId?: string): Promise<Settings> {
    if (!userId) return DEFAULT_SETTINGS;

    const docRef = doc(db, USERS_COLLECTION, userId, 'settings', 'app-settings');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Settings;
    }

    // Return default settings
    await saveSettings(userId, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
}

export function subscribeToSettings(userId: string | undefined, callback: (settings: Settings) => void): Unsubscribe | undefined {
    if (!userId) return undefined;
    const docRef = doc(db, USERS_COLLECTION, userId, 'settings', 'app-settings');
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Settings);
        }
    });
}

const DEFAULT_SETTINGS: Settings = {
    baseCurrency: 'KWD',
    defaultSafetyMarginPercent: 10,
    defaultComfortLevel: 50,
    defaultStayCosts: {
        hotelPerNightKwd: 20,
        paidCampPerNightKwd: 5,
        freeCampPerNightKwd: 0,
        friendFamilyPerNightKwd: 0,
    },
};

// ==================== MIGRATION FROM LOCALSTORAGE ====================

export async function migrateFromLocalStorage(userId: string): Promise<void> {
    try {
        // Check if we have localStorage data
        const localTrips = localStorage.getItem('trips');
        const localVehicles = localStorage.getItem('vehicles');
        const localSettings = localStorage.getItem('settings');

        if (localTrips) {
            const trips: Trip[] = JSON.parse(localTrips);
            await saveTrips(userId, trips);
            console.log('✅ Migrated trips to Firebase');
        }

        if (localVehicles) {
            const vehicles: Vehicle[] = JSON.parse(localVehicles);
            await saveVehicles(userId, vehicles);
            console.log('✅ Migrated vehicles to Firebase');
        }

        if (localSettings) {
            const settings: Settings = JSON.parse(localSettings);
            await saveSettings(userId, settings);
            console.log('✅ Migrated settings to Firebase');
        }

        // Mark migration as complete
        localStorage.setItem(`migrated-to-firebase-${userId}`, 'true');
    } catch (error) {
        console.error('Migration error:', error);
    }
}

// Check if migration is needed
export function needsMigration(userId: string): boolean {
    return !localStorage.getItem(`migrated-to-firebase-${userId}`) &&
        (!!localStorage.getItem('trips') ||
            !!localStorage.getItem('vehicles') ||
            !!localStorage.getItem('settings'));
}
