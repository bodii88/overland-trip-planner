# 🚗 Overland Trip Planner

A comprehensive, feature-rich trip planning application for overland adventures with real-time cost calculations, AI-powered insights, live currency conversion, and multi-device sync.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://trip-project1988.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)

## ✨ Features

### 🗺️ Trip Planning
- **Multi-Country Routes**: Plan trips across multiple countries with detailed segments
- **Cost Calculations**: Automatic fuel, accommodation, and food cost estimates
- **Real-time Sync**: Firebase-powered data synchronization across all devices
- **Offline Support**: PWA with service worker for offline access

### 💰 Currency & Costs
- **60+ World Currencies**: Support for all major currencies worldwide
- **Live Exchange Rates**: Hourly updates from exchangerate-api.com
- **Smart Caching**: Offline currency conversion with cached rates
- **Manual Refresh**: Update exchange rates on demand

### 🤖 AI-Powered Insights
- **Google Gemini Integration**: AI-generated trip recommendations and tips
- **Smart Analysis**: Route optimization and cost-saving suggestions
- **Visual Reports**: Colorful, sectioned insights with icons

### 🔐 Authentication & Security
- **Email/Password**: Secure account creation and login
- **Google Sign-In**: One-click authentication
- **Protected Routes**: All data secured behind authentication
- **Firebase Auth**: Industry-standard security

### 📊 Data Management
- **Admin Panel**: Export/import data, view statistics
- **Calendar Export**: Generate .ics files for trip itineraries
- **Vehicle Management**: Track multiple vehicles with fuel consumption
- **Trip History**: Save and manage unlimited trips

### 📱 Progressive Web App
- **Installable**: Add to home screen on mobile devices
- **Offline Mode**: Works without internet connection
- **Service Worker**: Smart caching for optimal performance
- **Responsive Design**: Beautiful UI for desktop and mobile

## 🚀 Live Demo

**[https://trip-project1988.web.app](https://trip-project1988.web.app)**

Try it now! No installation required.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Firebase (Firestore + Authentication + Hosting)
- **AI**: Google Gemini 2.0 Flash API
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest
- **Currency**: ExchangeRate-API (live rates)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase account (free tier works)
- Google Gemini API key (free tier available)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/bodii88/overland-trip-planner.git
cd overland-trip-planner

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### 1. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** and **Authentication** (Email/Password + Google)
3. Update `src/config/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Gemini API Setup

1. Get a free API key from [ai.google.dev](https://ai.google.dev)
2. Update `src/utils/gemini.ts`:

```typescript
const API_KEY = 'YOUR_GEMINI_API_KEY';
```

### 3. Deploy to Firebase

```bash
# Login to Firebase
firebase login

# Deploy
firebase deploy --only hosting
```

## 📱 Usage

### Creating Your First Trip

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Add Vehicle**: Configure your vehicle's fuel consumption
3. **Create Trip**: Add route segments with countries and distances
4. **View Results**: See detailed cost breakdown and AI insights
5. **Export**: Download calendar file or export data

### Currency Conversion

1. Navigate to any trip results page
2. Click the currency dropdown (top-right)
3. Select from 60+ world currencies
4. Click refresh icon for latest exchange rates
5. All amounts update instantly

### Installing as PWA

**On Mobile:**
1. Open app in browser
2. Tap "Add to Home Screen" (iOS) or "Install" (Android)
3. App appears in your app drawer
4. Works offline!

**On Desktop:**
1. Click install icon in address bar
2. Confirm installation
3. App opens in standalone window

## 🎯 Key Features Explained

### Live Currency Rates
- Fetches rates from exchangerate-api.com
- Updates every hour automatically
- Caches in localStorage for offline use
- Fallback to static rates if API unavailable
- Manual refresh available

### PWA Capabilities
- **App Shell Caching**: Instant load times
- **Offline Support**: Works without internet
- **Background Sync**: Data syncs when online
- **Install Prompt**: Native app experience

### Calendar Export
- Generates standard .ics files
- Each segment becomes a calendar event
- Includes distance, time estimates, and notes
- Compatible with Google Calendar, Outlook, Apple Calendar

### AI Trip Insights
- Analyzes your route and costs
- Provides country-specific tips
- Suggests optimizations
- Highlights potential issues
- Beautiful visual presentation

## 📊 Project Structure

```
overland-trip-planner/
├── public/
│   ├── service-worker.js    # PWA service worker
│   └── manifest.json         # PWA manifest
├── src/
│   ├── components/          # React components
│   ├── contexts/            # React contexts (Auth, Currency)
│   ├── pages/               # Page components
│   ├── utils/               # Utilities (currency, calculations, etc.)
│   ├── config/              # Firebase configuration
│   └── types.ts             # TypeScript types
├── .github/workflows/       # GitHub Actions
└── firebase.json            # Firebase configuration
```

## 🔐 Security

- **Authentication Required**: All routes protected
- **Firestore Rules**: User data isolation
- **API Keys**: Stored securely (move to env variables for production)
- **HTTPS Only**: Enforced by Firebase Hosting

### Recommended: Environment Variables

For production, use environment variables:

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_key
VITE_GEMINI_API_KEY=your_key
```

## 🚀 Deployment

### Automatic Deployment (GitHub Actions)

Push to `main` branch triggers automatic deployment to Firebase Hosting.

**Setup:**
1. Add `FIREBASE_SERVICE_ACCOUNT` secret to GitHub repository
2. Push to main branch
3. GitHub Actions builds and deploys automatically

### Manual Deployment

```bash
npm run build
firebase deploy --only hosting
```

## 📝 Documentation

- **[FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)** - Complete feature list
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Technical details
- **[CURRENCY_IMPLEMENTATION.md](./CURRENCY_IMPLEMENTATION.md)** - Currency system docs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own trips!

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **Google Gemini** - AI-powered insights
- **ExchangeRate-API** - Live currency rates
- **Tailwind CSS** - Styling framework
- **Lucide** - Beautiful icons

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for overland adventurers worldwide** 🌍✈️🚗

**Live App**: [https://trip-project1988.web.app](https://trip-project1988.web.app)

**GitHub**: [https://github.com/bodii88/overland-trip-planner](https://github.com/bodii88/overland-trip-planner)
