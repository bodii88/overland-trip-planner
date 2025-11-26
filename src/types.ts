export type FuelUnit = "km_per_liter" | "liters_per_100km";
export type StayType = "hotel" | "paid_camp" | "free_camp" | "friend_family" | "other";

export interface Vehicle {
    id: string;
    name: string;            // e.g. "Subaru Outback 2.5 NA 2023"
    fuelType: string;        // e.g. "95", "98", "diesel"
    fuelUnit: FuelUnit;
    consumption: number;     // average consumption in the chosen unit
    tankSizeLiters?: number; // optional
    notes?: string;
}

export interface Stay {
    id: string;
    countryCode: string;     // ISO code like "KW", "SA", "OM"
    cityOrArea: string;
    nights: number;
    stayType: StayType;
    costPerNight?: number;   // if not provided, use defaults from settings or external data
    notes?: string;
}

export interface CountrySegment {
    id: string;
    order: number;           // sequence in the route
    countryCode: string;
    countryName: string;
    km: number;              // km driven in this country
    days?: number;           // optional number of days in this country
    fuelPricePerLiter?: number;
    borderFees?: number;
    tollsAndVignettes?: number;
    otherFixedCosts?: number;
    stays: Stay[];
}

export interface TripAssumptions {
    defaultDailyFoodBudgetKwd?: number;       // fallback if not overridden per country
    safetyMarginPercent: number;              // e.g. 15 or 20
    comfortLevel: number;                     // 0–100: 0=ultra-budget, 100=comfort
}

export interface CountryResult {
    countryCode: string;
    countryName: string;
    km: number;
    days?: number;
    fuelCostKwd: number;
    hotelCostKwd: number;
    paidCampCostKwd: number;
    freeCampCostKwd: number;
    friendFamilyCostKwd: number;
    otherStayCostKwd: number;
    foodCostKwd: number;
    borderAndTollsKwd: number;
    otherFixedKwd: number;
    subtotalKwd: number;
}

export interface TripResults {
    totalCostKwd: number;
    totalFuelCostKwd: number;
    totalStayCostKwd: number;
    totalFoodCostKwd: number;
    totalOtherCostKwd: number;
    costPerDay?: number;
    costPerKm?: number;
    perCountry: CountryResult[];
}

export interface Trip {
    id: string;
    name: string;
    description?: string;
    vehicleId: string;
    startDate?: string;      // ISO date
    totalDaysEstimate?: number;
    segments: CountrySegment[];
    assumptions: TripAssumptions;
    isRoundTrip?: boolean;
    results?: TripResults;
}

export interface DailyCostProfile {
    countryCode: string;
    cityName?: string;
    hotelCostPerNight?: number;
    paidCampCostPerNight?: number;
    foodCostPerDay?: number;
}

export interface Settings {
    baseCurrency: string; // e.g. "KWD"
    defaultSafetyMarginPercent: number;
    defaultComfortLevel: number; // 0–100
    defaultStayCosts: {
        hotelPerNightKwd: number;
        paidCampPerNightKwd: number;
        freeCampPerNightKwd: number;
        friendFamilyPerNightKwd: number;
    };
    numbeoApiKey?: string;  // optional, used if implementing external fetch
}
