import React, { useState } from 'react';
import type { Settings as SettingsType } from '../types';
import { storage } from '../utils/storage';

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsType>(storage.getSettings());
    const [saved, setSaved] = useState(false);

    const handleChange = (key: keyof SettingsType, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleCostChange = (key: keyof SettingsType['defaultStayCosts'], value: number) => {
        setSettings(prev => ({
            ...prev,
            defaultStayCosts: {
                ...prev.defaultStayCosts,
                [key]: value
            }
        }));
        setSaved(false);
    };

    const save = () => {
        storage.saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-lg font-semibold text-blue-400 mb-3">General</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Base Currency</label>
                            <input
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={settings.baseCurrency}
                                onChange={e => handleChange('baseCurrency', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Default Safety Margin (%)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={settings.defaultSafetyMarginPercent}
                                onChange={e => handleChange('defaultSafetyMarginPercent', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-blue-400 mb-3">Default Stay Costs ({settings.baseCurrency})</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Hotel per night</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={settings.defaultStayCosts.hotelPerNightKwd}
                                onChange={e => handleCostChange('hotelPerNightKwd', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Paid Camp per night</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={settings.defaultStayCosts.paidCampPerNightKwd}
                                onChange={e => handleCostChange('paidCampPerNightKwd', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Free Camp per night</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={settings.defaultStayCosts.freeCampPerNightKwd}
                                onChange={e => handleCostChange('freeCampPerNightKwd', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Friend/Family per night</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={settings.defaultStayCosts.friendFamilyPerNightKwd}
                                onChange={e => handleCostChange('friendFamilyPerNightKwd', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </section>

                <button
                    onClick={save}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded text-white font-medium mt-4 transition-colors"
                >
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};
