import type { Trip, Vehicle, Settings, TripResults, CountryResult } from '../types';

export function calculateTrip(trip: Trip, vehicle: Vehicle, settings: Settings): TripResults {
    const { assumptions } = trip;
    const safetyMargin = assumptions.safetyMarginPercent ?? settings.defaultSafetyMarginPercent;

    // Consumption in L/100km
    let consumptionL100km = vehicle.consumption;
    if (vehicle.fuelUnit === 'km_per_liter') {
        consumptionL100km = 100 / vehicle.consumption;
    }

    const multiplier = trip.isRoundTrip ? 2 : 1;

    const perCountry: CountryResult[] = trip.segments.map(segment => {
        // Fuel
        const liters = (segment.km * consumptionL100km) / 100;
        const fuelCostKwd = liters * (segment.fuelPricePerLiter || 0) * multiplier;

        // Stays
        let hotelCostKwd = 0;
        let paidCampCostKwd = 0;
        let freeCampCostKwd = 0;
        let friendFamilyCostKwd = 0;
        let otherStayCostKwd = 0;

        segment.stays.forEach(stay => {
            const nights = stay.nights * multiplier;
            let costPerNight = stay.costPerNight;

            if (costPerNight === undefined) {
                // Use defaults
                switch (stay.stayType) {
                    case 'hotel':
                        costPerNight = settings.defaultStayCosts.hotelPerNightKwd;
                        break;
                    case 'paid_camp':
                        costPerNight = settings.defaultStayCosts.paidCampPerNightKwd;
                        break;
                    case 'free_camp':
                        costPerNight = settings.defaultStayCosts.freeCampPerNightKwd;
                        break;
                    case 'friend_family':
                        costPerNight = settings.defaultStayCosts.friendFamilyPerNightKwd;
                        break;
                    case 'other':
                        costPerNight = 0;
                        break;
                }
            }

            const totalStay = nights * (costPerNight || 0);

            switch (stay.stayType) {
                case 'hotel': hotelCostKwd += totalStay; break;
                case 'paid_camp': paidCampCostKwd += totalStay; break;
                case 'free_camp': freeCampCostKwd += totalStay; break;
                case 'friend_family': friendFamilyCostKwd += totalStay; break;
                case 'other': otherStayCostKwd += totalStay; break;
            }
        });

        // Food
        const days = (segment.days || 0) * multiplier;
        const foodCostPerDay = assumptions.defaultDailyFoodBudgetKwd || 15; // Default fallback
        const foodCostKwd = days * foodCostPerDay;

        // Other
        const borderAndTollsKwd = ((segment.borderFees || 0) + (segment.tollsAndVignettes || 0)) * multiplier;
        const otherFixedKwd = (segment.otherFixedCosts || 0) * multiplier;

        const subtotalKwd = fuelCostKwd + hotelCostKwd + paidCampCostKwd + freeCampCostKwd + friendFamilyCostKwd + otherStayCostKwd + foodCostKwd + borderAndTollsKwd + otherFixedKwd;

        return {
            countryCode: segment.countryCode,
            countryName: segment.countryName,
            km: segment.km * multiplier,
            days: days,
            fuelCostKwd,
            hotelCostKwd,
            paidCampCostKwd,
            freeCampCostKwd,
            friendFamilyCostKwd,
            otherStayCostKwd,
            foodCostKwd,
            borderAndTollsKwd,
            otherFixedKwd,
            subtotalKwd,
        };
    });

    const totalFuelCostKwd = perCountry.reduce((sum, c) => sum + c.fuelCostKwd, 0);
    const totalStayCostKwd = perCountry.reduce((sum, c) => sum + c.hotelCostKwd + c.paidCampCostKwd + c.freeCampCostKwd + c.friendFamilyCostKwd + c.otherStayCostKwd, 0);
    const totalFoodCostKwd = perCountry.reduce((sum, c) => sum + c.foodCostKwd, 0);
    const totalOtherCostKwd = perCountry.reduce((sum, c) => sum + c.borderAndTollsKwd + c.otherFixedKwd, 0);

    const rawTotal = totalFuelCostKwd + totalStayCostKwd + totalFoodCostKwd + totalOtherCostKwd;
    const totalCostKwd = rawTotal * (1 + safetyMargin / 100);

    const totalKm = perCountry.reduce((sum, c) => sum + c.km, 0);
    const totalDays = perCountry.reduce((sum, c) => sum + (c.days || 0), 0);

    return {
        totalCostKwd,
        totalFuelCostKwd,
        totalStayCostKwd,
        totalFoodCostKwd,
        totalOtherCostKwd,
        costPerDay: totalDays > 0 ? totalCostKwd / totalDays : 0,
        costPerKm: totalKm > 0 ? totalCostKwd / totalKm : 0,
        perCountry,
    };
}
