import type { Trip, Vehicle, Settings } from '../types';
import * as firebaseStorage from './firebaseStorage';
import { type Unsubscribe } from 'firebase/firestore';

const DEFAULT_SETTINGS: Settings = {
    baseCurrency: 'KWD',
    defaultSafetyMarginPercent: 15,
    defaultComfortLevel: 50,
    defaultStayCosts: {
        hotelPerNightKwd: 30,
        paidCampPerNightKwd: 10,
        freeCampPerNightKwd: 0,
        friendFamilyPerNightKwd: 0,
    },
};

// Cache for synchronous access
let tripsCache: Trip[] = [];
let vehiclesCache: Vehicle[] = [];
let settingsCache: Settings = DEFAULT_SETTINGS;

let currentUserId: string | undefined = undefined;

// Subscription cleanup functions
let unsubTrips: Unsubscribe | undefined;
let unsubVehicles: Unsubscribe | undefined;
let unsubSettings: Unsubscribe | undefined;

function cleanupSubscriptions() {
    if (unsubTrips) unsubTrips();
    if (unsubVehicles) unsubVehicles();
    if (unsubSettings) unsubSettings();
    unsubTrips = undefined;
    unsubVehicles = undefined;
    unsubSettings = undefined;
}

function initializeSubscriptions(userId: string) {
    cleanupSubscriptions();

    // Initial fetch
    firebaseStorage.getTrips(userId).then(trips => { tripsCache = trips; });
    firebaseStorage.getVehicles(userId).then(vehicles => { vehiclesCache = vehicles; });
    firebaseStorage.getSettings(userId).then(settings => { settingsCache = settings; });

    // Subscriptions
    unsubTrips = firebaseStorage.subscribeToTrips(userId, trips => { tripsCache = trips; });
    unsubVehicles = firebaseStorage.subscribeToVehicles(userId, vehicles => { vehiclesCache = vehicles; });
    unsubSettings = firebaseStorage.subscribeToSettings(userId, settings => { settingsCache = settings; });

    // Migration Check
    if (firebaseStorage.needsMigration(userId)) {
        console.log("Migration needed for user:", userId);
        firebaseStorage.migrateFromLocalStorage(userId);
    }
}

export const storage = {
    setUserId: (userId: string | null) => {
        // If logging out or switching to null
        if (!userId) {
            currentUserId = undefined;
            cleanupSubscriptions();
            tripsCache = [];
            vehiclesCache = [];
            settingsCache = DEFAULT_SETTINGS;
            return;
        }

        // If logging in or switching user
        if (currentUserId !== userId) {
            currentUserId = userId;
            initializeSubscriptions(userId);
        }
    },

    getTrips: (): Trip[] => {
        return tripsCache;
    },
    saveTrips: (trips: Trip[]) => {
        tripsCache = trips;
        firebaseStorage.saveTrips(currentUserId, trips).catch(console.error);
    },
    getVehicles: (): Vehicle[] => {
        return vehiclesCache;
    },
    saveVehicles: (vehicles: Vehicle[]) => {
        console.log(`🔄 Storage: Saving ${vehicles.length} vehicles, userId: ${currentUserId?.slice(0, 8) || 'NONE'}`);
        vehiclesCache = vehicles;
        firebaseStorage.saveVehicles(currentUserId, vehicles).catch((error) => {
            console.error('❌ Failed to save vehicles:', error);
        });
    },
    getSettings: (): Settings => {
        return settingsCache;
    },
    saveSettings: (settings: Settings) => {
        settingsCache = settings;
        firebaseStorage.saveSettings(currentUserId, settings).catch(console.error);
    },
};
