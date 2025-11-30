import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Trips } from './pages/Trips';
import { TripBuilder } from './pages/TripBuilder';
import { Results } from './pages/Results';
import { Vehicles } from './pages/Vehicles';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { needsMigration, migrateFromLocalStorage } from './utils/firebaseStorage';

function App() {
  useEffect(() => {
    // Migrate data from localStorage to Firebase on first load
    if (needsMigration()) {
      migrateFromLocalStorage().then(() => {
        console.log('✅ Data migrated to Firebase! Your data will now sync across devices.');
      });
    }
  }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Trips />} />
              <Route path="/trip/:id" element={<TripBuilder />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
