import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Trip } from '../types';

export interface UserTripData {
    userId: string;
    userEmail: string;
    trip: Trip;
    createdAt?: Date;
}

export interface TripStatistics {
    totalTrips: number;
    totalUsers: number;
    totalDistance: number;
    totalCost: number;
    countriesVisited: Set<string>;
    averageTripCost: number;
    averageTripDistance: number;
}

/**
 * Fetch all trips from all users (Admin only)
 */
export async function getAllUsersTrips(): Promise<UserTripData[]> {
    try {
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, orderBy('name'));
        const snapshot = await getDocs(q);

        const allTrips: UserTripData[] = [];

        snapshot.docs.forEach(doc => {
            const trip = doc.data() as Trip;
            allTrips.push({
                userId: 'default-user', // Current simple setup
                userEmail: 'Anonymous User',
                trip: trip,
                createdAt: new Date()
            });
        });

        return allTrips;
    } catch (error) {
        console.error('Error fetching all trips:', error);
        return [];
    }
}

/**
 * Get recent trips across all users
 */
export async function getRecentTrips(limitCount: number = 10): Promise<UserTripData[]> {
    try {
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, orderBy('name'), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            userId: 'default-user',
            userEmail: 'Anonymous User',
            trip: doc.data() as Trip,
            createdAt: new Date()
        }));
    } catch (error) {
        console.error('Error fetching recent trips:', error);
        return [];
    }
}

/**
 * Calculate statistics from all trips
 */
export function calculateTripStatistics(trips: UserTripData[]): TripStatistics {
    const uniqueUsers = new Set(trips.map(t => t.userId));
    const countriesVisited = new Set<string>();

    let totalDistance = 0;
    let totalCost = 0;

    trips.forEach(({ trip }) => {
        if (trip.segments) {
            trip.segments.forEach(segment => {
                totalDistance += segment.km;
                countriesVisited.add(segment.countryName);
            });
        }

        if (trip.results) {
            totalCost += trip.results.totalCostKwd;
        }
    });

    return {
        totalTrips: trips.length,
        totalUsers: uniqueUsers.size,
        totalDistance,
        totalCost,
        countriesVisited,
        averageTripCost: trips.length > 0 ? totalCost / trips.length : 0,
        averageTripDistance: trips.length > 0 ? totalDistance / trips.length : 0
    };
}

/**
 * Get trips by country
 */
export async function getTripsByCountry(country: string): Promise<UserTripData[]> {
    try {
        const allTrips = await getAllUsersTrips();
        return allTrips.filter(({ trip }) =>
            trip.segments?.some(segment =>
                segment.countryName.toLowerCase().includes(country.toLowerCase())
            )
        );
    } catch (error) {
        console.error('Error fetching trips by country:', error);
        return [];
    }
}

/**
 * Get popular routes (most common country combinations)
 */
export function getPopularRoutes(trips: UserTripData[]): Map<string, number> {
    const routes = new Map<string, number>();

    trips.forEach(({ trip }) => {
        if (trip.segments && trip.segments.length > 0) {
            const countries = trip.segments.map(s => s.countryName).join(' → ');
            routes.set(countries, (routes.get(countries) || 0) + 1);
        }
    });

    return new Map([...routes.entries()].sort((a, b) => b[1] - a[1]));
}
