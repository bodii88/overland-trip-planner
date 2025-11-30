import type { Trip } from '../types';

function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function generateTripICS(trip: Trip): string {
    if (!trip.segments || trip.segments.length === 0) {
        throw new Error('Trip has no segments');
    }

    const startDate = new Date(); // You might want to add a start date field to Trip
    let currentDay = 0;

    const events = trip.segments.map((segment, index) => {
        const eventStart = addDays(startDate, currentDay);
        const daysInSegment = segment.days || Math.ceil(segment.km / 500); // Estimate if not specified
        const eventEnd = addDays(startDate, currentDay + daysInSegment);

        currentDay += daysInSegment;

        const estimatedHours = (segment.km / 80).toFixed(1); // Assuming 80 km/h average

        return `BEGIN:VEVENT
UID:${trip.id}-segment-${index}@trip-planner.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART;VALUE=DATE:${eventStart.toISOString().split('T')[0].replace(/-/g, '')}
DTEND;VALUE=DATE:${eventEnd.toISOString().split('T')[0].replace(/-/g, '')}
SUMMARY:${segment.countryName} - ${segment.km}km
DESCRIPTION:Trip Segment ${index + 1}\\n\\nCountry: ${segment.countryName}\\nDistance: ${segment.km} km\\nEstimated driving time: ${estimatedHours} hours\\nDays: ${daysInSegment}
LOCATION:${segment.countryName}
STATUS:TENTATIVE
END:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Overland Trip Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${trip.name}
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Overland trip itinerary
${events}
END:VCALENDAR`;

    return icsContent;
}

export function downloadICS(trip: Trip): void {
    try {
        const icsContent = generateTripICS(trip);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${trip.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-itinerary.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to generate ICS:', error);
        throw error;
    }
}
