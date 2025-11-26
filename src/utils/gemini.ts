import type { Trip, TripResults } from '../types';

const API_KEY = 'AIzaSyB4pWdUylYnlOCqeZotQbG0qe67_sPN15o';

export interface AIAnalysis {
    factCheck: string;
    tips: string;
    recommendations: string;
}

export async function analyzeTripWithGemini(trip: Trip, results: TripResults): Promise<string> {
    const prompt = `
    You are an expert overland trip planner. Analyze the following trip plan and budget:

    Trip Name: ${trip.name}
    Vehicle: ${trip.vehicleId} (Fuel: ${results.totalFuelCostKwd.toFixed(2)} KWD)
    Total Cost: ${results.totalCostKwd.toFixed(2)} KWD
    Total Distance: ${results.perCountry.reduce((acc, c) => acc + c.km, 0)} km

    Route:
    ${trip.segments.map(s => `- ${s.countryName} (${s.km} km, ${s.days} days)`).join('\n')}

    Please provide a detailed report with the following sections:
    1. **Fact Checker**: Validate the estimated costs (fuel, stays) and distances. Are they realistic for these countries?
    2. **Tips**: Practical advice for driving and staying in these specific countries (visas, road conditions, safety).
    3. **Recommendations**: Suggested stops, scenic routes, or adjustments to the itinerary.

    Format the response in Markdown.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text || "No analysis could be generated.";
        return text;

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        // If the request failed because the model/key is not enabled, show a helpful message.
        if (error instanceof Error && error.message.includes('404')) {
            return `**AI Report Unavailable**\n\nThe Gemini model could not be reached (404).\nMake sure the Generative Language API is enabled for the Google Cloud project associated with the API key and that the key has permission to call the Gemini model.`;
        }
        // Re‑throw other errors so the UI can handle them.
        throw error;
    }
}
