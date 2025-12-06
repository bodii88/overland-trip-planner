
export interface Coordinates {
    lat: number;
    lng: number;
}

// Simulated live fuel prices in KWD per Liter
// 1 KWD = ~3.25 USD
// 100 fils = 0.1 KWD
const FUEL_PRICES_KWD: Record<string, number> = {
    'KW': 0.085, // Kuwait Premium 91
    'SA': 0.23, // Saudi Arabia (~2.33 SAR)
    'AE': 0.31, // UAE (~3.7 AED)
    'OM': 0.24, // Oman (~0.3 OMR)
    'QA': 0.18, // Qatar
    'BH': 0.16, // Bahrain
    'TR': 0.41, // Turkey (~40 TRY)
    'JO': 0.55, // Jordan (~1.2 JOD)
};

export const KURDISTAN_CITIES = [
    'erbil', 'arbil', 'irbil', 'hewler',
    'sulaymaniyah', 'sulaymaniyya', 'slemani',
    'duhok', 'dohuk',
    'zakho',
    'halabja',
    'soran',
    'akre',
    'kalar',
    'ranya'
];

/**
 * Simulates fetching live fuel prices.
 * Handles the specific logic for Iraq vs Kurdistan.
 */
export async function getLiveFuelPrice(countryCode: string, cityOrArea: string): Promise<number> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const code = countryCode.toUpperCase();
    const city = cityOrArea.toLowerCase().trim();

    if (code === 'IQ') {
        // Check if city is in Kurdistan region
        const isKurdistan = KURDISTAN_CITIES.some(kCity => city.includes(kCity));
        if (isKurdistan) {
            // ~200 fils
            return 0.200 + (Math.random() * 0.02);
        } else {
            // ~100 fils
            return 0.100 + (Math.random() * 0.01);
        }
    }

    if (FUEL_PRICES_KWD[code]) {
        // Add tiny variance to make it look "live"
        return FUEL_PRICES_KWD[code] + (Math.random() * 0.005 - 0.0025);
    }

    // Default global average fallback (~1.2 USD) -> ~0.37 KWD
    return 0.37;
}

export async function geocodeCity(query: string): Promise<Coordinates | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'OverlandTripPlanner/1.0'
            }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (e) {
        console.error("Geocoding failed:", e);
    }
    return null;
}

export async function getRouteDistance(coords: Coordinates[]): Promise<number> {
    if (coords.length < 2) return 0;

    // OSRM expects {lon},{lat};{lon},{lat}
    const waypoints = coords.map(c => `${c.lng},${c.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=false`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // distance is in meters, convert to km
            return Math.round(data.routes[0].distance / 1000);
        }
    } catch (e) {
        console.error("Routing failed:", e);
    }

    // Fallback: sum of haversine distances (straight lines)
    let totalKm = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        totalKm += getDistanceFromLatLonInKm(coords[i].lat, coords[i].lng, coords[i + 1].lat, coords[i + 1].lng);
    }
    return Math.round(totalKm * 1.2); // Add 20% buffer for road vs straight line
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}
