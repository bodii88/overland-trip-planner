import React, { useState } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { ALL_CURRENCIES, getCurrencyName } from '../utils/currency';

export const CurrencySwitcher: React.FC = () => {
    const { currency, setCurrency, refreshRates } = useCurrency();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currencies = Object.keys(ALL_CURRENCIES);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshRates();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh exchange rates"
            >
                <RefreshCw size={16} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="relative inline-block">
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer max-w-[150px]"
                    >
                        {currencies.map((curr) => (
                            <option key={curr} value={curr} className="bg-gray-800">
                                {curr} - {getCurrencyName(curr)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
