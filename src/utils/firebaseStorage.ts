import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    onSnapshot,
    query
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Trip, Vehicle, Settings } from '../types';

const USER_ID = 'default-user'; // Simple single-user setup

// Firestore Collections
const TRIPS_COLLECTION = 'trips';
const VEHICLES_COLLECTION = 'vehicles';

// ==================== TRIPS ====================

export async function saveTrips(trips: Trip[]): Promise<void> {
    const batch = trips.map(trip =>
        setDoc(doc(db, TRIPS_COLLECTION, trip.id), trip)
    );
    await Promise.all(batch);
}

export async function getTrips(): Promise<Trip[]> {
    const q = query(collection(db, TRIPS_COLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Trip);
}

export async function deleteTrip(id: string): Promise<void> {
    await deleteDoc(doc(db, TRIPS_COLLECTION, id));
}

export function subscribeToTrips(callback: (trips: Trip[]) => void): () => void {
    const q = query(collection(db, TRIPS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const trips = snapshot.docs.map(doc => doc.data() as Trip);
        callback(trips);
    });
}

// ==================== VEHICLES ====================

export async function saveVehicles(vehicles: Vehicle[]): Promise<void> {
    const batch = vehicles.map(vehicle =>
        setDoc(doc(db, VEHICLES_COLLECTION, vehicle.id), vehicle)
    );
    await Promise.all(batch);
}

export async function getVehicles(): Promise<Vehicle[]> {
    const q = query(collection(db, VEHICLES_COLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Vehicle);
}

export async function deleteVehicle(id: string): Promise<void> {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, id));
}

export function subscribeToVehicles(callback: (vehicles: Vehicle[]) => void): () => void {
    const q = query(collection(db, VEHICLES_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const vehicles = snapshot.docs.map(doc => doc.data() as Vehicle);
        callback(vehicles);
    });
}

// ==================== SETTINGS ====================

export async function saveSettings(settings: Settings): Promise<void> {
    await setDoc(doc(db, 'app-settings', USER_ID), settings);
}

export async function getSettings(): Promise<Settings> {
    const docRef = doc(db, 'app-settings', USER_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Settings;
    }

    // Return default settings
    const defaultSettings: Settings = {
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

    // Save default settings
    await saveSettings(defaultSettings);
    return defaultSettings;
}

export function subscribeToSettings(callback: (settings: Settings) => void): () => void {
    const docRef = doc(db, 'app-settings', USER_ID);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Settings);
        }
    });
}

// ==================== MIGRATION FROM LOCALSTORAGE ====================

export async function migrateFromLocalStorage(): Promise<void> {
    try {
        // Check if we have localStorage data
        const localTrips = localStorage.getItem('trips');
        const localVehicles = localStorage.getItem('vehicles');
        const localSettings = localStorage.getItem('settings');

        if (localTrips) {
            const trips: Trip[] = JSON.parse(localTrips);
            await saveTrips(trips);
            console.log('✅ Migrated trips to Firebase');
        }

        if (localVehicles) {
            const vehicles: Vehicle[] = JSON.parse(localVehicles);
            await saveVehicles(vehicles);
            console.log('✅ Migrated vehicles to Firebase');
        }

        if (localSettings) {
            const settings: Settings = JSON.parse(localSettings);
            await saveSettings(settings);
            console.log('✅ Migrated settings to Firebase');
        }

        // Mark migration as complete
        localStorage.setItem('migrated-to-firebase', 'true');
    } catch (error) {
        console.error('Migration error:', error);
    }
}

// Check if migration is needed
export function needsMigration(): boolean {
    return !localStorage.getItem('migrated-to-firebase') &&
        (!!localStorage.getItem('trips') ||
            !!localStorage.getItem('vehicles') ||
            !!localStorage.getItem('settings'));
}
