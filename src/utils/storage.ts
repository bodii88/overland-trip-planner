import type { Trip, Vehicle, Settings } from '../types';
import * as firebaseStorage from './firebaseStorage';

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

// Initialize caches from Firebase
firebaseStorage.getTrips().then(trips => { tripsCache = trips; });
firebaseStorage.getVehicles().then(vehicles => { vehiclesCache = vehicles; });
firebaseStorage.getSettings().then(settings => { settingsCache = settings; });

// Subscribe to real-time updates
firebaseStorage.subscribeToTrips(trips => { tripsCache = trips; });
firebaseStorage.subscribeToVehicles(vehicles => { vehiclesCache = vehicles; });
firebaseStorage.subscribeToSettings(settings => { settingsCache = settings; });

export const storage = {
    getTrips: (): Trip[] => {
        return tripsCache;
    },
    saveTrips: (trips: Trip[]) => {
        tripsCache = trips;
        firebaseStorage.saveTrips(trips).catch(console.error);
    },
    getVehicles: (): Vehicle[] => {
        return vehiclesCache;
    },
    saveVehicles: (vehicles: Vehicle[]) => {
        vehiclesCache = vehicles;
        firebaseStorage.saveVehicles(vehicles).catch(console.error);
    },
    getSettings: (): Settings => {
        return settingsCache;
    },
    saveSettings: (settings: Settings) => {
        settingsCache = settings;
        firebaseStorage.saveSettings(settings).catch(console.error);
    },
};
