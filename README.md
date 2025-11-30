# 🚗 Overland Trip Planner

A comprehensive trip planning application for overland adventures with real-time cost calculations, AI-powered insights, and multi-device sync.

## ✨ Features

- **Trip Planning**: Plan multi-country overland trips with detailed route segments
- **Cost Calculations**: Automatic fuel, accommodation, and food cost estimates
- **AI Insights**: Powered by Google Gemini for trip recommendations and tips
- **Vehicle Management**: Track multiple vehicles with fuel consumption data
- **Real-time Sync**: Firebase-powered data synchronization across all devices
- **Authentication**: Secure login with Email/Password and Google Sign-In
- **Admin Panel**: Export/import data, view statistics, manage settings
- **Responsive Design**: Beautiful UI optimized for both desktop and mobile

## 🚀 Live Demo

**[https://trip-project1988.web.app](https://trip-project1988.web.app)**

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication + Hosting)
- **AI**: Google Gemini API
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/overland-trip-planner.git
cd overland-trip-planner

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database and Authentication (Email/Password + Google)
3. Update `src/config/firebase.ts` with your Firebase config
4. Get a Gemini API key from [ai.google.dev](https://ai.google.dev)
5. Update `src/utils/gemini.ts` with your API key

## 🚀 Deployment

### Manual Deployment
```bash
npm run build
firebase deploy --only hosting
```

### Automatic Deployment (GitHub Actions)
Push to the `main` branch and GitHub Actions will automatically build and deploy to Firebase Hosting.

**Setup Required:**
1. Create a Firebase service account key
2. Add it as `FIREBASE_SERVICE_ACCOUNT` secret in GitHub repository settings

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Add Vehicles**: Configure your vehicle's fuel consumption
3. **Create Trip**: Add route segments with countries and distances
4. **View Results**: See cost breakdown and AI-powered insights
5. **Admin Panel**: Export data, view statistics, manage settings

## 🔐 Security

- All routes are protected with Firebase Authentication
- Firestore security rules ensure users can only access their own data
- API keys should be stored in environment variables for production

## 📄 License

MIT License - feel free to use this project for your own trips!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Travels! 🌍✈️🚗**
