# Implementation Plan: Advanced Features

## ✅ 1. Currency Switcher (COMPLETED)

### What was implemented:
- ✅ Currency conversion utility (`src/utils/currency.ts`)
- ✅ Currency context for global state (`src/contexts/CurrencyContext.tsx`)
- ✅ Currency switcher component (`src/components/CurrencySwitcher.tsx`)
- ✅ Updated Results page with currency conversion
- ✅ Support for 10 currencies: KWD, USD, EUR, GBP, SAR, AED, OMR, QAR, BHD, JOD

### Features:
- Default currency: KWD
- Real-time conversion of all amounts
- Persistent selection (localStorage)
- Dropdown switcher in Results page header

---

## 🔄 2. PWA (Progressive Web App) - IN PROGRESS

### Implementation Steps:

#### A. Service Worker Registration
Create `public/service-worker.js`:
```javascript
const CACHE_NAME = 'trip-planner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

#### B. Web App Manifest
Create `public/manifest.json`:
```json
{
  "name": "Overland Trip Planner",
  "short_name": "Trip Planner",
  "description": "Plan your overland adventures with cost calculations and AI insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1f2937",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### C. Register Service Worker
Update `src/main.tsx`:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

#### D. Cache Strategy
- **App Shell**: Cache HTML, CSS, JS
- **Last Opened Trip**: Store in IndexedDB
- **Offline Fallback**: Show cached data when offline

---

## 📅 3. ICS Export - TODO

### Implementation Steps:

#### A. Create ICS Generator
Create `src/utils/icsGenerator.ts`:
```typescript
export function generateICS(trip: Trip): string {
  const events = trip.segments.map((segment, index) => {
    const startDate = addDays(trip.startDate, index);
    return `BEGIN:VEVENT
UID:${trip.id}-${index}@trip-planner.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
SUMMARY:${segment.countryName} - ${segment.km}km
DESCRIPTION:Distance: ${segment.km}km\\nEstimated time: ${(segment.km / 80).toFixed(1)} hours
END:VEVENT`;
  }).join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Trip Planner//EN
${events}
END:VCALENDAR`;
}
```

#### B. Add Export Button
Add to Results page:
```tsx
<button onClick={handleExportICS}>
  <Calendar size={20} />
  Export to Calendar
</button>
```

---

## ☁️ 4. Move Gemini to Cloud Functions - TODO

### Implementation Steps:

#### A. Create Cloud Function
Create `functions/src/index.ts`:
```typescript
import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const summarizeTrip = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { trip, results } = data;
  const genAI = new GoogleGenerativeAI(functions.config().gemini.key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analyze this overland trip...`;
  const result = await model.generateContent(prompt);
  
  return { report: result.response.text() };
});
```

#### B. Update Client
Update `src/utils/gemini.ts`:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

export async function analyzeTripWithGemini(trip: Trip, results: TripResults) {
  const functions = getFunctions();
  const summarizeTrip = httpsCallable(functions, 'summarizeTrip');
  
  const result = await summarizeTrip({ trip, results });
  return result.data.report;
}
```

#### C. Deploy Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

#### D. Set API Key
```bash
firebase functions:config:set gemini.key="YOUR_API_KEY"
```

---

## 📋 Next Steps

1. ✅ Currency Switcher - DONE
2. 🔄 PWA - Create service worker and manifest
3. 📅 ICS Export - Implement calendar export
4. ☁️ Cloud Functions - Move Gemini API to backend

## Testing Checklist

- [ ] Currency conversion works for all amounts
- [ ] Currency selection persists across sessions
- [ ] PWA installs on mobile devices
- [ ] Offline mode works with cached data
- [ ] ICS file downloads correctly
- [ ] Calendar import works in Google Calendar/Outlook
- [ ] Cloud function authenticates properly
- [ ] AI generation works from cloud function
