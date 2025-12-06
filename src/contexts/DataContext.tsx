import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { Trip, Vehicle, Settings } from '../types';
import * as firebaseStorage from '../utils/firebaseStorage';
import { storage } from '../utils/storage';

interface DataContextType {
    trips: Trip[];
    vehicles: Vehicle[];
    settings: Settings;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [settings, setSettings] = useState<Settings>(storage.getSettings()); // default
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTrips([]);
            setVehicles([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Subscriptions - also update storage cache for backward compatibility
        const unsubTrips = firebaseStorage.subscribeToTrips(user.uid, (data) => {
            setTrips(data);
            console.log('📦 Trips updated from Firebase:', data.length);
        });

        const unsubVehicles = firebaseStorage.subscribeToVehicles(user.uid, (data) => {
            setVehicles(data);
            console.log('🚗 Vehicles updated from Firebase:', data.length);
        });

        const unsubSettings = firebaseStorage.subscribeToSettings(user.uid, (data) => {
            setSettings(data);
            setLoading(false);
            console.log('⚙️ Settings updated from Firebase');
        });

        return () => {
            if (unsubTrips) unsubTrips();
            if (unsubVehicles) unsubVehicles();
            if (unsubSettings) unsubSettings();
        };
    }, [user]);

    return (
        <DataContext.Provider value={{ trips, vehicles, settings, loading }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
