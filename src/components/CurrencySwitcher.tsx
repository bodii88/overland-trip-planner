import React from 'react';
import { DollarSign } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { CURRENCY_SYMBOLS } from '../utils/currency';

export const CurrencySwitcher: React.FC = () => {
    const { currency, setCurrency } = useCurrency();

    const currencies = Object.keys(CURRENCY_SYMBOLS);

    return (
        <div className="relative inline-block">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                <DollarSign size={16} className="text-gray-400" />
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
                >
                    {currencies.map((curr) => (
                        <option key={curr} value={curr} className="bg-gray-800">
                            {curr} ({CURRENCY_SYMBOLS[curr]})
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
