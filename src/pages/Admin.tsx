import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { storage } from '../utils/storage';
import {
    Shield,
    Download,
    Upload,
    Trash2,
    User,
    Database,
    BarChart3,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [exportMessage, setExportMessage] = useState('');

    // Use reactive data from context
    const { trips, vehicles, settings } = useData();

    const handleExportData = () => {
        const data = {
            trips,
            vehicles,
            settings,
            exportedAt: new Date().toISOString(),
            exportedBy: user?.email
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trip-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setExportMessage('✅ Data exported successfully!');
        setTimeout(() => setExportMessage(''), 3000);
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);

                if (data.trips) storage.saveTrips(data.trips);
                if (data.vehicles) storage.saveVehicles(data.vehicles);
                if (data.settings) storage.saveSettings(data.settings);

                setExportMessage('✅ Data imported successfully! Refreshing...');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                setExportMessage('❌ Import failed. Invalid file format.');
                setTimeout(() => setExportMessage(''), 3000);
            }
        };
        reader.readAsText(file);
    };

    const handleClearAllData = () => {
        if (window.confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone!')) {
            storage.saveTrips([]);
            storage.saveVehicles([]);
            setExportMessage('✅ All data cleared!');
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                        <p className="text-gray-400 text-sm">Manage your trip planner</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl border border-blue-700 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={32} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user?.email}</h2>
                        <p className="text-blue-200 text-sm">Administrator</p>
                        <p className="text-blue-300 text-xs mt-1">User ID: {user?.uid.slice(0, 12)}...</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm">Total Trips</h3>
                        <BarChart3 size={20} className="text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{trips.length}</p>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm">Vehicles</h3>
                        <Database size={20} className="text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{vehicles.length}</p>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm">Currency</h3>
                        <Shield size={20} className="text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{settings.baseCurrency}</p>
                </div>
            </div>

            {/* Analytics Button */}
            <button
                onClick={() => navigate('/admin/analytics')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 mb-6 shadow-lg"
            >
                <BarChart3 size={24} />
                <div className="text-left">
                    <div className="font-bold">View Trip Analytics</div>
                    <div className="text-sm opacity-90">Research & observation dashboard</div>
                </div>
            </button>

            {/* Message */}
            {exportMessage && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-6">
                    <p className="text-blue-400 text-sm">{exportMessage}</p>
                </div>
            )}

            {/* Data Management */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Database size={24} className="text-orange-400" />
                    Data Management
                </h2>

                <div className="space-y-3">
                    {/* Export */}
                    <button
                        onClick={handleExportData}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        <span>Export All Data (JSON)</span>
                    </button>

                    {/* Import */}
                    <label className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <Upload size={20} />
                        <span>Import Data (JSON)</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                        />
                    </label>

                    {/* Clear All */}
                    <button
                        onClick={handleClearAllData}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                        <span>Clear All Data</span>
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">ℹ️ Information</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Export your data regularly to keep backups</li>
                    <li>• Import feature allows you to restore from backups</li>
                    <li>• All data is synced across devices via Firebase</li>
                    <li>• Clear all data will permanently delete everything</li>
                </ul>
            </div>
        </div>
    );
};
