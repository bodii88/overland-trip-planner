import type { UserTripData } from './adminAnalytics';

/**
 * Export analytics data as CSV
 */
export function exportAnalyticsToCSV(trips: UserTripData[]): void {
    const headers = [
        'Trip Name',
        'User Email',
        'Segments',
        'Total Distance (km)',
        'Total Days',
        'Fuel Cost (KWD)',
        'Accommodation Cost (KWD)',
        'Food Cost (KWD)',
        'Total Cost (KWD)',
        'Countries'
    ];

    const rows = trips.map(({ trip, userEmail }) => {
        const totalDistance = trip.segments?.reduce((sum, s) => sum + s.km, 0) || 0;
        const totalDays = trip.segments?.reduce((sum, s) => sum + (s.days || 0), 0) || 0;
        const countries = trip.segments?.map(s => s.countryName).join(' → ') || '';

        return [
            trip.name,
            userEmail,
            trip.segments?.length || 0,
            totalDistance,
            totalDays,
            trip.results?.totalFuelCostKwd || 0,
            trip.results?.totalStayCostKwd || 0,
            trip.results?.totalFoodCostKwd || 0,
            trip.results?.totalCostKwd || 0,
            countries
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export analytics summary as JSON
 */
export function exportAnalyticsToJSON(trips: UserTripData[], stats: any): void {
    const data = {
        exportedAt: new Date().toISOString(),
        summary: {
            totalTrips: stats.totalTrips,
            totalDistance: stats.totalDistance,
            totalCost: stats.totalCost,
            averageCost: stats.averageTripCost,
            averageDistance: stats.averageTripDistance,
            countriesVisited: Array.from(stats.countriesVisited)
        },
        trips: trips.map(({ trip, userEmail }) => ({
            name: trip.name,
            userEmail,
            segments: trip.segments,
            results: trip.results
        }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Filter trips by date range
 */
export function filterTripsByDateRange(
    trips: UserTripData[],
    startDate: Date | null,
    endDate: Date | null
): UserTripData[] {
    if (!startDate && !endDate) return trips;

    return trips.filter(({ createdAt }) => {
        if (!createdAt) return true;
        if (startDate && createdAt < startDate) return false;
        if (endDate && createdAt > endDate) return false;
        return true;
    });
}

/**
 * Filter trips by country
 */
export function filterTripsByCountry(trips: UserTripData[], country: string): UserTripData[] {
    if (!country) return trips;

    return trips.filter(({ trip }) =>
        trip.segments?.some(segment =>
            segment.countryName.toLowerCase().includes(country.toLowerCase())
        )
    );
}

/**
 * Filter trips by cost range
 */
export function filterTripsByCostRange(
    trips: UserTripData[],
    minCost: number | null,
    maxCost: number | null
): UserTripData[] {
    return trips.filter(({ trip }) => {
        if (!trip.results) return false;
        const cost = trip.results.totalCostKwd;
        if (minCost !== null && cost < minCost) return false;
        if (maxCost !== null && cost > maxCost) return false;
        return true;
    });
}

/**
 * Sort trips by various criteria
 */
export function sortTrips(
    trips: UserTripData[],
    sortBy: 'name' | 'distance' | 'cost' | 'date',
    order: 'asc' | 'desc' = 'desc'
): UserTripData[] {
    const sorted = [...trips].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.trip.name.localeCompare(b.trip.name);
                break;
            case 'distance':
                const distA = a.trip.segments?.reduce((sum, s) => sum + s.km, 0) || 0;
                const distB = b.trip.segments?.reduce((sum, s) => sum + s.km, 0) || 0;
                comparison = distA - distB;
                break;
            case 'cost':
                const costA = a.trip.results?.totalCostKwd || 0;
                const costB = b.trip.results?.totalCostKwd || 0;
                comparison = costA - costB;
                break;
            case 'date':
                const dateA = a.createdAt?.getTime() || 0;
                const dateB = b.createdAt?.getTime() || 0;
                comparison = dateA - dateB;
                break;
        }

        return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
}

/**
 * Get cost distribution data for charts
 */
export function getCostDistribution(trips: UserTripData[]): {
    labels: string[];
    fuel: number[];
    accommodation: number[];
    food: number[];
} {
    const labels: string[] = [];
    const fuel: number[] = [];
    const accommodation: number[] = [];
    const food: number[] = [];

    trips.forEach(({ trip }) => {
        if (trip.results) {
            labels.push(trip.name.substring(0, 20));
            fuel.push(trip.results.totalFuelCostKwd);
            accommodation.push(trip.results.totalStayCostKwd);
            food.push(trip.results.totalFoodCostKwd);
        }
    });

    return { labels, fuel, accommodation, food };
}

/**
 * Get country frequency data
 */
export function getCountryFrequency(trips: UserTripData[]): Map<string, number> {
    const frequency = new Map<string, number>();

    trips.forEach(({ trip }) => {
        trip.segments?.forEach(segment => {
            const count = frequency.get(segment.countryName) || 0;
            frequency.set(segment.countryName, count + 1);
        });
    });

    return new Map([...frequency.entries()].sort((a, b) => b[1] - a[1]));
}
